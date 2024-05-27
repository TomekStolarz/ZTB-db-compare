const mysql = require('mysql2/promise'); // Using mysql2 with promise support
const { getTableIndex, getRandomIndex } = require('../const');

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'airportdb',
  password: 'root'
};

const generateRandomPassportNo = () => {
  return '' + Math.floor(Math.random() * 10000000).toString().padStart(8, '0');
};

const queries = [
  async (connection, limit) => {
    // Simple query: Select all flights with a limit
    const query = `
      SELECT flightno, departure, arrival
      FROM flight
      LIMIT ${limit};
    `;
    return connection.execute(query);
  }
];

const inserts = [
  async (connection, limit) => {
    // Insert multiple passengers based on the limit
    const passengers = [];
    for (let i = 0; i < limit; i++) {
      const passportno = generateRandomPassportNo();
      passengers.push([passportno, `First${i}`, `Last${i}`]);
    }
    const query = `
      INSERT INTO passenger (passportno, firstname, lastname)
      VALUES ?;
    `;
    return connection.query(query, [passengers]);
  }
];

const updates = [
  async (connection, limit) => {
    // Simple update: Set the departure time of limited flights to a fixed value
    const query = `
      UPDATE flight
      JOIN (
        SELECT flightno
        FROM flight
        LIMIT ${limit}
      ) AS subquery
      USING (flightno)
      SET departure = '2023-01-01 00:00:00';
    `;
    return connection.execute(query);
  }
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, connection, limit) => {
  const start = new Date().getTime();
  const [result] = await operation(connection, limit);
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

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);

    for (let index = 0; index < operationCount; index++) {
      const { time, result } = await executeOperation(operations[0], connection, limit);
      times.push(time);
      results.push(result);
    }

    console.log(times);
    res.status(200).json(times);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = { getResults };
