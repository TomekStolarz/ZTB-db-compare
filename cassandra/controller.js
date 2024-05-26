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
  // Simple query: Select all flights
  async () => {
    const query = `
      SELECT flightno, departure, arrival
      FROM flight;
    `;
    return client.execute(query);
  }
];

const inserts = [
  // Simple insert: Insert a new passenger with an integer passenger_id
  async () => {
    const passengerId = generateRandomInt(1, 2147483647); // Generate a random integer within the 32-bit integer range
    const query = `
      INSERT INTO passenger (passenger_id, passportno, firstname, lastname)
      VALUES (${passengerId}, 'XY123456', 'Bob', 'Johnson');
    `;
    return client.execute(query);
  }
];

const updates = [
  // Simple update: Set the departure time of all flights to a fixed value
  async () => {
    // Fetch all flight IDs to update
    const flightIds = await client.execute(`
      SELECT flight_id FROM flight;
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
    const batchSize = 100; // Adjust the batch size as needed
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

const executeOperation = async (operation) => {
  const start = new Date().getTime();
  const result = await operation();
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) || 0;
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  try {
    for (let index = 0; index < operationCount; index++) {
      const { time, result } = await executeOperation(operations[0]);
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
