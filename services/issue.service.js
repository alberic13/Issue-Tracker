'use strict';

const crypto = require('crypto');

class IssueService {
  constructor() {
    this.issues = [];
  }

  createIssue(project, body) {
    const { issue_title, issue_text, created_by, assigned_to, status_text } = body;
    if (!issue_title || !issue_text || !created_by) {
      return { error: 'required field(s) missing' };
    }

    const now = new Date().toISOString();
    const newIssue = {
      _id: crypto.randomBytes(12).toString('hex'),
      issue_title: String(issue_title),
      issue_text: String(issue_text),
      created_on: now,
      updated_on: now,
      created_by: String(created_by),
      assigned_to: assigned_to ? String(assigned_to) : '',
      open: true,
      status_text: status_text ? String(status_text) : '',
      project: String(project)
    };

    this.issues.push(newIssue);
    return this.formatIssue(newIssue);
  }

  getIssues(project, query = {}) {
    return this.issues
      .filter(issue => issue.project === String(project))
      .filter(issue => {
        for (const [key, val] of Object.entries(query)) {
          if (key === 'open') {
            const boolVal = val === 'true' || val === true;
            if (issue.open !== boolVal) return false;
          } else if (key === '_id') {
            if (String(issue._id) !== String(val)) return false;
          } else if (issue[key] !== undefined) {
            if (String(issue[key]) !== String(val)) return false;
          }
        }
        return true;
      })
      .map(issue => this.formatIssue(issue));
  }

  updateIssue(project, body) {
    const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = body;
    if (!_id) {
      return { error: 'missing _id' };
    }

    const fields = { issue_title, issue_text, created_by, assigned_to, status_text, open };
    const hasUpdate = Object.values(fields).some(v => v !== undefined && v !== null && v !== '');
    if (!hasUpdate) {
      return { error: 'no update field(s) sent', '_id': _id };
    }

    const issue = this.issues.find(i => String(i._id) === String(_id));
    if (!issue) {
      return { error: 'could not update', '_id': _id };
    }

    if (issue_title !== undefined && issue_title !== null && issue_title !== '') issue.issue_title = String(issue_title);
    if (issue_text !== undefined && issue_text !== null && issue_text !== '') issue.issue_text = String(issue_text);
    if (created_by !== undefined && created_by !== null && created_by !== '') issue.created_by = String(created_by);
    if (assigned_to !== undefined && assigned_to !== null && assigned_to !== '') issue.assigned_to = String(assigned_to);
    if (status_text !== undefined && status_text !== null && status_text !== '') issue.status_text = String(status_text);
    if (open !== undefined && open !== null && open !== '') {
      issue.open = open === true || open === 'true';
    }

    issue.updated_on = new Date().toISOString();
    return { result: 'successfully updated', '_id': _id };
  }

  deleteIssue(project, body) {
    const _id = body._id;
    if (!_id) {
      return { error: 'missing _id' };
    }

    const index = this.issues.findIndex(i => String(i._id) === String(_id));
    if (index === -1) {
      return { error: 'could not delete', '_id': _id };
    }

    this.issues.splice(index, 1);
    return { result: 'successfully deleted', '_id': _id };
  }

  formatIssue(issue) {
    return {
      _id: issue._id,
      issue_title: issue.issue_title,
      issue_text: issue.issue_text,
      created_on: issue.created_on,
      updated_on: issue.updated_on,
      created_by: issue.created_by,
      assigned_to: issue.assigned_to,
      open: issue.open,
      status_text: issue.status_text
    };
  }
}

module.exports = new IssueService();
