// src/app/api/generate-description/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

interface ChartDataPoint {
    date: string;
    value: number;
}

interface RequestBody {
    chartData: ChartDataPoint[];
    indicatorName: string;
    unit: string;
    startDate: string;
    endDate: string;
}

const MODEL_NAME = "gemini-1.5-flash-latest"; // Or other suitable Gemini model like "gemini-pro"

export async function POST(request: Request) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("Missing Google Gemini API Key");
        return NextResponse.json({ message: "AI service configuration error." }, { status: 500 });
    }

    try {
        const body: RequestBody = await request.json();
        const { chartData, indicatorName, unit, startDate, endDate } = body;

        if (!chartData || chartData.length === 0 || !indicatorName || !unit || !startDate || !endDate) {
            return NextResponse.json({ message: "Missing required data for description generation." }, { status: 400 });
        }

        // 1. Data Preprocessing & Summarization (Keep it simple for now)
        let dataSummary = `The indicator "${indicatorName}" (Unit: ${unit}) was observed from ${startDate} to ${endDate}. `;

        if (chartData.length > 0) {
            const firstValue = chartData[0].value.toFixed(2);
            const lastValue = chartData[chartData.length - 1].value.toFixed(2);
            dataSummary += `It started at ${firstValue} and ended at ${lastValue}. `;

            // Basic trend
            if (chartData.length > 1) {
                if (Number(lastValue) > Number(firstValue)) {
                    dataSummary += "Overall, there was an increasing trend. ";
                } else if (Number(lastValue) < Number(firstValue)) {
                    dataSummary += "Overall, there was a decreasing trend. ";
                } else {
                    dataSummary += "The value remained relatively stable from start to end. ";
                }
            }

            // Min/Max (optional, can make prompt long for many points)
            // const values = chartData.map(p => p.value);
            // const minValue = Math.min(...values).toFixed(2);
            // const maxValue = Math.max(...values).toFixed(2);
            // dataSummary += `The minimum value was ${minValue} and the maximum was ${maxValue}. `;
        } else {
            dataSummary += "No specific data points were provided for detailed analysis. ";
        }


        // 2. Prompt Engineering
        const prompt = `
            You are an economic analyst assistant.
            Analyze the following economic indicator data for Morocco and provide a concise, human-readable summary (around 2-4 sentences) highlighting key observations.
            Avoid technical jargon unless necessary and explain it.
            
            Indicator Details:
            - Name: ${indicatorName}
            - Unit: ${unit}
            - Period: ${startDate} to ${endDate}
            
            Data Summary:
            ${dataSummary}
            
            Key data points (chronological):
            ${chartData.slice(0, 5).map(p => `On ${p.date}, value was ${p.value.toFixed(2)}`).join('; ')}
            ${chartData.length > 5 ? `... (and ${chartData.length - 5} more data points)` : ''}

            Based on this, what are the most important insights a user should quickly understand from this data?
            Focus on trends, significant changes if apparent from the summary, or overall performance.
        `;

        // 3. Call Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.7, // Adjust for creativity vs. factuality
            topK: 1,
            topP: 1,
            maxOutputTokens: 200, // Adjust as needed
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{text: prompt}] }],
            generationConfig,
            safetySettings,
        });

        if (result.response) {
            const description = result.response.text();
            return NextResponse.json({ description });
        } else {
            console.error("AI Response Error:", result);
            return NextResponse.json({ message: "Failed to get a valid response from AI." }, { status: 500 });
        }

    } catch (error) {
        console.error("API Error generating description:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: "Failed to generate AI description", error: errorMessage }, { status: 500 });
    }
}