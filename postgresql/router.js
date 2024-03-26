const express = require("express");
const { get10Results } = require("./controller");

const postgresRouter = express.Router();

postgresRouter.get("/", get10Results);

module.exports = { postgresRouter };
