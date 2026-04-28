const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    // Aiven requires SSL. This looks for the ca.pem file you downloaded.
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'ca.pem')),
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export the promise-based version for cleaner async/await code
module.exports = pool.promise();