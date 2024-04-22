const mysql = require('mysql2/promise'); // Using mysql2 with promise support
const { getTableIndex, getRandomIndex } = require('../const');

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: '"root"'
};

const queries = [
  `
  SELECT f.flight_id, f.flightno, f.departure, f.arrival, 
         a.airlinename AS airline_name, 
         dep.name AS departure_airport, 
         arr.name AS arrival_airport
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id
  JOIN airport dep ON f.\`from\` = dep.airport_id
  JOIN airport arr ON f.\`to\` = arr.airport_id;
  `,
  `
  SELECT f.flight_id, f.flightno, f.departure, f.arrival, a.airlinename AS airline_name, 
         (SELECT COUNT(*) FROM booking b WHERE b.flight_id = f.flight_id) AS total_bookings
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id;
  `,
  `
  SELECT a.airlinename AS airline_name, total_flights
  FROM (
    SELECT airline_id, COUNT(*) AS total_flights
    FROM flight
    GROUP BY airline_id
  ) AS flights_per_airline
  JOIN airline a ON a.airline_id = flights_per_airline.airline_id;
  `,
  `SELECT * FROM flight
  INNER JOIN airplane on flight.airplane_id = airplane.airplane_id
  WHERE airplane.capacity < 150`,
  `
  SELECT f.flight_id, f.flightno, f.departure, f.arrival, a.airlinename AS airline_name, 
         p.passportno, p.firstname, p.lastname
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id
  JOIN booking b ON f.flight_id = b.flight_id
  JOIN passenger p ON b.passenger_id = p.passenger_id;
  `,
  `
  SELECT e.employee_id, e.firstname, e.lastname, e.department, 
         COUNT(f.flight_id) AS total_flights_assigned
  FROM employee e
  LEFT JOIN flight f ON e.employee_id = f.airline_id
  GROUP BY e.employee_id, e.firstname, e.lastname, e.department;
  `,
  `
  SELECT e.firstname, e.lastname, COUNT(b.booking_id) AS total_bookings
  FROM employee e
  JOIN booking b ON e.employee_id = b.passenger_id
  GROUP BY e.firstname, e.lastname;
  `,
  `
  SELECT * FROM airport
  WHERE country = 'Germany';
  `,
  `
  SELECT * FROM employee
  WHERE department = 'Management';
  `,
  `
  SELECT * FROM passenger
  WHERE firstname = 'John' AND lastname = 'Doe';
  `
];

const inserts = [
  `
  INSERT INTO booking (flight_id, seat, passenger_id, price)
  SELECT f.flight_id, 'A1', p.passenger_id, 200.00
  FROM flight f
  JOIN airline a ON f.airline_id = a.airline_id
  JOIN passenger p ON a.base_airport = p.airport_id
  LIMIT 1;
  `,
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
  INSERT INTO passenger (passportno, firstname, lastname)
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
  UPDATE flight
  SET departure = DATE_ADD(departure, INTERVAL 1 HOUR)
  WHERE flightno = 'XYZ456';
  `,
  `
  UPDATE passenger
  SET emailaddress = 'bob@example.com'
  WHERE firstname = 'Bob' AND lastname = 'Johnson';
  `
];

const tableMap = {
  'select': queries,
  'insert': inserts,
  'update': updates,
}

const get10Results = async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("Connected successfully to server");

    const [rows, fields] = await connection.execute('SELECT * FROM testtable LIMIT 10');
    console.log('Found documents:', rows);

    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to MySQL");
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const getResults = async (req, res) => {
  let connection;

  try {
    connection = await mysql.createConnection(connectionConfig);
    const operationCount = req.body.count;
    const level = req.body.level;
    const type = req.body.type;
    const queries = tableMap[type].slice(...getTableIndex(type, level));
    const indexes = new Array({ length: operationCount }, (_, i) => getRandomIndex(0, queries.length));
    const times = [];
    for (let index of indexes) {
      let start = new Date().getTime();
      const [rows, ] = await connection.execute(querie[index]);
      let end = new Date().getTime();
      times.push(start - end);
    }
    res.status(200).send(times);
  } catch (err) {
    console.error(err);
    res.status(500).send([]);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = { get10Results, getResults };
