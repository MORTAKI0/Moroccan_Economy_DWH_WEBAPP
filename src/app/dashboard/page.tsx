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

    // -------- START: New state for Gemini Test --------
    const [geminiTestResponse, setGeminiTestResponse] = useState<string | null>(null);
    const [isLoadingGeminiTest, setIsLoadingGeminiTest] = useState<boolean>(false);
    const [errorGeminiTest, setErrorGeminiTest] = useState<string | null>(null);
    // -------- END: New state for Gemini Test --------


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
            } catch (err) {
                setErrorIndicators((err as Error).message);
                console.error("Fetch Indicators Error:", err);
            } finally {
                setIsLoadingIndicators(false);
            }
        };
        fetchIndicators();
    }, []); // Empty dependency array means this runs once on mount

    const handleIndicatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIndicatorKey(event.target.value);
        setChartData([]); // Clear previous chart data
        setCurrentChartIndicator(null); // Clear current indicator details
        setGeminiTestResponse(null); // Clear AI response if indicator changes
        setErrorGeminiTest(null); // Clear AI error if indicator changes
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
        setChartData([]); // Clear previous chart data before fetching new
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
                value: Number(point.value) // Ensure value is a number
            }));
            setChartData(formattedData);
        } catch (err) {
            setErrorChartData((err as Error).message);
            console.error("Fetch Chart Data Error:", err);
        } finally {
            setIsLoadingChartData(false);
        }
    };

    // -------- START: New function for Gemini Test --------
    const handleTestGeminiApi = async () => {
        setIsLoadingGeminiTest(true);
        setErrorGeminiTest(null);
        setGeminiTestResponse(null);
        try {
            const response = await fetch('/api/test-gemini'); // Calls your test API route
            const data = await response.json();

            if (!response.ok) {
                // Try to get the error message from the JSON response, or use a default
                throw new Error(data.error || `Gemini API Test Failed: ${response.statusText} (Status: ${response.status})`);
            }
            setGeminiTestResponse(data.message);
        } catch (err) {
            setErrorGeminiTest((err as Error).message);
            console.error("Gemini Test API Call Error:", err);
        } finally {
            setIsLoadingGeminiTest(false);
        }
    };
    // -------- END: New function for Gemini Test --------


    if (!isMounted) {
        // Return null or a basic loading skeleton that is guaranteed to be the same on server and client
        return null;
    }

    return (
        <div className="space-y-8 p-4 md:p-8"> {/* Added some padding for better layout */}
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
                            <p className="text-gray-400">No indicators available.</p>
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
                    {isLoadingChartData && <p className="text-center text-gray-400 pt-4">Loading chart data...</p>}
                    {errorChartData && <p className="text-red-500 text-center pt-4">Error loading chart data: {errorChartData}</p>}
                    {!isLoadingChartData && !errorChartData && chartData.length > 0 && currentChartIndicator && (
                        <EconomicChart
                            chartData={chartData}
                            indicatorName={currentChartIndicator.StandardizedIndicatorName}
                            unit={currentChartIndicator.StandardUnit}
                        />
                    )}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && !currentChartIndicator && !isLoadingChartData && (
                        <p className="text-center text-gray-500 pt-4">Select an indicator and date range, then click "Display Chart".</p>
                    )}
                    {/* Condition when an indicator IS selected but no data is returned */}
                    {!isLoadingChartData && !errorChartData && chartData.length === 0 && currentChartIndicator && (
                        <p className="text-center text-gray-400 pt-4">No data available for the selected indicator and criteria.</p>
                    )}
                </div>
            </section>

            {/* -------- START: New section for Gemini Test -------- */}
            <section className="bg-gray-800 p-6 rounded-lg shadow-xl">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">Test Gemini API Integration</h2>
                <button
                    onClick={handleTestGeminiApi}
                    disabled={isLoadingGeminiTest}
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingGeminiTest ? "Testing API..." : "Test Gemini Connection"}
                </button>
                {isLoadingGeminiTest && <p className="mt-4 text-gray-400">Contacting Gemini, please wait...</p>}
                {errorGeminiTest && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded">
                        <p className="font-semibold text-red-300">Error testing Gemini:</p>
                        <p className="text-red-400 whitespace-pre-wrap break-words">{errorGeminiTest}</p>
                    </div>
                )}
                {geminiTestResponse && (
                    <div className="mt-4 p-3 bg-gray-700 border border-gray-600 rounded">
                        <h3 className="font-semibold text-gray-300">Gemini Said:</h3>
                        <p className="text-gray-400 whitespace-pre-wrap">{geminiTestResponse}</p>
                    </div>
                )}
            </section>
            {/* -------- END: New section for Gemini Test -------- */}
        </div>
    );
}