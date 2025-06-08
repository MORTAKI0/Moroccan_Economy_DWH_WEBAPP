import { queryDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const sql = `
            SELECT
                IndicatorKey,
                StandardizedIndicatorName,
                DisplayName,
                IndicatorCategory,
                IndicatorSubCategory,
                StandardUnit
            FROM dimindicator
            ORDER BY IndicatorCategory, DisplayName;
        `;

        const indicators = await queryDatabase(sql);

        return NextResponse.json(indicators);

    } catch (error) {
        console.error("API Error fetching indicators:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: "Failed to fetch indicators", error: errorMessage }, { status: 500 });
    }
}
