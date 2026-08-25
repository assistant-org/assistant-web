export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatLiters(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} L`;
}

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** Mask: (11) 99999-9999 or (11) 9999-9999 */
export function formatPhoneBR(raw: string): string {
  const d = digitsOnlyPhone(raw).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidPhoneBR(phone: string): boolean {
  const d = digitsOnlyPhone(phone);
  return d.length >= 10 && d.length <= 11;
}
