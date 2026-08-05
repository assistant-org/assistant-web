import {
  PaymentMethod,
  TransactionOrigin,
  TransactionStatus,
  TransactionType,
} from "../../types";

export interface CreateTransactionRequest {
  type: TransactionType;
  date: string;
  value: number;
  description?: string;
  categoryId?: string | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  paymentMethod?: PaymentMethod | null;
  eventId?: string | null;
  origin?: TransactionOrigin;
  originId?: string | null;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  date?: string;
  value?: number;
  description?: string;
  categoryId?: string | null;
  sourceAccountId?: string | null;
  destinationAccountId?: string | null;
  paymentMethod?: PaymentMethod | null;
  eventId?: string | null;
  origin?: TransactionOrigin;
  originId?: string | null;
  status?: TransactionStatus;
}
