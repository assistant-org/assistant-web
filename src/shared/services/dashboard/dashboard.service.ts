import { TransactionsService } from "../transactions/transactions.service";
import { TransactionType } from "../transactions/types";
import { EventsService } from "../events/events.service";
import { CategoriesService } from "../categories/categories.service";
import { productsService } from "../products/products.service";
import { stockBatchesService } from "../stock/stockBatches.service";
import { stockMovementsService } from "../stock/stockMovements.service";
import { StockBatchStatus, StockMovementType } from "../stock/types";
import {
  IDashboardData,
  IMetric,
  IExpenseByCategory,
  IKPI,
  ITransaction,
  IChartData,
  IStockDashboardSummary,
  IStockRankedItem,
} from "../../../modules/protected/home/types";
import { UnitOfMeasure } from "../products/types";
import {
  DateRange,
  getCycleRange,
  isDateInRange,
} from "../../utils/periodRange";

const CHART_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getChangeType(
  current: number,
  previous: number,
): "increase" | "decrease" {
  return current >= previous ? "increase" : "decrease";
}

function getChangeLabel(current: number, previous: number): string | undefined {
  if (previous === 0) return undefined;
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "1 dia atrás";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
}

/** Previous window of equal length ending the day before `range.startDate`. */
function previousRange(range: DateRange): DateRange {
  const start = new Date(range.startDate + "T00:00:00");
  const end = new Date(range.endDate + "T00:00:00");
  const days = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - (days - 1));
  const toISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { startDate: toISO(prevStart), endDate: toISO(prevEnd) };
}

export class DashboardService {
  private transactionsService = new TransactionsService();
  private eventsService = new EventsService();
  private categoriesService = new CategoriesService();

  async getDashboardData(range?: DateRange): Promise<IDashboardData> {
    const period = range || getCycleRange();
    const prev = previousRange(period);

    const [transactionsRes, eventsRes, categoriesRes, productsRes, batchesRes, movementsRes] =
      await Promise.all([
        this.transactionsService.findAll(),
        this.eventsService.findAll(),
        this.categoriesService.findAll(),
        productsService.findAll({ includeInactive: true, trackStockOnly: true }),
        stockBatchesService.findAll(),
        stockMovementsService.findAll(),
      ]);

    const transactions = transactionsRes.data || [];
    const events = eventsRes.data || [];
    const categories = categoriesRes.data || [];
    const products = productsRes.data || [];
    const batches = batchesRes.data || [];
    const movements = movementsRes.data || [];

    const incomes = transactions.filter((t) => t.type === TransactionType.INCOME);
    const expenses = transactions.filter((t) => t.type === TransactionType.EXPENSE);

    const categoryColorMap: Record<string, string> = {};
    categories.forEach((cat) => {
      if (cat.name && cat.color) categoryColorMap[cat.name] = cat.color;
    });

    const currentIncomes = incomes.filter((t) => isDateInRange(t.date, period));
    const prevIncomes = incomes.filter((t) => isDateInRange(t.date, prev));
    const currentExpensesList = expenses.filter((t) => isDateInRange(t.date, period));
    const prevExpensesList = expenses.filter((t) => isDateInRange(t.date, prev));

    const currentRevenue = currentIncomes.reduce((s, t) => s + (t.value || 0), 0);
    const prevRevenue = prevIncomes.reduce((s, t) => s + (t.value || 0), 0);
    const currentExpenses = currentExpensesList.reduce((s, t) => s + (t.value || 0), 0);
    const prevExpenses = prevExpensesList.reduce((s, t) => s + (t.value || 0), 0);
    const currentProfit = currentRevenue - currentExpenses;
    const prevProfit = prevRevenue - prevExpenses;
    const currentMargin =
      currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
    const prevMargin = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;
    const totalBalance =
      incomes.reduce((s, t) => s + (t.value || 0), 0) -
      expenses.reduce((s, t) => s + (t.value || 0), 0);

    const metrics: IMetric[] = [
      {
        title: "Faturamento",
        value: formatCurrency(currentRevenue),
        change: getChangeLabel(currentRevenue, prevRevenue),
        changeType: getChangeType(currentRevenue, prevRevenue),
        icon: "revenue",
      },
      {
        title: "Despesas",
        value: formatCurrency(currentExpenses),
        change: getChangeLabel(currentExpenses, prevExpenses),
        changeType: getChangeType(currentExpenses, prevExpenses),
        icon: "expense",
      },
      {
        title: "Lucro líquido",
        value: formatCurrency(currentProfit),
        change: getChangeLabel(currentProfit, prevProfit),
        changeType: getChangeType(currentProfit, prevProfit),
        icon: "profit",
      },
      {
        title: "Margem",
        value: formatPercentage(currentMargin),
        change:
          prevMargin > 0
            ? `${currentMargin >= prevMargin ? "+" : ""}${(currentMargin - prevMargin).toFixed(1)}%`
            : undefined,
        changeType: getChangeType(currentMargin, prevMargin),
        icon: "margin",
      },
      {
        title: "Saldo",
        value: formatCurrency(totalBalance),
        icon: "balance",
      },
    ];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const chartLabels: string[] = [];
    const chartData: number[] = [];

    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month < 0) {
        month += 12;
        year -= 1;
      }
      chartLabels.push(MONTH_NAMES[month]);
      const monthRevenue = incomes
        .filter((t) => {
          const d = new Date(t.date);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s, t) => s + (t.value || 0), 0);
      chartData.push(monthRevenue);
    }

    const revenueChartData: IChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "Faturamento Mensal",
          data: chartData,
          fill: true,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    };

    const expByCategory: Record<string, number> = {};
    currentExpensesList.forEach((t) => {
      const cat = t.category || "Outros";
      expByCategory[cat] = (expByCategory[cat] || 0) + (t.value || 0);
    });

    const expensesByCategory: IExpenseByCategory[] = Object.entries(expByCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], index) => ({
        category,
        amount,
        color: categoryColorMap[category] || CHART_COLORS[index % CHART_COLORS.length],
      }));

    const eventIdToName: Record<string, string> = {};
    events.forEach((ev) => {
      if (ev.id) eventIdToName[ev.id] = ev.name;
    });

    const eventRevenue: Record<string, number> = {};
    currentIncomes
      .filter((t) => t.eventId)
      .forEach((t) => {
        const eventName = eventIdToName[t.eventId!] || t.eventId!;
        eventRevenue[eventName] = (eventRevenue[eventName] || 0) + (t.value || 0);
      });
    const topEvent = Object.entries(eventRevenue).sort((a, b) => b[1] - a[1])[0];

    const paymentCounts: Record<string, number> = {};
    currentIncomes.forEach((t) => {
      const pm = t.paymentMethod || "Outros";
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
    });
    const topPayment = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0];

    const eventsInPeriod = events.filter((ev) => isDateInRange(ev.date, period));

    const kpis: IKPI[] = [
      {
        title: "Evento mais lucrativo",
        value: topEvent ? topEvent[0] : "Sem dados",
      },
      {
        title: "Forma de pgto. mais usada",
        value: topPayment ? topPayment[0] : "Sem dados",
      },
      {
        title: "Eventos no período",
        value: String(eventsInPeriod.length),
      },
      {
        title: "Receitas no período",
        value: String(currentIncomes.length),
      },
    ];

    type TransactionRaw = {
      id: number;
      description: string;
      amount: number;
      type: "income" | "expense";
      date: string;
      sortKey: string;
    };

    const allRaw: TransactionRaw[] = [
      ...currentIncomes.map((t, i) => ({
        id: i + 1,
        description: t.description || `Receita - ${t.category}`,
        amount: t.value || 0,
        type: "income" as const,
        date: t.date,
        sortKey: t.created_at || t.date,
      })),
      ...currentExpensesList.map((t, i) => ({
        id: i + 10000,
        description: t.description || `Despesa - ${t.category}`,
        amount: t.value || 0,
        type: "expense" as const,
        date: t.date,
        sortKey: t.created_at || t.date,
      })),
    ];

    const recentTransactions: ITransaction[] = allRaw
      .sort((a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime())
      .slice(0, 5)
      .map((t, i) => ({
        id: i + 1,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: formatRelativeDate(t.date),
      }));

    const stockSummary = this.buildStockSummary(products, batches, movements, period);

    return {
      metrics,
      revenueChartData,
      expensesByCategory,
      kpis,
      recentTransactions,
      stockSummary,
    };
  }

  private buildStockSummary(
    products: Awaited<ReturnType<typeof productsService.findAll>>["data"],
    batches: Awaited<ReturnType<typeof stockBatchesService.findAll>>["data"],
    movements: Awaited<ReturnType<typeof stockMovementsService.findAll>>["data"],
    period: DateRange,
  ): IStockDashboardSummary {
    const productList = products || [];
    const batchList = batches || [];
    const movementList = movements || [];

    const UNIT_SHORT: Record<string, string> = {
      [UnitOfMeasure.LITER]: "L",
      [UnitOfMeasure.UNIT]: "un",
      [UnitOfMeasure.KG]: "kg",
    };

    const qtyByProduct = new Map<string, number>();
    let totalImmobilized = 0;

    for (const batch of batchList) {
      if (batch.status !== StockBatchStatus.ACTIVE) continue;
      totalImmobilized += batch.availableQuantity * batch.unitValue;
      qtyByProduct.set(
        batch.productId,
        (qtyByProduct.get(batch.productId) || 0) + batch.availableQuantity,
      );
    }

    const productName = (id: string) =>
      productList.find((p) => p.id === id)?.name || id;
    const productUnit = (id: string) =>
      productList.find((p) => p.id === id)?.unit || UnitOfMeasure.LITER;

    const formatQty = (id: string, qty: number): string => {
      const unit = UNIT_SHORT[productUnit(id)] || "L";
      return `${qty.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ${unit}`.trim();
    };

    const topByQuantity: IStockRankedItem[] = Array.from(qtyByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({
        name: productName(id),
        value: formatQty(id, qty),
      }));

    const belowMinimum: IStockRankedItem[] = productList
      .filter((p) => p.minStock != null && p.active)
      .map((p) => ({
        product: p,
        available: qtyByProduct.get(p.id) || 0,
      }))
      .filter(({ product, available }) => available < (product.minStock ?? 0))
      .sort((a, b) => a.available - b.available)
      .slice(0, 5)
      .map(({ product, available }) => ({
        name: product.name,
        value: `${formatQty(product.id, available)} (mín. ${product.minStock})`,
      }));

    const periodMovements = movementList.filter((m) => isDateInRange(m.date, period));

    const sumByType = (type: StockMovementType): IStockRankedItem[] => {
      const map = new Map<string, number>();
      for (const m of periodMovements) {
        if (m.type !== type) continue;
        map.set(m.productId, (map.get(m.productId) || 0) + m.quantity);
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, qty]) => ({
          name: productName(id),
          value: formatQty(id, qty),
        }));
    };

    return {
      totalImmobilizedValue: formatCurrency(totalImmobilized),
      topByQuantity,
      belowMinimum,
      topConsumption: sumByType(StockMovementType.INTERNAL_CONSUMPTION),
      topLoss: sumByType(StockMovementType.LOSS),
    };
  }
}
