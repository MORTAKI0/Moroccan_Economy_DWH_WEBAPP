'use client';

import { useState, useEffect } from 'react';
import EconomicChart from '@/components/EconomicChart';
import { format } from 'date-fns';

interface Indicator {
    IndicatorKey: number;
    StandardizedIndicatorName: string;
    IndicatorCategory: string;
    IndicatorSubCategory?: string;
    StandardUnit: string;
}

interface ChartDataPoint {
    date: string;
    value: number;
}

export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string>('');
    const [isLoadingIndicators, setIsLoadingIndicators] = useState<boolean>(true);
    const [errorIndicators, setErrorIndicators] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoadingChartData, setIsLoadingChartData] = useState<boolean>(false);
    const [errorChartData, setErrorChartData] = useState<string | null>(null);
    const [currentChartIndicator, setCurrentChartIndicator] = useState<Indicator | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        setIsMounted(true);
        const today = new Date();
        const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
        setStartDate(format(oneYearAgo, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));

        const fetchIndicators = async () => {
            setIsLoadingIndicators(true);
            setErrorIndicators(null);
            try {
                const response = await fetch('/api/indicators');
                if (!response.ok) throw new Error(`Failed to fetch indicators: ${response.statusText}`);
                const data = await response.json();
                setIndicators(data);
            } catch (err) {
                setErrorIndicators((err as Error).message);
                console.error(err);
            } finally {
                setIsLoadingIndicators(false);
            }
        };
        fetchIndicators();
    }, []);

    const handleIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIndicatorKey(event.target.value);
        setChartData([]);
        setCurrentChartIndicator(null);
    };

    const handleFetchChartData = async () => {
        if (!selectedIndicatorKey) {
            alert("Please select an indicator.");
            return;
        }
        if (!startDate || !endDate) {
            alert("Please select a start and end date.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            alert("Start date cannot be after end date.");
            return;
        }

        setIsLoadingChartData(true);
        setErrorChartData(null);
        const selectedInd = indicators.find(ind => ind.IndicatorKey.toString() === selectedIndicatorKey);
        setCurrentChartIndicator(selectedInd || null);

        try {
            const params = new URLSearchParams({
                indicatorKey: selectedIndicatorKey,
                startDate: startDate,
                endDate: endDate,
            });
            const response = await fetch(`/api/indicator-data?${params.toString()}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to fetch chart data: ${response.statusText}`);
            }
            const data: ChartDataPoint[] = await response.json();
            setChartData(data.map(point => ({
                ...point,
                value: Number(point.value)
            })));
        } catch (err) {
            setErrorChartData((err as Error).message);
            console.error(err);
        } finally {
            setIsLoadingChartData(false);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-6">
            <section className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6">
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                    Indicator Selection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="indicator-select" className="block text-sm font-medium text-slate-300 mb-2">
                            Select Indicator:
                        </label>
                        {isLoadingIndicators && <p className="text-slate-400">Loading indicators...</p>}
                        {errorIndicators && <p className="text-red-400">Error: {errorIndicators}</p>}
                        {!isLoadingIndicators && !errorIndicators && indicators.length > 0 && (
                            <select
                                id="indicator-select"
                                value={selectedIndicatorKey}
                                onChange={handleIndicatorChange}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all"
                            >
                                <option value="" disabled>-- Select an Indicator --</option>
                                {indicators.map((indicator) => (
                                    <option key={indicator.IndicatorKey} value={indicator.IndicatorKey.toString()}>
                                        {`${indicator.IndicatorCategory} > ${indicator.IndicatorSubCategory || 'General'} > ${indicator.StandardizedIndicatorName} (${indicator.StandardUnit})`}
                                    </option>
                                ))}
                            </select>
                        )}
                        {!isLoadingIndicators && !errorIndicators && indicators.length === 0 && (
                            <p className="text-slate-400">No indicators available.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-2">
                            Start Date:
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all"
                        />
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-300 mb-2">
                            End Date:
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white transition-all"
                        />
                    </div>

                    <div className="md:col-start-4">
                        <button
                            onClick={handleFetchChartData}
                            disabled={!selectedIndicatorKey || isLoadingChartData}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25 disabled:shadow-none"
                        >
                            {isLoadingChartData ? "Loading..." : "Display Chart"}
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl border border-slate-700 p-6 min-h-[450px]">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
                    {currentChartIndicator ? `Visualization: ${currentChartIndicator.StandardizedIndicatorName}` : "Visualization"}
                </h2>
                <div className="h-[350px] bg-slate-700/50 backdrop-blur p-4 rounded-xl border border-slate-600">
                    {isLoadingChartData && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-300">Loading chart data...</p>
                        </div>
                    )}
                    {errorChartData && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-red-400">Error loading chart data: {errorChartData}</p>
                        </div>
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length > 0 && currentChartIndicator && (
                        <EconomicChart
                            chartData={chartData}
                            indicatorName={currentChartIndicator.StandardizedIndicatorName}
                            unit={currentChartIndicator.StandardUnit}
                        />
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && !currentChartIndicator && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400">Select an indicator and date range, then click "Display Chart".</p>
                        </div>
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && currentChartIndicator && (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-slate-400">No data available for the selected indicator and criteria.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}