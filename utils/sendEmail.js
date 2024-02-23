const nodemailer = require('nodemailer');
const nodeMailerConfig = require('./nodeMailerConfig');

const sendEmail = async({to,subject,html})=>{
    const transporter = nodemailer.createTransport(nodeMailerConfig);

    return transporter.sendMail({
        from: '"Pras Play👻" <prantocse18@gmail.com>', // sender address
        to, // list of receivers
        subject, // Subject line
        html // html body
      });
      
}

module.exports = sendEmail;