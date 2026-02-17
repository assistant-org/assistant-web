export interface Entry {
  id?: string;
  date: string;
  category: string;
  paymentMethod?: string; // 'dinheiro' | 'pix' | 'cartao'
  value: number;
  description?: string;
  event?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEntryRequest {
  date: string;
  category: string;
  paymentMethod?: string;
  value: number;
  description?: string;
  event?: string;
}

export interface UpdateEntryRequest {
  date?: string;
  category?: string;
  paymentMethod?: string;
  value?: number;
  description?: string;
  event?: string;
}
