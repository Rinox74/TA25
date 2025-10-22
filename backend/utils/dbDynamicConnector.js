import mysql from 'mysql2/promise';
import pg from 'pg';
import mssql from 'mssql';

const { Client: PgClient } = pg;

export const createDynamicConnection = async (dbConfig) => {
    const dbType = dbConfig.dbType?.toUpperCase();
    let client;

    try {
        if (dbType === 'MYSQL') {
            client = await mysql.createConnection({
                host: dbConfig.dbHost,
                user: dbConfig.dbUser,
                password: dbConfig.dbPassword,
                database: dbConfig.dbName,
                port: parseInt(dbConfig.dbPort || '3306', 10),
            });
            return {
                query: async (sql, params = []) => client.query(sql, params),
                close: async () => client.end(),
            };
        }
        
        if (dbType === 'POSTGRES') {
            client = new PgClient({
                user: dbConfig.dbUser,
                host: dbConfig.dbHost,
                database: dbConfig.dbName,
                password: dbConfig.dbPassword,
                port: parseInt(dbConfig.dbPort || '5432', 10),
            });
            await client.connect();
             return {
                query: async (sql, params = []) => client.query(sql, params),
                close: async () => client.end(),
            };
        }
        
        if (dbType === 'SQLSERVER') {
             client = await mssql.connect({
                server: dbConfig.dbHost,
                user: dbConfig.dbUser,
                password: dbConfig.dbPassword,
                database: dbConfig.dbName,
                port: parseInt(dbConfig.dbPort || '1433', 10),
                options: {
                    encrypt: process.env.DB_ENCRYPT === 'true',
                    trustServerCertificate: true,
                },
            });
            return {
                query: async (sql) => client.request().query(sql),
                close: async () => client.close(),
            };
        }

        throw new Error('Tipo di database non supportato o non specificato.');

    } catch (error) {
        // Re-throw the original error to be handled by the API route
        throw error;
    }
};