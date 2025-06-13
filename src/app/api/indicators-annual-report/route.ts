// src/app/api/indicators-annual-report/route.ts

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAnnualIndicators, AnnualIndicator } from '@/lib/db';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro-latest' // Consider gemini-1.5-flash for speed if 1.5-pro is too slow, but pro is better for quality.
});

export async function GET(req: Request) {
    try {
        const url  = new URL(req.url);
        const year = Number(url.searchParams.get('year') ?? new Date().getFullYear());

        // 1) Fetch data
        const indicators: AnnualIndicator[] = await getAnnualIndicators(year);

        // 2) Serialize into a prompt-friendly list
        const structuredData = indicators
            .map((i: AnnualIndicator) =>
                `- ${i.DisplayName} (${i.IndicatorCategory}` +
                (i.IndicatorSubCategory ? ` › ${i.IndicatorSubCategory}` : '') +
                `): ${i.value?.toLocaleString(undefined, { maximumFractionDigits: 3 }) ?? 'N/A'} ${i.StandardUnit}` // Added toLocaleString options
            )
            .join('\n');

        // 3) Craft a richer prompt
        const prompt = `
You are a distinguished Senior Economist preparing the **Official Annual Economic Review for Morocco** for the year ${year}.
Your objective is to deliver a comprehensive, insightful, and analytically robust report that provides a clear vision of Morocco's economic landscape, performance, and key challenges during this period.
The style should be formal, objective, and authoritative, akin to publications from national institutions like Morocco's High Commission for Planning (HCP) or Bank Al-Maghrib.

**Report Structure and Content Guidelines:**

**I. Executive Summary (Implicitly, the overall tone and flow):**
   While not a separate section in this text-only output, the entire review should read as a cohesive summary.

**II. Macroeconomic Context (Opening Narrative - Paragraph Form):**
   *   Begin with a compelling narrative (2-3 paragraphs) setting the stage.
   *   Describe the prevailing global and domestic macroeconomic environment in ${year}.
   *   Key elements to discuss:
        *   Significant global economic trends (e.g., global growth, commodity prices, major geopolitical events impacting trade/economy).
        *   Dominant domestic factors (e.g., specific national policy initiatives, fiscal stance, structural reforms, climatic conditions like drought if relevant, social factors).
        *   If ${year} is a post-crisis year (e.g., post-COVID), analyze the recovery trajectory and lingering impacts.
   *   Crucially, establish how these contextual elements influenced Morocco's economic trajectory throughout ${year}.

**III. Detailed Thematic Analysis (Organize into the following numbered sections):**
    *   For each section, provide an analytical narrative. Do not just list data.
    *   **Interpret** each relevant data point: explain its significance, underlying drivers, and broader implications for the Moroccan economy. Connect it to the Macroeconomic Context.

    *   **1. Overall Economic Performance:**
        *   Analyze GDP growth: its magnitude and quality.
        *   Discuss the main sectoral contributions to GDP (e.g., agriculture, industry, services, tourism).
        *   Highlight key drivers of domestic demand (consumption, investment) and net exports.

    *   **2. Labour Market Dynamics:**
        *   Examine employment and unemployment trends (overall, youth, gender, urban/rural if data permits).
        *   Discuss labor force participation rates.
        *   Analyze sectoral employment shifts and any signs of wage pressures or labor market rigidities.

    *   **3. Price Stability and Inflation:**
        *   Detail inflation trends (headline CPI, core inflation if inferable).
        *   Identify and analyze the primary drivers of inflation (e.g., food prices, energy costs, imported inflation, demand-pull vs. cost-push factors).
        *   Discuss the impact of inflation on purchasing power and economic agents.

    *   **4. Monetary Policy and Financial Conditions:**
        *   Describe the stance of Bank Al-Maghrib's monetary policy during ${year} (e.g., interest rate decisions, liquidity management).
        *   Analyze the evolution of credit to the economy (to households and businesses).
        *   Comment on the health and stability of the financial sector, if possible based on data (e.g., credit quality, banking sector profitability - though specific data for this might be limited here).

    *   **5. External Sector Performance:**
        *   Analyze trends in exports of goods and services (identifying key performing/underperforming categories).
        *   Discuss import dynamics and the resulting trade balance.
        *   Examine the performance of key foreign exchange earners like tourism revenues and remittances from Moroccans residing abroad.
        *   Conclude with an assessment of the current account balance and its implications.

**IV. Key Insights and Outlook (Concluding Section):**
    *   Synthesize the main findings into a "Key Insights" subsection.
    *   Present 5-7 distinct, impactful bullet points (use a single '*' for each bullet, e.g., "* The resilience of the agricultural sector was a key stabilizing factor."). These should be concise summaries of the most critical trends and developments.
    *   (Optional, if the AI feels confident based on analysis) Briefly touch upon the emerging outlook or key challenges and opportunities for the Moroccan economy moving forward from ${year}, based on the year's performance. Keep this concise and high-level.

**Data Integration and Presentation Guidelines:**
*   The provided "DATA POINTS" are your primary source for quantitative evidence. Integrate them **naturally and accurately** within your analytical narrative for each relevant section.
*   When citing a data point, frame it with your interpretation. For example: "The services sector demonstrated robust growth, expanding by X%, primarily driven by Y and Z, thereby contributing significantly to overall economic activity."
*   **Crucially, do NOT use any markdown formatting like '**' or '***' for bolding or emphasis in your generated text. All section titles (e.g., "1. Overall Economic Performance") and content should be plain text.**
*   Ensure numerical values from the data are presented clearly.

**DATA POINTS FOR YEAR ${year}:**
${structuredData}
    `.trim();

        // 4) Call Gemini
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                temperature:     0.6, // Slightly lower for more factual, less "creative" economic reporting
                maxOutputTokens: 1500, // Increased to allow for more detailed analysis and narrative
                topP: 0.95,
                topK: 40
            }
        });

        let aiSummary = result.response.text().trim();

        // --- Clean the AI summary from any residual markdown bolding (as a fallback) ---
        aiSummary = aiSummary.replace(/\*\*\*/g, '');
        aiSummary = aiSummary.replace(/\*\*/g, '');

        // 5) Return
        return NextResponse.json({
            indicators,
            aiSummary: aiSummary || 'No summary generated.',
            generatedAt: new Date().toISOString()
        });
    } catch (err: any) {
        console.error('Annual report error:', err);
        return NextResponse.json(
            { message: 'Failed to build annual report', error: err.message },
            { status: 500 }
        );
    }
}