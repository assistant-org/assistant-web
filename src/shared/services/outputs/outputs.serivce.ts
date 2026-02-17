import { supabase } from "../../config";
import { CreateOutputRequest, UpdateOutputRequest } from "./types";
import {
  OutputResponse,
  OutputsListResponse,
  ApiResponse,
} from "./models/response/response";

export class OutputsService {
  private tableName = "output";

  /**
   * Cria uma nova saída
   */
  async create(
    output: CreateOutputRequest,
  ): Promise<ApiResponse<OutputResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            "output-day": output.date,
            category: output.category,
            value: output.value,
            description: output.description,
            "payment-type": output.paymentMethod,
            event: output.event === "null" ? null : output.event || null,
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
        date: data["output-day"],
        paymentMethod: data["payment-type"],
        isRecurring: data.recurrence,
        category: data.categories?.name || data.category,
      };
      delete mappedData["output-day"];
      delete mappedData["payment-type"];
      delete mappedData.recurrence;

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca todas as saídas
   */
  async findAll(): Promise<ApiResponse<OutputsListResponse>> {
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
          date: item["output-day"],
          paymentMethod: item["payment-type"],
          isRecurring: item.recurrence,
        })) || [];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca uma saída por ID
   */
  async findById(id: string): Promise<ApiResponse<OutputResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back
      const mappedData = {
        ...data,
        date: data["output-day"],
        paymentMethod: data["payment-type"],
        isRecurring: data.recurrence,
      };

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Atualiza uma saída
   */
  async update(
    id: string,
    updates: UpdateOutputRequest,
  ): Promise<ApiResponse<OutputResponse>> {
    try {
      // Map updates to column names
      const mappedUpdates: any = {};
      if (updates.date !== undefined)
        mappedUpdates["output-day"] = updates.date;
      if (updates.category !== undefined)
        mappedUpdates.category = updates.category;
      if (updates.value !== undefined) mappedUpdates.value = updates.value;
      if (updates.description !== undefined)
        mappedUpdates.description = updates.description;
      if (updates.paymentMethod !== undefined)
        mappedUpdates["payment-type"] = updates.paymentMethod;
      if (updates.event !== undefined)
        mappedUpdates.event =
          updates.event === "" || updates.event === "null"
            ? null
            : updates.event;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(mappedUpdates)
        .eq("id", id)
        .select("*, categories(name)")
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back
      const mappedData = {
        ...data,
        date: data["output-day"],
        paymentMethod: data["payment-type"],
        isRecurring: data.recurrence,
        category: data.categories?.name || data.category,
      };

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Deleta uma saída
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

// Exporta uma instância singleton da service
export const outputsService = new OutputsService();
