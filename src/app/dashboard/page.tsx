// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EconomicChart from '@/components/EconomicChart'; // Ensure this path is correct
import { format } from 'date-fns';

// Simple SVG Icons - You can replace these with a proper icon library or more refined SVGs
const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.032c0 .114-.024.224-.07.324a.75.75 0 01-1.32-.324V12.5c0-.584-.237-1.135-.659-1.59L4.682 6.22A2.25 2.25 0 014 4.632V2.34a.75.75 0 01.628-.74z" clipRule="evenodd" />
    </svg>
);

const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM7 10h2v7H7v-7zm4 0h2v7h-2v-7zm4-3h2v10h-2V7z" />
    </svg>
);

const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.993 4.993 0 017 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.08-2.02 3.98L14.85 13.1z" />
    </svg>
);

// SparklesIcon (using a cleaner, more standard version)
const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-1.154 2.116.61.391c.523.317.974.787 1.296 1.338l-.59 4.292a.75.75 0 001.054.807l4.108-2.559 4.108 2.559a.75.75 0 001.054-.807l-.59-4.292c.322-.551.773-1.021 1.296-1.338l.61-.391-1.154-2.116-4.753-.39L10.868 2.884zM6.464 10c-.377-.213-.837-.338-1.33-.365a.75.75 0 00-.676.93L4.71 14.31a.75.75 0 00.676.599l3.065-.04a.75.75 0 00.553-.44l1.445-2.887a.75.75 0 00-1.299-.769l-.019.033-.491.987c-.377.753-1.211.988-1.96.614A4.54 4.54 0 016.464 10zM14.836 11.064c.377-.753 1.211-.988 1.96-.614a4.542 4.542 0 011.054.675l2.746-3.76a.75.75 0 00-.676-.93l-3.065.04a.75.75 0 00-.553.44L14.04 9.25a.75.75 0 001.3.768l.019-.033.491-.987z" clipRule="evenodd" />
    </svg>
);


interface Indicator {
    IndicatorKey: number;
    StandardizedIndicatorName: string;
    DisplayName: string;
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

    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [isLoadingAiDescription, setIsLoadingAiDescription] = useState<boolean>(false);
    const [errorAiDescription, setErrorAiDescription] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        const today = new Date();
        const defaultEndDate = format(today, 'yyyy-MM-dd');
        const defaultStartDate = format(new Date(today.setFullYear(today.getFullYear() - 5)), 'yyyy-MM-dd'); // Default to 5 years ago

        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);

        const fetchIndicators = async () => {
            setIsLoadingIndicators(true);
            setErrorIndicators(null);
            try {
                const response = await fetch('/api/indicators');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch indicators: ${response.statusText}`);
                }
                const data: Indicator[] = await response.json();
                setIndicators(data);
                // Optionally, select the first indicator by default
                // if (data.length > 0) {
                //     setSelectedIndicatorKey(data[0].IndicatorKey.toString());
                // }
            } catch (err) {
                setErrorIndicators((err as Error).message);
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
        setAiDescription(null);
        setErrorAiDescription(null);
    };

    const handleFetchChartData = async () => {
        setAiDescription(null);
        setErrorAiDescription(null);

        if (!selectedIndicatorKey) {
            setErrorChartData("Please select an indicator.");
            return;
        }
        if (!startDate || !endDate) {
            setErrorChartData("Please select a valid start and end date.");
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setErrorChartData("Start date cannot be after end date.");
            return;
        }

        setIsLoadingChartData(true);
        setErrorChartData(null);
        setChartData([]);
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
            setChartData(data.map(point => ({ ...point, value: Number(point.value) })));
            if (data.length === 0) {
                setErrorChartData("No data found for the selected criteria. Try adjusting the date range or indicator.");
            }
        } catch (err) {
            setErrorChartData((err as Error).message);
        } finally {
            setIsLoadingChartData(false);
        }
    };

    const handleGenerateAiDescription = async () => {
        if (!chartData || chartData.length === 0 || !currentChartIndicator) {
            alert("Please display a chart with data first before generating a description.");
            return;
        }
        setIsLoadingAiDescription(true);
        setErrorAiDescription(null);
        setAiDescription(null);
        try {
            const response = await fetch('/api/generate-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartData: chartData,
                    indicatorName: currentChartIndicator.DisplayName,
                    unit: currentChartIndicator.StandardUnit,
                    startDate: startDate,
                    endDate: endDate,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Failed to generate AI description: ${response.statusText}`);
            }
            setAiDescription(data.description);
        } catch (err) {
            setErrorAiDescription((err as Error).message);
        } finally {
            setIsLoadingAiDescription(false);
        }
    };

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] p-4 md:p-8">
                <div className="w-16 h-16 border-4 border-sky-500 border-dashed rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-400">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 md:p-6 lg:p-8">
            {/* Filters Section */}
            <section className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/70">
                <div className="flex items-center mb-5">
                    <FilterIcon />
                    <h2 className="text-xl sm:text-2xl font-semibold text-sky-300 ml-2">
                        Filter Economic Indicators
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-5 items-end">
                    <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                        <label htmlFor="indicator-select" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Select Indicator
                        </label>
                        {isLoadingIndicators ? (
                            <div className="w-full h-11 p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-400 animate-pulse">Loading...</div>
                        ) : errorIndicators ? (
                            <div className="w-full p-3 bg-red-700/20 border border-red-600/50 rounded-lg text-red-400">{errorIndicators}</div>
                        ) : (
                            <select
                                id="indicator-select"
                                value={selectedIndicatorKey}
                                onChange={handleIndicatorChange}
                                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-100 shadow-sm appearance-none"
                            >
                                <option value="" disabled className="text-slate-500">-- Select an Indicator --</option>
                                {indicators.map((indicator) => (
                                    <option key={indicator.IndicatorKey} value={indicator.IndicatorKey.toString()} className="bg-slate-800 hover:bg-slate-700">
                                        {indicator.DisplayName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-100 shadow-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-slate-300 mb-1.5">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-100 shadow-sm"
                        />
                    </div>

                    <div className="sm:col-span-full lg:col-span-1 xl:col-span-4 flex justify-end pt-3">
                        <button
                            onClick={handleFetchChartData}
                            disabled={!selectedIndicatorKey || isLoadingChartData}
                            className="flex items-center justify-center gap-2.5 w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-7 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 transform hover:scale-[1.02]"
                        >
                            <ChartBarIcon className="h-5 w-5" />
                            {isLoadingChartData ? "Loading Chart..." : "Display Chart"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Visualization & AI Insights Section */}
            <section className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/70 min-h-[500px]"> {/* Ensure a min height */}
                <h2 className="text-xl sm:text-2xl font-semibold mb-1 text-sky-300">
                    {currentChartIndicator ? `Chart: ${currentChartIndicator.DisplayName}` : "Data Visualization"}
                </h2>
                {currentChartIndicator && (
                    <p className="text-xs text-slate-400 mb-5">
                        Unit: {currentChartIndicator.StandardUnit} | Category: {currentChartIndicator.IndicatorCategory}
                        {currentChartIndicator.IndicatorSubCategory && ` > ${currentChartIndicator.IndicatorSubCategory}`}
                    </p>
                )}

                <div className="h-[380px] bg-slate-700/30 p-3 sm:p-4 rounded-lg border border-slate-600/50 flex items-center justify-center">
                    {isLoadingChartData && (
                        <div className="flex flex-col items-center text-slate-400">
                            <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-3"></div>
                            Loading chart data...
                        </div>
                    )}
                    {!isLoadingChartData && errorChartData && (
                        <div className="text-center text-red-400 p-4 border border-red-600/50 bg-red-900/30 rounded-lg">
                            <p className="font-semibold text-red-300">Error Loading Chart</p>
                            <p className="text-sm">{errorChartData}</p>
                        </div>
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length > 0 && currentChartIndicator && (
                        <EconomicChart
                            chartData={chartData}
                            indicatorName={currentChartIndicator.DisplayName}
                            unit={currentChartIndicator.StandardUnit}
                        />
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && (
                        <div className="text-center text-slate-500">
                            {currentChartIndicator ? "No data for selected criteria." : "Select an indicator and date range to display the chart."}
                        </div>
                    )}
                </div>

                {/* AI Chart Description UI */}
                {isMounted && chartData.length > 0 && currentChartIndicator && !isLoadingChartData && !errorChartData && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center">
                            <SparklesIcon />
                            <span className="ml-2">AI Generated Insights</span>
                        </h3>
                        <button
                            onClick={handleGenerateAiDescription}
                            disabled={isLoadingAiDescription}
                            className="flex items-center justify-center gap-2.5 mb-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 px-6 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400 transform hover:scale-[1.02]"
                        >
                            <LightBulbIcon className="h-5 w-5" />
                            {isLoadingAiDescription ? "Generating Analysis..." : "Generate AI Analysis"}
                        </button>
                        {isLoadingAiDescription && (
                            <div className="flex items-center text-sm text-slate-400 p-3 bg-slate-700/40 rounded-lg">
                                <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mr-2.5"></div>
                                AI is analyzing the data, please wait...
                            </div>
                        )}
                        {errorAiDescription && !isLoadingAiDescription && (
                            <div className="mt-2 p-4 bg-red-900/40 border border-red-700/60 rounded-lg text-red-300">
                                <p className="font-semibold text-red-200 mb-1">Error Generating AI Insights:</p>
                                <p className="text-sm whitespace-pre-wrap break-words">{errorAiDescription}</p>
                            </div>
                        )}
                        {aiDescription && !isLoadingAiDescription && (
                            <div className="mt-2 p-4 bg-slate-700/50 backdrop-blur-sm border border-slate-600/60 rounded-lg shadow-inner">
                                <p className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">{aiDescription}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Developer Tools Section has been removed */}
        </div>
    );
}