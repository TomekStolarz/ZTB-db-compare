const cassandra = require('cassandra-driver');
const { getTableIndex, getRandomIndex } = require('../const');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'airportdb'
});

const queries = [
  `
  SELECT a.airlinename, f.flightno, f.departure, f.arrival, ap.capacity
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id
  JOIN airplane ap ON f.airplane_id = ap.airplane_id
  WHERE ap.capacity > 200 ALLOW FILTERING;
  `,
  `
  SELECT airline_id, AVG(duration) AS avg_duration_minutes
  FROM (
      SELECT airline_id, (arrival - departure) AS duration
      FROM flight
  )
  GROUP BY airline_id;
  `,
  `
  SELECT p.firstname, p.lastname, COUNT(b.booking_id) AS total_bookings
  FROM passenger p
  JOIN booking b ON p.passenger_id = b.passenger_id
  WHERE b.flight_id IN (
      SELECT flight_id FROM flight WHERE departure > '2015-05-10'
  )
  GROUP BY p.firstname, p.lastname
  ALLOW FILTERING;
  `,
  `
  SELECT * 
  FROM flight
  WHERE "from" = (
      SELECT airport_id FROM airport WHERE iata = 'JFK'
  ) ALLOW FILTERING;
  `,
  `
  SELECT p.firstname, p.lastname, COUNT(b.booking_id) AS total_bookings
  FROM booking b
  JOIN passenger p ON b.passenger_id = p.passenger_id
  GROUP BY p.firstname, p.lastname;
  `,
  `
  SELECT flightno, departure, arrival
  FROM flight
  WHERE (arrival - departure) > 86400000 ALLOW FILTERING;
  `
];

const inserts = [
  `
  INSERT INTO booking (flight_id, seat, passenger_id, price)
  VALUES ((SELECT flight_id FROM flight WHERE flightno = 'ABC123' LIMIT 1),
          'B3',
          (SELECT passenger_id FROM passenger WHERE firstname = 'Alice' AND lastname = 'Smith' LIMIT 1),
          250.00);
  `,
  `
  INSERT INTO airplane (capacity, type_id, airline_id)
  VALUES (200, 1, 1);
  `,
  `
  INSERT INTO airport (iata, icao, name)
  VALUES ('FRA', 'EDDF', 'Frankfurt Airport');
  `,
  `INSERT INTO passenger (passportno, firstname, lastname)
  VALUES ('XY123456', 'Bob', 'Johnson');`
];

const updates = [
  `
  UPDATE flight
  SET airplane_id = (
      SELECT airplane_id
      FROM airplane
      WHERE capacity = (SELECT MAX(capacity) FROM airplane)
      LIMIT 1
  )
  WHERE departure > '2015-05-10' ALLOW FILTERING;
  `,
  `
  UPDATE booking
  SET price = price * 1.1
  WHERE flight_id IN (
      SELECT flight_id
      FROM flight
      WHERE airline_id = (SELECT airline_id FROM airline WHERE iata = 'SP' LIMIT 1)
  );
  `,
  `
  UPDATE flight
  SET departure = departure + 3600000
  WHERE departure > '2015-05-10' ALLOW FILTERING;
  `,
  `
  UPDATE employee
  SET emailaddress = firstname || '.' || lastname || '@example.com'
  WHERE emailaddress IS NULL;
  `
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const getResults = async (req, res) => {
  try {
    const operationCount = req.body.count;
    const level = req.body.level;
    const type = req.body.type;
    const queries = tableMap[type].slice(...getTableIndex(type, level));

    const indexes = Array.from({ length: operationCount }, (_, i) => getRandomIndex(0, queries.length));
    const times = [];
    for (let index of indexes) {
      let start = new Date().getTime();

      await client.execute(queries[index]);
      let end = new Date().getTime();
      times.push(end - start);
    }
    console.log(times);
    res.status(200).send(times);
  } catch (err) {
    console.error(err);
    res.status(500).send([]);
  }
};

module.exports = { getResults };
