'use strict';
const mongoose = require("mongoose");

module.exports = function (app) {

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("successfully connected to database.");
    })
    .catch((error) => {
      console.log(error);
    })

  const issueModel = require('../models/issue');

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      let issue = Object.assign({ project: project }, req.query);

      issueModel.find(issue).exec()
        .then(data => {
          if (data) {
            let issues = [];
            data.forEach(issue => {
              issues.push({ _id: issue._id, assigned_to: issue.assigned_to, status_text: issue.status_text, issue_title: issue.issue_title, issue_text: issue.issue_text, created_by: issue.created_by, created_on: issue.created_on, updated_on: issue.updated_on, open: issue.open })
            })
            return res.json(issues);
          }
        })
        .catch(error => console.log(error))
    })

    .post(function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" })
      } else {
        const issue = new issueModel({
          project: project,
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || '',
          created_on: new Date(),
          updated_on: new Date(),
          open: true
        })

        issue.save()
          .then(data => {
            let newIssue = {
              _id: data._id,
              assigned_to: data.assigned_to,
              status_text: data.status_text,
              issue_title: data.issue_title,
              issue_text: data.issue_text,
              created_by: data.created_by,
              created_on: data.created_on,
              updated_on: data.updated_on,
              open: data.open,
            };
            return res.json(newIssue);
          })
          .catch(err => console.log(err));
      }
    })

    .put(function (req, res) {
      let issue = Object.assign(req.body);

      if (!issue._id) {
        return res.json({ error: "missing _id" });
      }
      if (!issue.issue_title && !issue.issue_text && !issue.created_by && !issue.assigned_to && !issue.status_text) {
        return res.json({ error: "no update field(s) sent", _id: issue._id });
      } else {
        issue.updated_on = new Date();

        Object.keys(issue).forEach((k) => issue[k] == '' && delete issue[k]);

        issueModel.findByIdAndUpdate(issue._id, issue).exec()
          .then((data) => {
            if (data) return res.json({ result: "successfully updated", _id: issue._id })
            else return res.json({ error: "could not update", _id: issue._id });
          })
          .catch((err) => console.log(err));
      }

    })

    .delete(function (req, res) {
      let issue = Object.assign(req.body);

      if (!issue._id) {
        return res.json({ error: "missing _id"});
      } else {
        issueModel.findByIdAndDelete(issue._id).exec()
          .then((data) => {
            if (data) return res.json({ result: "successfully deleted", _id: issue._id, });
            else return res.json({ error: "could not delete", _id: issue._id });
          })
          .catch((err) => console.log(err))
      }
    });

};
