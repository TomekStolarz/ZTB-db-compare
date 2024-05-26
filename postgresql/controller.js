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
  `
  SELECT a.airlinename, f.flightno, f.departure, f.arrival, ap.capacity
  FROM airportdb.flight f
  JOIN airportdb.airline a ON f.airline_id = a.airline_id
  JOIN airportdb.airplane ap ON f.airplane_id = ap.airplane_id
  WHERE ap.capacity > 200 LIMIT 1000;
  `,
  `
  SELECT airline_id, AVG(EXTRACT(EPOCH FROM (arrival - departure)) / 60) AS avg_duration_minutes
  FROM airportdb.flight
  GROUP BY airline_id LIMIT 10000;
  `,
  `
  SELECT passenger.firstname, 
         passenger.lastname, 
         COUNT(b.booking_id) AS total_bookings
  FROM airportdb.passenger
  INNER JOIN (SELECT * FROM airportdb.booking LIMIT 100000) b ON passenger.passenger_id = b.passenger_id
  WHERE b.flight_id IN (
      SELECT flight_id FROM airportdb.flight WHERE departure > '2015-05-10'
  )
  GROUP BY passenger.firstname, passenger.lastname
  ORDER BY total_bookings DESC;
  `,
  `
  SELECT * 
  FROM airportdb.flight
  WHERE "from" = (
      SELECT airport_id FROM airportdb.airport WHERE iata = 'JFK' LIMIT 1
  ) LIMIT 50;
  `,
  `
  SELECT p.firstname, p.lastname, COUNT(b.booking_id) AS total_bookings
  FROM (SELECT * FROM airportdb.booking LIMIT 100000) b
  JOIN airportdb.passenger p ON b.passenger_id = p.passenger_id
  GROUP BY p.firstname, p.lastname;
  `,
  `
  SELECT flightno, departure, arrival
  FROM airportdb.flight
  WHERE (arrival - departure) > INTERVAL '1 day';
  `
];

const inserts = [
  `
  WITH flight_cte AS (
    SELECT flight_id FROM airportdb.flight WHERE flightno = 'ABC123' LIMIT 1
  ), passenger_cte AS (
    SELECT passenger_id FROM airportdb.passenger WHERE firstname = 'Alice' AND lastname = 'Smith' LIMIT 1
  )
  INSERT INTO airportdb.booking (flight_id, seat, passenger_id, price)
  SELECT flight_id, 'B3', passenger_id, 250.00
  FROM flight_cte, passenger_cte;
  `,
  `
  INSERT INTO airportdb.airplane (capacity, type_id, airline_id)
  VALUES (200, 1, 1);
  `,
  `
  INSERT INTO airportdb.airport (iata, icao, name)
  VALUES ('FRA', 'EDDF', 'Frankfurt Airport');
  `,
  `INSERT INTO airportdb.passenger (passportno, firstname, lastname)
  VALUES ('XY123456', 'Bob', 'Johnson');`
];

const updates = [
  `
  WITH max_capacity_airplane AS (
    SELECT airplane_id
    FROM airportdb.airplane
    WHERE capacity = (SELECT MAX(capacity) FROM airportdb.airplane)
    LIMIT 1
  )
  UPDATE airportdb.flight
  SET airplane_id = (SELECT airplane_id FROM max_capacity_airplane)
  WHERE departure > '2015-05-10';
  `,
  `
  WITH sp_airline AS (
    SELECT airline_id
    FROM airportdb.airline
    WHERE iata = 'SP'
    LIMIT 1
  )
  UPDATE airportdb.booking
  SET price = price * 1.1
  WHERE flight_id IN (
    SELECT flight_id
    FROM airportdb.flight
    WHERE airline_id = (SELECT airline_id FROM sp_airline)
  );
  `,
  `
  UPDATE airportdb.flight
  SET departure = departure + INTERVAL '1 hour'
  WHERE departure > '2015-05-10';
  `,
  `
  UPDATE airportdb.employee
  SET emailaddress = CONCAT(firstname, '.', lastname, '@example.com')
  WHERE emailaddress IS NULL;
  `
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
};

const getResults = async (req, res) => {
  let client;

  try {
    client = await pool.connect();
    const operationCount = req.body.count;
    const level = req.body.level;
    const type = req.body.type;
    const queries = tableMap[type].slice(...getTableIndex(type, level));

    const indexes = Array.from({ length: operationCount }, (_, i) => getRandomIndex(0, queries.length));
    const times = [];
    for (let index of indexes) {
      let start = new Date().getTime();

      await client.query(queries[index]);
      let end = new Date().getTime();
      times.push(end - start);
    }
    console.log(times);
    res.status(200).send(times);
  } catch (err) {
    console.error(err);
    res.status(500).send([]);
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = { getResults };
