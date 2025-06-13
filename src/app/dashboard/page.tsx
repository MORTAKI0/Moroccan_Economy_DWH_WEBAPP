// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import EconomicChart from '@/components/EconomicChart';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Icon Components
const FilterIcon = () => (
    <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const LightBulbIcon = ({ className }: { className?: string }) => (
    <svg className={className || "w-5 h-5"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const SparklesIcon = () => (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057 3.943L5 12l3.057 5.057L5 21l5.057-3.943L15 21l-3.943-5.057L15 12l-5.943-3.057L15 3l-5.057 3.943L5 3z" />
    </svg>
);

const CalendarIcon = () => (
    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
);


interface Indicator {
    IndicatorKey: number;
    StandardizedIndicatorName: string;
    DisplayName: string;
    IndicatorCategory: string;
    IndicatorSubCategory?: string;
    StandardUnit: string;
    value?: number;
}

interface ChartDataPoint {
    date: string;
    value: number;
}

interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}


export default function DashboardPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [indicators, setIndicators] = useState<Indicator[]>([]);
    const [selectedIndicatorKey, setSelectedIndicatorKey] = useState('');
    const [isLoadingIndicators, setIsLoadingIndicators] = useState(true);
    const [errorIndicators, setErrorIndicators] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoadingChartData, setIsLoadingChartData] = useState(false);
    const [errorChartData, setErrorChartData] = useState<string | null>(null);
    const [currentChartIndicator, setCurrentChartIndicator] = useState<Indicator | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [aiDescription, setAiDescription] = useState<string | null>(null);
    const [isLoadingAiDescription, setIsLoadingAiDescription] = useState(false);
    const [errorAiDescription, setErrorAiDescription] = useState<string | null>(null);

    // New state for PDF report year
    const [pdfReportYear, setPdfReportYear] = useState<number>(new Date().getFullYear());
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);


    useEffect(() => {
        setIsMounted(true);
        const today = new Date();
        const defaultEndDate = format(today, 'yyyy-MM-dd');
        const defaultStartDate = format(new Date(new Date().setFullYear(today.getFullYear() - 5)), 'yyyy-MM-dd');
        setStartDate(defaultStartDate);
        setEndDate(defaultEndDate);
        setPdfReportYear(today.getFullYear() -1); // Default to previous year for annual report

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

    const handleDownloadPdf = async () => {
        setIsDownloadingPdf(true);
        try {
            // Use the state pdfReportYear
            const response = await fetch(`/api/indicators-annual-report?year=${pdfReportYear}`);
            if (!response.ok) {
                const errorData = await response.json();
                alert(`Failed to fetch annual report data: ${errorData.message || response.statusText}`);
                return;
            }
            const { indicators: reportIndicators, aiSummary, generatedAt } = await response.json();
            const doc: jsPDFWithAutoTable = new jsPDF() as jsPDFWithAutoTable;

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(22);
            doc.text('Moroccan Economic Indicators Report', 105, 30, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.text(`Year: ${pdfReportYear}`, 105, 42, { align: 'center' }); // Use pdfReportYear
            doc.setFontSize(11);
            doc.text(`Generated on: ${new Date(generatedAt).toLocaleString()}`, 105, 50, { align: 'center' });
            doc.setFontSize(12);
            doc.setTextColor(60, 60, 60);
            doc.text(
                "A comprehensive annual overview of Morocco's key economic indicators and AI-generated insights.",
                105,
                62,
                { align: 'center', maxWidth: 180 }
            );
            doc.setDrawColor(51, 105, 232);
            doc.setLineWidth(1);
            doc.line(40, 70, 170, 70);

            doc.addPage();
            doc.setFontSize(16);
            doc.setTextColor(41, 128, 185);
            doc.text('Annual Economic Review (AI)', 14, 24);

            const pageWidth   = doc.internal.pageSize.getWidth();
            const pageHeight  = doc.internal.pageSize.getHeight();
            const margin      = 14;
            const maxLineWidth= pageWidth - margin * 2;
            const lineHeight  = 7;
            let cursorY       = 32;

            const lines = doc.splitTextToSize(aiSummary || "AI summary not available.", maxLineWidth);

            for (const line of lines) {
                if (cursorY + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    cursorY = margin;
                }
                doc.setFontSize(11);
                doc.setTextColor(30, 30, 30);
                doc.text(line, margin, cursorY);
                cursorY += lineHeight;
            }

            let keyInsightsStartY = cursorY + 10; // Increased gap for Key Insights

            const keyInsightsMatch = aiSummary?.match(/Key Insights:([\s\S]*)/i) ?? aiSummary?.match(/\* (.+)/gmi); // More robust regex for key insights
            if (keyInsightsMatch) {
                // Determine if we're dealing with the "Key Insights:" block or just bullet points
                const insightsText = keyInsightsMatch[1] ? keyInsightsMatch[1].trim() : aiSummary;
                const bullets = insightsText.match(/^\s*[-*]\s+(.+)/gm);


                if (bullets && bullets.length > 0) {
                    if (keyInsightsStartY + 20 > pageHeight - margin) {
                        doc.addPage();
                        keyInsightsStartY = margin;
                    }
                    doc.setFontSize(13);
                    doc.setTextColor(41, 128, 185);
                    doc.text('Key Insights', 14, keyInsightsStartY);
                    keyInsightsStartY += 7;
                    doc.setFontSize(11);
                    doc.setTextColor(30, 30, 30);
                    for (const b of bullets) {
                        const bulletContent = b.replace(/^\s*[-*]\s+/, '').trim();
                        const splitBullet = doc.splitTextToSize(`• ${bulletContent}`, maxLineWidth - 4);
                        for (const bulletLine of splitBullet) {
                            if (keyInsightsStartY + lineHeight > pageHeight - margin) {
                                doc.addPage();
                                keyInsightsStartY = margin;
                            }
                            doc.text(bulletLine, 18, keyInsightsStartY);
                            keyInsightsStartY += lineHeight;
                        }
                        if (keyInsightsStartY > pageHeight - margin - lineHeight * 2) { // Add a bit more buffer
                            doc.addPage(); keyInsightsStartY = margin;
                        }
                    }
                }
            }


            doc.addPage();
            let indicatorTableStartY = 22;
            doc.setFontSize(15);
            doc.setTextColor(41, 128, 185);
            doc.text('All Indicators', 14, indicatorTableStartY);
            indicatorTableStartY += 8;

            const grouped: Record<string, Indicator[]> = {};
            for (const ind of reportIndicators) {
                if (!grouped[ind.IndicatorCategory]) grouped[ind.IndicatorCategory] = [];
                grouped[ind.IndicatorCategory].push(ind);
            }

            for (const cat of Object.keys(grouped).sort()) { // Sort categories alphabetically
                if (indicatorTableStartY + 15 > pageHeight - margin) {
                    doc.addPage();
                    indicatorTableStartY = margin;
                }
                doc.setFontSize(13);
                doc.setTextColor(51, 105, 232);
                doc.text(cat, 16, indicatorTableStartY);
                autoTable(doc, {
                    startY: indicatorTableStartY + 4,
                    head: [['Name', 'Subcategory', 'Value', 'Unit']],
                    body: grouped[cat].map(ind => [
                        ind.DisplayName,
                        ind.IndicatorSubCategory || '-',
                        ind.value != null ? ind.value.toLocaleString(undefined, {maximumFractionDigits: 2}) : '-', // Format numbers
                        ind.StandardUnit,
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255], fontStyle: 'bold' },
                    bodyStyles: { fontSize: 10 },
                    alternateRowStyles: { fillColor: [230, 240, 255] },
                    margin: { left: 16, right: 10 },
                    tableWidth: 180,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    didDrawPage: (_data) => {
                        indicatorTableStartY = margin;
                    }
                });
                indicatorTableStartY = doc.lastAutoTable.finalY + 12;
            }

            const pageCount = doc.internal.pages.length;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    'Source: Moroccan Economy Dashboard | Data: HCP, Bank Al-Maghrib, World Bank | Powered by AI | For informational purposes only.',
                    pageWidth / 2,
                    pageHeight - 8,
                    { align: 'center' }
                );
                doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 10, pageHeight - 8, { align: 'right'});
            }

            doc.save(`Moroccan_Economy_Report_${pdfReportYear}.pdf`); // Use pdfReportYear
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the PDF report.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    // Generate year options for the dropdown (e.g., last 20 years)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);


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
            {/* PDF Report Section */}
            <section className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/70">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-xl sm:text-2xl font-semibold text-sky-300 mb-3 sm:mb-0 flex items-center">
                        <CalendarIcon />
                        <span className="ml-2">Annual Economic Report</span>
                    </h2>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex-grow sm:flex-grow-0">
                        <label htmlFor="pdf-year-select" className="block text-sm font-medium text-slate-300 mb-1.5">
                            Select Report Year
                        </label>
                        <select
                            id="pdf-year-select"
                            value={pdfReportYear}
                            onChange={(e) => setPdfReportYear(Number(e.target.value))}
                            className="w-full sm:w-auto p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-slate-100 shadow-sm appearance-none"
                            disabled={isDownloadingPdf}
                        >
                            {yearOptions.map(year => (
                                <option key={year} value={year} className="bg-slate-800 hover:bg-slate-700">
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleDownloadPdf}
                        disabled={isDownloadingPdf}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isDownloadingPdf ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating Report...
                            </>
                        ) : (
                            "Download PDF Report"
                        )}
                    </button>
                </div>
            </section>


            {/* Filters Section */}
            <section className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/70">
                <div className="flex items-center mb-5">
                    <FilterIcon />
                    <h2 className="text-xl sm:text-2xl font-semibold text-sky-300 ml-2">
                        Filter Economic Indicators for Chart
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
            <section className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl shadow-xl border border-slate-700/70 min-h-[500px]">
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
                {isMounted && chartData.length > 0 && currentChartIndicator && !isLoadingChartData && !errorChartData && (
                    <div className="mt-8 pt-6 border-t border-slate-700">
                        <h3 className="text-lg font-semibold text-sky-300 mb-4 flex items-center">
                            <SparklesIcon />
                            <span className="ml-2">AI Generated Chart Insights</span>
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
        </div>
    );
}