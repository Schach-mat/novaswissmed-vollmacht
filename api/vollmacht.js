// api/vollmacht.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // ✅ CORS: Erlaube nur deine Domain
  res.setHeader('Access-Control-Allow-Origin', 'https://novaswissmed.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // ✅ Preflight (OPTIONS) beantworten
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ✅ Nur POST erlauben
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST-Anfragen erlaubt' });
  }

  // ✅ Daten aus dem Body extrahieren
  const {
    name,
    dob,
    address,
    email,
    phone,
    place,
    dateSigned,
    vollmachtText
  } = req.body;

  // ✅ Validierung erforderlicher Felder
  if (!name || !dob || !address || !email || !place || !dateSigned) {
    return res.status(400).json({ 
      message: 'Fehlende erforderliche Felder' 
    });
  }

  // ✅ Sicherstellen, dass vollmachtText existiert
  if (!vollmachtText) {
    return res.status(400).json({ 
      message: 'Fehlender vollmachtText – kein Nachweisdokument' 
    });
  }

  // ✅ E-Mail-Transport konfigurieren (Brevo / Sendinblue)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '94edae001@smtp-brevo.com',
      pass: process.env.SMTP_PASSWORD, // 🔐 Muss in Vercel gesetzt sein
    },
  });

  try {
    // ✅ E-Mail senden
    await transporter.sendMail({
      from: 'info@novaswissmed.com',
      to: 'info@novaswissmed.com',
      replyTo: email,
      subject: `Digitale Vollmacht – ${name} – ${place}, ${dateSigned}`,
      text: vollmachtText,
    });

    console.log('✅ E-Mail erfolgreich gesendet an info@novaswissmed.com');
    res.status(200).json({ message: 'E-Mail erfolgreich gesendet' });
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error);
    res.status(500).json({ message: 'Fehler beim Senden der E-Mail' });
  }
}
