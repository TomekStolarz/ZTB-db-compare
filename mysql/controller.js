const mysql = require('mysql2/promise'); // Using mysql2 with promise support

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: '"root"'
};

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

module.exports = { get10Results };
