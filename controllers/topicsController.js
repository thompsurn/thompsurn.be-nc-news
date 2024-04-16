const { selectTopics: fetchTopicsData, selectArticleById } = require("../models/topicsModel");
const endpoints = require("../endpoints.json");


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

module.exports = { healthCheck, getTopics, getEndpoints, getArticleById };