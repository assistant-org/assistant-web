import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { IChartData } from '../types';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

interface PieChartProps {
  data: IChartData;
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: false,
            },
        },
    };

    return <Pie data={data} options={options} />;
};

export default PieChart;
