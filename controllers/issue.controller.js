'use strict';

const issueService = require('../services/issue.service');

class IssueController {
  create(req, res) {
    const project = req.params.project;
    const result = issueService.createIssue(project, req.body || {});
    return res.json(result);
  }

  getAll(req, res) {
    const project = req.params.project;
    const result = issueService.getIssues(project, req.query || {});
    return res.json(result);
  }

  update(req, res) {
    const project = req.params.project;
    const result = issueService.updateIssue(project, req.body || {});
    return res.json(result);
  }

  delete(req, res) {
    const project = req.params.project;
    const result = issueService.deleteIssue(project, req.body || {});
    return res.json(result);
  }
}

module.exports = new IssueController();
