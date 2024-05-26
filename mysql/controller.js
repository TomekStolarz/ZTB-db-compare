const mysql = require('mysql2/promise'); // Using mysql2 with promise support
const { getTableIndex, getRandomIndex } = require('../const');

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'airportdb',
  password: 'root'
};

const generateRandomPassportNo = () => {
  return 'XY' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

const queries = [
  async (connection) => {
    // Simple query: Select all flights
    const query = `
      SELECT flightno, departure, arrival
      FROM flight;
    `;
    return connection.execute(query);
  }
];

const inserts = [
  async (connection) => {
    // Simple insert: Insert a new passenger with a unique passportno
    const passportno = generateRandomPassportNo();
    const query = `
      INSERT INTO passenger (passportno, firstname, lastname)
      VALUES ('${passportno}', 'Bob', 'Johnson');
    `;
    return connection.execute(query);
  }
];

const updates = [
  async (connection) => {
    // Simple update: Set the departure time of all flights to a fixed value
    const query = `
      UPDATE flight
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

const executeOperation = async (operation, connection) => {
  const start = new Date().getTime();
  const [result] = await operation(connection);
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) || 0;
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);

    for (let index = 0; index < operationCount; index++) {
      const { time, result } = await executeOperation(operations[0], connection);
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
