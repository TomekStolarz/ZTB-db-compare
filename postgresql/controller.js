const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'test',
  password: 'example',
  port: 5432,
});

const queries = [
  `
  SELECT a.airlinename, f.flightno, f.departure, f.arrival, ap.capacity
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id
  JOIN airplane ap ON f.airplane_id = ap.airplane_id
  WHERE ap.capacity > 200 LIMIT 1000;
  `,
  `
  SELECT airline_id, AVG(TIMESTAMPDIFF(MINUTE, departure, arrival)) AS avg_duration_minutes
  FROM flight
  GROUP BY airline_id LIMIT 10000;
  `,
  `
  SELECT passenger.firstname, 
       passenger.lastname, 
       COUNT(b.booking_id) AS total_bookings
FROM passenger
INNER JOIN  (SELECT * FROM booking LIMIT 100000) b ON passenger.passenger_id = b.passenger_id
WHERE b.flight_id IN (
    SELECT flight_id FROM flight WHERE departure > '2015-05-10'
)
GROUP BY passenger.firstname, passenger.lastname
ORDER BY total_bookings DESC;
  `,
  `
  SELECT * 
  FROM flight
  WHERE flight.from = (
      SELECT airport_id FROM airport WHERE iata = 'JFK'
  ) LIMIT 50;
  `,
  `
  SELECT p.firstname, p.lastname, COUNT(b.booking_id) AS total_bookings
  FROM (SELECT * FROM booking LIMIT 100000) b
  JOIN passenger p ON b.passenger_id = p.passenger_id
  GROUP BY p.firstname, p.lastname;
  `,
  `
  SELECT flightno, departure, arrival
  FROM flight
  WHERE DATEDIFF(arrival, departure) > 1;
  `
];

const inserts = [
  `
  INSERT INTO booking (flight_id, seat, passenger_id, price)
  VALUES (
    (SELECT flight_id FROM flight WHERE flightno = 'ABC123'),
    'B3',
    (SELECT passenger_id FROM passenger WHERE firstname = 'Alice' AND lastname = 'Smith'),
    250.00
  );
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
]

const updates = [
  `
  UPDATE flight
  SET airplane_id = (
    SELECT airplane_id
    FROM airplane
    WHERE capacity >= (
      SELECT MAX(capacity)
      FROM airplane
    )
    LIMIT 1
  )
  WHERE departure > NOW();
  `,
  `
  UPDATE booking
  SET price = price * 1.1
  WHERE flight_id IN (
    SELECT flight_id
    FROM flight
    WHERE airline_id = (
      SELECT airline_id
      FROM airline
      WHERE iata = 'SP'
    )
  ) LIMIT 100000;
  `,
  `
  UPDATE flight
  SET departure = DATE_ADD(departure, INTERVAL 1 HOUR)
  WHERE departure > NOW();
  `,
  `
  UPDATE passenger
  SET emailaddress = CONCAT(firstname, '.', lastname, '@example.com')
  WHERE emailaddress IS NULL;
  `
];

const get10Results = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    console.log("Connected successfully to server");

    const result = await client.query('SELECT * FROM testtable LIMIT 10');
    console.log('Found rows:', result.rows);

    res.status(200).send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to PostgreSQL");
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = { get10Results };
