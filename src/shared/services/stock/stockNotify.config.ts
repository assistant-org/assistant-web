/** Presets for seller WhatsApp notify after stock ENTRY. */
export const STOCK_SELLER_PRESETS = [
  {
    id: "edmilson",
    label: "Edmilson",
    phone: "15997986710",
  },
] as const;

export type StockSellerPresetId = (typeof STOCK_SELLER_PRESETS)[number]["id"];
