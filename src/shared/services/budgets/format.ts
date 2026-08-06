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
