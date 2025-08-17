// api/vollmacht.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // 1. Nur POST-Anfragen erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Anfragen erlaubt' });
  }

  // 2. Daten aus dem Formular extrahieren
  const { name, dob, address, email, phone, place, dateSigned, vollmachtText } = req.body;

  // 3. Sicherstellen, dass alle benötigten Felder vorhanden sind
  if (!name || !dob || !address || !email || !place || !dateSigned) {
    return res.status(400).json({ message: 'Fehlende erforderliche Felder' });
  }

  // 4. E-Mail-Konfiguration mit Brevo (früher Sendinblue)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', // Brevo SMTP-Server
    port: 587,
    secure: false, // true für 465, false für 587
    auth: {
      user: 'info@novaswissmed.com', // Deine E-Mail
      pass: process.env.SMTP_PASSWORD, // Dein Brevo API-Key (in Vercel gesetzt)
    },
  });

  try {
    // 5. E-Mail senden
    await transporter.sendMail({
      from: 'info@novaswissmed.com',
      to: 'info@novaswissmed.com', // Du als Empfänger
      replyTo: email, // Damit du direkt auf den Patienten antworten kannst
      subject: `Vollmacht – ${name} – ${dateSigned}`,
      text: vollmachtText, // Die formatierte Vollmacht (wie offizielles Dokument)
    });

    // 6. Erfolgsantwort an das Formular
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
  } catch (error) {
    console.error('Fehler beim Senden der E-Mail:', error);
    res.status(500).json({ message: 'Fehler beim Senden der E-Mail' });
  }
}
