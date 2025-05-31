// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EconomicChart from '@/components/EconomicChart'; // Ensure this path is correct
import { format } from 'date-fns';

// Simple SVG Icon Components (e.g., from Heroicons)
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

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.4 चमकता है1.74a.75.75 0 011.06.04l.05.06 1.72 1.72a.75.75 0 010 1.06l-1.72 1.72a.75.75 0 01-1.1-.02l-.05-.06-1.72-1.72a.75.75 0 010-1.06l1.72-1.72zM8.5 6.75a.75.75 0 01.8-.7l.12.01L11.5 6.5l2.08-.42a.75.75 0 01.8.7l.01.12L13.5 8.5l.42 2.08a.75.75 0 01-.7.8l-.12.01L11.5 11.5l-2.08.42a.75.75 0 01-.8-.7l-.01-.12L9.5 8.5l-.42-2.08a.75.75 0 01.7-.8zM18 12a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V13.5A.75.75 0 0118 12zM6 12a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V13.5A.75.75 0 016 12zM12 18a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V19.5A.75.75 0 0112 18zM12 6a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0V7.5A.75.75 0 0112 6z" />
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

    const [geminiTestResponse, setGeminiTestResponse] = useState<string | null>(null);
    const [isLoadingGeminiTest, setIsLoadingGeminiTest] = useState<boolean>(false);
    const [errorGeminiTest, setErrorGeminiTest] = useState<string | null>(null);

    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [isLoadingAiDescription, setIsLoadingAiDescription] = useState<boolean>(false);
    const [errorAiDescription, setErrorAiDescription] = useState<string | null>(null);

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
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to fetch indicators: ${response.statusText}`);
                }
                const data = await response.json();
                setIndicators(data);
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
        setGeminiTestResponse(null);
        setErrorGeminiTest(null);
        setAiDescription(null);
        setErrorAiDescription(null);
    };

    const handleFetchChartData = async () => {
        setAiDescription(null);
        setErrorAiDescription(null);
        if (!selectedIndicatorKey) {
            alert("Please select an indicator.");
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
        } catch (err) {
            setErrorChartData((err as Error).message);
        } finally {
            setIsLoadingChartData(false);
        }
    };

    const handleTestGeminiApi = async () => {
        setIsLoadingGeminiTest(true);
        setErrorGeminiTest(null);
        setGeminiTestResponse(null);
        try {
            const response = await fetch('/api/test-gemini');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || `Gemini API Test Failed: ${response.statusText} (Status: ${response.status})`);
            }
            setGeminiTestResponse(data.message);
        } catch (err) {
            setErrorGeminiTest((err as Error).message);
        } finally {
            setIsLoadingGeminiTest(false);
        }
    };

    const handleGenerateAiDescription = async () => {
        if (!chartData || chartData.length === 0 || !currentChartIndicator) {
            alert("Please display a chart first before generating a description.");
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
        // Render a minimal skeleton or null during server-side rendering / hydration phase
        return (
            <div className="min-h-screen bg-gray-900 p-4 md:p-8 animate-pulse">
                <div className="h-20 bg-gray-700 rounded-lg mb-8"></div>
                <div className="h-64 bg-gray-700 rounded-lg mb-8"></div>
                <div className="h-40 bg-gray-700 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 p-4 md:p-8 bg-gray-900 text-gray-100 min-h-screen">
            {/* Indicator Selection Section */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-2xl">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-sky-400">
                    Economic Indicator Dashboard
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                    <div className="md:col-span-2 lg:col-span-2">
                        <label htmlFor="indicator-select" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Select Indicator
                        </label>
                        {isLoadingIndicators ? (
                            <div className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-gray-400">Loading indicators...</div>
                        ) : errorIndicators ? (
                            <div className="w-full p-3 bg-red-700/30 border border-red-600 rounded-md text-red-400">{errorIndicators}</div>
                        ) : (
                            <select
                                id="indicator-select"
                                value={selectedIndicatorKey}
                                onChange={handleIndicatorChange}
                                className="w-full p-3 bg-gray-700 border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-white shadow-sm appearance-none"
                            >
                                <option value="" disabled className="text-gray-400">-- Select an Indicator --</option>
                                {indicators.map((indicator) => (
                                    <option key={indicator.IndicatorKey} value={indicator.IndicatorKey.toString()} className="bg-gray-800 hover:bg-gray-700">
                                        {indicator.DisplayName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1.5">
                            Start Date
                        </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-3 bg-gray-700 border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-white shadow-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1.5">
                            End Date
                        </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-3 bg-gray-700 border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-white shadow-sm"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-4 flex justify-end pt-2">
                        <button
                            onClick={handleFetchChartData}
                            disabled={!selectedIndicatorKey || isLoadingChartData}
                            className="flex items-center justify-center gap-2 w-full md:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold py-3 px-6 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                        >
                            <ChartBarIcon className="h-5 w-5" />
                            {isLoadingChartData ? "Loading Chart..." : "Display Chart"}
                        </button>
                    </div>
                </div>
            </section>

            {/* Visualization & AI Insights Section */}
            { (currentChartIndicator || isLoadingChartData || errorChartData) && (
                <section className="bg-gray-800 p-6 rounded-xl shadow-2xl">
                    <h2 className="text-xl sm:text-2xl font-semibold mb-1 text-sky-400">
                        {currentChartIndicator ? `Visualization: ${currentChartIndicator.DisplayName}` : "Visualization"}
                    </h2>
                    <p className="text-xs text-gray-400 mb-4">
                        {currentChartIndicator ? `Unit: ${currentChartIndicator.StandardUnit} | Category: ${currentChartIndicator.IndicatorCategory}` : "Awaiting selection..."}
                    </p>

                    <div id="chart-area" className="h-[380px] bg-gray-700/50 p-4 rounded-lg border border-gray-700/80 flex items-center justify-center">
                        {isLoadingChartData && (
                            <div className="flex flex-col items-center text-gray-400">
                                <svg className="animate-spin h-8 w-8 text-sky-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading chart data...
                            </div>
                        )}
                        {errorChartData && !isLoadingChartData && (
                            <div className="text-center text-red-400 p-4 border border-red-600 bg-red-700/30 rounded-md">
                                <p className="font-semibold">Error Loading Chart Data</p>
                                <p className="text-sm">{errorChartData}</p>
                            </div>
                        )}
                        {!isLoadingChartData && !errorChartData && chartData.length > 0 && currentChartIndicator && (
                            <EconomicChart
                                chartData={chartData}
                                indicatorName={currentChartIndicator.DisplayName || currentChartIndicator.StandardizedIndicatorName}
                                unit={currentChartIndicator.StandardUnit}
                            />
                        )}
                        {!isLoadingChartData && !errorChartData && chartData.length === 0 && currentChartIndicator && (
                            <div className="text-center text-gray-400">
                                No data available for the selected indicator and criteria.
                            </div>
                        )}
                        {!isLoadingChartData && !errorChartData && chartData.length === 0 && !currentChartIndicator && !isLoadingChartData && (
                            <div className="text-center text-gray-500">
                                Select an indicator and date range, then click "Display Chart".
                            </div>
                        )}
                    </div>

                    {/* AI Chart Description UI */}
                    {chartData.length > 0 && currentChartIndicator && !isLoadingChartData && !errorChartData && (
                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <h3 className="text-lg font-semibold text-sky-400 mb-3 flex items-center">
                                <SparklesIcon className="h-6 w-6 mr-2 text-yellow-400" />
                                AI Generated Insights
                            </h3>
                            <button
                                onClick={handleGenerateAiDescription}
                                disabled={isLoadingAiDescription}
                                className="flex items-center justify-center gap-2 mb-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 px-5 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow hover:shadow-md"
                            >
                                <LightBulbIcon className="h-5 w-5" />
                                {isLoadingAiDescription ? "Generating Insights..." : "Get AI Insights"}
                            </button>
                            {isLoadingAiDescription && (
                                <div className="flex items-center text-sm text-gray-400 p-3 bg-gray-700/50 rounded-md">
                                    <svg className="animate-spin h-5 w-5 text-sky-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    AI is analyzing the data, please wait...
                                </div>
                            )}
                            {errorAiDescription && !isLoadingAiDescription && (
                                <div className="mt-2 p-4 bg-red-800/40 border border-red-700 rounded-md text-red-300">
                                    <p className="font-semibold text-red-200 mb-1">Error Generating AI Description:</p>
                                    <p className="text-sm whitespace-pre-wrap break-words">{errorAiDescription}</p>
                                </div>
                            )}
                            {aiDescription && !isLoadingAiDescription && (
                                <div className="mt-2 p-4 bg-gray-700/80 border border-gray-600/70 rounded-lg shadow-inner">
                                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{aiDescription}</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            )}


            {/* Gemini Test Section - Kept for consistency, you might remove or integrate its functionality elsewhere */}
            <section className="bg-gray-800 p-6 rounded-xl shadow-2xl opacity-80 hover:opacity-100 transition-opacity">
                <h2 className="text-lg font-semibold mb-4 text-gray-400">Developer Tools</h2>
                <button
                    onClick={handleTestGeminiApi}
                    disabled={isLoadingGeminiTest}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-md disabled:opacity-60 transition-colors text-sm"
                >
                    {isLoadingGeminiTest ? "Testing API..." : "Test Gemini Connection"}
                </button>
                {isLoadingGeminiTest && <p className="mt-3 text-xs text-gray-500">Contacting Gemini, please wait...</p>}
                {errorGeminiTest && (
                    <div className="mt-3 p-2.5 bg-red-800/40 border border-red-700 rounded-md text-xs">
                        <p className="font-semibold text-red-300">Error:</p>
                        <p className="text-red-400 whitespace-pre-wrap break-words">{errorGeminiTest}</p>
                    </div>
                )}
                {geminiTestResponse && (
                    <div className="mt-3 p-2.5 bg-gray-700/80 border border-gray-600/70 rounded-md text-xs">
                        <h3 className="font-semibold text-gray-300">Gemini Said:</h3>
                        <p className="text-gray-400 whitespace-pre-wrap">{geminiTestResponse}</p>
                    </div>
                )}
            </section>
        </div>
    );
}