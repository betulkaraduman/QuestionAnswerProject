const mongoose = require("mongoose");
const Question = require("./question");
const answers = require("./answer");

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Please provide a content"],
    minlength: [5, "Please provide a content at least 5 characters"],
  },
  createAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.ObjectId, ref: "auth" }],
  auth: { type: mongoose.Schema.ObjectId, ref: "auth" },
  question: { type: mongoose.Schema.ObjectId, ref: "question" },
 });module.exports = mongoose.model("Answer", answerSchema);
