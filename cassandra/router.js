const express = require("express");
const { getResults } = require("./controller");

const cassandraRouter = express.Router();

cassandraRouter.post("/", getResults);

module.exports = { cassandraRouter };
