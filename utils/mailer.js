// utils/mailer.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendConfirmationEmail(email, nombre, token) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirma tu registro en Cobros',
    html: `
      <h1>Hola ${nombre}</h1>
      <p>Gracias por registrarte. Haz clic en el enlace para confirmar tu cuenta:</p>
      <a href="http://localhost:3000/usuarios/confirmar/${token}">Confirmar cuenta</a>
      <p>Si no solicitaste esto, ignora este mensaje.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Correo de confirmación enviado a', email);
}

module.exports = { sendConfirmationEmail };