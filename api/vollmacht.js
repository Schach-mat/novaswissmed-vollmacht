// api/vollmacht.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Nur POST erlaubt' });
  }

  const { name, dob, adresse, email, telefon, ortDatum } = req.body;

  // Formatierter Vollmacht-Text (wie offizielles Dokument)
  const mailText = `
DIGITALE VOLLMACHT ZUR WEITERGABE MEDIZINISCHER DATEN

Ich, ${name}, geboren am ${dob}, wohnhaft in ${adresse}, 
erteile hiermit NovaSwissMed, vertreten durch Herrn Mohammad Kheir Naji, 
die Vollmacht, meine medizinischen Daten an zur Behandlung erforderliche 
medizinische Institutionen weiterzugeben.

Ich bestätige, dass alle von mir gemachten Angaben vollständig, richtig und 
der Wahrheit entsprechend sind.

Ort, Datum: ${ortDatum}
Unterschrift: Digitale Bestätigung durch Absenden des Formulars

--- EINGABEDATEN ---
Vor- und Nachname: ${name}
Geburtsdatum: ${dob}
Adresse: ${adresse}
E-Mail: ${email}
Telefon: ${telefon || '–'}
`;

  // E-Mail-Konfiguration (Beispiel mit Brevo / Sendinblue – SMTP)
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "deine-email@novaswissmed.com",
      pass: "dein-api-key-hier",
    },
  });

  try {
    await transporter.sendMail({
      from: "info@novaswissmed.com",
      to: "info@novaswissmed.com", // Du als Empfänger
      replyTo: email, // Damit du auf die E-Mail antworten kannst
      subject: "Neue Vollmacht eingegangen",
      text: mailText,
    });

    res.status(200).json({ message: "E-Mail erfolgreich gesendet" });
  } catch (error) {
    console.error("Fehler beim Senden:", error);
    res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
  }
}