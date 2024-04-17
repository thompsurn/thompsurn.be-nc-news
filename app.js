const express = require("express");
const {
  healthCheck,
  getTopics,
  getEndpoints,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  addCommentByArticleId,
  patchArticleById,
  deleteCommentById,
  getAllUsers
} = require("./controllers/controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById); 

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", addCommentByArticleId);

app.patch('/api/articles/:article_id', patchArticleById);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.get('/api/users', getAllUsers);

app.use((err, req, res, next) => {
  const { status = 500, msg = "Internal Server Error" } = err;
  res.status(status).send({ msg });
});





module.exports = app;