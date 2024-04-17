const db = require("../db/connection");

function selectTopics() {
  return db.query(`SELECT * FROM topics ;`).then(({ rows }) => {
    return rows;
  });
}

function selectArticleById(article_id) {
  return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then(({ rows }) => {
      if (!rows.length) {
        return null;
      }
      return rows[0];
    });
}

function selectArticles(topic) {
  let query = `SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id`;

  const params = [];

  if (topic) {
    query += ` HAVING articles.topic = $1`;
    params.push(topic);
  }
  return db.query(query, params).then((result) => {
    return result.rows;
  });
}


function countCommentsByArticleId(article_id) {
  return db.query(`
    SELECT COUNT(*) AS comment_count
    FROM comments
    WHERE article_id = $1
  `, [article_id]).then(({ rows }) => {
    return rows[0].comment_count;
  });
}

const updateArticleVotes = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return null;
      }
      return rows[0];
    });
};





module.exports = { selectTopics, selectArticleById, selectArticles, countCommentsByArticleId, updateArticleVotes };