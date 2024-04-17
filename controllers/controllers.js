const { 
  selectTopics: fetchTopicsData, 
  selectArticleById, 
  selectArticles, 
  countCommentsByArticleId,
  updateArticleVotes
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

  Promise.all([
    selectArticleById(article_id),
    countCommentsByArticleId(article_id)
  ])
    .then(([article, comment_count]) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      article.comment_count = comment_count;
      res.status(200).send({ article });
    })
    .catch(next);

}

//getArticles
function getArticles(req, res, next) {
  const { topic } = req.query;

  selectArticles(topic)
    .then((articles) => {
      if (!articles.length) {
        return Promise.reject({ status: 404, msg: "No articles found for the specified topic" });
      }

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

//addCommentByArticleId
const addCommentByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;

  if (!username || !body) {
    return next({ status: 400, msg: "Username and body are required" });
  }

  db.query(
    `INSERT INTO comments (article_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
    [article_id, username, body]
  )
    .then(({ rows }) => {
      const [comment] = rows;
      if (!comment) return Promise.reject({ status: 404, msg: "Article not found" });
      res.status(201).send({ comment });
    })
    .catch(next);
};

//patchArticleById
const patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(article_id, inc_votes)
    .then((article) => {
      if (!article) {
        return Promise.reject({ status: 404, msg: 'Article not found' });
      }
      res.status(200).send({ article });
    })
    .catch(next);
};


// deleteCommentById
function deleteCommentById(req, res, next) {
  const comment_id = req.params.comment_id;

  db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [comment_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return next({ status: 404, msg: "Comment not found" });
      }
      res.status(204).send();
    })
    .catch((err) => {
      if (err.code === "22P02" || err.code === "23503") {
        next({ status: 400, msg: "Invalid comment_id format" });
      } else {
        next(err);
      }
    });
}

// getAllUsers
function getAllUsers(req, res, next) {
  db.query(`SELECT username, name, avatar_url FROM users;`)
    .then(({ rows }) => {
      if (!rows.length) {
        return next({ status: 404, msg: "No users found" });
      }
      res.status(200).send({ users: rows });
    })
    .catch((err) => {
      next(err);
    });
}



module.exports = { healthCheck, 
  getTopics, 
  getEndpoints, 
  getArticleById, 
  getArticles, 
  getCommentsByArticleId, 
  addCommentByArticleId, 
  addCommentByArticleId,
  patchArticleById,
  deleteCommentById,
  getAllUsers
};