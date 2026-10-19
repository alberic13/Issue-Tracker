'use strict';

const issueController = require('../controllers/issue.controller');

module.exports = function (app) {
  app.route('/api/issues/:project')
    .get(function (req, res) {
      return issueController.getAll(req, res);
    })
    .post(function (req, res) {
      return issueController.create(req, res);
    })
    .put(function (req, res) {
      return issueController.update(req, res);
    })
    .delete(function (req, res) {
      return issueController.delete(req, res);
    });
};
