import fetch from "node-fetch";

export default async function handler(req, res) {
  // --- CORS-Header setzen ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;

    // --- Sicherheits-Check ---
    if (!data.name || !data.email || !data.dob || !data.address) {
      return res.status(400).json({ message: "Fehlende Pflichtfelder" });
    }

    // --- Vollmacht-Text generieren ---
    const vollmachtText = `
DIGITALE VOLLMACHT ZUR WEITERGABE MEDIZINISCHER DATEN

Ich, ${data.name}, geboren am ${data.dob}, wohnhaft in ${data.address}, 
erteile hiermit NovaSwissMed, vertreten durch Herrn Mohammad Kheir Naji, 
die Vollmacht, meine medizinischen Daten an zur Behandlung erforderliche 
medizinische Institutionen weiterzugeben.

Ich bestätige, dass alle von mir gemachten Angaben vollständig, richtig und 
der Wahrheit entsprechend sind.

Ort, Datum: ${data.place}, ${data.dateSigned}
Unterschrift: Digitale Bestätigung durch Absenden des Formulars
    `.trim();

    // --- Mail-Body für Brevo ---
    const emailBody = {
      sender: { email: "no-reply@novaswissmed.ch", name: "NovaSwissMed" },
      to: [{ email: "DEINE_EMAIL@domain.ch", name: "NovaSwissMed Verwaltung" }],
      subject: "Neue digitale Vollmacht eingegangen",
      htmlContent: `
        <h2>Neue digitale Vollmacht</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Geburtsdatum:</strong> ${data.dob}</p>
        <p><strong>Adresse:</strong> ${data.address}</p>
        <p><strong>E-Mail:</strong> ${data.email}</p>
        <p><strong>Telefon:</strong> ${data.phone || "-"}</p>
        <p><strong>Ort:</strong> ${data.place}</p>
        <p><strong>Datum:</strong> ${data.dateSigned}</p>
        <hr />
        <pre>${vollmachtText}</pre>
      `,
    };

    // --- API Request an Brevo ---
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY, // <-- kommt von Vercel
      },
      body: JSON.stringify(emailBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo Fehler:", errorText);
      return res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
    }

    return res.status(200).json({ message: "E-Mail erfolgreich gesendet" });

  } catch (error) {
    console.error("Server Fehler:", error);
    return res.status(500).json({ message: "Serverfehler", error: error.message });
  }
}
