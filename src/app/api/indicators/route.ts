// src/app/api/indicators/route.ts
import { queryDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const sql = `
            SELECT
                IndicatorKey,
                StandardizedIndicatorName,
                DisplayName, -- << ADDED
                IndicatorCategory,
                IndicatorSubCategory,
                StandardUnit
            FROM DimIndicator
            ORDER BY IndicatorCategory, DisplayName; -- Optionally order by DisplayName
        `;
        const indicators = await queryDatabase(sql);

        return NextResponse.json(indicators);

    } catch (error) {
        console.error("API Error fetching indicators:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: "Failed to fetch indicators", error: errorMessage }, { status: 500 });
    }
}