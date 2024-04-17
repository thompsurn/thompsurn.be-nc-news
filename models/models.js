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

function selectArticles() {
  return db.query(`
    SELECT article_id, title, topic, created_at, votes, article_img_url, author
    FROM articles
  `).then(({ rows }) => {
    return rows;
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