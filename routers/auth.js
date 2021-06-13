const express = require("express");
const route = express.Router();
const Auth = require("../models/auth");
const asyncErrorWrapper = require("express-async-handler");
const path = require("path");
const CustomError = require("../helpers/error/customError");
const { reset } = require("nodemon");
const sendEmail = require("../helpers/libraries/sendEmail");
const auth = require("../models/auth");
const bcrypt = require("bcryptjs");
const question = require("../models/question");
const answer = require("../models/answer");
const url = require("url");
const { use } = require("./admin");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { has } = require("lodash");
route.get("/login", (req, res) => {
  res.render("site/login");
});
route.get(
  "/myAccount",
  asyncErrorWrapper(async (req, res) => {
    const { userId } = req.session;
    const auth = await Auth.findOne({ _id: userId }).lean();
    if (auth) {
      res.render("user/index", { auth: auth });
    }
  })
);
route.get(
  "/myQuestions",
  asyncErrorWrapper(async (req, res) => {
    const { userId } = req.session;
    const questions = await question.find({ auth: userId }).lean();
    if (auth) {
      res.render("user/myQuestions", { questions: questions });
    }
  })
);
route.get(
  "/myAnswers",
  asyncErrorWrapper(async (req, res) => {
    const { userId } = req.session;
    const answers = await answer.find({ auth: userId }).lean();
    if (answers) {
      res.render("user/myAnswers", { answers: answers });
    }
  })
);
route.get(
  "/activeUser",
  asyncErrorWrapper(async (req, res) => {
    const { userId } = req.session;
    const auth = await Auth.findOne({ _id: userId }).lean();
    if (auth) {
      res.render("user/activeUser", { auth: auth });
    }
  })
);

route.get("/errorPage", (req, res) => {
  res.render("site/errorPage");
});

route.put(
  "/activeUser/:_id",
  asyncErrorWrapper(async (req, res) => {
    if (req.files) {
      const auths = await auth.findById(req.params._id);
      let postImage = req.files.profile_image;
      postImage.mv(
        path.resolve(__dirname, "../public/img/postImages", postImage.name)
      );
      const imgResult = `img/postImages/${req.files.profile_image.name}`;
      auths.profile_image = imgResult;
      auths.save();
    }
    const editUser = req.body;
    const user = await auth.findByIdAndUpdate(req.params._id, editUser, {
      new: true,
      runValidators: true,
    });
    if (user) {
      req.session.sessionFlash = {
        type: "alert alert-success",
        message: "User is updated",
      };
      res.redirect("/admin/users");
    }
  })
);

route.get("/forgetPassword", (req, res) => {
  res.render("site/forgetPassword");
});
route.get("/resetPassword", (req, res) => {
  res.render("site/resetPassword");
});
route.get("/register", (req, res) => {
  res.render("site/register");
});

route.post(
  "/register",
  asyncErrorWrapper(async (req, res) => {
    if (!req.files) {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Images is npt upload",
      };
    }

    let postImage = req.files.profile_image;
    postImage.mv(
      path.resolve(__dirname, "../public/img/postImages", postImage.name)
    );
    const user = await auth.create({
      ...req.body,
      profile_image: `img/postImages/${postImage.name}`,
    });
    
    req.session.userId = user._id;
    req.session.sessionFlash = {
      type: "alert alert-primary",
      message: "User is added",
    };
    res.redirect("/");
  })
);

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  await Auth.findOne({ email }, (err, user) => {
    const result = bcrypt.compareSync(password, user.password); //Hashleniş ve hashlenmemiş passworfleri kıyaslar

    if (user) {
      if (result) {
        req.session.userId = user._id;
        res.redirect("/");
      } else {
        req.session.sessionFlash = {
          type: "alert alert-danger",
          message: "Password error",
        };
        res.redirect("/auth/login");
      }
    } else {
      req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "User is not found",
      };
      res.redirect("/auth/login");
    }
  });
});
route.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
route.post(
  "/forgetPassword",
  asyncErrorWrapper(async (req, res, next) => {
    const resetMail = req.body.email;
    const user = await Auth.findOne({ email: resetMail });
    if (!user) {
      return next(new CustomError("There is not user with that email"));
    }
    const ResetPasswordToken = user.getResetPasswordTokenFromUser();
    await user.save();
    const resetPassURL = `http://127.0.0.1:3000/auth/getToken?ResetPasswordToken=${ResetPasswordToken}`;
    const emailTemplate = `
    <h3>Reset Your Password</h3>
    <h4><a href='${resetPassURL}' target=''_blank><b>link</b></a> will expire an hour</h4>`;

    try {
      await sendEmail({
        from: process.env.SMTP_USER,
        to: resetMail,
        subject: "Reset Your Password",
        html: emailTemplate,
      });
      req.session.sessionFlash = {
        type: "alert alert-warning",
        message: "Password code is sent",
      };
      res.redirect("/auth/login");
    } catch (err) {
      user.ResetPasswordToken = undefined;
      user.ResetExpire = undefined;
      //değerileri undefined yapar
      await user.save();
      return new new CustomError("Email could not be sent", 500)();
    }
  })
);
route.get(
  "/getToken",
  asyncErrorWrapper(async (req, res, next) => {
    const ResetToken = url.parse(req.url, true).query;
    const resetPassToken = ResetToken.ResetPasswordToken;

    const user = await Auth.findOne({ resetPasswordToken: resetPassToken }).lean();
    if (user) {
      res.render("user/newPassword", { user: user });
    }
  })
);
route.put(
  "/newPassword/:_id",
  asyncErrorWrapper(async (req, res) => {
    const auths = await auth.findById(req.params._id);
    const newPass=req.body.password;
    bcrypt.genSalt(10,  (err, salt) => {      
      bcrypt.hash(newPass, salt, async(err, hash) => {       
        // newPass= hash;
        const newUser = {
          role: auths.role,
          profile_image: auths.profile_image,
          password:hash,
          blocked: auths.blocked,
          name: auths.name,
          email: auths.email,
          title: auths.title,
          about: auths.about,
          place: auths.place,
          website: auths.website,
          createdAt: auths.createdAt,
          resetPasswordExpire: auths.resetPasswordExpire,
          resetPasswordToken: auths.resetPasswordToken,
        };
        const user = await auth.findByIdAndUpdate(req.params._id, newUser, {
          new: true,
          runValidators: true,
        });
        if (user) {
          req.session.sessionFlash = {
            type: "alert alert-success",
            message: "Password is changed",
          };
          res.redirect("/auth/login");
        }
      });
    });


  })
);
module.exports = route;
