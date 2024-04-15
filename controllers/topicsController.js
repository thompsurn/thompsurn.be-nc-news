const { selectTopics: fetchTopicsData } = require("../models/topicsModel");
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

module.exports = { healthCheck, getTopics, getEndpoints };