import { supabase } from "../../config";
import { ApiResponse, PaginatedResult, PaginationParams } from "../types";
import {
  buildPaginatedResult,
  normalizePagination,
  toRange,
} from "../pagination";
import {
  CreateProductRequest,
  Product,
  ProductCategory,
  UnitOfMeasure,
  UpdateProductRequest,
} from "./types";

export interface ProductListParams extends PaginationParams {
  includeInactive?: boolean;
  category?: ProductCategory;
  trackStockOnly?: boolean;
  active?: boolean;
  name?: string;
}

function mapProductRow(data: Record<string, unknown>): Product {
  return {
    id: String(data.id),
    name: (data.name as string) || "",
    category: data.category as ProductCategory,
    unit: data.unit as UnitOfMeasure,
    trackStock: data.track_stock !== false,
    minStock: data.min_stock != null ? Number(data.min_stock) : null,
    defaultUnitValue: Number(data.default_unit_value) || 0,
    active: data.active !== false,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

function applyProductFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  options?: Omit<ProductListParams, keyof PaginationParams>,
) {
  if (options?.active !== undefined) {
    query = query.eq("active", options.active);
  } else if (!options?.includeInactive) {
    query = query.eq("active", true);
  }
  if (options?.category) {
    query = query.eq("category", options.category);
  }
  if (options?.trackStockOnly) {
    query = query.eq("track_stock", true);
  }
  if (options?.name?.trim()) {
    query = query.ilike("name", `%${options.name.trim()}%`);
  }
  return query;
}

export class ProductsService {
  private tableName = "products";

  async create(product: CreateProductRequest): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            name: product.name,
            category: ProductCategory.BEVERAGE,
            unit: UnitOfMeasure.LITER,
            track_stock: true,
            min_stock: product.minStock ?? null,
            default_unit_value: product.defaultUnitValue ?? 0,
            active: product.active ?? true,
          },
        ])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapProductRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /** Full list (dropdowns / dashboard). Prefer `findPage` for UI tables. */
  async findAll(options?: {
    includeInactive?: boolean;
    category?: ProductCategory;
    trackStockOnly?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .order("name", { ascending: true });

      query = applyProductFilters(query, options);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data || []).map(mapProductRow), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findPage(
    params: ProductListParams = {},
  ): Promise<ApiResponse<PaginatedResult<Product>>> {
    try {
      const { page, pageSize } = normalizePagination(params);
      const { from, to } = toRange(page, pageSize);

      let query = supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .order("name", { ascending: true });

      query = applyProductFilters(query, params);

      const { data, error, count } = await query.range(from, to);

      if (error) {
        return { data: null, error: error.message };
      }

      return {
        data: buildPaginatedResult(
          (data || []).map(mapProductRow),
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

  async findById(id: string): Promise<ApiResponse<Product>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapProductRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async update(
    id: string,
    updates: UpdateProductRequest,
  ): Promise<ApiResponse<Product>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.unit !== undefined) updateData.unit = updates.unit;
      if (updates.trackStock !== undefined) updateData.track_stock = updates.trackStock;
      if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
      if (updates.defaultUnitValue !== undefined)
        updateData.default_unit_value = updates.defaultUnitValue;
      if (updates.active !== undefined) updateData.active = updates.active;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapProductRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async deactivate(id: string): Promise<ApiResponse<null>> {
    const result = await this.update(id, { active: false });
    return result.error
      ? { data: null, error: result.error }
      : { data: null, error: null };
  }

  async setActive(id: string, active: boolean): Promise<ApiResponse<Product>> {
    return this.update(id, { active });
  }

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { data: batches, error: batchesError } = await supabase
        .from("stock_batches")
        .select("id")
        .eq("product_id", id);

      if (batchesError) {
        return { data: null, error: batchesError.message };
      }

      const batchIds = (batches || []).map((b) => String(b.id));

      if (batchIds.length > 0) {
        const { error: movByBatchError } = await supabase
          .from("stock_movements")
          .delete()
          .in("batch_id", batchIds);

        if (movByBatchError) {
          return { data: null, error: movByBatchError.message };
        }
      }

      const { error: movByProductError } = await supabase
        .from("stock_movements")
        .delete()
        .eq("product_id", id);

      if (movByProductError) {
        return { data: null, error: movByProductError.message };
      }

      const { error: batchesDeleteError } = await supabase
        .from("stock_batches")
        .delete()
        .eq("product_id", id);

      if (batchesDeleteError) {
        return { data: null, error: batchesDeleteError.message };
      }

      const { error } = await supabase.from(this.tableName).delete().eq("id", id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const productsService = new ProductsService();
