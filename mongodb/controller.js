const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'ztb';

const get10Results = async (req, res) => {
  let client;

  try {
    client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected successfully to server");
    const db = client.db(dbName);

    const collection = db.collection('ztb');

    const findResult = await collection.find({}).toArray();
    console.log('Found documents:', findResult);

    res.status(200).send(findResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error connecting to MongoDB");
  } finally {
    if (client) {
      await client.close();
    }
  }
};

module.exports = { get10Results };
