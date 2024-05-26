const { MongoClient } = require('mongodb');
const { getTableIndex, getRandomIndex } = require('../const');

const uri = 'mongodb://localhost:27017';
const dbName = 'airportdb';
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const queries = [
  async (db) => {
    // Simple query: Select flights with capacity greater than 200
    return db.collection('flight').find({ capacity: { $gt: 200 } }).limit(1000).toArray();
  },
  async (db) => {
    // Advanced query: Aggregate to find the average flight duration by airline
    return db.collection('flight').aggregate([
      {
        $group: {
          _id: '$airline_id',
          avg_duration_minutes: { $avg: { $divide: [{ $subtract: ['$arrival', '$departure'] }, 60000] } }
        }
      },
      { $limit: 10000 }
    ]).toArray();
  }
];

const inserts = [
  async (db) => {
    // Simple insert: Insert a new passenger
    return db.collection('passenger').insertOne({ passportno: 'XY123456', firstname: 'Bob', lastname: 'Johnson' });
  },
  async (db) => {
    // Advanced insert: Insert a new booking for a specific flight and passenger
    const flight = await db.collection('flight').findOne({ flightno: 'ABC123' }, { projection: { flight_id: 1 } });
    const passenger = await db.collection('passenger').findOne({ firstname: 'Alice', lastname: 'Smith' }, { projection: { passenger_id: 1 } });

    if (flight && passenger) {
      return db.collection('booking').insertOne({
        flight_id: flight.flight_id,
        seat: 'B3',
        passenger_id: passenger.passenger_id,
        price: 250.00
      });
    }
  }
];

const updates = [
  async (db) => {
    // Simple update: Delay departure by one hour for flights after a certain date
    return db.collection('flight').updateMany(
      { departure: { $gt: new Date('2015-05-10') } },
      { $inc: { departure: 3600000 } } // Add one hour (3600000 ms) to the departure time
    );
  },
  async (db) => {
    // Advanced update: Increase booking prices by 10% for flights of a specific airline
    const spAirline = await db.collection('airline').findOne({ iata: 'SP' }, { projection: { airline_id: 1 } });

    if (spAirline) {
      return db.collection('booking').updateMany(
        { flight_id: { $in: (await db.collection('flight').find({ airline_id: spAirline.airline_id }).project({ flight_id: 1 }).toArray()).map(f => f.flight_id) } },
        { $mul: { price: 1.1 } }
      );
    }
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
