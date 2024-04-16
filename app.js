const express = require("express");
const {
  healthCheck,
  getTopics,
  getEndpoints,
  getArticleById
} = require("./controllers/topicsController");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById); 

module.exports = app;