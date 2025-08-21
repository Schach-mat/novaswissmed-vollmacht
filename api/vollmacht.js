// api/vollmacht.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // ✅ Korrigierte CORS-Header (keine Leerzeichen!)
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
    firstname,
    lastname,
    dob,
    gender,
    address,
    plz,
    city,
    country,
    phone,
    passport,
    email,
    place,
    dateSigned,
    vollmachtText
  } = req.body;

  // ✅ Validierung erforderlicher Felder
  if (!firstname || !lastname || !dob || !address || !plz || !city || !country || !email || !place || !dateSigned) {
    return res.status(400).json({ 
      message: 'Fehlende erforderliche Felder' 
    });
  }

  // ✅ Validierung des Vollmachttexts
  if (!vollmachtText) {
    return res.status(400).json({ 
      message: 'Fehlender vollmachtText – kein Nachweisdokument' 
    });
  }

  // ✅ E-Mail-Adresse des Senders (Brevo SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
      user: '94edae001@smtp-brevo.com',
      pass: process.env.SMTP_PASSWORD, // ✅ Aus Vercel Umgebungsvariable
    },
  });

  try {
    // ✅ E-Mail senden
    await transporter.sendMail({
      from: 'info@novaswissmed.com',
      to: 'info@novaswissmed.com', // ✅ Empfänger: deine Klinik
      replyTo: email, // ✅ Damit du auf Patienten-E-Mail antworten kannst
      subject: `Digitale Vollmacht – ${firstname} ${lastname} – ${place}, ${dateSigned}`,
      text: vollmachtText, // ✅ 1:1 wie im Formular – als Nachweisdokument
    });

    console.log('✅ E-Mail erfolgreich gesendet:', { firstname, lastname, email, place, dateSigned });

    // ✅ Erfolgsantwort
    res.status(200).json({ 
      message: 'E-Mail erfolgreich gesendet' 
    });
  } catch (error) {
    console.error('❌ Fehler beim Senden der E-Mail:', error);
    res.status(500).json({ 
      message: 'Fehler beim Senden der E-Mail – Bitte prüfen Sie SMTP_PASSWORD in Vercel' 
    });
  }
}
