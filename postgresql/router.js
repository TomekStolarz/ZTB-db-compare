const express = require("express");
const { getResults } = require("./controller");

const postgresRouter = express.Router();

postgresRouter.post("/", getResults);

module.exports = { postgresRouter };
