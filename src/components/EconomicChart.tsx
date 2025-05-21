// src/components/EconomicChart.tsx
'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    ChartOptions,
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the date adapter
// import { enUS } from 'date-fns/locale'; // REMOVED - No longer directly used in options

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface ChartDataPoint {
    date: string;
    value: number;
}

interface EconomicChartProps {
    chartData: ChartDataPoint[];
    indicatorName?: string;
    unit?: string;
}

export default function EconomicChart({ chartData, indicatorName, unit }: EconomicChartProps) {
    if (!chartData || chartData.length === 0) {
        return <p className="text-center text-gray-400">No data to display for the chart.</p>;
    }

    const data = {
        labels: chartData.map(d => d.date),
        datasets: [
            {
                label: indicatorName || 'Indicator Value',
                data: chartData.map(d => d.value),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#e5e7eb'
                }
            },
            title: {
                display: true,
                text: indicatorName || 'Economic Indicator Trend',
                color: '#e5e7eb',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += `${context.parsed.y}${unit ? ` ${unit}` : ''}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                    tooltipFormat: 'MMM yyyy',
                    displayFormats: {
                        month: 'MMM yyyy',
                        year: 'yyyy'
                        // If you needed specific locale formatting here, you'd pass `locale: enUS` within a 'date' object under 'adapters'
                        // but for standard formats, chartjs-adapter-date-fns often handles it well.
                    },
                },
                ticks: {
                    color: '#9ca3af',
                    maxRotation: 45,
                    minRotation: 0,
                },
                grid: {
                    color: 'rgba(107, 114, 128, 0.3)',
                }
            },
            y: {
                beginAtZero: false,
                ticks: {
                    color: '#9ca3af',
                    callback: function(value) {
                        if (typeof value === 'number') {
                            return `${value}${unit ? ` ${unit}` : ''}`;
                        }
                        return value;
                    }
                },
                grid: {
                    color: 'rgba(107, 114, 128, 0.3)',
                }
            },
        },
    };

    return <Line options={options} data={data} />;
}