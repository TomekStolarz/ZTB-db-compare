const { Pool } = require('pg');
const { getTableIndex, getRandomIndex } = require('../const');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'airportdb',
  password: 'example',
  port: 5432,
});

const queries = [
  async (client) => {
    // Simple query: Select all flights
    const query = 'SELECT flightno, departure, arrival FROM airportdb.flight;';
    return client.query(query);
  },
];

const inserts = [
  async (client) => {
    // Simple insert: Insert a new passenger
    const query = `
      INSERT INTO airportdb.passenger (passportno, firstname, lastname)
      VALUES ('XY123456', 'Bob', 'Johnson');
    `;
    return client.query(query);
  },
];

const updates = [
  async (client) => {
    // Simple update: Set the departure time of all flights to a fixed value
    const query = `
      UPDATE airportdb.flight
      SET departure = '2023-01-01 00:00:00';
    `;
    return client.query(query);
  },
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, client) => {
  const start = new Date().getTime();
  const result = await operation(client);
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) || 0;
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  let client;
  try {
    client = await pool.connect();

    for (let index = 0; index < operationCount; index++) {
      const { time, result } = await executeOperation(operations[0], client);
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
