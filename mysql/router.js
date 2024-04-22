const express = require("express");
const { get10Results, getResults } = require("./controller");

const mysqlRouter = express.Router();

mysqlRouter.get("/", get10Results);
mysqlRouter.post("/", getResults)

module.exports = { mysqlRouter };
