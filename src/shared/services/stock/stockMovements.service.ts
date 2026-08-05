import { supabase } from "../../config";
import { ApiResponse } from "../types";
import { stockBatchesService, mapMovementRow } from "./stockBatches.service";
import {
  CreateEntryRequest,
  CreateMovementInput,
  CreateStockMovementRequest,
  StockMovement,
  StockMovementDirection,
  StockMovementOrigin,
  StockMovementType,
} from "./types";

function defaultDirectionForType(
  type: StockMovementType,
  explicit?: StockMovementDirection,
): StockMovementDirection {
  if (type === StockMovementType.ENTRY) return StockMovementDirection.IN;
  if (type === StockMovementType.ADJUSTMENT) {
    if (!explicit) {
      throw new Error("Direção é obrigatória para ajustes");
    }
    return explicit;
  }
  return StockMovementDirection.OUT;
}

export class StockMovementsService {
  private tableName = "stock_movements";

  /**
   * ENTRY creates a new batch + its paired ENTRY movement so history is
   * complete from day one. Other types append a movement to an existing batch
   * after validating the result would not go negative.
   */
  async create(request: CreateMovementInput): Promise<ApiResponse<StockMovement>> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? null;

      const isEntry =
        !("type" in request) ||
        request.type === StockMovementType.ENTRY ||
        ("unitValue" in request && "entryDate" in request);

      if (isEntry) {
        return this.createEntry(request as CreateEntryRequest, userId);
      }

      return this.createOutgoingOrAdjustment(
        request as CreateStockMovementRequest,
        userId,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro interno do servidor";
      return { data: null, error: message };
    }
  }

  private async createEntry(
    request: CreateEntryRequest,
    userId: string | null,
  ): Promise<ApiResponse<StockMovement>> {
    const { data: batch, error: batchError } = await supabase
      .from("stock_batches")
      .insert([
        {
          product_id: request.productId,
          entry_date: request.entryDate,
          expiry_date: request.expiryDate || null,
          initial_quantity: request.quantity,
          unit_value: request.unitValue,
          observations: request.observations || null,
        },
      ])
      .select()
      .single();

    if (batchError || !batch) {
      return { data: null, error: batchError?.message || "Erro ao criar lote" };
    }

    const { data: movement, error: movementError } = await supabase
      .from(this.tableName)
      .insert([
        {
          batch_id: batch.id,
          product_id: request.productId,
          type: StockMovementType.ENTRY,
          direction: StockMovementDirection.IN,
          quantity: request.quantity,
          date: request.entryDate,
          user_id: userId,
          reason: request.reason || null,
          origin: request.origin || StockMovementOrigin.MANUAL,
          origin_id: request.originId || null,
        },
      ])
      .select()
      .single();

    if (movementError || !movement) {
      // Best-effort cleanup so a failed ENTRY doesn't leave an orphan batch.
      await supabase.from("stock_batches").delete().eq("id", batch.id);
      return {
        data: null,
        error: movementError?.message || "Erro ao registrar entrada",
      };
    }

    return { data: mapMovementRow(movement), error: null };
  }

  private async createOutgoingOrAdjustment(
    request: CreateStockMovementRequest,
    userId: string | null,
  ): Promise<ApiResponse<StockMovement>> {
    const direction = defaultDirectionForType(request.type, request.direction);

    const availableRes = await stockBatchesService.getAvailableQuantity(
      request.batchId,
    );
    if (availableRes.error || availableRes.data === null) {
      return {
        data: null,
        error: availableRes.error || "Não foi possível calcular o saldo do lote",
      };
    }

    if (direction === StockMovementDirection.OUT) {
      if (request.quantity > availableRes.data) {
        return {
          data: null,
          error: `Quantidade insuficiente no lote. Disponível: ${availableRes.data}`,
        };
      }
    }

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          batch_id: request.batchId,
          product_id: request.productId,
          type: request.type,
          direction,
          quantity: request.quantity,
          date: request.date,
          user_id: userId,
          reason: request.reason || null,
          origin: request.origin || StockMovementOrigin.MANUAL,
          origin_id: request.originId || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapMovementRow(data), error: null };
  }

  async findAll(filters?: {
    batchId?: string;
    productId?: string;
    type?: StockMovementType;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<StockMovement[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.batchId) query = query.eq("batch_id", filters.batchId);
      if (filters?.productId) query = query.eq("product_id", filters.productId);
      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.dateFrom) query = query.gte("date", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("date", filters.dateTo);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data || []).map(mapMovementRow), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const stockMovementsService = new StockMovementsService();
