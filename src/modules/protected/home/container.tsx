import React, { useState, useEffect } from 'react';
import { useSession } from '../../../shared/hooks/useSession';
import HomePresentation from './presentation';
import { IHomePresentationProps, IDashboardData } from './types';

// Mock data for the dashboard
const mockDashboardData: IDashboardData = {
  metrics: [
    { title: 'Faturamento do Mês', value: 'R$ 12.500,00', change: '+15.2%', changeType: 'increase' },
    { title: 'Total de Despesas', value: 'R$ 4.800,00', change: '+5.8%', changeType: 'increase' },
    { title: 'Lucro Líquido', value: 'R$ 7.700,00', change: '+21.7%', changeType: 'increase' },
    { title: 'Margem de Lucro', value: '61.6%', change: '+3.1%', changeType: 'increase' },
    { title: 'Saldo em Caixa', value: 'R$ 28.350,00' },
  ],
  revenueChartData: {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
      {
        label: 'Faturamento Mensal',
        data: [8500, 9200, 11000, 10500, 13000, 12500],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  },
  expensesByCategory: [
    { category: 'Insumos (Chopp)', amount: 2500, color: '#FF6384' },
    { category: 'Combustível', amount: 800, color: '#36A2EB' },
    { category: 'Marketing', amount: 500, color: '#FFCE56' },
    { category: 'Manutenção', amount: 600, color: '#4BC0C0' },
    { category: 'Outros', amount: 400, color: '#9966FF' },
  ],
  kpis: [
    { title: 'Evento Mais Lucrativo', value: 'Oktoberfest Local' },
    { title: 'Forma de Pgto. Mais Usada', value: 'PIX' },
    { title: 'Total de Eventos no Mês', value: '8' },
    { title: 'Consumo Total de Chopp', value: '550 Litros' },
  ],
  recentTransactions: [
    { id: 1, description: 'Venda - Evento Oktoberfest', amount: 3200, type: 'income', date: '2 dias atrás' },
    { id: 2, description: 'Compra de Insumos', amount: 1500, type: 'expense', date: '3 dias atrás' },
    { id: 3, description: 'Pagamento de Combustível', amount: 250, type: 'expense', date: '4 dias atrás' },
    { id: 4, description: 'Venda - Evento Corporativo', amount: 2500, type: 'income', date: '5 dias atrás' },
    { id: 5, description: 'Recebimento via PIX', amount: 150, type: 'income', date: '5 dias atrás' },
  ],
};

export default function HomeContainer() {
  const { user } = useSession();
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);

  useEffect(() => {
    // In a real application, you would fetch this data from an API
    // For now, we use the mock data with a small delay to simulate a fetch
    const timer = setTimeout(() => {
      setDashboardData(mockDashboardData);
    }, 500); // Simulate network latency

    return () => clearTimeout(timer);
  }, []);

  const presentationProps: IHomePresentationProps = {
    dashboardData,
    userName: user?.name,
  };

  return <HomePresentation {...presentationProps} />;
}