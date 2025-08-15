// api/vollmacht.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Anfragen erlaubt' });
  }

  const { name, dob, address, email, phone, place, dateSigned, vollmachtText } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: 'info@novaswissmed.com',
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: 'info@novaswissmed.com',
      to: 'info@novaswissmed.com',
      replyTo: email,
      subject: `Vollmacht – ${name} – ${dateSigned}`,
      text: vollmachtText,
    });

    res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
  } catch (error) {
    console.error('Fehler beim Senden:', error);
    res.status(500).json({ message: 'Fehler beim Senden der E-Mail' });
  }
}
