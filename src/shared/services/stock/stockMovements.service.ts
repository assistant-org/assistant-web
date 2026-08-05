import { supabase } from "../../config";
import { ApiResponse } from "../types";
import { stockBatchesService, mapMovementRow } from "./stockBatches.service";
import {
  CreateEntryRequest,
  CreateMovementInput,
  CreateStockMovementRequest,
  StockMovement,
  StockMovementDirection,
  StockMovementFilters,
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

function reverseType(type: StockMovementType): StockMovementType {
  switch (type) {
    case StockMovementType.ENTRY:
      return StockMovementType.EXIT;
    case StockMovementType.EXIT:
    case StockMovementType.LOSS:
    case StockMovementType.INTERNAL_CONSUMPTION:
      return StockMovementType.ENTRY;
    case StockMovementType.ADJUSTMENT:
      return StockMovementType.ADJUSTMENT;
    default:
      return StockMovementType.EXIT;
  }
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
        request.type === StockMovementType.ENTRY ||
        (!("type" in request) &&
          "unitValue" in request &&
          "entryDate" in request);

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
    if (request.quantity <= 0) {
      return { data: null, error: "Quantidade deve ser maior que zero" };
    }
    if (request.unitValue < 0) {
      return { data: null, error: "Valor unitário não pode ser negativo" };
    }

    const origin =
      request.eventId != null && request.eventId !== ""
        ? StockMovementOrigin.EVENT
        : request.origin || StockMovementOrigin.MANUAL;

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
          event_id: request.eventId || null,
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
          origin,
          origin_id: request.originId || null,
          event_id: request.eventId || null,
          operation_group_id: request.operationGroupId || null,
        },
      ])
      .select()
      .single();

    if (movementError || !movement) {
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
    if (request.quantity <= 0) {
      return { data: null, error: "Quantidade deve ser maior que zero" };
    }

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

    const origin =
      request.eventId != null && request.eventId !== ""
        ? StockMovementOrigin.EVENT
        : request.origin || StockMovementOrigin.MANUAL;

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
          origin,
          origin_id: request.originId || null,
          event_id: request.eventId || null,
          operation_group_id: request.operationGroupId || null,
          reverses_movement_id: request.reversesMovementId
            ? Number(request.reversesMovementId)
            : null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: mapMovementRow(data), error: null };
  }

  /**
   * Creates an inverse movement linked to the original for audit.
   * Does not mutate the original row.
   */
  async reverse(movementId: string): Promise<ApiResponse<StockMovement>> {
    try {
      const { data: row, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", movementId)
        .single();

      if (error || !row) {
        return { data: null, error: error?.message || "Movimentação não encontrada" };
      }

      const original = mapMovementRow(row);
      if (original.reversesMovementId) {
        return { data: null, error: "Não é possível reverter uma reversão" };
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? null;

      const newType = reverseType(original.type);
      const reason = `Reversão da movimentação #${original.id}`;

      if (newType === StockMovementType.ENTRY) {
        // Reverse of EXIT/LOSS/INTERNAL: add stock back to same batch (IN adjustment-style ENTRY on existing batch)
        return this.createOutgoingOrAdjustment(
          {
            type: StockMovementType.ADJUSTMENT,
            productId: original.productId,
            batchId: original.batchId,
            quantity: original.quantity,
            date: original.date,
            direction: StockMovementDirection.IN,
            reason,
            eventId: original.eventId,
            reversesMovementId: original.id,
            origin: StockMovementOrigin.ADJUSTMENT,
          },
          userId,
        );
      }

      if (original.type === StockMovementType.ENTRY) {
        // Reverse of ENTRY: remove quantity from the batch
        return this.createOutgoingOrAdjustment(
          {
            type: StockMovementType.EXIT,
            productId: original.productId,
            batchId: original.batchId,
            quantity: original.quantity,
            date: original.date,
            reason,
            eventId: original.eventId,
            reversesMovementId: original.id,
            origin: StockMovementOrigin.ADJUSTMENT,
          },
          userId,
        );
      }

      // ADJUSTMENT: flip direction
      const flipped =
        original.direction === StockMovementDirection.IN
          ? StockMovementDirection.OUT
          : StockMovementDirection.IN;
      return this.createOutgoingOrAdjustment(
        {
          type: StockMovementType.ADJUSTMENT,
          productId: original.productId,
          batchId: original.batchId,
          quantity: original.quantity,
          date: original.date,
          direction: flipped,
          reason,
          eventId: original.eventId,
          reversesMovementId: original.id,
          origin: StockMovementOrigin.ADJUSTMENT,
        },
        userId,
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro interno do servidor";
      return { data: null, error: message };
    }
  }

  async findAll(
    filters?: StockMovementFilters,
  ): Promise<ApiResponse<StockMovement[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*, products(name)")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.batchId) query = query.eq("batch_id", filters.batchId);
      if (filters?.productId) query = query.eq("product_id", filters.productId);
      if (filters?.type) query = query.eq("type", filters.type);
      if (filters?.eventId) query = query.eq("event_id", filters.eventId);
      if (filters?.dateFrom) query = query.gte("date", filters.dateFrom);
      if (filters?.dateTo) query = query.lte("date", filters.dateTo);

      const { data, error } = await query;

      if (error) {
        // Fallback without join if products relation fails
        let fallback = supabase
          .from(this.tableName)
          .select("*")
          .order("date", { ascending: false })
          .order("created_at", { ascending: false });
        if (filters?.batchId) fallback = fallback.eq("batch_id", filters.batchId);
        if (filters?.productId)
          fallback = fallback.eq("product_id", filters.productId);
        if (filters?.type) fallback = fallback.eq("type", filters.type);
        if (filters?.eventId) fallback = fallback.eq("event_id", filters.eventId);
        if (filters?.dateFrom) fallback = fallback.gte("date", filters.dateFrom);
        if (filters?.dateTo) fallback = fallback.lte("date", filters.dateTo);
        const res = await fallback;
        if (res.error) return { data: null, error: res.error.message };
        return { data: (res.data || []).map(mapMovementRow), error: null };
      }

      return { data: (data || []).map(mapMovementRow), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const stockMovementsService = new StockMovementsService();
