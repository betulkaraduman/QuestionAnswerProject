const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var slugify = require('slugify')
const answer =require('./answer');
const QuestionSchema = new mongoose.Schema({
  title: {type: String, required: [true, "Please provide a title"], minlength: [1, "Please provided a title at least 10 characters"], unique: true},
  content: {type: String, required: [true, "Please provide a title"], minlength: [2, "Please provide a content at least 20 characters"] },
  slug: { type: String },
  createdAt: { type: Date, default: Date.now },
  auth:{ type: Schema.Types.ObjectId, required: true, ref :"auth"},
  likes:[{type: Schema.Types.ObjectId,ref:'auth'}],
  answers:[{type: Schema.Types.ObjectId,ref:'answer'}],   
  category: { type: Schema.Types.ObjectId, ref: "category" },
});
QuestionSchema.pre('save',function(next){
  if(this.isModified('title'))next();
  this.slug=this.makeSlug();
  next();

})
QuestionSchema.methods.makeSlug=function(){
  return slugify(this.title, {
    replacement: '-',  // replace spaces with replacement character, defaults to `-`
    remove: /[*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: false,     // strip special characters except replacement, defaults to `false`
    locale: 'vi'       // language code of the locale to use
  })
}
QuestionSchema.post('remove',async function(){
  await answer.deleteMany({question:this._id})
 

})
module.exports = mongoose.model("Question", QuestionSchema);
