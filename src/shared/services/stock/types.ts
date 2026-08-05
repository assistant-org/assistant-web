export enum StockMovementType {
  ENTRY = "ENTRY",
  EXIT = "EXIT",
  LOSS = "LOSS",
  INTERNAL_CONSUMPTION = "INTERNAL_CONSUMPTION",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum StockMovementDirection {
  IN = "IN",
  OUT = "OUT",
}

export enum StockMovementOrigin {
  MANUAL = "manual",
  EVENT = "evento",
  TRANSACTION = "transacao",
  ADJUSTMENT = "ajuste",
}

export enum StockBatchStatus {
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export interface StockMovement {
  id: string;
  batchId: string;
  productId: string;
  productName?: string;
  type: StockMovementType;
  direction: StockMovementDirection;
  quantity: number;
  date: string;
  userId?: string | null;
  reason?: string | null;
  origin: StockMovementOrigin;
  originId?: string | null;
  eventId?: string | null;
  operationGroupId?: string | null;
  reversesMovementId?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StockBatch {
  id: string;
  productId: string;
  productName?: string;
  productCategory?: string;
  productUnit?: string;
  entryDate: string;
  expiryDate?: string | null;
  initialQuantity: number;
  unitValue: number;
  observations?: string | null;
  eventId?: string | null;
  /** Derived: sum(IN) - sum(OUT) over this batch's movements. */
  availableQuantity: number;
  /** Derived: ACTIVE when availableQuantity > 0, else CLOSED. */
  status: StockBatchStatus;
  movements?: StockMovement[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateEntryRequest {
  type?: StockMovementType.ENTRY;
  productId: string;
  quantity: number;
  unitValue: number;
  entryDate: string;
  expiryDate?: string | null;
  observations?: string | null;
  reason?: string | null;
  origin?: StockMovementOrigin;
  originId?: string | null;
  eventId?: string | null;
  operationGroupId?: string | null;
}

export interface CreateStockMovementRequest {
  type: Exclude<StockMovementType, StockMovementType.ENTRY>;
  productId: string;
  batchId: string;
  quantity: number;
  date: string;
  reason?: string | null;
  /** Required for ADJUSTMENT — IN increases stock, OUT decreases. */
  direction?: StockMovementDirection;
  origin?: StockMovementOrigin;
  originId?: string | null;
  eventId?: string | null;
  operationGroupId?: string | null;
  reversesMovementId?: string | null;
}

export type CreateMovementInput = CreateEntryRequest | CreateStockMovementRequest;

export interface UpdateStockBatchRequest {
  expiryDate?: string | null;
  observations?: string | null;
  unitValue?: number;
  eventId?: string | null;
}

export interface StockBatchFilters {
  productId?: string;
  category?: string;
  status?: StockBatchStatus | "all";
  expiryBefore?: string;
  eventId?: string;
}

export interface StockMovementFilters {
  batchId?: string;
  productId?: string;
  type?: StockMovementType;
  eventId?: string;
  dateFrom?: string;
  dateTo?: string;
}
