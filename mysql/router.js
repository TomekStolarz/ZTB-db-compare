const express = require("express");
const { get10Results } = require("./controller");

const mysqlRouter = express.Router();

mysqlRouter.get("/", get10Results);

module.exports = { mysqlRouter };
