// src/lib/db.ts
import mysql from 'mysql2/promise';
import type { Pool, PoolOptions, PoolConnection } from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';

let pool: Pool | null = null;

/** Create (or return) a MySQL connection pool to your local WAMP server */
function getPool(): Pool {
    if (pool) return pool;

    const host     = process.env.DB_HOST     ?? '127.0.0.1';
    const port     = parseInt(process.env.DB_PORT ?? '3306', 10);
    const user     = process.env.DB_USER     ?? 'root';
    const password = process.env.DB_PASSWORD ?? '';
    const database = process.env.DB_NAME     ?? 'moroccan_economy_dwh_local';

    const config: PoolOptions = {
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit:    10,
        queueLimit:         0,
        connectTimeout:     15000,
    };

    pool = mysql.createPool(config);
    console.log('💾 MySQL pool created:', { host, port, database, user });
    return pool;
}

/**
 * Run any SQL and return the raw RowDataPacket[].
 * - `params` is `unknown[]` (no `any`).
 */
export async function queryDatabase(
    sql: string,
    params?: unknown[]
): Promise<RowDataPacket[]> {
    const p = getPool();
    let conn: PoolConnection | undefined;

    try {
        conn = await p.getConnection();
        const [rows] = await conn.execute<RowDataPacket[]>(sql, params);
        return rows;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('🔴 DB error:', msg);
        throw new Error(`Database query failed: ${msg}`);
    } finally {
        conn?.release();
    }
}


/** Shape of one annual indicator for your API */
export interface AnnualIndicator {
    DisplayName:          string;
    IndicatorCategory:    string;
    IndicatorSubCategory: string | null;
    value:                number;
    StandardUnit:         string;
}

/**
 * Fetches the “annual” values for all indicators in a given year.
 * Joins facteconomicindicators ⇢ dimtime, dimindicator, dimfrequency.
 */
export async function getAnnualIndicators(
    year: number
): Promise<AnnualIndicator[]> {
    const sql = `
    SELECT
      di.DisplayName,
      di.IndicatorCategory,
      di.IndicatorSubCategory,
      fi.IndicatorValue    AS value,
      di.StandardUnit
    FROM facteconomicindicators AS fi
    JOIN dimtime     AS dt ON fi.TimeKey      = dt.TimeKey
    JOIN dimindicator AS di ON fi.IndicatorKey = di.IndicatorKey
    JOIN dimfrequency AS df ON fi.FrequencyKey = df.FrequencyKey
    WHERE dt.Year = ? AND df.FrequencyName = 'Annual'
    ORDER BY di.DisplayName
  `;

    const rows = await queryDatabase(sql, [year]);

    return rows.map((row) => ({
        DisplayName:          String(row.DisplayName),
        IndicatorCategory:    String(row.IndicatorCategory),
        IndicatorSubCategory: row.IndicatorSubCategory === null ? null : String(row.IndicatorSubCategory),
        value:                Number(row.value),
        StandardUnit:         String(row.StandardUnit),
    }));
}
