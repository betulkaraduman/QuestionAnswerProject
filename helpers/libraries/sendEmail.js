const nodemailer = require("nodemailer");

const sendEmail = async(mailOptions) => {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
       auth: {
          user: process.env.SMTP_USER, // generated ethereal user
          pass: process.env.SMTP_PASS // generated ethereal password
        }
      });
   
    //g
      console.log(mailOptions)
    console.log(await transporter.sendMail(mailOptions));
    
};

module.exports = sendEmail;