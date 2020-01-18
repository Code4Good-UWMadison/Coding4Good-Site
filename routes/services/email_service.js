
const nodemailer = require('nodemailer');
const HOST = "smtp-mail.outlook.com";

/* service to send emails using nodemailer
* param:
*  emailDetail: email detailes required by nodemailer
*  including but not limited to:
*  from, to, subject, html, attachments, etc
*  https://community.nodemailer.com/
* 
* Email is defaulted to send from noreply account to org admin account
* Can be changed by passing in 'to' and 'from' setting of emailDetail
*/
exports.sendEmail = function(emailDetail, callback){
    if(!emailDetail.html || !emailDetail.subject){
        console.log("SendEmail -- Wrong usage, subject and html must not be empty!")
        callback("Error: info is not sent! Please contact admin!");
    }
    //Default
    emailDetail.from = emailDetail.from ? emailDetail.from : `"Coding for Good Team <"${process.env.EMAILUSER}">" `;
    emailDetail.to = emailDetail.to ? emailDetail.to : process.env.EMAILORG;
    
    let transporter = nodemailer.createTransport({
        host: HOST,
        secureConnection: false,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAILUSER,
            pass: process.env.EMAILPASS
        }
    });

    transporter.sendMail(
        emailDetail, 
        function (err, info) {
            if(err){
                //console.log(err);
                callback(err);
            }
            else{
                //console.log(info);
                callback(null);
            }
    });
};