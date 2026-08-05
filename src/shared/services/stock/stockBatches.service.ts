import { supabase } from "../../config";
import { ApiResponse, PaginatedResult, PaginationParams } from "../types";
import {
  buildPaginatedResult,
  normalizePagination,
  toRange,
} from "../pagination";
import {
  StockBatch,
  StockBatchFilters,
  StockBatchStatus,
  StockMovement,
  StockMovementDirection,
  StockMovementOrigin,
  StockMovementType,
} from "./types";

export type StockBatchListParams = StockBatchFilters & PaginationParams;

export function mapMovementRow(data: Record<string, unknown>): StockMovement {
  return {
    id: String(data.id),
    batchId: String(data.batch_id),
    productId: String(data.product_id),
    type: data.type as StockMovementType,
    direction: data.direction as StockMovementDirection,
    quantity: Number(data.quantity) || 0,
    date: data.date as string,
    userId: data.user_id != null ? String(data.user_id) : null,
    reason: (data.reason as string) || null,
    origin: (data.origin as StockMovementOrigin) || StockMovementOrigin.MANUAL,
    originId: data.origin_id != null ? String(data.origin_id) : null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

export function deriveAvailableQuantity(movements: StockMovement[]): number {
  return movements.reduce((total, m) => {
    return m.direction === StockMovementDirection.IN
      ? total + m.quantity
      : total - m.quantity;
  }, 0);
}

export function deriveBatchStatus(availableQuantity: number): StockBatchStatus {
  return availableQuantity > 0 ? StockBatchStatus.ACTIVE : StockBatchStatus.CLOSED;
}

function mapBatchRow(
  data: Record<string, unknown>,
  movements: StockMovement[] = [],
): StockBatch {
  const products = data.products as
    | { name?: string; category?: string; unit?: string }
    | null
    | undefined;

  const availableFromView =
    data.available_quantity != null ? Number(data.available_quantity) : null;
  const availableQuantity =
    availableFromView != null
      ? availableFromView
      : deriveAvailableQuantity(movements);

  const statusFromView = data.status as StockBatchStatus | undefined;

  return {
    id: String(data.id),
    productId: String(data.product_id),
    productName: products?.name,
    productCategory: products?.category,
    productUnit: products?.unit,
    entryDate: data.entry_date as string,
    expiryDate: (data.expiry_date as string) || null,
    initialQuantity: Number(data.initial_quantity) || 0,
    unitValue: Number(data.unit_value) || 0,
    observations: (data.observations as string) || null,
    availableQuantity,
    status: statusFromView || deriveBatchStatus(availableQuantity),
    movements,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

function applyBatchFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters?: StockBatchFilters,
) {
  if (filters?.productId) {
    query = query.eq("product_id", filters.productId);
  }
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.expiryBefore) {
    query = query.lte("expiry_date", filters.expiryBefore);
  }
  if (filters?.category) {
    query = query.eq("products.category", filters.category);
  }
  return query;
}

export class StockBatchesService {
  private tableName = "stock_batches";
  private viewName = "v_stock_batches";

  /** Full list (wizard / dashboard / summaries). Prefer `findPage` for UI tables. */
  async findAll(filters?: StockBatchFilters): Promise<ApiResponse<StockBatch[]>> {
    try {
      let query = supabase
        .from(this.viewName)
        .select("*, products(name, category, unit)")
        .order("entry_date", { ascending: false });

      query = applyBatchFilters(query, filters);

      const { data, error } = await query;

      if (error) {
        // Fallback if view not applied yet
        return this.findAllFromTable(filters);
      }

      return {
        data: (data || []).map((row) => mapBatchRow(row, [])),
        error: null,
      };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  private async findAllFromTable(
    filters?: StockBatchFilters,
  ): Promise<ApiResponse<StockBatch[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*, products(name, category, unit)")
        .order("entry_date", { ascending: false });

      if (filters?.productId) {
        query = query.eq("product_id", filters.productId);
      }

      const { data, error } = await query;
      if (error) return { data: null, error: error.message };

      const batches = data || [];
      if (batches.length === 0) return { data: [], error: null };

      const batchIds = batches.map((b) => b.id);
      const { data: movementsData, error: movementsError } = await supabase
        .from("stock_movements")
        .select("*")
        .in("batch_id", batchIds);

      if (movementsError) {
        return { data: null, error: movementsError.message };
      }

      const movementsByBatch = new Map<string, StockMovement[]>();
      for (const row of movementsData || []) {
        const mapped = mapMovementRow(row);
        const list = movementsByBatch.get(mapped.batchId) || [];
        list.push(mapped);
        movementsByBatch.set(mapped.batchId, list);
      }

      let result = batches.map((row) =>
        mapBatchRow(row, movementsByBatch.get(String(row.id)) || []),
      );

      if (filters?.category) {
        result = result.filter((b) => b.productCategory === filters.category);
      }
      if (filters?.status && filters.status !== "all") {
        result = result.filter((b) => b.status === filters.status);
      }
      if (filters?.expiryBefore) {
        result = result.filter(
          (b) => b.expiryDate && b.expiryDate <= filters.expiryBefore!,
        );
      }

      return { data: result, error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findPage(
    params: StockBatchListParams = {},
  ): Promise<ApiResponse<PaginatedResult<StockBatch>>> {
    try {
      const { page, pageSize } = normalizePagination(params);
      const { from, to } = toRange(page, pageSize);

      let query = supabase
        .from(this.viewName)
        .select("*, products(name, category, unit)", { count: "exact" })
        .order("entry_date", { ascending: false });

      query = applyBatchFilters(query, params);

      const { data, error, count } = await query.range(from, to);

      if (error) {
        // Fallback: client-side page if view missing
        const all = await this.findAllFromTable(params);
        if (all.error || !all.data) {
          return { data: null, error: all.error || error.message };
        }
        const slice = all.data.slice(from, to + 1);
        return {
          data: buildPaginatedResult(slice, all.data.length, page, pageSize),
          error: null,
        };
      }

      return {
        data: buildPaginatedResult(
          (data || []).map((row) => mapBatchRow(row, [])),
          count ?? 0,
          page,
          pageSize,
        ),
        error: null,
      };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findById(id: string): Promise<ApiResponse<StockBatch>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, products(name, category, unit)")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      const { data: movementsData, error: movementsError } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("batch_id", id)
        .order("date", { ascending: true })
        .order("created_at", { ascending: true });

      if (movementsError) {
        return { data: null, error: movementsError.message };
      }

      const movements = (movementsData || []).map(mapMovementRow);
      return { data: mapBatchRow(data, movements), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async getAvailableQuantity(batchId: string): Promise<ApiResponse<number>> {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("direction, quantity")
        .eq("batch_id", batchId);

      if (error) {
        return { data: null, error: error.message };
      }

      const movements = (data || []).map(mapMovementRow);
      return { data: deriveAvailableQuantity(movements), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const stockBatchesService = new StockBatchesService();
