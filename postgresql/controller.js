const { Pool } = require('pg');
const { getTableIndex, getRandomIndex } = require('../const');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'airportdb',
  password: 'example',
  port: 5432,
});

const generateRandomPassportNo = () => {
  return 'XY' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

const queries = [
  async (client, limit) => {
    // Simple query: Select all flights with a limit
    const query = `
      SELECT flightno, departure, arrival
      FROM airportdb.flight
      LIMIT ${limit};
    `;
    return client.query(query);
  },
];

const inserts = [
  async (client, limit) => {
    // Insert multiple passengers based on the limit
    const passengers = [];
    for (let i = 0; i < limit; i++) {
      const passportno = generateRandomPassportNo();
      passengers.push(`('${passportno}', 'First${i}', 'Last${i}')`);
    }
    const query = `
      INSERT INTO airportdb.passenger (passportno, firstname, lastname)
      VALUES ${passengers.join(', ')};
    `;
    return client.query(query);
  },
];

const updates = [
  async (client, limit) => {
    // Simple update: Set the departure time of limited flights to a fixed value
    const query = `
      UPDATE airportdb.flight f
      SET departure = '2023-01-01 00:00:00'
      FROM (
        SELECT flightno
        FROM airportdb.flight
        ORDER BY flightno
        LIMIT ${limit}
      ) AS subquery
      WHERE f.flightno = subquery.flightno;
    `;
    return client.query(query);
  },
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, client, limit) => {
  const start = new Date().getTime();
  const result = await operation(client, limit);
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) || 0;
  const limit = parseInt(req.body.level) || 0; // Changed from level to limit
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  let client;
  try {
    client = await pool.connect();

    for (let index = 0; index < operationCount; index++) {
      const { time, result } = await executeOperation(operations[0], client, limit);
      times.push(time);
      results.push(result);
    }

    console.log(times);
    res.status(200).json(times);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = { getResults };
