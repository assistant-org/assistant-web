export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum TransactionOrigin {
  MANUAL = "manual",
  EVENT = "evento",
  BUDGET = "orcamento",
  ADJUSTMENT = "ajuste",
}

export enum TransactionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  PIX = "PIX",
  DEBIT_CARD = "DEBIT_CARD",
  MONEY = "MONEY",
}

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  value: number;
  description?: string;
  /** Category id. Required for INCOME/EXPENSE, null for TRANSFER. */
  categoryId?: string | null;
  /** Resolved category name, for display. */
  category?: string;
  /** Account money leaves. Required for EXPENSE and TRANSFER. */
  sourceAccountId?: string | null;
  /** Account money enters. Required for INCOME and TRANSFER. */
  destinationAccountId?: string | null;
  paymentMethod?: PaymentMethod | null;
  eventId?: string | null;
  origin: TransactionOrigin;
  originId?: string | null;
  status: TransactionStatus;
  created_at?: string;
  updated_at?: string;
}
