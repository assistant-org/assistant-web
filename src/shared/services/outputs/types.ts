export interface Output {
  id?: string;
  date: string;
  category: string;
  paymentMethod: string; // 'dinheiro' | 'pix' | 'cartao' | 'transferencia'
  value: number;
  description?: string;
  event?: string; // Novo campo
  created_at?: string;
  updated_at?: string;
}

export interface CreateOutputRequest {
  date: string;
  category: string;
  paymentMethod: string;
  value: number;
  description?: string;
  event?: string;
}

export interface UpdateOutputRequest {
  date?: string;
  category?: string;
  paymentMethod?: string;
  value?: number;
  description?: string;
  event?: string;
}
