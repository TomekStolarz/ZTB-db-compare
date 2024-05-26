const express = require("express");
const { getResults } = require("./controller");

const mongoRouter = express.Router();

mongoRouter.post("/", getResults);

module.exports = { mongoRouter };
