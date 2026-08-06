import { supabase } from "../../config";
import {
  buildPaginatedResult,
  normalizePagination,
  toRange,
} from "../pagination";
import { ApiResponse, PaginatedResult, PaginationParams } from "../types";
import {
  Budget,
  BudgetCalculationResult,
  BudgetExtraLine,
  BudgetFlavorLine,
  BudgetServiceType,
  BudgetStatus,
  ConsumptionProfileId,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "./types";

function mapBudgetRow(data: Record<string, unknown>): Budget {
  const eventDateRaw = data.event_date as string | null | undefined;
  return {
    id: String(data.id),
    serviceType: data.service_type as BudgetServiceType,
    people: Number(data.people),
    hours: Number(data.hours),
    consumptionProfile: data.consumption_profile as ConsumptionProfileId,
    otherDrinks: Boolean(data.other_drinks),
    distanceKm: Number(data.distance_km) || 0,
    flavors: (data.flavors as BudgetFlavorLine[]) || [],
    extras: (data.extras as BudgetExtraLine[]) || [],
    calculation: data.calculation as BudgetCalculationResult,
    calculatedTotal: Number(data.calculated_total) || 0,
    finalTotal: Number(data.final_total) || 0,
    adjustmentReason: (data.adjustment_reason as string) || null,
    clientName: (data.client_name as string) || "",
    clientPhone: (data.client_phone as string) || "",
    clientCity: (data.client_city as string) || "",
    notes: (data.notes as string) || "",
    eventDate: eventDateRaw ? String(eventDateRaw).slice(0, 10) : null,
    status: (data.status as BudgetStatus) || "open",
    reminderSentAt: (data.reminder_sent_at as string) || null,
    created_at: data.created_at as string | undefined,
    updated_at: data.updated_at as string | undefined,
  };
}

function toRowPayload(payload: CreateBudgetRequest | UpdateBudgetRequest) {
  return {
    service_type: payload.serviceType,
    people: payload.people,
    hours: payload.hours,
    consumption_profile: payload.consumptionProfile,
    other_drinks: payload.otherDrinks,
    distance_km: payload.distanceKm,
    flavors: payload.flavors,
    extras: payload.extras,
    calculation: payload.calculation,
    calculated_total: payload.calculatedTotal,
    final_total: payload.finalTotal,
    adjustment_reason: payload.adjustmentReason ?? null,
    client_name: payload.clientName,
    client_phone: payload.clientPhone,
    client_city: payload.clientCity,
    notes: payload.notes ?? "",
    event_date: payload.eventDate,
    status: payload.status ?? "open",
    updated_at: new Date().toISOString(),
  };
}

export class BudgetsService {
  private tableName = "budgets";

  async create(payload: CreateBudgetRequest): Promise<ApiResponse<Budget>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([toRowPayload(payload)])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapBudgetRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async update(
    id: string,
    payload: UpdateBudgetRequest,
  ): Promise<ApiResponse<Budget>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(toRowPayload(payload))
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapBudgetRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async updateStatus(
    id: string,
    status: BudgetStatus,
  ): Promise<ApiResponse<Budget>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapBudgetRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findAll(): Promise<ApiResponse<Budget[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return {
        data: (data || []).map((row) => mapBudgetRow(row)),
        error: null,
      };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async findPage(
    params: PaginationParams = {},
  ): Promise<ApiResponse<PaginatedResult<Budget>>> {
    try {
      const { page, pageSize } = normalizePagination(params);
      const { from, to } = toRange(page, pageSize);

      const { data, error, count } = await supabase
        .from(this.tableName)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return { data: null, error: error.message };
      }

      return {
        data: buildPaginatedResult(
          (data || []).map((row) => mapBudgetRow(row)),
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

  async findById(id: string): Promise<ApiResponse<Budget>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: mapBudgetRow(data), error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: true, error: null };
    } catch {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const budgetsService = new BudgetsService();
