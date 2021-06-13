const CustomError = require("../../helpers/error/customError");
const errorHandler = (err, req, res, next) => {
  let customError = err;
  console.log(err.name)
  if(err.name==='SyntaxError'){
    req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "Unexpected Syntax",
      };
    res.redirect("users")  
  }
  if(err.code===11000){
    //Duplicate Key
    req.session.sessionFlash = {
        type: "alert alert-danger",
        message: "This email is using",
      };
    res.redirect("users")  
  }
  // if(err.name==='ValidationError'){
  //   req.session.sessionFlash = {
  //       type: "alert alert-danger",
  //       message: "VALIDATION ERROR password must be 6 character",
  //     };

  //    res.redirect("/question/newQuestion");
  // }
  req.session.sessionFlash = {
    type: "alert alert-danger",
    message: customError.message,
  };
res.redirect("/auth/errorPage")  

  console.log(customError.message);
  //res.status(400).json({ success: false });
};

module.exports = errorHandler;
