const { MongoClient } = require('mongodb');
const { getTableIndex, getRandomIndex } = require('../const');

const uri = 'mongodb://localhost:27017';
const dbName = 'airportdb';
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const queries = [
  async (db) => {
    // Simple query: Select all flights
    return db.collection('flight').find({}, { projection: { flightno: 1, departure: 1, arrival: 1 } }).toArray();
  },
];

const inserts = [
  async (db) => {
    // Simple insert: Insert a new passenger
    return db.collection('passenger').insertOne({ passportno: 'XY123456', firstname: 'Bob', lastname: 'Johnson' });
  },
];

const updates = [
  async (db) => {
    // Simple update: Set the departure time of all flights to a fixed value
    return db.collection('flight').updateMany(
      {},
      { $set: { departure: new Date('2023-01-01T00:00:00Z') } }
    );
  }
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, db) => {
  const start = new Date().getTime();
  const result = await operation(db);
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) ?? 0;
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  try {
    for (let index = 0; index < operationCount; index++) {
      const client = new MongoClient(uri, clientOptions);
      await client.connect();
      const db = client.db(dbName);

      const { time, result } = await executeOperation(operations[0], db);
      times.push(time);
      results.push(result);

      await client.close();
    }

    console.log(times);
    res.status(200).json(times);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

module.exports = { getResults };
