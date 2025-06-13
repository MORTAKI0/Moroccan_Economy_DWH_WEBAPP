import { queryDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Helper to call Google Gemini API (using fetch)
async function getAiSummary(year: string, indicators: any[]) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GOOGLE_GEMINI_API_KEY");

    // Prepare summary input
    const indicatorsText = indicators
        .map(ind => `- ${ind.DisplayName} (${ind.IndicatorCategory}): ${ind.value} ${ind.StandardUnit}`)
        .join('\n');

    const prompt = `
Write a detailed executive summary for Morocco's economy in ${year} based on these annual indicators:
${indicatorsText}

Highlight major trends, notable outliers, and important economic implications. Use formal, professional language.
`;

    // Google Gemini API call
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
        }),
    });
    const data = await response.json();

    // Gemini returns text as data.candidates[0].content.parts[0].text
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No summary available.";
    return aiText;
}

export async function GET(request: NextRequest) {
    const year = request.nextUrl.searchParams.get('year');
    if (!year) {
        return NextResponse.json({ message: "Missing year parameter" }, { status: 400 });
    }
    try {
        // Get all indicators and their average value for that year
        const sql = `
            SELECT di.IndicatorKey, di.DisplayName, di.IndicatorCategory, di.IndicatorSubCategory, di.StandardUnit,
                   ROUND(AVG(fe.IndicatorValue), 2) as value
            FROM dimindicator di
            LEFT JOIN facteconomicindicators fe ON fe.IndicatorKey = di.IndicatorKey
            LEFT JOIN dimtime dt ON fe.TimeKey = dt.TimeKey
            WHERE dt.Year = ?
            GROUP BY di.IndicatorKey, di.DisplayName, di.IndicatorCategory, di.IndicatorSubCategory, di.StandardUnit
            ORDER BY di.IndicatorCategory, di.DisplayName
        `;
        const indicators = await queryDatabase(sql, [year]);

        // Get AI summary
        const aiSummary = await getAiSummary(year, indicators);

        return NextResponse.json({
            year,
            indicators,
            aiSummary,
            generatedAt: new Date().toISOString()
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Failed to generate annual report", error: (err as Error).message }, { status: 500 });
    }
}
