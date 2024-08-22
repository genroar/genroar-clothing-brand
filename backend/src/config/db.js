const { Pool } = require('pg');

const pool = new Pool({
    user: 'ixbspartan',
    host: 'localhost',
    database: 'genroar',
    password: '',
    port: 5432
});

const dbConnection = async () => {
    let client = null;
    try {
        client = await pool.connect();
        console.log("Database connected Successfully.");
        return true;
    } catch(err) {
        console.error("Error connecting to database:", err);
        return false;
    } finally {
        if(client) {
            client.release();
        }
    }
};

dbConnection();

module.exports = { pool, dbConnection };
