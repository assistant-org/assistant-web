export interface EntryResponse {
  id: string;
  date: string;
  category: string;
  paymentMethod?: string;
  value: number;
  description?: string;
  event?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export type EntriesListResponse = EntryResponse[];
