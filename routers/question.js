const express = require("express");
const route = express.Router();
const questions = require("../models/question");
const Answer = require("../models/answer");
const Auth = require("../models/auth");
const Category = require("../models/category");
const asyncErrorWrapper = require("express-async-handler");
const { Router } = require("express");
const CustomError = require("../helpers/error/customError");

route.get("/", (req, res) => {
  res.redirect("/question/newQuestion");
});
route.get(
  "/newQuestion",
  asyncErrorWrapper(async (req, res) => {
    const categories = await Category.find({}).lean();
    res.render("question/newQuestion", { categories: categories });
  })
);
route.get(
  "/questions",
  asyncErrorWrapper(async (req, res) => {
    const postPerPage = 6;
    const page = req.query.page || 1;
    const postCount = await questions.countDocuments();
    const question = await questions
      .find({})
      .lean()
      .skip(postPerPage * page - postPerPage)
      .limit(postPerPage);
    res.render("question/questions", {
      question: question,
      current: parseInt(page), //page count
      pages: Math.ceil(postCount / postPerPage),
    });
  })
);

route.get(
  "/test",
  asyncErrorWrapper(async (req, res) => {
    const question = await questions.find({}).lean();
    res.render("question/questions", { question: question });
  })
);

route.post(
  "/newQuestion",
  asyncErrorWrapper(async (req, res, next) => {
    const questionInfo = req.body;
    if (req.session.userId) {
      if (questionInfo.category == "none") {
        req.session.sessionFlash = {
          type: "alert alert-warning",
          message: "Please select category",
        };
      } else {
        const question = await questions.create({
          ...req.body,
          auth: req.session.userId,
        });
        req.session.sessionFlash = {
          type: "alert alert-primary",
          message: "Question is added",
        };
      }
      res.redirect("/question/newQuestion");
    }
  })
);

route.get(
  "/oneQuestion/:_id",
  asyncErrorWrapper(async (req, res) => {
    const postPerPage = 1;
    const page = req.query.page || 1;

    const postCount = await Answer.countDocuments();
    const question = await questions.find({ _id: req.params._id }).lean();
    const aQuestion = await questions.findById({ _id: req.params._id }).lean();
    const answers = await Answer.find({ question: req.params._id })
      .lean()
      .skip(postPerPage * page - postPerPage)
      .limit(postPerPage);

    const category = await Category.find({ _id: aQuestion.category });
    const categories = await Category.find({});
    const auth = await Auth.find({ _id: aQuestion.auth }).lean();
    res.render("question/questionDetail", {
      qufestion: question,
      answers: answers,
      auth: auth,
      category: category,
      categories: categories,
      current: parseInt(page), //page count
      pages: Math.ceil(postCount / postPerPage),
    });
  })
);

route.get(
  "/addNewAnswer/:_id",
  asyncErrorWrapper(async (req, res) => {
    const question = await questions.find({ _id: req.params._id }).lean();
    // // const auth=await Auth.find({_id:question{[auth]}})
    res.render("question/newAnswer", { question: question });
  })
);

route.get(
  "/edit/:_id",
  asyncErrorWrapper(async (req, res) => {
    const question = await questions.findOne({ _id: req.params._id }).lean();
    const category = await Category.findOne({ _id: question.category }).lean();
    const categories = await Category.find({}).lean();
    const selected = category.content;
    const selectedID = category._id;
    if (question)
      res.render("question/editQuestion", {
        question: question,
        category: category,
        categories: categories,
        selected: selected,
        selectedID: selectedID,
      });
  })
);
route.put(
  "/edit/:_id",
  asyncErrorWrapper(async (req, res) => {
    const newQuestion = req.body;
    if (newQuestion.category == "none") {
      newQues = {
        category: newQuestion.selected,
        title: newQuestion.title,
        content: newQuestion.content,
      };
      const question = await questions.findByIdAndUpdate(
        req.params._id,
        newQues,
        {
          new: true,
          runValidators: true,
        }
      );
      
    if (question) {
      req.session.sessionFlash = {
        type: "alert alert-primary",
        message: "Question is updated",
      };
      res.redirect("/question/questions");
    }
    } 
    
    
    else {
      const question = await questions.findByIdAndUpdate(
        req.params._id,
        newQuestion,
        {
          new: true,
          runValidators: true,
        }
      );
      if (question) {
        req.session.sessionFlash = {
          type: "alert alert-primary",
          message: "Question is updated",
        };
        res.redirect("/question/questions");
      }
    }
  
  })
);

route.get(
  "/like/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.session;
    if (!userId) {
      res.redirect("/auth/login");
    }
    const question = await questions.findById({ _id: req.params._id });
    if (userId) {
      if (question.likes.includes(userId)) {
        return next(new CustomError("You already liked this question"));
      }
      question.likes.push(userId);
      await question.save();
      res.redirect("/question/questions");
    }
  })
);
route.get(
  "/unlike/:_id",
  asyncErrorWrapper(async (req, res, next) => {
    const { userId } = req.session;
    if (!userId) {
      res.redirect("/auth/login");
    }
    const question = await questions.findById({ _id: req.params._id });
    if (userId) {
      if (!question.likes.includes(userId)) {
        return next(new CustomError("Yo can not undo like for this"));
      }
      const index = question.likes.indexOf(userId);
      question.likes.splice(index, 1);
      await question.save();
      res.redirect("/question/questions");
    }
  })
);

route.delete(
  "/delete/:_id",
  asyncErrorWrapper(async (req, res) => {
    const question = await questions.findById({ _id: req.params._id });
    await question.remove();
    req.session.sessionFlash = {
      type: "alert alert-warning",
      message: "Question is deleted",
    };
    res.redirect("/question/questions");
  })
);

module.exports = route;
