import { KEG_SIZES, KegSize } from "./budget.config";

export interface FlavorPercentInput {
  productId: string;
  name: string;
  unitPrice: number;
  percent: number;
}

export interface FlavorAllocation {
  productId: string;
  name: string;
  unitPrice: number;
  percent: number;
  liters: number;
}

export interface KegLine {
  size: KegSize;
  count: number;
}

export interface KegPlan {
  kegs: KegLine[];
  suppliedLiters: number;
  technicalReserve: number;
}

export interface PercentValidation {
  ok: boolean;
  total: number;
  error: string | null;
}

/**
 * Pure service for flavor % validation, liter allocation, and keg packing.
 * UI must not reimplement these rules.
 */
export class BeerDistributionService {
  validatePercents(
    flavors: Array<{ percent: number }>,
  ): PercentValidation {
    const total = flavors.reduce(
      (sum, f) => sum + (Number.isFinite(f.percent) ? f.percent : 0),
      0,
    );
    const rounded = Math.round(total * 100) / 100;
    if (rounded > 100) {
      return {
        ok: false,
        total: rounded,
        error: `Distribuição em ${rounded}% — ultrapassa 100%.`,
      };
    }
    if (rounded < 100) {
      return {
        ok: false,
        total: rounded,
        error: `Distribuição em ${rounded}% — falta completar 100%.`,
      };
    }
    return { ok: true, total: 100, error: null };
  }

  /**
   * Snap raw liters to the nearest combination of 30/50 kegs.
   * On equal distance, prefer the larger supply (e.g. 25 → 30).
   * Positive amounts below 30 snap to one 30L keg.
   */
  snapToKegLiters(raw: number): number {
    if (!Number.isFinite(raw) || raw <= 0) return 0;

    const need = raw;
    let bestSupplied: number | null = null;
    let bestDist = Infinity;

    const maxKegs = Math.ceil(need / 30) + 2;

    for (let c50 = 0; c50 <= maxKegs; c50++) {
      for (let c30 = 0; c30 <= maxKegs - c50; c30++) {
        if (c50 + c30 === 0) continue;
        const supplied = c50 * 50 + c30 * 30;
        const dist = Math.abs(supplied - need);
        if (
          dist < bestDist ||
          (dist === bestDist &&
            bestSupplied != null &&
            supplied > bestSupplied)
        ) {
          bestDist = dist;
          bestSupplied = supplied;
        }
      }
    }

    return bestSupplied ?? 30;
  }

  /** Split need liters by percent, then snap each flavor to 30/50 keg sizes. */
  allocateFlavorLiters(
    billingLiters: number,
    flavors: FlavorPercentInput[],
  ): FlavorAllocation[] {
    return flavors.map((flavor) => {
      const raw = (billingLiters * flavor.percent) / 100;
      const liters = this.snapToKegLiters(raw);
      return {
        productId: flavor.productId,
        name: flavor.name,
        unitPrice: flavor.unitPrice,
        percent: flavor.percent,
        liters,
      };
    });
  }

  /**
   * Cover required liters with 30/50 kegs.
   * Never under-supply. Minimize technical reserve; then minimize keg count.
   */
  planKegs(requiredLiters: number): KegPlan {
    const need = Math.max(0, Math.ceil(requiredLiters));
    if (need === 0) {
      return { kegs: [], suppliedLiters: 0, technicalReserve: 0 };
    }

    type Candidate = {
      waste: number;
      count: number;
      c50: number;
      c30: number;
    };

    let best: Candidate | null = null;
    const max50 = Math.ceil(need / 50) + 1;

    for (let c50 = 0; c50 <= max50; c50++) {
      const after50 = need - c50 * 50;
      const c30 = after50 <= 0 ? 0 : Math.ceil(after50 / 30);
      const supplied = c50 * 50 + c30 * 30;
      if (supplied < need) continue;

      const waste = supplied - need;
      const count = c50 + c30;
      if (
        !best ||
        waste < best.waste ||
        (waste === best.waste && count < best.count)
      ) {
        best = { waste, count, c50, c30 };
      }
    }

    if (!best) {
      const count = Math.ceil(need / 30);
      return {
        kegs: [{ size: 30, count }],
        suppliedLiters: count * 30,
        technicalReserve: count * 30 - need,
      };
    }

    const kegs: KegLine[] = (
      [
        { size: 50 as KegSize, count: best.c50 },
        { size: 30 as KegSize, count: best.c30 },
      ] as KegLine[]
    ).filter((k) => k.count > 0);

    const suppliedLiters = kegs.reduce((s, k) => s + k.size * k.count, 0);

    return {
      kegs,
      suppliedLiters,
      technicalReserve: suppliedLiters - need,
    };
  }

  /** Equal integer percents that sum to 100. */
  equalPercents(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [100];
    const base = Math.floor(100 / count);
    const remainder = 100 - base * count;
    return Array.from({ length: count }, (_, i) =>
      i < remainder ? base + 1 : base,
    );
  }
}

export const beerDistribution = new BeerDistributionService();

/** Re-export sizes for callers that only need the constant via this module. */
export { KEG_SIZES };
