const mongoose = require("mongoose");
const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true, //DeprecationWarning: uyarısını username ve email alanlarını unique yaptığımızda aldık onu çözmek için kullanıırız
       })
    .then(console.log("MongoDb Connection Successfull"))
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDatabase;
