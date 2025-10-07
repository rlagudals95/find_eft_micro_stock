import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ChartProps {
  type: 'bar' | 'doughnut' | 'line';
  data: any;
  options?: any;
  className?: string;
}

export const Chart: React.FC<ChartProps> = ({ type, data, options, className = '' }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    ...options,
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar data={data} options={defaultOptions} />;
      case 'doughnut':
        return <Doughnut data={data} options={defaultOptions} />;
      case 'line':
        return <Line data={data} options={defaultOptions} />;
      default:
        return null;
    }
  };

  return (
    <div className={`w-full h-64 ${className}`}>
      {renderChart()}
    </div>
  );
};

// 미리 정의된 차트 데이터 생성 함수들
export const createHoldingsChartData = (holdings: any[]) => {
  const topHoldings = holdings.slice(0, 10);
  
  return {
    labels: topHoldings.map(h => h.symbol),
    datasets: [
      {
        label: '비중 (%)',
        data: topHoldings.map(h => h.weight),
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
          '#EC4899',
          '#6B7280',
        ],
        borderWidth: 1,
      },
    ],
  };
};

export const createScoreDistributionData = (stocks: any[]) => {
  const scoreRanges = [
    { range: '90-100', count: 0 },
    { range: '80-89', count: 0 },
    { range: '70-79', count: 0 },
    { range: '60-69', count: 0 },
    { range: '50-59', count: 0 },
  ];

  stocks.forEach(stock => {
    const score = stock.score;
    if (score >= 90) scoreRanges[0].count++;
    else if (score >= 80) scoreRanges[1].count++;
    else if (score >= 70) scoreRanges[2].count++;
    else if (score >= 60) scoreRanges[3].count++;
    else scoreRanges[4].count++;
  });

  return {
    labels: scoreRanges.map(r => r.range),
    datasets: [
      {
        label: '종목 수',
        data: scoreRanges.map(r => r.count),
        backgroundColor: [
          '#10B981',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
          '#6B7280',
        ],
        borderWidth: 1,
      },
    ],
  };
};

export const createTrendData = (data: any[]) => {
  return {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: '점수',
        data: data.map(d => d.score),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };
};
