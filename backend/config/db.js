import mysql from 'mysql2/promise';
import pg from 'pg';
import mssql from 'mssql';
import dotenv from 'dotenv';
import { setupDatabase } from '../utils/dbSetup.js';

dotenv.config();

const { Pool: PgPool } = pg;
const dbType = process.env.DB_TYPE?.toUpperCase() || 'MYSQL';

let pool;
let isDbConnected = false;

const dbConfigs = {
  MYSQL: {
    host: '185.221.175.33',
    user: 'krxrbauj_ta25',
    password: 'zEa4eKfhSaQRWsExjeGK',
    database: 'krxrbauj_ta25',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  POSTGRES: {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  SQLSERVER: {
    server: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '1433', 10),
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true,
    },
  },
};

const initializePool = async () => {
  try {
    if (dbType === 'MYSQL') {
      pool = mysql.createPool(dbConfigs.MYSQL);
    } else if (dbType === 'POSTGRES') {
      pool = new PgPool(dbConfigs.POSTGRES);
    } else if (dbType === 'SQLSERVER') {
      pool = await new mssql.ConnectionPool(dbConfigs.SQLSERVER).connect();
    } else {
      console.warn('WARNING: No DB_TYPE specified or is invalid. Backend will run without a database connection.');
      return;
    }
    
    // Test the connection with a simple query to ensure it's valid.
    if (dbType === 'MYSQL') await pool.query('SELECT 1');
    else if (dbType === 'POSTGRES') await pool.query('SELECT 1');
    else if (dbType === 'SQLSERVER') await pool.request().query('SELECT 1');

    isDbConnected = true;
    console.log(`Database connection to ${dbType} successful!`);
    
    // Run the database setup script to ensure tables and seed data exist.
    await setupDatabase();
    
  } catch (error) {
    console.warn(`\n\n----------------- DATABASE CONNECTION FAILED -----------------`);
    console.warn(`Could not connect to the ${dbType} database.`);
    console.warn(`Reason: ${error.message}`);
    console.warn(`The server will start, but API endpoints requiring a database will fail until the connection is resolved.`);
    console.warn(`Please check your database credentials and ensure the database server is accessible.`);
    console.warn(`--------------------------------------------------------------\n`);
    isDbConnected = false;
  }
};

initializePool();

// Universal query function to abstract away driver differences
export const query = async (sql, params = []) => {
    if (!pool || !isDbConnected) {
        throw new Error("Database not connected. Please check backend server logs for details.");
    }

    try {
        if (dbType === 'MYSQL') {
            // MySQL driver uses '?' for placeholders
            const [results] = await pool.query(sql, params);
            return results;
        } 
        if (dbType === 'POSTGRES') {
            // PostgreSQL driver uses $1, $2, etc. for placeholders
            const { rows } = await pool.query(sql, params);
            return rows;
        }
        if (dbType === 'SQLSERVER') {
            // mssql driver uses @param1, @param2, etc. and needs manual input setup
            const request = pool.request();
            // Map the params array to named parameters
            params.forEach((value, index) => {
                request.input(`param${index + 1}`, value);
            });
            const { recordset } = await request.query(sql);
            return recordset;
        }
    } catch (error) {
        console.error('Database query error:', { sql, params, error });
        throw new Error('An error occurred while executing the database query.');
    }
};

// Helper to get the correct SQL syntax variant
export const getSql = (variants) => {
    return variants[dbType] || variants['MYSQL']; // Default to MySQL syntax if not specified
};