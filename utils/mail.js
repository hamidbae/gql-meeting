const nodemailer = require('nodemailer')
const mailGun = require('nodemailer-mailgun-transport')

const auth = {
    auth: {
        api_key: process.env.MAIL_API,
        domain: process.env.MAIL_DOMAIN
    }
}

const transporter = nodemailer.createTransport(mailGun(auth))

const sendMail = (email, subject, text, cb) => {
    const mailOptions = {
        from: 'hamid1bae1@gmail.com',
        to: email,
        subject: subject,
        text: text
    }
    
    transporter.sendMail(mailOptions, (err, data) => {
        if(err){
            cb(err, null)
        }else{
            cb(null, data)
        }
    })
}

module.exports = sendMail