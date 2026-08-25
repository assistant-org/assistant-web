const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const UNITS = [
  "",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];

const TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];

const HUNDREDS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

function underThousand(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const h = Math.floor(n / 100);
  const r = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(HUNDREDS[h]);
  if (r > 0) {
    if (r < 20) parts.push(UNITS[r]);
    else {
      const t = Math.floor(r / 10);
      const u = r % 10;
      parts.push(u > 0 ? `${TENS[t]} e ${UNITS[u]}` : TENS[t]);
    }
  }
  return parts.join(" e ");
}

/** Converts integer 0–999999 to Portuguese words (lowercase). */
export function formatNumberExtenso(value: number): string {
  const n = Math.round(Math.abs(value));
  if (n === 0) return "zero";
  if (n < 1000) return underThousand(n);

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const thousandPart =
    thousands === 1 ? "mil" : `${underThousand(thousands)} mil`;
  if (rest === 0) return thousandPart;
  return `${thousandPart} e ${underThousand(rest)}`;
}

/** e.g. 05 de setembro de 2026 */
export function formatDateLongBR(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "___ de ________ de ____";
  const [y, m, d] = iso.slice(0, 10).split("-");
  const day = String(Number(d)).padStart(2, "0");
  const month = MONTHS[Number(m) - 1] ?? "________";
  return `${day} de ${month} de ${y}`;
}

/** e.g. 06 de agosto de 2026 (signature line, no leading zero on day optional - PDF uses both) */
export function formatDateLongBRSignature(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return "___ de ________ de ____";
  const [y, m, d] = iso.slice(0, 10).split("-");
  const day = String(Number(d));
  const month = MONTHS[Number(m) - 1] ?? "________";
  return `${day} de ${month} de ${y}`;
}

/** Contract-style currency in words (matches signed PDF). */
export function formatCurrencyExtensoContract(value: number): string {
  const reais = Math.floor(Math.abs(value));
  const cents = Math.round((Math.abs(value) - reais) * 100);

  if (cents === 0) return formatNumberExtenso(reais);
  const reaisPart = reais > 0 ? formatNumberExtenso(reais) : "";
  const centsPart =
    cents === 1 ? "um centavo" : `${formatNumberExtenso(cents)} centavos`;
  if (!reaisPart) return centsPart;
  return `${reaisPart} e ${centsPart}`;
}

/** R$ 1.205,00 (mil e duzentos e cinco) */
export function formatCurrencyWithExtenso(value: number): string {
  const formatted = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return `${formatted} (${formatCurrencyExtensoContract(value)})`;
}

/** Pads barrel count to 2 digits for contract text, e.g. 02 */
export function formatBarrelCount(n: number): string {
  return String(n).padStart(2, "0");
}

function flavorName(name: string): string {
  return name.replace(/^Chopp de\s+/i, "");
}

/** Clause 2 chopp line: "80 litros de chopp tipo Pilsen" */
export function formatChoppLine(
  liters: number,
  flavors: { name: string }[],
): string {
  const qty = Math.round(liters);
  if (flavors.length === 0) {
    return `${qty} litros de chopp`;
  }
  if (flavors.length === 1) {
    return `${qty} litros de chopp tipo ${flavorName(flavors[0].name)}`;
  }
  const names = flavors.map((f) => flavorName(f.name)).join(", ");
  return `${qty} litros de chopp (${names})`;
}

/** "Capela do Alto-SP" → "Capela do Alto" */
export function extractSignatureCity(clientCityState: string): string {
  return clientCityState.replace(/\s*-?\s*SP\s*$/i, "").trim();
}
