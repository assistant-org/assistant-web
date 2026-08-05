export interface Account {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  /** Balance before any Transaction. The running balance is always derived, never mutated directly. */
  openingBalance: number;
  created_at?: string;
}

export interface CreateAccountRequest {
  name: string;
  description?: string;
  active?: boolean;
  openingBalance?: number;
}

export interface UpdateAccountRequest {
  name?: string;
  description?: string;
  active?: boolean;
  openingBalance?: number;
}
