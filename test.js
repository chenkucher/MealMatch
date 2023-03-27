const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: 'chenkucher@outlook.com',
    pass: 'Ck9696396963'
  },
  debug: true // add debug option
});

const mailOptions = {
  from: 'chenkucher@outlook.com',
  to: 'chenkuchiersky@gmail.com',
  subject: 'Confirm Your Email Address',
  text: `Please click on the following link to confirm your email address:}`
};

transporter.sendMail(mailOptions, (error) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent');
  }
});
