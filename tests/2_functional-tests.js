const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testIssue1, testIssue2;

  suite('Routing tests', function() {
    suite('POST /api/issues/{project} => object with issue data', function() {
      test('Create an issue with every field', function(done) {
        chai.request(server).post('/api/issues/test').send({
          issue_title: 'Title 1', issue_text: 'Text 1', created_by: 'Functional Test - Every field',
          assigned_to: 'Chai and Mocha', status_text: 'In QA'
        }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title 1');
          assert.equal(res.body.issue_text, 'Text 1');
          assert.equal(res.body.created_by, 'Functional Test - Every field');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.equal(res.body.status_text, 'In QA');
          assert.equal(res.body.open, true);
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, '_id');
          testIssue1 = res.body;
          done();
        });
      });

      test('Create an issue with only required fields', function(done) {
        chai.request(server).post('/api/issues/test').send({
          issue_title: 'Title 2', issue_text: 'Text 2', created_by: 'Functional Test - Required fields only'
        }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.issue_title, 'Title 2');
          assert.equal(res.body.issue_text, 'Text 2');
          assert.equal(res.body.created_by, 'Functional Test - Required fields only');
          assert.equal(res.body.assigned_to, '');
          assert.equal(res.body.status_text, '');
          assert.equal(res.body.open, true);
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'updated_on');
          assert.property(res.body, '_id');
          testIssue2 = res.body;
          done();
        });
      });

      test('Create an issue with missing required fields', function(done) {
        chai.request(server).post('/api/issues/test').send({ issue_title: 'Title only' }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'required field(s) missing' });
          done();
        });
      });
    });

    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      test('View issues on a project', function(done) {
        chai.request(server).get('/api/issues/test').end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 2);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          done();
        });
      });

      test('View issues on a project with one filter', function(done) {
        chai.request(server).get('/api/issues/test?created_by=Functional Test - Every field').end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          res.body.forEach(i => assert.equal(i.created_by, 'Functional Test - Every field'));
          done();
        });
      });

      test('View issues on a project with multiple filters', function(done) {
        chai.request(server).get('/api/issues/test?created_by=Functional Test - Every field&assigned_to=Chai and Mocha').end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtLeast(res.body.length, 1);
          res.body.forEach(i => {
            assert.equal(i.created_by, 'Functional Test - Every field');
            assert.equal(i.assigned_to, 'Chai and Mocha');
          });
          done();
        });
      });
    });

    suite('PUT /api/issues/{project} => text', function() {
      test('Update one field on an issue', function(done) {
        chai.request(server).put('/api/issues/test').send({
          _id: testIssue1._id, issue_title: 'Updated Title'
        }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', '_id': testIssue1._id });
          done();
        });
      });

      test('Update multiple fields on an issue', function(done) {
        chai.request(server).put('/api/issues/test').send({
          _id: testIssue1._id, issue_text: 'Updated issue text content', open: false
        }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully updated', '_id': testIssue1._id });
          done();
        });
      });

      test('Update an issue with missing _id', function(done) {
        chai.request(server).put('/api/issues/test').send({ issue_title: 'No id' }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
      });

      test('Update an issue with no fields to update', function(done) {
        chai.request(server).put('/api/issues/test').send({ _id: testIssue1._id }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'no update field(s) sent', '_id': testIssue1._id });
          done();
        });
      });

      test('Update an issue with an invalid _id', function(done) {
        const invalidId = '5f665eb4329723048b3b92b1';
        chai.request(server).put('/api/issues/test').send({
          _id: invalidId, issue_title: 'Invalid ID test'
        }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not update', '_id': invalidId });
          done();
        });
      });
    });

    suite('DELETE /api/issues/{project} => text', function() {
      test('Delete an issue', function(done) {
        chai.request(server).delete('/api/issues/test').send({ _id: testIssue2._id }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { result: 'successfully deleted', '_id': testIssue2._id });
          done();
        });
      });

      test('Delete an issue with an invalid _id', function(done) {
        const invalidId = '5f665eb4329723048b3b92b1';
        chai.request(server).delete('/api/issues/test').send({ _id: invalidId }).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'could not delete', '_id': invalidId });
          done();
        });
      });

      test('Delete an issue with missing _id', function(done) {
        chai.request(server).delete('/api/issues/test').send({}).end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { error: 'missing _id' });
          done();
        });
      });
    });
  });
});
