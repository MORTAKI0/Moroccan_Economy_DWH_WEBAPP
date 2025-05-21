// src/lib/db.ts
import mysql from 'mysql2/promise'; // Using the promise-based API

// Define the connection pool (recommended for multiple requests)
// The pool will manage connections for you.
let pool: mysql.Pool | null = null;

function getPool() {
    if (pool) {
        return pool;
    }
    // Create the connection pool. The pool will emit acquire and release events.
    // Adjust pool options as needed for production, but defaults are often fine for local.
    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'moroccan_economy_dwh_local',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 10, // Adjust as needed
        queueLimit: 0
    });
    console.log("MySQL Connection Pool created.");
    return pool;
}


// Function to execute queries
export async function queryDatabase(sql: string, params?: any[]) {
    const currentPool = getPool();
    let connection;
    try {
        connection = await currentPool.getConnection();
        console.log(`Executing query: ${sql.substring(0,100)}... with params:`, params); // Log query safely
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        console.error("Database query error:", error);
        // In a real app, you might throw a custom error or handle specific DB errors
        throw new Error("Failed to query the database.");
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
}

// Optional: A function to test the connection if needed during startup
export async function testDbConnection() {
    try {
        const connection = await getPool().getConnection();
        console.log("Successfully connected to MySQL via pool for test.");
        connection.release();
        return true;
    } catch (error) {
        console.error("Failed to connect to MySQL via pool for test:", error);
        return false;
    }
}