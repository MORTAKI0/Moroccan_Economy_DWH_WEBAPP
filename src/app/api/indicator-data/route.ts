import { queryDatabase } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const indicatorKey = searchParams.get('indicatorKey');
    const startDate = searchParams.get('startDate'); // YYYY-MM-DD
    const endDate = searchParams.get('endDate');     // YYYY-MM-DD

    if (!indicatorKey) {
        return NextResponse.json({ message: "indicatorKey parameter is required" }, { status: 400 });
    }

    try {
        let sql = `
            SELECT
                dt.FullDate as date,
                fe.IndicatorValue as value
            FROM facteconomicindicators fe
                JOIN dimtime dt ON fe.TimeKey = dt.TimeKey
            WHERE fe.IndicatorKey = ?
        `;
        const params: any[] = [indicatorKey];

        if (startDate) {
            sql += ` AND dt.FullDate >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND dt.FullDate <= ?`;
            params.push(endDate);
        }

        sql += ` ORDER BY dt.FullDate ASC;`;

        const data = await queryDatabase(sql, params);

        return NextResponse.json(data);

    } catch (error) {
        console.error("API Error fetching indicator data:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return NextResponse.json({ message: "Failed to fetch indicator data", error: errorMessage }, { status: 500 });
    }
}
