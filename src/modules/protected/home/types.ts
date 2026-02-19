export interface IMetric {
  title: string;
  value: string;
  change?: string;
  changeType?: "increase" | "decrease";
}

export interface IChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
  }[];
}

export interface IKPI {
  title: string;
  value: string;
}

export interface ITransaction {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

export interface IExpenseByCategory {
  category: string;
  amount: number;
  color: string;
}

export interface IDashboardData {
  metrics: IMetric[];
  revenueChartData: IChartData;
  expensesByCategory: IExpenseByCategory[];
  kpis: IKPI[];
  recentTransactions: ITransaction[];
}

export interface IHomePresentationProps {
  readonly dashboardData: IDashboardData | null;
  readonly userName: string | undefined;
  readonly loading: boolean;
  readonly error: string | null;
}
