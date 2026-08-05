import { supabase } from "../../config";
import { ApiResponse, PaginatedResult, PaginationParams } from "../types";
import {
  buildPaginatedResult,
  normalizePagination,
  toRange,
} from "../pagination";
import {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "./models/request/request";
import {
  TransactionResponse,
  TransactionsListResponse,
} from "./models/response/response";
import {
  PaymentMethod,
  TransactionOrigin,
  TransactionStatus,
  TransactionType,
} from "./types";

export interface TransactionFilters {
  type?: TransactionType | "";
  categoryId?: string;
  /** Matches transactions where this account is either the source or the destination. */
  accountId?: string;
  origin?: TransactionOrigin | string;
  eventId?: string;
  /** ACTIVE | CANCELLED | all — empty/ACTIVE defaults to active-only. */
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  includeInactive?: boolean;
}

export type TransactionListParams = TransactionFilters & PaginationParams;

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
}

function mapTransactionRow(
  data: Record<string, unknown>,
): TransactionResponse {
  const categories = data.categories as { name?: string } | null;

  return {
    id: String(data.id),
    type: data.type as TransactionType,
    date: data.date as string,
    value: Number(data.value),
    description: (data.description as string) || undefined,
    categoryId: data.category != null ? String(data.category) : null,
    category: categories?.name,
    sourceAccountId:
      data.source_account != null ? String(data.source_account) : null,
    destinationAccountId:
      data.destination_account != null
        ? String(data.destination_account)
        : null,
    paymentMethod: (data.payment_method as PaymentMethod) || null,
    eventId: data.event != null ? String(data.event) : null,
    origin: (data.origin as TransactionOrigin) || TransactionOrigin.MANUAL,
    originId: data.origin_id != null ? String(data.origin_id) : null,
    status: (data.status as TransactionStatus) || TransactionStatus.ACTIVE,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

function buildInsertPayload(transaction: CreateTransactionRequest) {
  const originId = transaction.originId ?? transaction.eventId ?? null;
  const origin =
    transaction.origin ||
    (originId ? TransactionOrigin.EVENT : TransactionOrigin.MANUAL);

  return {
    type: transaction.type,
    date: transaction.date,
    value: Number(transaction.value),
    description: transaction.description,
    category: transaction.categoryId || null,
    source_account: transaction.sourceAccountId || null,
    destination_account: transaction.destinationAccountId || null,
    payment_method: transaction.paymentMethod || null,
    event: transaction.eventId || null,
    origin,
    origin_id: originId,
    status: TransactionStatus.ACTIVE,
  };
}

function buildUpdatePayload(transaction: UpdateTransactionRequest) {
  const updateData: Record<string, unknown> = {};

  if (transaction.type !== undefined) updateData.type = transaction.type;
  if (transaction.date !== undefined) updateData.date = transaction.date;
  if (transaction.value !== undefined)
    updateData.value = Number(transaction.value);
  if (transaction.description !== undefined)
    updateData.description = transaction.description;
  if (transaction.categoryId !== undefined)
    updateData.category = transaction.categoryId || null;
  if (transaction.sourceAccountId !== undefined)
    updateData.source_account = transaction.sourceAccountId || null;
  if (transaction.destinationAccountId !== undefined)
    updateData.destination_account = transaction.destinationAccountId || null;
  if (transaction.paymentMethod !== undefined)
    updateData.payment_method = transaction.paymentMethod || null;
  if (transaction.status !== undefined)
    updateData.status = transaction.status;

  if (
    transaction.origin !== undefined ||
    transaction.originId !== undefined ||
    transaction.eventId !== undefined
  ) {
    const originId =
      transaction.originId !== undefined
        ? transaction.originId
        : transaction.eventId || null;
    const origin =
      transaction.origin ||
      (originId ? TransactionOrigin.EVENT : TransactionOrigin.MANUAL);
    updateData.origin = origin;
    updateData.origin_id = originId;
    updateData.event = originId;
  }

  return updateData;
}

function applyTransactionFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters?: TransactionFilters,
) {
  // Soft-ignore legacy transfers in operational lists
  query = query.neq("type", TransactionType.TRANSFER);

  const status = filters?.status;
  if (status === "all" || filters?.includeInactive) {
    // no status filter
  } else if (status === TransactionStatus.CANCELLED) {
    query = query.eq("status", TransactionStatus.CANCELLED);
  } else {
    query = query.or("status.eq.active,status.is.null");
  }

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }
  if (filters?.categoryId) {
    query = query.eq("category", filters.categoryId);
  }
  if (filters?.accountId) {
    query = query.or(
      `source_account.eq.${filters.accountId},destination_account.eq.${filters.accountId}`,
    );
  }
  if (filters?.origin) {
    query = query.eq("origin", filters.origin);
  }
  if (filters?.eventId) {
    query = query.eq("event", filters.eventId);
  }
  if (filters?.dateFrom) {
    query = query.gte("date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    query = query.lte("date", filters.dateTo);
  }

  return query;
}

export class TransactionsService {
  private tableName = "transactions";

  async create(
    transaction: CreateTransactionRequest,
  ): Promise<ApiResponse<TransactionResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([buildInsertPayload(transaction)])
        .select("*, categories(name)")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapTransactionRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /** Full list for dashboard / aggregates. Prefer `findPage` for UI tables. */
  async findAll(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<TransactionsListResponse>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      query = applyTransactionFilters(query, filters);

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data || []).map(mapTransactionRow), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findPage(
    params: TransactionListParams = {},
  ): Promise<ApiResponse<PaginatedResult<TransactionResponse>>> {
    try {
      const { page, pageSize } = normalizePagination(params);
      const { from, to } = toRange(page, pageSize);

      let query = supabase
        .from(this.tableName)
        .select("*, categories(name)", { count: "exact" })
        .order("created_at", { ascending: false });

      query = applyTransactionFilters(query, params);

      const { data, error, count } = await query.range(from, to);

      if (error) {
        return { data: null, error: error.message };
      }

      return {
        data: buildPaginatedResult(
          (data || []).map(mapTransactionRow),
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

  /**
   * Totals for filtered set (not limited to current page).
   * Excludes cancelled unless status filter is CANCELLED/all appropriately.
   */
  async summarize(
    filters?: TransactionFilters,
  ): Promise<ApiResponse<TransactionSummary>> {
    try {
      const baseFilters: TransactionFilters = {
        ...filters,
        // For totals: if viewing active-only (default), exclude cancelled
        status:
          filters?.status === "all"
            ? "all"
            : filters?.status === TransactionStatus.CANCELLED
              ? TransactionStatus.CANCELLED
              : TransactionStatus.ACTIVE,
      };

      const incomeFilters = { ...baseFilters, type: TransactionType.INCOME };
      const expenseFilters = { ...baseFilters, type: TransactionType.EXPENSE };

      const sumFor = async (f: TransactionFilters) => {
        let query = supabase.from(this.tableName).select("value");
        query = applyTransactionFilters(query, f);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return (data || []).reduce(
          (s, row) => s + (Number((row as { value: number }).value) || 0),
          0,
        );
      };

      // When user filtered a single type, only that side has value
      if (filters?.type === TransactionType.INCOME) {
        const income = await sumFor(incomeFilters);
        return { data: { income, expense: 0, balance: income }, error: null };
      }
      if (filters?.type === TransactionType.EXPENSE) {
        const expense = await sumFor(expenseFilters);
        return {
          data: { income: 0, expense, balance: -expense },
          error: null,
        };
      }

      const [income, expense] = await Promise.all([
        sumFor(incomeFilters),
        sumFor(expenseFilters),
      ]);

      return {
        data: { income, expense, balance: income - expense },
        error: null,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro interno do servidor";
      return { data: null, error: message };
    }
  }

  async findById(id: string): Promise<ApiResponse<TransactionResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, categories(name)")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapTransactionRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async update(
    id: string,
    transaction: UpdateTransactionRequest,
  ): Promise<ApiResponse<TransactionResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(buildUpdatePayload(transaction))
        .eq("id", id)
        .select("*, categories(name)")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapTransactionRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async cancel(id: string): Promise<ApiResponse<null>> {
    const result = await this.update(id, {
      status: TransactionStatus.CANCELLED,
    });
    return result.error
      ? { data: null, error: result.error }
      : { data: null, error: null };
  }
}

export const transactionsService = new TransactionsService();
