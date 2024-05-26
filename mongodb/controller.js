const { MongoClient } = require('mongodb');
const { getTableIndex, getRandomIndex } = require('../const');

const uri = 'mongodb://localhost:27017';
const dbName = 'airportdb';
const clientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

const queries = [
  async (db) => {
    return db.collection('flight').aggregate([
      {
        $lookup: {
          from: 'airline',
          localField: 'airline_id',
          foreignField: 'airline_id',
          as: 'airline'
        }
      },
      { $unwind: '$airline' },
      {
        $lookup: {
          from: 'airplane',
          localField: 'airplane_id',
          foreignField: 'airplane_id',
          as: 'airplane'
        }
      },
      { $unwind: '$airplane' },
      { $match: { 'airplane.capacity': { $gt: 200 } } },
      { $limit: 1000 },
      {
        $project: {
          airlinename: '$airline.airlinename',
          flightno: 1,
          departure: 1,
          arrival: 1,
          capacity: '$airplane.capacity'
        }
      }
    ]).toArray();
  },
  async (db) => {
    return db.collection('flight').aggregate([
      {
        $addFields: {
          departure: { $toDate: '$departure' },
          arrival: { $toDate: '$arrival' }
        }
      },
      {
        $group: {
          _id: '$airline_id',
          avg_duration_minutes: {
            $avg: {
              $divide: [
                { $subtract: ['$arrival', '$departure'] },
                60000
              ]
            }
          }
        }
      },
      { $limit: 10000 }
    ]).toArray();
  },
  async (db) => {
    const flightIds = await db.collection('flight').find({ departure: { $gt: new Date('2015-05-10') } }).project({ flight_id: 1 }).toArray();
    const flightIdList = flightIds.map(f => f.flight_id);
    return db.collection('passenger').aggregate([
      {
        $lookup: {
          from: 'booking',
          localField: 'passenger_id',
          foreignField: 'passenger_id',
          as: 'bookings'
        }
      },
      { $unwind: '$bookings' },
      {
        $match: {
          'bookings.flight_id': { $in: flightIdList }
        }
      },
      {
        $group: {
          _id: {
            firstname: '$firstname',
            lastname: '$lastname'
          },
          total_bookings: { $sum: 1 }
        }
      },
      { $sort: { total_bookings: -1 } }
    ]).toArray();
  },
  async (db) => {
    const jfkAirport = await db.collection('airport').findOne({ iata: 'JFK' }, { projection: { airport_id: 1 } });
    return db.collection('flight').find({
      from: jfkAirport.airport_id
    }).limit(50).toArray();
  },
  async (db) => {
    return db.collection('booking').aggregate([
      {
        $lookup: {
          from: 'passenger',
          localField: 'passenger_id',
          foreignField: 'passenger_id',
          as: 'passenger'
        }
      },
      { $unwind: '$passenger' },
      {
        $group: {
          _id: {
            firstname: '$passenger.firstname',
            lastname: '$passenger.lastname'
          },
          total_bookings: { $sum: 1 }
        }
      }
    ]).toArray();
  },
  async (db) => {
    return db.collection('flight').aggregate([
      {
        $addFields: {
          departure: { $toDate: '$departure' },
          arrival: { $toDate: '$arrival' }
        }
      },
      {
        $match: {
          $expr: { $gt: [{ $subtract: ['$arrival', '$departure'] }, 86400000] } // 1 day in milliseconds
        }
      },
      {
        $project: {
          flightno: 1,
          departure: 1,
          arrival: 1
        }
      }
    ]).toArray();
  }
];

const inserts = [
  async (db) => {
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
  },
  async (db) => {
    return db.collection('airplane').insertOne({
      capacity: 200,
      type_id: 1,
      airline_id: 1
    });
  },
  async (db) => {
    return db.collection('airport').insertOne({
      iata: 'FRA',
      icao: 'EDDF',
      name: 'Frankfurt Airport'
    });
  },
  async (db) => {
    return db.collection('passenger').insertOne({
      passportno: 'XY123456',
      firstname: 'Bob',
      lastname: 'Johnson'
    });
  }
];

const updates = [
  async (db) => {
    const maxCapacityAirplane = await db.collection('airplane').findOne({}, { sort: { capacity: -1 }, projection: { airplane_id: 1 } });

    if (maxCapacityAirplane) {
      return db.collection('flight').updateMany(
        { departure: { $gt: new Date('2015-05-10') } },
        { $set: { airplane_id: maxCapacityAirplane.airplane_id } }
      );
    }
  },
  async (db) => {
    const spAirline = await db.collection('airline').findOne({ iata: 'SP' }, { projection: { airline_id: 1 } });

    if (spAirline) {
      return db.collection('booking').updateMany(
        { flight_id: { $in: (await db.collection('flight').find({ airline_id: spAirline.airline_id }).project({ flight_id: 1 }).toArray()).map(f => f.flight_id) } },
        { $mul: { price: 1.1 } }
      );
    }
  },
  async (db) => {
    return db.collection('flight').updateMany(
      { departure: { $gt: new Date('2015-05-10') } },
      {
        $set: {
          departure: {
            $dateAdd: {
              startDate: "$departure",
              unit: "hour",
              amount: 1
            }
          }
        }
      }
    );
  },
  async (db) => {
    return db.collection('employee').updateMany(
      { emailaddress: null },
      [
        { $set: { emailaddress: { $concat: ['$firstname', '.', '$lastname', '@example.com'] } } }
      ]
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
  const operationCount = req.body.count;
  const level = req.body.level;
  const type = req.body.type;
  const operations = tableMap[type].slice(...getTableIndex(type, level));

  const indexes = Array.from({ length: operationCount }, (_, i) => getRandomIndex(0, operations.length));
  const times = [];
  const results = [];

  try {
    for (let index of indexes) {
      const client = new MongoClient(uri, clientOptions);
      await client.connect();
      const db = client.db(dbName);

      const { time, result } = await executeOperation(operations[index], db);
      times.push(time);
      results.push(result);

      await client.close();
    }

    console.log(times);
    res.status(200).json({ times, results });
  } catch (err) {
    console.error(err);
    res.status(500).send([]);
  }
};

module.exports = { getResults };
