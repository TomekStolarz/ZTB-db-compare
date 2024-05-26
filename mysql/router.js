const express = require("express");
const { getResults } = require("./controller");

const mysqlRouter = express.Router();

mysqlRouter.post("/", getResults)

module.exports = { mysqlRouter };
