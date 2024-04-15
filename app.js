const express = require("express");
const {
  healthCheck,
  getTopics,
  getEndpoints,
} = require("./controllers/topicsController");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getTopics);
app.get("/api", getEndpoints);
app.get("/api", getEndpoints);

module.exports = app;