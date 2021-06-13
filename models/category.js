const mongoose = require("mongoose");
const Question = require("./question");
const Schema = mongoose.Schema;
const answers = require("./answer");

const categorySchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Please provide a content"],
    minlength: [5, "Please provide a content at least 5 characters"],
  },
  createAt: { type: Date, default: Date.now },
 });
//  QuestionSchema.post('remove',async function(){
//   await answer.deleteMany({question:this._id})
 

// })
 module.exports=mongoose.model('Category',categorySchema)