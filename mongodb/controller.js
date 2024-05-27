const { MongoClient } = require('mongodb');
const { getTableIndex, getRandomIndex } = require('../const');

const uri = 'mongodb://localhost:27017';
const dbName = 'airportdb';
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const generateRandomPassportNo = () => {
  return 'XY' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
};

const queries = [
  async (db, limit) => {
    // Simple query: Select all flights with a limit
    return db.collection('flight').find({}, { projection: { flightno: 1, departure: 1, arrival: 1 } }).limit(limit).toArray();
  },
];

const inserts = [
  async (db, limit) => {
    // Insert multiple passengers based on the limit
    const passengers = [];
    for (let i = 0; i < limit; i++) {
      const passportno = generateRandomPassportNo();
      passengers.push({ passportno, firstname: `First${i}`, lastname: `Last${i}` });
    }
    return db.collection('passenger').insertMany(passengers);
  },
];

const updates = [
  async (db, limit) => {
    // Simple update: Set the departure time of limited flights to a fixed value
    const flights = await db.collection('flight').find({}, { projection: { _id: 1 } }).limit(limit).toArray();
    const flightIds = flights.map(flight => flight._id);
    return db.collection('flight').updateMany(
      { _id: { $in: flightIds } },
      { $set: { departure: new Date('2023-01-01T00:00:00Z') } }
    );
  }
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const executeOperation = async (operation, db, limit) => {
  const start = new Date().getTime();
  const result = await operation(db, limit);
  const end = new Date().getTime();
  return { time: end - start, result };
};

const getResults = async (req, res) => {
  const operationCount = parseInt(req.body.count) ?? 0;
  const limit = parseInt(req.body.level) || 0; // Changed from level to limit
  const type = req.body.type;
  const operations = tableMap[type];

  const times = [];
  const results = [];

  try {
    for (let index = 0; index < operationCount; index++) {
      const client = new MongoClient(uri, clientOptions);
      await client.connect();
      const db = client.db(dbName);

      const { time, result } = await executeOperation(operations[0], db, limit);
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
