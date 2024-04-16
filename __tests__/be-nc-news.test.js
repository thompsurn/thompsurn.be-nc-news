const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const seedTestData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");

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

describe('GET /api/articles/:article_id', () => {
    const request = require("supertest");
const app = require("../app");

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
});
})
