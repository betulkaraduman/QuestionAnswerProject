const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const question =require('./question');

const AuthSchema = new mongoose.Schema({
  name: { type: String, require: [true, "Please provide a name"] },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      "Please provide a valid email",
    ],
  },
  role: { type: String, default: "User", enum: ["User", "Admin"] },
  password: {
    type: String,
    minlength: [6, "Please provide a password with min lenght 6"],
    required: [true, "Please provide a password"],
    // select: false,
  },
  createdAt: { type: Date, default: Date.now },
  title: { type: String },
  about: { type: String },
  place: { type: String },
  website: { type: String },
  profile_image: { type: String, default: "default.jpg" },
  // post_image: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
});
AuthSchema.methods.generateJwtFromUser = function () {
  const { JWT_SECRET_KEY, JWT_EXPIRE } = process.env;
  const payload = {
    id: this._id,
    name: this.name,
  };
  const token = jwt.sign(payload, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRE,
  });
  return token;
};
AuthSchema.methods.getResetPasswordTokenFromUser = function () {
  const {Reset_Password_Token}=process.env;
  const rndVal = crypto.randomBytes(15).toString("hex");//15 karakterli hex oluşturmak gerekiyor
  const ResetPasswordToken = crypto.createHash("SHA256").update(rndVal).digest("hex");
 
   this.resetPasswordToken=ResetPasswordToken;
   this.resetPasswordExpire=Date.now()+ parseInt(Reset_Password_Token);


  return ResetPasswordToken;
};

AuthSchema.pre("save", function (next) {
  //parola değişmemişsa çalışmaması için;
  if (!this.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) next(err);
      this.password = hash;
      next();
    });
  });
});

AuthSchema.post('remove',async function(){
  await question.deleteMany({auth:this._id})

})

module.exports = mongoose.model("Auth", AuthSchema);
