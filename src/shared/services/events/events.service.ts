import { supabase } from "../../config";
import { CreateEventRequest, UpdateEventRequest } from "./types";
import {
  EventResponse,
  EventsListResponse,
  ApiResponse,
} from "./models/response/response";

export class EventsService {
  private tableName = "events";

  /**
   * Cria um novo evento
   */
  async create(
    event: CreateEventRequest,
  ): Promise<ApiResponse<EventResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          name: event.name,
          'event-day': event.date,
          'event-type': event.type,
          observations: event.observations,
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back to expected format
      const mappedData = {
        ...data,
        date: data['event-day'],
        type: data['event-type'],
      };
      delete mappedData['event-day'];
      delete mappedData['event-type'];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca todos os eventos
   */
  async findAll(): Promise<ApiResponse<EventsListResponse>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      // Map columns back
      const mappedData = data?.map(item => ({
        ...item,
        date: item['event-day'],
        type: item['event-type'],
      })) || [];

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Busca um evento por ID
   */
  async findById(id: string): Promise<ApiResponse<EventResponse>> {
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
        date: data['event-day'],
        type: data['event-type'],
      };

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Atualiza um evento
   */
  async update(
    id: string,
    updates: UpdateEventRequest,
  ): Promise<ApiResponse<EventResponse>> {
    try {
      // Map updates to column names
      const mappedUpdates: any = {};
      if (updates.name !== undefined) mappedUpdates.name = updates.name;
      if (updates.date !== undefined) mappedUpdates['event-day'] = updates.date;
      if (updates.type !== undefined) mappedUpdates['event-type'] = updates.type;
      if (updates.observations !== undefined) mappedUpdates.observations = updates.observations;

      const { data, error } = await supabase
        .from(this.tableName)
        .update(mappedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      // Map back
      const mappedData = {
        ...data,
        date: data['event-day'],
        type: data['event-type'],
      };

      return { data: mappedData, error: null };
    } catch (err) {
      return { data: null, error: "Erro interno do servidor" };
    }
  }

  /**
   * Deleta um evento
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
export const eventsService = new EventsService();