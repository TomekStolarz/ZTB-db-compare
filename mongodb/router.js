
const express = require("express");
const { get10Results } = require("./controller");

const mongoRouter = express.Router();

mongoRouter.get("/", get10Results);

module.exports = { mongoRouter };
