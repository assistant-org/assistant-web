import React from 'react';
import { IHomePresentationProps, IMetric, ITransaction, IExpenseByCategory } from './types';
import Card from '../../../shared/components/Card';
import LineChart from './components/LineChart';

const MetricCard: React.FC<{ metric: IMetric }> = ({ metric }) => (
  <Card>
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{metric.title}</h3>
    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{metric.value}</p>
    {metric.change && (
      <p className={`mt-1 text-sm ${metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
        {metric.change} vs. mês passado
      </p>
    )}
  </Card>
);

const TransactionRow: React.FC<{ transaction: ITransaction }> = ({ transaction }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{transaction.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{transaction.date}</p>
        </div>
        <p className={`font-semibold ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
            {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
        </p>
    </div>
);

const ExpenseCategoryRow: React.FC<{ expense: IExpenseByCategory; total: number; }> = ({ expense, total }) => {
    const percentage = total > 0 ? (expense.amount / total) * 100 : 0;
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{expense.category}</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">R$ {expense.amount.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700" title={`${percentage.toFixed(1)}%`}>
                <div className="h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: expense.color }}></div>
            </div>
        </div>
    );
};


export default function HomePresentation({ dashboardData, userName }: IHomePresentationProps) {
  if (!dashboardData) {
    return (
        <div className="flex justify-center items-center h-64">
             <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    );
  }
  
  const totalExpenses = dashboardData.expensesByCategory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Olá, {userName}!
      </h1>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {dashboardData.metrics.map(metric => <MetricCard key={metric.title} metric={metric} />)}
      </div>

      {/* Charts Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
            <h2 className="text-lg font-semibold mb-4">Faturamento Mensal</h2>
            <div className="h-80"><LineChart data={dashboardData.revenueChartData} /></div>
        </Card>
        <Card>
            <h2 className="text-lg font-semibold mb-4">Despesas por Categoria</h2>
            <div className="space-y-4 pt-2">
                {dashboardData.expensesByCategory.map(expense => (
                    <ExpenseCategoryRow key={expense.category} expense={expense} total={totalExpenses} />
                ))}
            </div>
        </Card>
      </div>
      
       {/* KPIs and Transactions */}
       <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-1">
                 <h2 className="text-lg font-semibold mb-4">Indicadores Operacionais</h2>
                 <div className="space-y-4">
                    {dashboardData.kpis.map(kpi => (
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
                    {dashboardData.recentTransactions.map(tx => <TransactionRow key={tx.id} transaction={tx} />)}
                 </div>
            </Card>
       </div>
    </div>
  );
}