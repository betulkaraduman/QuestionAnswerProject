const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const Category = require("./models/category");
const connectDatabase = require("./helpers/database/connectDatabase");
const expressSession = require("express-session");
const hostname = "127.0.0.1";
const connectMongo = require("connect-mongo");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const errorHandle = require("./middleware/error/customErrorHandler");
const mongoStore = connectMongo(expressSession);
const bcrypt = require("bcryptjs");
// io.use(ios(Session));
let activeUser = "";

app.use(
  expressSession({
    secret: "blogSession",
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//Statik dosyaları kullanmak için middleware eklendi
app.use(express.static("public"));

//Environment Variables için;
dotenv.config({
  path: "./config/env/config.env",
});
//dotenv tanımlanmadan önce port bilgidi oluşturulsa hata alırız (ALDIK)
const port = process.env.PORT;

//Create Mongo Db
connectDatabase();
app.use((req, res, next) => {
  const { userId } = req.session;
  if (userId) {
    activeUser = req.session.userId;
    res.locals = { displayLink: true };
  } else {
    res.locals = { displayLink: false };
  }
  next();
});
app.use(fileUpload());
app.use(methodOverride("_method"));
const hbs = exphbs.create({
  helpers: {
    LikeState: (likes) => {
      let result = false;

      for (i = 0; i < likes.length; i++) {
        result = likes[i] == activeUser.trim();
        if (result) break;
      }
      if (result) {
        return true;
      } else {
        return false;
      }
    },
    LikeCount: (likes) => {
      const likeCount = likes.length;
      return likeCount;
    },
    DeleteAnswer: (auth) => {
      if (activeUser == auth) {
        return true;
      } else {
        return false;
      }
    },
    UpdateQuestion: (auth) => {
      if (activeUser == auth) {
        return true;
      } else {
        return false;
      }
    },
    DeleteQuestion: (auth) => {
      if (activeUser == auth) {
        return true;
      } else {
        return false;
      }
    },
    paginate: (options) => {
      let outputHtml = "";
      if (options.hash.current == 1) {
        outputHtml += `<li class="page-item disabled"style='list-style: none;'><a class="page-link">First</a></li>`;
      } else {
        outputHtml += `<li class="page-item" style='list-style: none;'><a class="page-link" href="?page=1">First</a></li>`;
      }
      let i =
        Number(options.hash.current) > 5 ? Number(options.hash.current) - 3 : 1;
      if (i != 1) {
        outputHtml += `<li class="page-item disabled" style='list-style: none;'><a class="page-link">...</a></li>`;
      }
      for (
        ;
        i <= Number(options.hash.current) + 3 && i <= options.hash.pages;
        i++
      ) {
        if (i === options.hash.current) {
          outputHtml += `<li class="page-item active" style='list-style: none;'><a class="page-link" href="?page=1">${i}</a></li>`;
        } else {
          outputHtml += `<li class="page-item" style='list-style: none;'><a class="page-link" href="?page=${i}">${i}</a></li>`;
        }
        if (i === Number(options.hash.current) + 3 && i < options.hash.pages) {
          if (options.hash.current == 1) {
            outputHtml += `<li class="page-item disabled" style='list-style: none;'><a class="page-link" >...</a></li>`;
          }
        }
      }
      // if (options.hash.current == options.hash.pages) {
      //   outputHtml += `<li class="page-item disabled" style='list-style: none;'><a class="page-link">Last</a></li>`;
      // } else{
      //   outputHtml += `<li class="page-item" style='list-style: none;'><a class="page-link"  href=${options.hash.pages}>Last</a></li>`;
      // }

      return outputHtml;
    },
    adminCheck: () => {
      const userId = activeUser;
    if(userId) return true;
    else return false;},
    UpdateAdd: (Aquestion) => {
      if(Aquestion==undefined){
        return false;
      }else{
        return true;
      }},
      SelectedCategory:(selected,_id)=>{
      console.log(selected)
      console.log(_id)
    }
  },
});
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use((req, res, next) => {
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

const main = require("./routers/main");
const auths = require("./routers/auth");
const questions = require("./routers/question");
const answers = require("./routers/answer");
const admins = require("./routers/admin/index");
const { fstat } = require("fs");
const { use, report } = require("./routers/answer");
app.use("/", main);
app.use("/auth", auths);
app.use("/question", questions);
app.use("/answer", answers);
app.use("/admin", admins);

app.use(errorHandle);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, hostname, () => {
  console.log(`Server is started http://${hostname}:${port}`);
});
