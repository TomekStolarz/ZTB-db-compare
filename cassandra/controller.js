const cassandra = require('cassandra-driver');
const { getTableIndex, getRandomIndex } = require('../const');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'airportdb',
  pooling: {
    coreConnectionsPerHost: {
      [cassandra.types.distance.local]: 2,
      [cassandra.types.distance.remote]: 1
    },
    maxRequestsPerConnection: 32768 // Increase the limit of requests per connection
  }
});

const generateRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const queries = [
  // Simple query: Select all flights with a limit
  async (limit) => {
    const query = `
      SELECT flightno, departure, arrival
      FROM flight
      LIMIT ${limit};
    `;
    return client.execute(query);
  }
];

const inserts = [
  // Insert multiple passengers based on the limit
  async (limit) => {
    const passengers = [];
    for (let i = 0; i < limit; i++) {
      const passengerId = generateRandomInt(1, 2147483647); // Generate a random integer within the 32-bit integer range
      const passportno = `XY${generateRandomInt(100000, 999999)}`;
      passengers.push({ passengerId, passportno, firstname: `First${i}`, lastname: `Last${i}` });
    }

    const queries = passengers.map(p => ({
      query: `
        INSERT INTO passenger (passenger_id, passportno, firstname, lastname)
        VALUES (?, ?, ?, ?);
      `,
      params: [p.passengerId, p.passportno, p.firstname, p.lastname]
    }));

    // Batch the inserts to process them sequentially in chunks
    const batchSize = 100; // Adjust the batch size as needed
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      await client.batch(batch, { prepare: true });
    }
  }
];

const updates = [
  // Simple update: Set the departure time of limited flights to a fixed value
  async (limit) => {
    // Fetch limited flight IDs to update
    const flightIds = await client.execute(`
      SELECT flight_id FROM flight LIMIT ${limit};
    `);

    const queries = flightIds.rows.map(row => ({
      query: `
        UPDATE flight
        SET departure = '2023-01-01 00:00:00'
        WHERE flight_id = ?;
      `,
      params: [row.flight_id]
    }));

    // Batch the updates to process them sequentially in chunks
    const batchSize = 50; // Adjust the batch size as needed
    for (let i = 0; i < queries.length; i += batchSize) {
      const batch = queries.slice(i, i + batchSize);
      await client.batch(batch, { prepare: true });
    }
  }
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, limit) => {
  const start = new Date().getTime();
  const result = await operation(limit);
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

  try {
    for (let index = 0; index < operationCount; index++) {
      console.log('Progress:', index + 1, '/', operationCount)
      const { time, result } = await executeOperation(operations[0], limit);
      times.push(time);
      results.push(result);
    }

    console.log(times);
    res.status(200).json(times);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = { getResults };
