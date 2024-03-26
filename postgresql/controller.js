const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test',
  password: 'example',
  port: 5432,
});

const get10Results = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log("Connected successfully to server");

    const result = await client.query('SELECT * FROM testtable LIMIT 10');
    console.log('Found rows:', result.rows);

    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to PostgreSQL");
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = { get10Results };
