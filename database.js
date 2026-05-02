const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create the connection pool

const isTest = process.env.NODE_ENV === 'test';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: isTest
        ? undefined // skip SSL in tests
        : {
            ca: process.env.DB_CA_CERT || fs.readFileSync('./ca.pem'),
        },

    waitForConnections: true,
    connectionLimit: 10,
});

// Export the promise-based version for cleaner async/await code
module.exports = pool.promise();