import { supabase } from "../../config";
import { ApiResponse } from "../types";
import { TransactionType } from "../transactions/types";
import { Account, CreateAccountRequest, UpdateAccountRequest } from "./types";

function mapAccountRow(data: Record<string, unknown>): Account {
  return {
    id: String(data.id),
    name: (data.name as string) || "",
    description: (data.description as string) || undefined,
    active: Boolean(data.active),
    openingBalance: Number(data.opening_balance) || 0,
    created_at: data.created_at as string | undefined,
  };
}

export class AccountsService {
  private tableName = "accounts";

  async create(
    account: CreateAccountRequest,
  ): Promise<ApiResponse<Account>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            name: account.name,
            description: account.description,
            active: account.active ?? true,
            opening_balance: account.openingBalance ?? 0,
          },
        ])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapAccountRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findAll(options?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<Account[]>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: true });

      if (!options?.includeInactive) {
        query = query.eq("active", true);
      }

      const { data, error } = await query;

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: (data || []).map(mapAccountRow), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findById(id: string): Promise<ApiResponse<Account>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapAccountRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async update(
    id: string,
    updates: UpdateAccountRequest,
  ): Promise<ApiResponse<Account>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.active !== undefined) updateData.active = updates.active;
      if (updates.openingBalance !== undefined)
        updateData.opening_balance = updates.openingBalance;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapAccountRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /** Accounts are never deleted — deactivate keeps history/traceability intact. */
  async deactivate(id: string): Promise<ApiResponse<null>> {
    const result = await this.update(id, { active: false });
    return result.error
      ? { data: null, error: result.error }
      : { data: null, error: null };
  }

  /**
   * Running balance is always derived from history, never stored/mutated
   * directly: opening balance + incomes received - expenses paid + transfers
   * received - transfers sent.
   */
  async getBalance(accountId: string): Promise<ApiResponse<number>> {
    try {
      const [accountRes, transactionsRes] = await Promise.all([
        this.findById(accountId),
        supabase
          .from("transactions")
          .select("type, value, source_account, destination_account")
          .or("status.eq.active,status.is.null")
          .or(
            `source_account.eq.${accountId},destination_account.eq.${accountId}`,
          ),
      ]);

      if (accountRes.error || !accountRes.data) {
        return { data: null, error: accountRes.error || "Conta não encontrada" };
      }

      if (transactionsRes.error) {
        return { data: null, error: transactionsRes.error.message };
      }

      const rows = transactionsRes.data || [];
      const balance = rows.reduce((total, row) => {
        const value = Number(row.value) || 0;
        const isDestination = String(row.destination_account) === accountId;
        const isSource = String(row.source_account) === accountId;

        if (row.type === TransactionType.INCOME && isDestination) {
          return total + value;
        }
        if (row.type === TransactionType.EXPENSE && isSource) {
          return total - value;
        }
        if (row.type === TransactionType.TRANSFER) {
          if (isDestination) return total + value;
          if (isSource) return total - value;
        }
        return total;
      }, accountRes.data.openingBalance);

      return { data: balance, error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const accountsService = new AccountsService();
