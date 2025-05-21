// src/app/api/indicators/route.ts
import { queryDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() { // Ensure this is exported correctly
    try {
        const sql = `
            SELECT 
                IndicatorKey, 
                StandardizedIndicatorName, 
                IndicatorCategory, 
                IndicatorSubCategory, 
                StandardUnit 
            FROM DimIndicator
            ORDER BY IndicatorCategory, StandardizedIndicatorName;
        `;
        const indicators = await queryDatabase(sql);

        return NextResponse.json(indicators);

    } catch (error) {
        console.error("API Error fetching indicators:", error);
        // Make sure to cast error to Error type to access message property
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: "Failed to fetch indicators", error: errorMessage }, { status: 500 });
    }
}