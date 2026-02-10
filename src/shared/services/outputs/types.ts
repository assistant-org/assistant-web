export interface Output {
  id?: string;
  date: string;
  category: string;
  type: string; // 'fixa' | 'variavel'
  paymentMethod: string; // 'dinheiro' | 'pix' | 'cartao' | 'transferencia'
  value: number;
  description?: string;
  isRecurring?: boolean;
  recurrenceDay?: number;
  event?: string; // Novo campo
  created_at?: string;
  updated_at?: string;
}

export interface CreateOutputRequest {
  date: string;
  category: string;
  type: string;
  paymentMethod: string;
  value: number;
  description?: string;
  isRecurring?: boolean;
  recurrenceDay?: number;
  event?: string;
}

export interface UpdateOutputRequest {
  date?: string;
  category?: string;
  type?: string;
  paymentMethod?: string;
  value?: number;
  description?: string;
  isRecurring?: boolean;
  recurrenceDay?: number;
  event?: string;
}
