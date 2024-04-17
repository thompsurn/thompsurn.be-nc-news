const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const seedTestData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");
const sorted = require('jest-sorted');


beforeEach(() => {
  return seed(seedTestData);
});

afterAll(() => {
  db.end();
});


describe('GET /api/topics', () => {

    describe("/api/unknown-endpoint", () => {
        test("GET 404: responds with 404 status if endpoint doesn't exist", () => {
          return request(app).get("/api/unknown-endpoint").expect(404);
        });
      });
      
      
      
      describe("/api/topics", () => {
        describe("GET", () => {
          test("GET 200: responds with 200 status", () => {
            return request(app).get("/api/topics").expect(200);
          });
          test("GET 200: responds with array of topics, expected length is 3", () => {
            return request(app)
              .get("/api/topics")
              .expect(200)
              .then(({ body }) => {
                const { topics } = body;
                expect(topics.length).toBe(3);
              });
          });
          test("GET 200: responds with array of topics with 'slug' and 'description' properties", () => {
            return request(app)
              .get("/api/topics")
              .expect(200)
              .then(({ body }) => {
                const { topics } = body;
                expect(topics.length).toBe(3);
                topics.forEach((topic) => {
                  expect(topic).toHaveProperty("slug");
                  expect(topic).toHaveProperty("description");
                });
              });
          });
        });
      });
      
      describe("/api", () => {
        test("GET 200: responds with 200 status", () => {
          return request(app).get("/api").expect(200);
        });
        test("GET 200: responds with an object containing 'endpoints' property with data from endpoints.json", () => {
          return request(app)
            .get("/api")
            .expect(200)
            .then(({ body }) => {
              expect(body.endpoints).toEqual(endpointsData);
            });
        });
      });
})

describe('GET /api', () => {
    it('should respond with the correct endpoints data', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(200);
      expect(response.body.endpoints).toEqual(endpointsData);
    });
  });


describe("GET /api/articles/:article_id", () => {
  
  test("should return the requested article with a 200 status code", () => {
    return request(app)
      .get("/api/articles/1")
      .then((res) => {
        expect(res.status).toBe(200);
        expect(res.body.article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });

  test("should return a 400 status code for an invalid article_id format", () => {
    return request(app)
      .get("/api/articles/invalidId")
      .then((res) => {
        expect(res.status).toBe(400);
        expect(res.body.msg).toBe("Invalid article_id format");
      });
  });

  test("should return a 404 status code for a non-existing article", () => {
    return request(app)
      .get("/api/articles/9999")
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.msg).toBe("Article not found");
      });
  });

  test("should return a 404 status code for a valid but non-existing article_id", () => {
    return request(app)
      .get("/api/articles/1000")
      .then((res) => {
        expect(res.status).toBe(404);
        expect(res.body.msg).toBe("Article not found");
      });
  });

  test("should include expected properties in the article object", () => {
    return request(app)
      .get("/api/articles/1")
      .then((res) => {
        const { article } = res.body;
        expect(Object.keys(article)).toEqual(
          expect.arrayContaining([
            "author",
            "title",
            "article_id",
            "body",
            "topic",
            "created_at",
            "votes",
            "article_img_url",
          ])
        );
      });
  });
  test("should return an article with comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then((res) => {
        const { article } = res.body;
        expect(article).toHaveProperty("comment_count");
        expect(typeof article.comment_count).toBe("string");
      });
  });
});


describe('GET /api/articles', () => {
    test("should return an array of articles with the correct properties", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((res) => {
            const { articles } = res.body;
            expect(articles).toBeInstanceOf(Array);
            expect(articles.length).toBeGreaterThan(0);
            articles.forEach((article) => {
              expect(article).toHaveProperty("author");
              expect(article).toHaveProperty("title");
              expect(article).toHaveProperty("article_id");
              expect(article).toHaveProperty("topic");
              expect(article).toHaveProperty("created_at");
              expect(article).toHaveProperty("votes");
              expect(article).toHaveProperty("article_img_url");
              expect(article).toHaveProperty("comment_count");
              expect(article).not.toHaveProperty("body");
            });
          });
      });

      test("should return articles sorted by date in descending order", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((res) => {
            const { articles } = res.body;
            
            expect(articles).toBeSortedBy('created_at', { descending: true });
          });
      });
})

describe("GET /api/articles/:article_id/comments", () => {
  test("should return comments for a valid article_id sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((res) => {
        const { comments } = res.body;
        expect(comments.length).toBeGreaterThan(0);
        expect(comments).toBeSortedBy("created_at", { descending: true });
        expect(comments[0]).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: 1,
        });
      });
  });


  test("should return 400 for invalid article_id format", () => {
    return request(app)
      .get("/api/articles/invalidId/comments")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid article_id format");
      });
  });

  test("should return 404 for non-existing article_id", () => {
    return request(app)
      .get("/api/articles/1000/comments")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comments not found");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("should add a comment to an article and respond with the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge", body: "This is a test comment" })
      .expect(201)
      .then((res) => {
        const { comment } = res.body;
        expect(comment).toMatchObject({
          article_id: 1,
          author: "butter_bridge",
          body: "This is a test comment",
        });
      });
  });

  test("should return a 400 status code if username or body is missing", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge" })
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Username and body are required");
      });
  });
});

describe('PATCH /api/articles/:article_id', () => {
  let initialVotes;

  test('should update the votes of the article by article_id', () => {
    return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((res) => {
        initialVotes = res.body.article.votes;
        return request(app)
          .patch('/api/articles/1')
          .send({ inc_votes: 10 })
          .expect(200);
      })
      .then((res) => {
        expect(res.body.article.votes).toBe(initialVotes + 10);
      });
  });
  

  test('should return 404 for non-existing article_id', () => {
    return request(app)
      .patch('/api/articles/9999')
      .send({ inc_votes: 10 })
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe('Article not found');
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("should delete the given comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204);
  });

  test("should return 404 for non-existing comment_id", () => {
    return request(app)
      .delete("/api/comments/999")
      .expect(404)
      .then((res) => {
        expect(res.body.msg).toBe("Comment not found");
      });
  });

  test("should return 400 for invalid comment_id format", () => {
    return request(app)
      .delete("/api/comments/invalidId")
      .expect(400)
      .then((res) => {
        expect(res.body.msg).toBe("Invalid comment_id format");
      });
  });
});

describe('GET /api/users', () => {
  test('should return an array of all users with correct properties', () => {
    return request(app)
      .get('/api/users')
      .expect(200)
      .then((res) => {
        const { users } = res.body;
        expect(users).toBeArray();
        expect(users.length).toBeGreaterThan(0);
        users.forEach((user) => {
          expect(user).toHaveProperty('username');
          expect(user).toHaveProperty('name');
          expect(user).toHaveProperty('avatar_url');
        });
      });
  });
});


describe("GET /api/articles", () => {
  test("should return articles filtered by topic", () => {
    return request(app)
      .get("/api/articles?topic=mitch")
      .expect(200)
      .then((res) => {
        const { articles } = res.body;
        expect(articles.length).toBeGreaterThan(0);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });
  });

  test("should return all articles if topic query is omitted", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((res) => {
        const { articles } = res.body;
        expect(articles.length).toBeGreaterThan(0);
      });
  });

  test("should return 404 if no articles found for the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=unknown_topic")
      .expect(404)
      .then((res) => {
        const { msg } = res.body;
        expect(msg).toBe("No articles found for the specified topic");
      });
  });
});
