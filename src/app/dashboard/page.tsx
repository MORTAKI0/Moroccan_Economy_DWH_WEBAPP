// src/app/dashboard/page.tsx
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
    const [isMounted, setIsMounted] = useState(false); // For hydration
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState<string>('');
    const [isLoadingIndicators, setIsLoadingIndicators] = useState<boolean>(true); // Start true
    const [errorIndicators, setErrorIndicators] = useState<string | null>(null);

    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoadingChartData, setIsLoadingChartData] = useState<boolean>(false);
    const [errorChartData, setErrorChartData] = useState<string | null>(null);
    const [currentChartIndicator, setCurrentChartIndicator] = useState<Indicator | null>(null);

    // State for date range - initialize client-side
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        setIsMounted(true); // Component has mounted on the client

        // Initialize dates on client to avoid server/client mismatch for default values
        const today = new Date();
        const oneYearAgo = new Date(new Date().setFullYear(today.getFullYear() - 1));
        setStartDate(format(oneYearAgo, 'yyyy-MM-dd'));
        setEndDate(format(today, 'yyyy-MM-dd'));

        const fetchIndicators = async () => {
            setIsLoadingIndicators(true);
            setErrorIndicators(null);
            try {
                const response = await fetch('/api/indicators');
                if (!response.ok) {
                    throw new Error(`Failed to fetch indicators: ${response.statusText}`);
                }
                const data = await response.json();
                setIndicators(data);
                // Optionally pre-select if needed after mount and data load
                // if (data.length > 0 && !selectedIndicatorKey) {
                //     setSelectedIndicatorKey(data[0].IndicatorKey.toString());
                // }
            } catch (err) {
                setErrorIndicators((err as Error).message);
                console.error(err);
            } finally {
                setIsLoadingIndicators(false);
            }
        };
        fetchIndicators();
    }, []); // Empty dependency array means this runs once on mount

    const handleIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIndicatorKey(event.target.value);
        setChartData([]);
        setCurrentChartIndicator(null);
    };

    const handleFetchChartData = async () => {
        // ... (validation logic remains the same) ...
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
            const formattedData = data.map(point => ({
                ...point,
                value: Number(point.value)
            }));
            setChartData(formattedData);
        } catch (err) {
            setErrorChartData((err as Error).message);
            console.error(err);
        } finally {
            setIsLoadingChartData(false);
        }
    };

    if (!isMounted) {
        // Return null or a basic loading skeleton that is guaranteed to be the same on server and client
        return null;
    }

    return (
        <div className="space-y-8">
            <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-6 text-gray-300">Indicator Selection</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="indicator-select" className="block text-sm font-medium text-gray-400 mb-1">
                            Select Indicator:
                        </label>
                        {isLoadingIndicators && <p className="text-gray-400">Loading indicators...</p>}
                        {errorIndicators && <p className="text-red-500">Error: {errorIndicators}</p>}
                        {!isLoadingIndicators && !errorIndicators && indicators.length > 0 && (
                            <select
                                id="indicator-select"
                                value={selectedIndicatorKey}
                                onChange={handleIndicatorChange}
                                className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-white"
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
                            <p>No indicators available.</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-400 mb-1">
                            Start Date:
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-white"
                        />
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-400 mb-1">
                            End Date:
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 text-white"
                        />
                    </div>

                    <div className="md:col-start-4">
                        <button
                            onClick={handleFetchChartData}
                            disabled={!selectedIndicatorKey || isLoadingChartData}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoadingChartData ? "Loading..." : "Display Chart"}
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-gray-800 p-6 rounded-lg shadow-xl min-h-[450px]">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">
                    {currentChartIndicator ? `Visualization: ${currentChartIndicator.StandardizedIndicatorName}` : "Visualization"}
                </h2>
                <div id="chart-area" className="h-[350px] bg-gray-700 p-4 rounded">
                    {isLoadingChartData && <p className="text-center text-gray-400">Loading chart data...</p>}
                    {errorChartData && <p className="text-red-500 text-center">Error loading chart data: {errorChartData}</p>}
                    {!isLoadingChartData && !errorChartData && chartData.length > 0 && currentChartIndicator && (
                        <EconomicChart
                            chartData={chartData}
                            indicatorName={currentChartIndicator.StandardizedIndicatorName}
                            unit={currentChartIndicator.StandardUnit}
                        />
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && !currentChartIndicator && (
                        <p className="text-center text-gray-500">Select an indicator and date range, then click "Display Chart".</p>
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && currentChartIndicator && (
                        <p className="text-center text-gray-400">No data available for the selected indicator and criteria.</p>
                    )}
                </div>
            </section>
        </div>
    );
}