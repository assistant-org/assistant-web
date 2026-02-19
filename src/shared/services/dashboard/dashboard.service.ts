import { EntriesService } from "../entries/entries.service";
import { OutputsService } from "../outputs/outputs.serivce";
import { EventsService } from "../events/events.service";
import { CategoriesService } from "../categories/categories.service";
import {
  IDashboardData,
  IMetric,
  IExpenseByCategory,
  IKPI,
  ITransaction,
  IChartData,
} from "../../../modules/protected/home/types";

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

export class DashboardService {
  private entriesService = new EntriesService();
  private outputsService = new OutputsService();
  private eventsService = new EventsService();
  private categoriesService = new CategoriesService();

  async getDashboardData(): Promise<IDashboardData> {
    const [entriesRes, outputsRes, eventsRes, categoriesRes] =
      await Promise.all([
        this.entriesService.findAll(),
        this.outputsService.findAll(),
        this.eventsService.findAll(),
        this.categoriesService.findAll(),
      ]);

    const entries = entriesRes.data || [];
    const outputs = outputsRes.data || [];
    const events = eventsRes.data || [];
    const categories = categoriesRes.data || [];

    // Build category name → color lookup
    const categoryColorMap: Record<string, string> = {};
    categories.forEach((cat) => {
      if (cat.name && cat.color) categoryColorMap[cat.name] = cat.color;
    });

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // --- Filter by month ---
    const currentEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const prevEntries = entries.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });
    const currentOutputs = outputs.filter((o) => {
      const d = new Date(o.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const prevOutputs = outputs.filter((o) => {
      const d = new Date(o.date);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    // --- Calculated Totals ---
    const currentRevenue = currentEntries.reduce(
      (s, e) => s + (e.value || 0),
      0,
    );
    const prevRevenue = prevEntries.reduce((s, e) => s + (e.value || 0), 0);
    const currentExpenses = currentOutputs.reduce(
      (s, o) => s + (o.value || 0),
      0,
    );
    const prevExpenses = prevOutputs.reduce((s, o) => s + (o.value || 0), 0);
    const currentProfit = currentRevenue - currentExpenses;
    const prevProfit = prevRevenue - prevExpenses;
    const currentMargin =
      currentRevenue > 0 ? (currentProfit / currentRevenue) * 100 : 0;
    const prevMargin = prevRevenue > 0 ? (prevProfit / prevRevenue) * 100 : 0;
    const totalBalance =
      entries.reduce((s, e) => s + (e.value || 0), 0) -
      outputs.reduce((s, o) => s + (o.value || 0), 0);

    // --- Metrics ---
    const metrics: IMetric[] = [
      {
        title: "Faturamento do Mês",
        value: formatCurrency(currentRevenue),
        change: getChangeLabel(currentRevenue, prevRevenue),
        changeType: getChangeType(currentRevenue, prevRevenue),
      },
      {
        title: "Total de Despesas",
        value: formatCurrency(currentExpenses),
        change: getChangeLabel(currentExpenses, prevExpenses),
        changeType: getChangeType(currentExpenses, prevExpenses),
      },
      {
        title: "Lucro Líquido",
        value: formatCurrency(currentProfit),
        change: getChangeLabel(currentProfit, prevProfit),
        changeType: getChangeType(currentProfit, prevProfit),
      },
      {
        title: "Margem de Lucro",
        value: formatPercentage(currentMargin),
        change:
          prevMargin > 0
            ? `${currentMargin >= prevMargin ? "+" : ""}${(currentMargin - prevMargin).toFixed(1)}%`
            : undefined,
        changeType: getChangeType(currentMargin, prevMargin),
      },
      {
        title: "Saldo em Caixa",
        value: formatCurrency(totalBalance),
      },
    ];

    // --- Revenue Chart (last 6 months) ---
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
      const monthRevenue = entries
        .filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === month && d.getFullYear() === year;
        })
        .reduce((s, e) => s + (e.value || 0), 0);
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

    // --- Expenses by Category ---
    const expByCategory: Record<string, number> = {};
    currentOutputs.forEach((o) => {
      const cat = o.category || "Outros";
      expByCategory[cat] = (expByCategory[cat] || 0) + (o.value || 0);
    });

    const expensesByCategory: IExpenseByCategory[] = Object.entries(
      expByCategory,
    )
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], index) => ({
        category,
        amount,
        color:
          categoryColorMap[category] ||
          CHART_COLORS[index % CHART_COLORS.length],
      }));

    // --- KPIs ---
    // Build event ID → name lookup from the fetched events list
    const eventIdToName: Record<string, string> = {};
    events.forEach((ev) => {
      if (ev.id) eventIdToName[ev.id] = ev.name;
    });

    // Most profitable event this month
    const eventRevenue: Record<string, number> = {};
    currentEntries
      .filter((e) => e.event)
      .forEach((e) => {
        const eventName = eventIdToName[e.event!] || e.event!;
        eventRevenue[eventName] =
          (eventRevenue[eventName] || 0) + (e.value || 0);
      });
    const topEvent = Object.entries(eventRevenue).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Most used payment method this month
    const paymentCounts: Record<string, number> = {};
    currentEntries.forEach((e) => {
      const pm = e.paymentMethod || "Outros";
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
    });
    const topPayment = Object.entries(paymentCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Events this month
    const eventsThisMonth = events.filter((ev) => {
      const d = new Date(ev.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const kpis: IKPI[] = [
      {
        title: "Evento Mais Lucrativo",
        value: topEvent ? topEvent[0] : "Sem dados",
      },
      {
        title: "Forma de Pgto. Mais Usada",
        value: topPayment ? topPayment[0] : "Sem dados",
      },
      {
        title: "Total de Eventos no Mês",
        value: String(eventsThisMonth.length),
      },
      {
        title: "Total de Entradas no Mês",
        value: String(currentEntries.length),
      },
    ];

    // --- Recent Transactions ---
    type TransactionRaw = {
      id: number;
      description: string;
      amount: number;
      type: "income" | "expense";
      date: string;
      sortKey: string;
    };

    const allRaw: TransactionRaw[] = [
      ...entries.map((e, i) => ({
        id: i + 1,
        description: e.description || `Entrada - ${e.category}`,
        amount: e.value || 0,
        type: "income" as const,
        date: e.date,
        sortKey: e.created_at || e.date,
      })),
      ...outputs.map((o, i) => ({
        id: i + 10000,
        description: o.description || `Saída - ${o.category}`,
        amount: o.value || 0,
        type: "expense" as const,
        date: o.date,
        sortKey: o.created_at || o.date,
      })),
    ];

    const recentTransactions: ITransaction[] = allRaw
      .sort(
        (a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime(),
      )
      .slice(0, 5)
      .map((t, i) => ({
        id: i + 1,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: formatRelativeDate(t.date),
      }));

    return {
      metrics,
      revenueChartData,
      expensesByCategory,
      kpis,
      recentTransactions,
    };
  }
}
