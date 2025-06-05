// src/lib/db.ts
import mysql from 'mysql2/promise'; // Using the promise-based API

// Define the connection pool (recommended for multiple requests)
// The pool will manage connections for you.
let pool: mysql.Pool | null = null;

function getPool() {
    if (pool) {
        return pool;
    }

    // Read environment variables for database connection
    // DB_HOST will be crucial:
    // - In Cloud Run (with Cloud SQL connection): /cloudsql/YOUR_INSTANCE_CONNECTION_NAME
    // - Local Docker with WAMP: host.docker.internal
    // - Local dev (npm run dev) without Docker: localhost (or specific IP if WAMP isn't on localhost for Node)
    // - Other TCP/IP connections: The actual IP or hostname
    const dbHost = process.env.DB_HOST;
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD || ''; // In Cloud Run, this will come from Secret Manager
    const dbName = process.env.DB_NAME || 'moroccan_economy_dwh_local';
    const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

    const connectionConfig: mysql.PoolOptions = {
        user: dbUser,
        password: dbPassword,
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10, // Adjust as needed for Cloud SQL tier and app load
        queueLimit: 0,
        connectTimeout: 15000 // Optional: Increased connection timeout
    };

    // --- Logic to handle different DB_HOST scenarios ---
    if (dbHost && dbHost.startsWith('/cloudsql/')) {
        // Scenario 1: Cloud Run connecting to Cloud SQL via Unix Socket
        // Cloud Run injects the socket path, often into DB_HOST or CLOUD_SQL_CONNECTION_NAME.
        // We assume DB_HOST will carry this socket path.
        console.log(`Configuring MySQL connection for Cloud SQL socket: ${dbHost}`);
        connectionConfig.socketPath = dbHost;
    } else if (dbHost === 'host.docker.internal') {
        // Scenario 2: Local Docker container connecting to WampServer (or other host service)
        console.log(`Configuring MySQL connection for host.docker.internal (WAMP) via TCP: ${dbHost}:${dbPort}`);
        connectionConfig.host = dbHost;
        connectionConfig.port = dbPort;
    } else if (dbHost) {
        // Scenario 3: Connecting via TCP/IP to a specific host (e.g., Cloud SQL Public IP, other remote DB)
        console.log(`Configuring MySQL connection for remote host via TCP: ${dbHost}:${dbPort}`);
        connectionConfig.host = dbHost;
        connectionConfig.port = dbPort;
    } else {
        // Scenario 4: Fallback for local development (npm run dev without Docker, or if DB_HOST is not set)
        // Defaults to 'localhost'
        console.log(`Configuring MySQL connection for localhost (default/WAMP) via TCP: localhost:${dbPort}`);
        connectionConfig.host = 'localhost'; // Assumes WAMP MySQL is accessible via 'localhost' from Node.js
        connectionConfig.port = dbPort;
    }
    // --- End of DB_HOST scenario logic ---

    // Create the connection pool with the determined configuration
    pool = mysql.createPool(connectionConfig);

    console.log("MySQL Connection Pool created with configuration:", {
        host: connectionConfig.host,
        port: connectionConfig.port,
        socketPath: connectionConfig.socketPath,
        user: connectionConfig.user,
        database: connectionConfig.database,
        // Do not log password
    });

    return pool;
}


// Function to execute queries
export async function queryDatabase(sql: string, params?: any[]) {
    const currentPool = getPool(); // Ensures pool is initialized
    let connection;
    try {
        connection = await currentPool.getConnection();
        // console.log(`Executing query: ${sql.substring(0,100)}... with params:`, params); // Log query safely
        const [results] = await connection.execute(sql, params);
        return results;
    } catch (error) {
        const dbError = error as any; // Cast to access potential MySQL error properties
        console.error("Database query error:", dbError.message); // Log the error message
        // Log more specific MySQL error details if available
        if (dbError.code || dbError.sqlState) {
            console.error(`MySQL Error - Code: ${dbError.code}, SQLState: ${dbError.sqlState}`);
        }
        // In a real app, you might throw a custom error or handle specific DB errors
        throw new Error(`Failed to query the database. Error: ${dbError.message}`);
    } finally {
        if (connection) {
            connection.release(); // Release the connection back to the pool
        }
    }
}

// Optional: A function to test the connection if needed during startup
export async function testDbConnection() {
    try {
        // Calling getPool() here ensures it's initialized based on current env vars
        const connection = await getPool().getConnection();
        console.log("Successfully connected to MySQL via pool for test.");
        connection.release();
        return true;
    } catch (error) {
        const dbError = error as any;
        console.error("Failed to connect to MySQL via pool for test:", dbError.message);
        if (dbError.code || dbError.sqlState) {
            console.error(`MySQL Test Connection Error - Code: ${dbError.code}, SQLState: ${dbError.sqlState}`);
        }
        return false;
    }
}