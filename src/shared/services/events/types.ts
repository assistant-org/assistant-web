export interface Event {
  id?: string;
  name: string;
  date: string;
  type: string; // 'fechado' | 'avulso'
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEventRequest {
  name: string;
  date: string;
  type: string;
  observations?: string;
}

export interface UpdateEventRequest {
  name?: string;
  date?: string;
  type?: string;
  observations?: string;
}