
const nodemailer = require('nodemailer');
const HOST = "smtp-mail.outlook.com";

module.exports = {
    /* service to send emails using nodemailer
     * param:
     *  emailDetail: email detailes required by nodemailer
     *  including but not limited to:
     *  from, to, subject, html, attachments, etc
     *  https://community.nodemailer.com/
     */
     sendEmail: function(emailDetail, callback){
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
    }
}