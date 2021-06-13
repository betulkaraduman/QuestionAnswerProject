const express = require("express");
const route = express.Router({ mergeParams: true });
const Answer = require("../models/answer");
const Auth = require("../models/auth");
const Question = require("../models/question");
const path = require("path");
const asyncErrorWrapper = require("express-async-handler");
const CustomError = require("../helpers/error/customError");

route.get("/:_id", (req, res) => {
  res.render("answer/allAnswers");
});
route.post(
  "/newAnswer",
  asyncErrorWrapper(async (req, res, next) => {
    const postPerPage = 6;
    const page = req.query.page || 1;

    const postCount = await Answer.countDocuments();

    const answer = await Answer.create({
      ...req.body,
      auth: req.session.userId,
      question: req.body.question,
    });
    const questionToAnswer = await Question.findById(req.body.question);
    questionToAnswer.answers.push(answer._id);
    await questionToAnswer.save();
    const question = await Question.find({ _id: req.body.question }).lean();
    const auth = await Auth.find({ _id: req.session.userId }).lean();
    const answers = await Answer.find({ question: req.body.question })
      .lean()
      .skip(postPerPage * page - postPerPage)
      .limit(postPerPage);

    req.session.sessionFlash = {
      type: "alert alert-primary",
      message: "Question is added",
    };
    res.render("question/questionDetail", {
      answers: answers,
      auth: auth,
      question: question,
      current: parseInt(page), //page count
      pages: Math.ceil(postCount / postPerPage),
    });
  })
);
route.get(
  "/like/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.session;
    const answer = await Answer.findById({ _id: req.params._id });
    const questions = answer.question;
    const auth = await Auth.find({ _id: answer.auth }).lean();
    const question = await Question.find({ _id: answer.question }).lean();
    const answers = await Answer.find({ question: questions }).lean();
    if (!userId) {
      res.redirect("/auth/login");
    }
    if (userId) {
      if (answer.likes.includes(userId)) {
        return next(new CustomError("You already liked this question"));
      }
      answer.likes.push(userId);
      await answer.save();
      req.session.sessionFlash = {
        type: "alert alert-primary",
        message: "Answer is liked",
      };
      res.redirect("/question/questions");
      //res.render("question/questions", {answers:answers,question:question,auth:auth});
    }
  })
);

route.get(
  "/unlike/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.session;
    const answer = await Answer.findById({ _id: req.params._id });
    if (!userId) {
      res.redirect("/auth/login");
    }
    if (userId) {
      if (!answer.likes.includes(userId)) {
        return next(new CustomError("Yo can not undo like for this"));
      }
      const index = answer.likes.indexOf(userId);
      answer.likes.splice(index, 1);
      await answer.save();
      req.session.sessionFlash = {
        type: "alert alert-primary",
        message: "Answer is unlike",
      };
      res.redirect("/question/questions");
    }
  })
);
route.delete(
  "/delete/:_id",
  asyncErrorWrapper(async (req, res) => {
    const answer = await Answer.findById({ _id: req.params._id });
    await answer.remove();
    req.session.sessionFlash = {
      type: "alert alert-warning",
      message: "Answer is deleted",
    };
    res.redirect("/question/questions");
  })
);
module.exports = route;
