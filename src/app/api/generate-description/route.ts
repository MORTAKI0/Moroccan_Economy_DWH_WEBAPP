// src/app/api/generate-description/route.ts
import { NextResponse } from 'next/server';
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    GenerateContentResult
} from '@google/generative-ai';
import { format, parseISO, differenceInDays, differenceInMonths } from 'date-fns';

interface ChartDataPoint {
    date: string; // Expecting 'YYYY-MM-DD'
    value: number;
}

interface RequestBody {
    chartData: ChartDataPoint[];
    indicatorName: string;
    unit: string;
    startDate: string; // Expecting 'YYYY-MM-DD'
    endDate: string;   // Expecting 'YYYY-MM-DD'
}

interface BasicStats {
    count: number;
    startDate: string;
    endDate: string;
    startValue: number;
    endValue: number;
    minValue: number;
    minDate: string; // Formatted date string
    maxValue: number;
    maxDate: string; // Formatted date string
    avgValue: number;
    median: number;
    stdDev: number;
    coefficientOfVariation: number;
    netChange: number;
    percentageChange: number;
    timeSpanDays: number;
    timeSpanMonths: number;
}

interface TrendAnalysis {
    direction: 'increasing' | 'decreasing' | 'stable' | 'volatile' | 'cyclical';
    strength: 'strong' | 'moderate' | 'weak';
    confidence: number;
    segments: Array<{
        period: string;
        trend: string;
        change: number;
        significance: 'high' | 'medium' | 'low';
    }>;
}

interface SeasonalityAnalysis {
    hasSeasonality: boolean;
    pattern?: 'quarterly' | 'annual' | 'monthly';
    strength?: number;
    description?: string;
}

interface VolatilityAnalysis {
    level: 'high' | 'medium' | 'low';
    coefficient: number;
    periods: Array<{
        period: string;
        volatility: number;
        description: string;
    }>;
}

interface Outlier {
    date: string;
    value: number;
    type: 'peak' | 'trough' | 'anomaly';
    significance: number;
    context?: string;
}
interface OutlierAnalysis {
    outliers: Outlier[];
    hasSignificantOutliers: boolean;
}

interface AdvancedStats {
    basicStats: BasicStats;
    trendAnalysis: TrendAnalysis;
    seasonalityAnalysis: SeasonalityAnalysis;
    volatilityAnalysis: VolatilityAnalysis;
    outlierAnalysis: OutlierAnalysis;
    correlationInsights: string[];
    economicContext: string[];
}

const MODEL_NAME = "gemini-1.5-pro-latest";

function calculateAdvancedStats(data: ChartDataPoint[]): AdvancedStats | null {
    if (!data || data.length < 2) return null;

    const values = data.map(p => p.value);

    const firstPoint = data[0];
    const lastPoint = data[data.length - 1];

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = values.length % 2 === 0
        ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
        : sortedValues[Math.floor(values.length / 2)];

    const variance = values.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avgValue !== 0 ? (stdDev / avgValue) * 100 : 0;

    const netChange = lastPoint.value - firstPoint.value;
    const percentageChange = firstPoint.value !== 0 ? (netChange / Math.abs(firstPoint.value)) * 100 : 0;

    const minIndex = values.indexOf(minValue);
    const maxIndex = values.indexOf(maxValue);
    const minDate = data[minIndex]?.date || firstPoint.date;
    const maxDate = data[maxIndex]?.date || lastPoint.date;

    const basicStats: BasicStats = {
        count: data.length,
        startDate: firstPoint.date,
        endDate: lastPoint.date,
        startValue: firstPoint.value,
        endValue: lastPoint.value,
        minValue,
        minDate: format(parseISO(minDate), 'MMM yyyy'),
        maxValue,
        maxDate: format(parseISO(maxDate), 'MMM yyyy'),
        avgValue,
        median,
        stdDev,
        coefficientOfVariation,
        netChange,
        percentageChange,
        timeSpanDays: differenceInDays(parseISO(lastPoint.date), parseISO(firstPoint.date)),
        timeSpanMonths: differenceInMonths(parseISO(lastPoint.date), parseISO(firstPoint.date))
    };

    const trendAnalysis = analyzeTrend(data, values);
    const seasonalityAnalysis = analyzeSeasonality(data);
    const volatilityAnalysis = analyzeVolatility(data, values, avgValue, stdDev);
    const outlierAnalysis = detectOutliers(data, values, avgValue, stdDev);
    const correlationInsights = generateCorrelationInsights(data, basicStats);
    const economicContext = generateEconomicContext(basicStats, trendAnalysis);

    return {
        basicStats,
        trendAnalysis,
        seasonalityAnalysis,
        volatilityAnalysis,
        outlierAnalysis,
        correlationInsights,
        economicContext
    };
}

function analyzeTrend(data: ChartDataPoint[], values: number[]): TrendAnalysis {
    const n = values.length;
    if (n < 2) {
        return { direction: 'stable', strength: 'weak', confidence: 0, segments: [] };
    }
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
    const denominator = (n * sumX2 - sumX * sumX);
    const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    const yPred = x.map(xi => slope * xi + intercept);
    const yMean = sumY / n;
    const ssRes = values.reduce((sum, val, i) => sum + Math.pow(val - yPred[i], 2), 0);
    const ssTot = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0);
    const rSquared = ssTot === 0 ? 1 : Math.max(0, 1 - (ssRes / ssTot));
    let direction: TrendAnalysis['direction'] = 'stable';
    if (Math.abs(slope) > 0.01) { direction = slope > 0 ? 'increasing' : 'decreasing'; }
    const residuals = values.map((val, i) => val - yPred[i]);
    const stdDevResiduals = Math.sqrt(residuals.reduce((sum, r) => sum + r * r, 0) / (n - 2 || 1));
    const relativeVolatility = yMean !== 0 ? (stdDevResiduals / Math.abs(yMean)) * 100 : 0;
    if (relativeVolatility > 30) { direction = 'volatile'; }
    let strength: TrendAnalysis['strength'];
    if (rSquared > 0.6 && Math.abs(slope) > 0.1 * Math.abs(yMean)) { strength = 'strong'; }
    else if (rSquared > 0.3 && Math.abs(slope) > 0.05 * Math.abs(yMean)) { strength = 'moderate'; }
    else { strength = 'weak'; }
    const segments = analyzeTrendSegments(data, values);
    return { direction, strength, confidence: rSquared, segments };
}

function analyzeTrendSegments(data: ChartDataPoint[], values: number[]): TrendAnalysis['segments'] {
    const segments: TrendAnalysis['segments'] = [];
    if (values.length < 3) return segments;
    const segmentSize = Math.max(3, Math.min(12, Math.floor(values.length / 3)));
    for (let i = 0; i < values.length; i += segmentSize) {
        const end = Math.min(i + segmentSize, values.length);
        if (end - i < 2) continue;
        const segmentValues = values.slice(i, end);
        const segmentData = data.slice(i, end);
        const startVal = segmentValues[0];
        const endVal = segmentValues[segmentValues.length - 1];
        const change = startVal !== 0 ? ((endVal - startVal) / Math.abs(startVal)) * 100 : (endVal !== 0 ? Infinity : 0);
        let trendDesc = 'stable';
        let significance: 'high' | 'medium' | 'low' = 'low';
        if (Math.abs(change) > 20) { trendDesc = change > 0 ? 'strong increase' : 'strong decrease'; significance = 'high'; }
        else if (Math.abs(change) > 10) { trendDesc = change > 0 ? 'moderate increase' : 'moderate decrease'; significance = 'medium'; }
        else if (Math.abs(change) > 3) { trendDesc = change > 0 ? 'slight increase' : 'slight decrease'; }
        segments.push({
            period: `${format(parseISO(segmentData[0].date), 'MMM yyyy')} - ${format(parseISO(segmentData[segmentData.length - 1].date), 'MMM yyyy')}`,
            trend: trendDesc, change, significance
        });
    }
    return segments;
}

function analyzeSeasonality(data: ChartDataPoint[]): SeasonalityAnalysis {
    if (data.length < 24) return { hasSeasonality: false, description: "Insufficient data for robust seasonality analysis (requires at least 2 full cycles)." };
    const monthlyTotals: Record<number, { sum: number; count: number }> = {};
    data.forEach(point => {
        const month = parseISO(point.date).getMonth();
        if (!monthlyTotals[month]) { monthlyTotals[month] = { sum: 0, count: 0 }; }
        monthlyTotals[month].sum += point.value;
        monthlyTotals[month].count++;
    });
    const monthlyAverages = Object.values(monthlyTotals).map(m => m.sum / m.count);
    if (monthlyAverages.length < 12) return { hasSeasonality: false, description: "Data does not cover all months consistently for seasonality." };
    const overallAverage = monthlyAverages.reduce((s, v) => s + v, 0) / 12;
    const variance = monthlyAverages.reduce((s, v) => s + Math.pow(v - overallAverage, 2), 0) / 12;
    const stdDevSeasonal = Math.sqrt(variance);
    const seasonalStrength = overallAverage !== 0 ? stdDevSeasonal / Math.abs(overallAverage) : 0;
    const hasSeasonality = seasonalStrength > 0.15;
    return {
        hasSeasonality, pattern: hasSeasonality ? 'monthly' : undefined,
        strength: hasSeasonality ? seasonalStrength : undefined,
        description: hasSeasonality ? `Suggestive monthly pattern with a seasonal strength coefficient of ${(seasonalStrength * 100).toFixed(1)}%.`
            : 'No strong, consistent monthly seasonal pattern detected with this basic analysis.'
    };
}

function analyzeVolatility(data: ChartDataPoint[], values: number[], avgValue: number, stdDev: number): VolatilityAnalysis {
    const coefficientOfVariation = avgValue !== 0 ? (stdDev / Math.abs(avgValue)) * 100 : 0;
    let level: VolatilityAnalysis['level'];
    if (coefficientOfVariation > 25) level = 'high';
    else if (coefficientOfVariation > 10) level = 'medium';
    else level = 'low';
    const periods: VolatilityAnalysis['periods'] = [];
    const n = data.length;
    if (n >= 6) {
        const midPoint = Math.floor(n / 2);
        [{ d: data.slice(0, midPoint), v: values.slice(0, midPoint), label: "first half" },
            { d: data.slice(midPoint), v: values.slice(midPoint), label: "second half" }]
            .forEach(part => {
                if (part.v.length < 2) return;
                const partAvg = part.v.reduce((s, val) => s + val, 0) / part.v.length;
                const partVariance = part.v.reduce((s, val) => s + Math.pow(val - partAvg, 2), 0) / part.v.length;
                const partStdDev = Math.sqrt(partVariance);
                const partCV = partAvg !== 0 ? (partStdDev / Math.abs(partAvg)) * 100 : 0;
                let desc = 'stable';
                if (partCV > 25) desc = 'highly volatile'; else if (partCV > 10) desc = 'moderately volatile';
                periods.push({
                    period: `Period covering ${part.label} (${format(parseISO(part.d[0].date), 'MMM yyyy')} - ${format(parseISO(part.d[part.d.length - 1].date), 'MMM yyyy')})`,
                    volatility: partCV,
                    description: desc
                });
            });
    }
    return { level, coefficient: coefficientOfVariation, periods };
}

function detectOutliers(data: ChartDataPoint[], values: number[], avgValue: number, stdDev: number): OutlierAnalysis {
    const outliers: Outlier[] = [];
    const iqrThresholdMultiplier = 1.5;
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1 = sortedValues[Math.floor(sortedValues.length / 4)];
    const q3 = sortedValues[Math.floor((sortedValues.length * 3) / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - iqrThresholdMultiplier * iqr;
    const upperBound = q3 + iqrThresholdMultiplier * iqr;
    values.forEach((value, index) => {
        if (value < lowerBound || value > upperBound) {
            const type = value > upperBound ? 'peak' : 'trough';
            outliers.push({ date: data[index].date, value, type, significance: Math.abs(value - avgValue) / stdDev, context: `Value is outside IQR bounds (Lower: ${lowerBound.toFixed(2)}, Upper: ${upperBound.toFixed(2)})` });
        }
    });
    for (let i = 1; i < values.length - 1; i++) {
        if (values[i-1] === 0) continue;
        const prevChange = Math.abs(values[i] - values[i-1]) / Math.abs(values[i-1]) * 100;
        if (prevChange > 50) {
            if (!outliers.some(o => o.date === data[i].date && o.type !== 'anomaly')) {
                outliers.push({ date: data[i].date, value: values[i], type: 'anomaly', significance: prevChange, context: `Sudden change of ${prevChange.toFixed(1)}% from previous point.` });
            }
        }
    }
    return { outliers: outliers.sort((a,b) => b.significance - a.significance).slice(0, 5), hasSignificantOutliers: outliers.length > 0 };
}

function generateCorrelationInsights(data: ChartDataPoint[], basicStats: BasicStats): string[] {
    const insights: string[] = [];
    if (basicStats.timeSpanMonths > 24) {
        insights.push(`The dataset spans ${(basicStats.timeSpanMonths / 12).toFixed(1)} years, allowing for observation of medium-term trends.`);
    } else if (basicStats.timeSpanMonths > 6) {
        insights.push(`The dataset covers ${basicStats.timeSpanMonths} months, suitable for short-term analysis.`);
    }
    const annualizedGrowth = (basicStats.timeSpanMonths >= 12 && basicStats.startValue !== 0) ? (Math.pow(basicStats.endValue / basicStats.startValue, 12 / basicStats.timeSpanMonths) - 1) * 100 : null;
    if (annualizedGrowth !== null) {
        if (Math.abs(annualizedGrowth) > 3) { insights.push(`The indicator shows an approximate annualized ${annualizedGrowth > 0 ? 'growth' : 'decline'} rate of ${annualizedGrowth.toFixed(1)}%.`); }
        else { insights.push(`The indicator shows a relatively stable annualized rate of change.`); }
    }
    if (basicStats.coefficientOfVariation < 5) { insights.push('Overall data stability is high (low coefficient of variation).'); }
    else if (basicStats.coefficientOfVariation > 20) { insights.push('Overall data shows notable volatility (high coefficient of variation).'); }
    return insights;
}

function generateEconomicContext(basicStats: BasicStats, trendAnalysis: TrendAnalysis): string[] {
    const context: string[] = [];
    if (trendAnalysis.direction === 'increasing' && trendAnalysis.strength === 'strong') { context.push('A strong, sustained upward trend often signifies positive economic momentum or growing demand/activity.'); }
    else if (trendAnalysis.direction === 'decreasing' && trendAnalysis.strength === 'strong') { context.push('A strong, sustained downward trend may indicate underlying economic challenges or contracting activity.'); }
    else if (trendAnalysis.direction === 'volatile') { context.push('Observed volatility can reflect periods of economic uncertainty, policy shifts, or external shocks.'); }
    if (Math.abs(basicStats.percentageChange) > 30 && basicStats.timeSpanMonths >=12) { context.push(`A total change of ${basicStats.percentageChange.toFixed(1)}% over the period suggests a substantial shift in the indicator's dynamics.`); }
    return context;
}


export async function POST(request: Request) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Missing Google Gemini API Key");
        return NextResponse.json({ message: "AI service configuration error." }, { status: 500 });
    }

    try {
        const body: RequestBody = await request.json();
        const { chartData, indicatorName, unit, startDate, endDate } = body;

        if (!chartData || chartData.length < 2 || !indicatorName || !unit || !startDate || !endDate) {
            return NextResponse.json({ message: "Insufficient data or missing parameters for description generation." }, { status: 400 });
        }

        const advancedStats = calculateAdvancedStats(chartData);

        if (!advancedStats) {
            return NextResponse.json({ message: "Failed to calculate advanced statistics from the provided data." }, { status: 400 });
        }

        const { basicStats, trendAnalysis, seasonalityAnalysis, volatilityAnalysis, outlierAnalysis, correlationInsights, economicContext } = advancedStats;

        // Fixed date formatting in dataSummaryForPrompt
        const dataSummaryForPrompt = `
        DETAILED ECONOMIC ANALYSIS FOR: "${indicatorName}" (Unit: ${unit})
        Report Period: ${format(parseISO(startDate), 'MMMM d, yyyy')} to ${format(parseISO(endDate), 'MMMM d, yyyy')}
        Actual Data Span Analyzed: ${format(parseISO(basicStats.startDate), 'MMM yyyy')} to ${format(parseISO(basicStats.endDate), 'MMM yyyy')} (${basicStats.count} points over ~${(basicStats.timeSpanMonths / 12).toFixed(1)} years).

        Core Statistics:
        - Start Value: ${basicStats.startValue.toFixed(2)} | End Value: ${basicStats.endValue.toFixed(2)}
        - Net Change: ${basicStats.netChange.toFixed(2)} (${basicStats.percentageChange.toFixed(1)}%)
        - Average: ${basicStats.avgValue.toFixed(2)} | Median: ${basicStats.median.toFixed(2)}
        - Min: ${basicStats.minValue.toFixed(2)} (on ${basicStats.minDate}) | Max: ${basicStats.maxValue.toFixed(2)} (on ${basicStats.maxDate})
        - Std. Deviation: ${basicStats.stdDev.toFixed(2)} | Coeff. of Variation: ${basicStats.coefficientOfVariation.toFixed(1)}%

        Trend Analysis:
        - Overall Trend: ${trendAnalysis.direction} (Strength: ${trendAnalysis.strength}, Confidence (R²): ${(trendAnalysis.confidence * 100).toFixed(1)}%)
        - Key Trend Segments:
          ${trendAnalysis.segments.length > 0 ? trendAnalysis.segments.map(s => `  - ${s.period}: ${s.trend} (${s.change.toFixed(1)}% change, ${s.significance} significance)`).join('\n') : "  - Segment analysis requires more distinct periods or data."}

        Volatility Insights:
        - Overall Volatility: ${volatilityAnalysis.level} (Coeff. of Variation: ${volatilityAnalysis.coefficient.toFixed(1)}%)
        - Period Volatility:
          ${volatilityAnalysis.periods.length > 0 ? volatilityAnalysis.periods.map(p => `  - ${p.period}: ${p.description} (CV: ${p.volatility.toFixed(1)}%)`).join('\n') : "  - Detailed period volatility analysis requires more data or distinct phases."}

        Seasonality Assessment:
        - Seasonal Pattern: ${seasonalityAnalysis.hasSeasonality ? `Detected (${seasonalityAnalysis.pattern || 'general'}) with strength ~${(seasonalityAnalysis.strength! * 100).toFixed(1)}%` : 'Not prominently detected or insufficient data for robust analysis.'}
        - Note: ${seasonalityAnalysis.description || "Basic seasonality check performed."}

        Outliers and Anomalies:
        - Significant Outliers: ${outlierAnalysis.hasSignificantOutliers ? `${outlierAnalysis.outliers.length} detected` : 'None prominent'}
          ${outlierAnalysis.outliers.map(o => `  - ${format(parseISO(o.date), 'MMM yyyy')}: ${o.value.toFixed(2)} (${o.type} - ${o.context})`).join('\n')}

        Derived Insights:
        ${correlationInsights.map(insight => `  - ${insight}`).join('\n        ')}
        ${economicContext.map(context => `  - ${context}`).join('\n          ')}
        `;

        const prompt = `
        As a Senior Economist for Morocco, provide a comprehensive analytical report on the economic indicator: "${indicatorName}".
        Your analysis should be detailed, insightful, and written in formal, professional language suitable for high-level briefings.
        The report should be structured into clear paragraphs covering key aspects of the data. Aim for a total length of 10-15 sentences.

        DATASET OVERVIEW:
        ${dataSummaryForPrompt}

        REQUIRED ANALYTICAL SECTIONS:

        1.  **Executive Summary (2-3 sentences):** Start with a concise overview of the indicator's performance and its primary implications during the analyzed period.

        2.  **Trend Dynamics and Segmentation (3-4 sentences):**
            * Describe the dominant long-term trend (direction, strength, confidence/R²).
            * Discuss significant trend segments identified, including their timeframe, nature (e.g., acceleration, deceleration, reversal), and magnitude of change.
            * Relate these trends to potential underlying economic drivers or conditions in Morocco.

        3.  **Volatility and Stability Assessment (2-3 sentences):**
            * Characterize the overall volatility (e.g., low, moderate, high) using the coefficient of variation.
            * Discuss any specific periods of heightened or subdued volatility identified and their potential economic context.

        4.  **Key Observations (Outliers & Seasonality) (2-3 sentences):**
            * Comment on any significant outliers detected, their timing, and plausible explanations (e.g., policy changes, external shocks, data anomalies).
            * Briefly mention if any seasonal patterns were suggested by the data, and their nature if apparent.

        5.  **Broader Economic Interpretation and Implications (3-4 sentences):**
            * Synthesize the findings: What does this indicator's behavior reveal about the Moroccan economy or the specific sector it represents?
            * Connect the analysis to broader Moroccan economic goals, development plans, or known economic events during the period if relevant.
            * Suggest potential implications for policy or business strategy, if appropriate, based on the data.

        **INSTRUCTIONS:**
        - Refer to specific values, dates, and statistical measures from the "DATASET OVERVIEW" to substantiate your analysis.
        - Ensure a logical flow between sections.
        - Conclude with a forward-looking statement or a summary of the key takeaway if appropriate.
        - If data limitations exist (e.g., short time span, few data points for a sub-analysis), acknowledge this appropriately.
        - Identify the likely source of the data (e.g., HCP, BAM, World Bank) based on the indicator name "${indicatorName}" at the beginning of your report.
        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.3,
            topK: 30,
            topP: 0.90,
            maxOutputTokens: 1200,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result: GenerateContentResult = await model.generateContent({
            contents: [{ role: "user", parts: [{text: prompt}] }],
            generationConfig,
            safetySettings,
        });

        const geminiAPIResponse = result.response; // Renamed for clarity

        if (geminiAPIResponse && geminiAPIResponse.candidates && geminiAPIResponse.candidates.length > 0 && geminiAPIResponse.candidates[0].content) {
            const description = geminiAPIResponse.text();
            return NextResponse.json({
                description,
                // advancedStats // You can uncomment this if you want to send stats to the frontend
            });
        } else {
            console.error("AI Response Error or Blocked. Full result object:", JSON.stringify(result, null, 2));
            let detailedError = "Failed to get a valid response from AI or content was blocked.";

            // Access promptFeedback from the 'geminiAPIResponse' (which is result.response)
            const feedback = geminiAPIResponse?.promptFeedback;

            if (feedback?.blockReason) {
                detailedError += ` Blocked due to: ${feedback.blockReason}.`;
                if (feedback.safetyRatings) {
                    detailedError += ` Safety Ratings: ${JSON.stringify(feedback.safetyRatings)}`;
                }
            } else if (geminiAPIResponse && geminiAPIResponse.candidates && geminiAPIResponse.candidates.length === 0) {
                detailedError += " AI responded but with no valid candidates (content was likely filtered).";
            } else if (!geminiAPIResponse) {
                // This case implies the entire 'response' object from Gemini was missing.
                // The 'result' object itself might have top-level error information if the API call failed at a higher level.
                // However, 'promptFeedback' specifically is part of the 'GenerateContentResponse' structure according to the SDK.
                // If 'geminiAPIResponse' is null/undefined, it means no response payload was received.
                detailedError += " No response object received from AI; the request might have failed before generating content.";
            }
            return NextResponse.json({ message: detailedError }, { status: 500 });
        }

    } catch (error) {
        console.error("API Error generating description:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({
            message: "Failed to generate AI description",
            error: errorMessage
        }, { status: 500 });
    }
}