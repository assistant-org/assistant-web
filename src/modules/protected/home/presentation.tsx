import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Percent,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import {
  IHomePresentationProps,
  IMetric,
  ITransaction,
  IExpenseByCategory,
} from "./types";
import Card from "../../../shared/components/Card";
import PageHeader from "../../../shared/components/PageHeader";
import LineChart from "./components/LineChart";
import { useMediaQuery } from "../../../shared/hooks/useMediaQuery";
import { PERIOD_OPTIONS } from "../../../shared/utils/periodRange";

const METRIC_ICONS: Record<NonNullable<IMetric["icon"]>, LucideIcon> = {
  revenue: TrendingUp,
  expense: TrendingDown,
  profit: CircleDollarSign,
  margin: Percent,
  balance: Wallet,
};

const MetricCard: React.FC<{ metric: IMetric; square?: boolean }> = ({
  metric,
  square,
}) => {
  const Icon = metric.icon ? METRIC_ICONS[metric.icon] : Wallet;

  if (square) {
    return (
      <div className="snap-center shrink-0 w-[42vw] max-w-[180px] aspect-square rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight truncate">
            {metric.value}
          </p>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
            {metric.title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {metric.title}
        </h3>
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
      </div>
      <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
        {metric.value}
      </p>
      {metric.change && (
        <p
          className={`mt-1 text-sm ${
            metric.changeType === "increase" ? "text-green-500" : "text-red-500"
          }`}
        >
          {metric.change} vs. período anterior
        </p>
      )}
    </Card>
  );
};

const TransactionRow: React.FC<{ transaction: ITransaction }> = ({ transaction }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <div>
      <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
    </div>
    <p
      className={`font-semibold ${
        transaction.type === "income" ? "text-green-500" : "text-red-500"
      }`}
    >
      {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
    </p>
  </div>
);

const ExpenseCategoryRow: React.FC<{
  expense: IExpenseByCategory;
  total: number;
}> = ({ expense, total }) => {
  const percentage = total > 0 ? (expense.amount / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {expense.category}
        </span>
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          R$ {expense.amount.toFixed(2)}
        </span>
      </div>
      <div
        className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700"
        title={`${percentage.toFixed(1)}%`}
      >
        <div
          className="h-2 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: expense.color }}
        ></div>
      </div>
    </div>
  );
};

export default function HomePresentation({
  dashboardData,
  loading,
  error,
  periodKey,
  periodRange,
  customRange,
  onPeriodKeyChange,
  onCustomRangeChange,
}: IHomePresentationProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-indigo-500 underline hover:text-indigo-700"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const totalExpenses = dashboardData.expensesByCategory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  return (
    <div>
      <PageHeader
        title="Olá, Na Estrada Chopp!"
        subtitle="Visão geral do período selecionado"
        filters={
          <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {periodRange.startDate.split("-").reverse().join("/")} –{" "}
            {periodRange.endDate.split("-").reverse().join("/")}
          </p>
        }
        belowToolbar={
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onPeriodKeyChange(opt.key)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  periodKey === opt.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {periodKey === "custom" && (
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="text-sm text-gray-600 dark:text-gray-400">
            De{" "}
            <input
              type="date"
              value={customRange.startDate}
              onChange={(e) => onCustomRangeChange("startDate", e.target.value)}
              className="ml-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-2 py-1"
            />
          </label>
          <label className="text-sm text-gray-600 dark:text-gray-400">
            Até{" "}
            <input
              type="date"
              value={customRange.endDate}
              onChange={(e) => onCustomRangeChange("endDate", e.target.value)}
              className="ml-1 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 px-2 py-1"
            />
          </label>
        </div>
      )}

      {isMobile ? (
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
          {dashboardData.metrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} square />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {dashboardData.metrics.map((metric) => (
            <MetricCard key={metric.title} metric={metric} />
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Faturamento Mensal</h2>
          <div className="h-80">
            <LineChart data={dashboardData.revenueChartData} />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-4">Despesas por Categoria</h2>
          <div className="space-y-4 pt-2">
            {dashboardData.expensesByCategory.map((expense) => (
              <ExpenseCategoryRow
                key={expense.category}
                expense={expense}
                total={totalExpenses}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4">Indicadores Operacionais</h2>
          <div className="space-y-4">
            {dashboardData.kpis.map((kpi) => (
              <div key={kpi.title}>
                <p className="text-sm text-gray-500 dark:text-gray-400">{kpi.title}</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{kpi.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Últimas Movimentações</h2>
          <div>
            {dashboardData.recentTransactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Estoque</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Valor imobilizado
            </h3>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
              {dashboardData.stockSummary.totalImmobilizedValue}
            </p>
          </Card>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <StockRankList
            title="Maior estoque"
            items={dashboardData.stockSummary.topByQuantity}
            empty="Sem estoque ativo"
          />
          <StockRankList
            title="Abaixo do mínimo"
            items={dashboardData.stockSummary.belowMinimum}
            empty="Nenhum produto abaixo do mínimo"
          />
          <StockRankList
            title="Maior consumo (período)"
            items={dashboardData.stockSummary.topConsumption}
            empty="Sem consumo no período"
          />
          <StockRankList
            title="Maior perda (período)"
            items={dashboardData.stockSummary.topLoss}
            empty="Sem perdas no período"
          />
        </div>
      </div>
    </div>
  );
}

const StockRankList: React.FC<{
  title: string;
  items: { name: string; value: string }[];
  empty: string;
}> = ({ title, items, empty }) => (
  <Card>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
    {items.length === 0 ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">{empty}</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={`${title}-${item.name}`}
            className="flex justify-between gap-2 text-sm"
          >
            <span className="text-gray-700 dark:text-gray-300 truncate">{item.name}</span>
            <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    )}
  </Card>
);
