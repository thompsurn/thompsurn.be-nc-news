const { 
  selectTopics: fetchTopicsData, 
  selectArticleById, 
  selectArticles, 
  countCommentsByArticleId
} = require("../models/models");
const endpoints = require("../endpoints.json");

const db = require("../db/connection");


//healthcheck
function healthCheck(req, res, next) {
  res.status(200).send({ msg: "server is online" });
}


//alltopics
function getTopics(req, res, next) {
  return fetchTopicsData().then((topics) => {
    res.status(200).send({ topics });
  });
}

//endpoints
function getEndpoints(req, res, next) {
  res.status(200).send({ endpoints });
}

// getArticleById
function getArticleById(req, res, next) {
  const { article_id } = req.params;

  if (!article_id) {
    return res.status(400).send({ msg: "article_id is missing" });
  }

  if (isNaN(article_id)) {
    return res.status(400).send({ msg: "Invalid article_id format" });
  }

  selectArticleById(article_id)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      res.status(200).send({ article });
    })
    .catch(next);
}

//getArticles
function getArticles(req, res, next) {

  selectArticles()
    .then((articles) => {
      const articleIds = articles.map((article) => article.article_id);
      return Promise.all(
        articleIds.map((article_id) => countCommentsByArticleId(article_id))
      ).then((commentCounts) => {
        const articlesWithComments = articles.map((article, index) => ({
          ...article,
          comment_count: commentCounts[index],
        }));

        const sortedArticles = articlesWithComments.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        const articlesWithoutBody = sortedArticles.map(({ body, ...rest }) => rest);

        res.status(200).send({ articles: articlesWithoutBody });
      });
    })
    .catch(next);
}


//getCommentsByArticleId

function getCommentsByArticleId(req, res, next) {
  const article_id = req.params.article_id;

  db.query(
    `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
    [article_id]
  )
    .then(({ rows }) => {
      if (!rows.length) {
        return next({ status: 404, msg: "Comments not found" });
      }
      res.status(200).send({ comments: rows });
    })
    .catch((err) => {
      if (err.code === "22P02" || err.code === "23503") {
        next({ status: 400, msg: "Invalid article_id format" });
      } else {
        next(err);
      }
    });
}


module.exports = { healthCheck, getTopics, getEndpoints, getArticleById, getArticles, getCommentsByArticleId };