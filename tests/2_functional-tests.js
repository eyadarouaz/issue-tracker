const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    suite('Test GET', function () {
        test('GET issues of a project', (done) => {
            chai
                .request(server)
                .get('/api/issues/apitest')
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body, 'is array')
                    assert.property(res.body[0], 'assigned_to')
                    assert.property(res.body[0], 'status_text')
                    assert.property(res.body[0], 'open')
                    assert.property(res.body[0], 'issue_title')
                    assert.property(res.body[0], 'issue_text')
                    assert.property(res.body[0], 'created_by')
                    assert.property(res.body[0], 'created_on')
                    assert.property(res.body[0], 'updated_on')
                    done()
                })
        })

        test('GET issue of a project by passing one optional field', (done) => {
            chai
                .request(server)
                .get('/api/issues/apitest')
                .query({ open: false })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body, 'is array')
                    res.body.forEach(issue => {
                        assert.equal(issue.open, false)
                    })
                    done()
                })
        })

        test('GET issue of a project by passing multuple optional fields', (done) => {
            chai
                .request(server)
                .get('/api/issues/apitest')
                .query({ open: false, created_by: "Chris" })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body, 'is array')
                    res.body.forEach(issue => {
                        assert.equal(issue.open, false)
                        assert.equal(issue.created_by, "Chris")
                    })
                    done()
                })
        })
    })

    suite('Test POST', function () {
        test('POST an issue with optional fields', (done) => {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .send({
                    assigned_to: 'Bar',
                    status_text: 'Ongoing',
                    issue_title: 'Button shadow',
                    issue_text: 'Button shadow must be blue',
                    created_by: 'Foo',
                })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.assigned_to, 'Bar')
                    assert.equal(res.body.status_text, 'Ongoing')
                    assert.equal(res.body.issue_title, 'Button shadow')
                    assert.equal(res.body.issue_text, 'Button shadow must be blue')
                    assert.equal(res.body.created_by, 'Foo')
                    done()
                })
        })

        test('POST issue with required fields only', (done) => {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .send({
                    created_by: 'Bar',
                    issue_text: 'Ongoing',
                    issue_title: 'Button shadow',
                })
                .end((err, res) => {
                    assert.equal(res.status, 200)
                    assert.equal(res.body.created_by, 'Bar')
                    assert.equal(res.body.issue_text, 'Ongoing')
                    assert.equal(res.body.issue_title, 'Button shadow')
                    assert.equal(res.body.status_text, '')
                    assert.equal(res.body.assigned_to, '')
                    done()
                })
        })

        test('POST issue without required fields', (done) => {
            chai
                .request(server)
                .post('/api/issues/apitest')
                .send({
                    assigned_to: '',
                    status_text: 'Ongoing',
                    issue_title: 'Button shadow',
                })
                .end((err, res) => {
                    assert.equal(res.body.error, 'required field(s) missing')
                    done()
                })
        })
    })

    suite('Test PUT', function () {
        test('UPDATE one field ', (done) => {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '65facbed23c9191d49f4ff54',
                    issue_title: 'Error when displaying data'
                })
                .end((err, res) => {
                    assert.equal(res.body.result, 'successfully updated')
                    assert.equal(res.body._id, '65facbed23c9191d49f4ff54')
                    done()
                })
        })

        test('UPDATE multiple fields ', (done) => {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '65facbed23c9191d49f4ff54',
                    issue_title: 'Error when displaying data',
                    assigned_to: 'Samantha'
                })
                .end((err, res) => {
                    assert.equal(res.body.result, 'successfully updated')
                    assert.equal(res.body._id, '65facbed23c9191d49f4ff54')
                    done()
                })
        })

        test('UPDATE issue without providing id', (done) => {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .send({
                    issue_title: 'Button shadow',
                })
                .end((err, res) => {
                    assert.equal(res.body.error, 'missing _id')
                    done()
                })
        })

        test('UPDATE issue with no fields to update', done => {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .send({ _id: '65f839aa2215590cea686863' })
                .end((err, res) => {
                    assert.equal(res.body.error, 'no update field(s) sent')
                    assert.equal(res.body._id, '65f839aa2215590cea686863')
                    done()
                })
        })

        test('UPDATE issue with invalid id', done => {
            chai
                .request(server)
                .put('/api/issues/apitest')
                .send({ _id: '60f1bee4521da62c5ccd7641', issue_text: 'error' })
                .end((err, res) => {
                    assert.equal(res.body.error, 'could not update')
                    assert.equal(res.body._id, '60f1bee4521da62c5ccd7641')
                    done()
                })
        })
    })

    suite('Test DELETE', function () {
        test('DELETE issue', done => {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .send({ _id: "65facbed23c9191d49f4ff54" })
                .end((err, res) => {
                    assert.equal(res.body.result, 'successfully deleted')
                    assert.equal(res.body._id, "65facbed23c9191d49f4ff54")
                    done()
                })
        })

        test('DELETE issue with invalid id', done => {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .send({ _id: '60f1c7cd0e7e0e0a74771d25' })
                .end((err, res) => {
                    assert.equal(res.body.error, 'could not delete')
                    assert.equal(res.body._id, '60f1c7cd0e7e0e0a74771d25')
                    done()
                })
        })

        test('DELETE issue with missing id', done => {
            chai
                .request(server)
                .delete('/api/issues/apitest')
                .send({})
                .end((err, res) => {
                    assert.equal(res.body.error, 'missing _id')
                    done()
                })
        })
    })

});
