/**
 * Thin re-export: the Financial module has no validation rules of its own,
 * it uses the shared Transaction schema directly (single source of truth
 * shared with the transactions service).
 */
export { transactionSchema as transactionFormSchema } from "../../../shared/services/transactions/schema";
export type { TransactionFormSchema } from "../../../shared/services/transactions/schema";
