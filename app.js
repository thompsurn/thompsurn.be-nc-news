const express = require("express");
const {
  healthCheck,
  getTopics,
  getEndpoints,
  getArticleById,
  getArticles
} = require("./controllers/topicsController");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById); 

app.get("/api/articles", getArticles);


module.exports = app;