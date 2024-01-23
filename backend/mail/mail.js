import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b9ab32b1eb00d1",
    pass: "17b6485a62da4a",
  },
});

export default function sendPasswordResetMail(username, email, resetCode){
  transporter.sendMail({
    from: '"Let\'s Just Draw! ✏️" <support@letsjustdraw.com>', // sender address
    to: email, // receiver address
    subject: "Let\'s Just Draw! - password reset", // subject line
    html: `Hello,<br/><br/><br/>
            Your username was "${username}" and you can reset your password <a href="http://localhost:3000/reset-password-form/${resetCode}">here</a>.
            <br/><br/><br/><br/>
            Have fun,<br/>
            Let's Just Draw team.`, // html body
  });
}