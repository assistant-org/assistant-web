import { supabase } from "../../config";
import {
  CreateEntryRequest,
  UpdateEntryRequest,
} from "./models/request/request";
import {
  EntryResponse,
  EntriesListResponse,
  ApiResponse,
} from "./models/response/reponse";

export class EntriesService {
  private tableName = "entries";

  /**
   * Cria uma nova entrada
   */
  async create(entry: CreateEntryRequest): Promise<ApiResponse<EntryResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            "entry-day": entry.date,
            category: entry.category,
            value: Number(entry.value),
            description: entry.description,
            "payment-type": entry.paymentMethod,
            event: entry.event === "null" ? null : entry.event || null,
          },
        ])
        .select("*, categories(name)")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back to expected format
      const mappedData = {
        ...data,
        date: data["entry-day"],
        paymentMethod: data["payment-type"],
        category: data.categories?.name || data.category,
      };
      delete mappedData["entry-day"];
      delete mappedData["payment-type"];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca todas as entradas
   */
  async findAll(): Promise<ApiResponse<EntriesListResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, categories(name)")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Map columns back
      const mappedData =
        data?.map((item) => ({
          ...item,
          category: item.categories?.name || item.category,
          date: item["entry-day"],
          paymentMethod: item["payment-type"],
        })) || [];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca uma entrada por ID
   */
  async findById(id: string): Promise<ApiResponse<EntryResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, categories(name)")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back to expected format
      const mappedData = {
        ...data,
        date: data["entry-day"],
        paymentMethod: data["payment-type"],
        category: data.categories?.name || data.category,
      };
      delete mappedData["entry-day"];
      delete mappedData["payment-type"];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Atualiza uma entrada
   */
  async update(
    id: string,
    entry: UpdateEntryRequest,
  ): Promise<ApiResponse<EntryResponse>> {
    try {
      const updateData: any = {};

      if (entry.date) updateData["entry-day"] = entry.date;
      if (entry.category) updateData.category = entry.category;
      if (entry.value !== undefined) updateData.value = entry.value;
      if (entry.description !== undefined)
        updateData.description = entry.description;
      if (entry.paymentMethod !== undefined)
        updateData["payment-type"] = entry.paymentMethod;
      if (entry.event !== undefined)
        updateData.event = entry.event === "null" ? null : entry.event || null;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq("id", id)
        .select("*, categories(name)")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back to expected format
      const mappedData = {
        ...data,
        date: data["entry-day"],
        paymentMethod: data["payment-type"],
        category: data.categories?.name || data.category,
      };
      delete mappedData["entry-day"];
      delete mappedData["payment-type"];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Deleta uma entrada
   */
  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }
}

export const entriesService = new EntriesService();
