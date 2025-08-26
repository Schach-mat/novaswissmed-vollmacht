export default async function handler(req, res) {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // für Tests; später Domain eintragen
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // Pflichtfelder
    const required = ["name", "dob", "address", "email", "confirm", "privacy"];
    for (const field of required) {
      if (!data[field]) {
        return res.status(400).json({ error: `Feld ${field} fehlt` });
      }
    }

    // Spamcheck Honeypot
    if (data.company && data.company.trim() !== "") {
      return res.status(400).json({ error: "Spam detected" });
    }

    // --- Brevo E-Mail ---
    try {
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "NovaSwissMed", email: "no-reply@novaswissmed.ch" },
          to: [{ email: "info@novaswissmed.ch" }], // Empfängeradresse anpassen
          subject: "Neue digitale Vollmacht",
          htmlContent: `
            <h2>Neue digitale Vollmacht</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Geburtsdatum:</strong> ${data.dob}</p>
            <p><strong>Adresse:</strong> ${data.address}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Telefon:</strong> ${data.phone || "-"}</p>
            <p><strong>Ort/Datum:</strong> ${data.place}, ${data.dateSigned}</p>
            <pre>${data.vollmachtText}</pre>
          `,
        }),
      });

      if (!brevoRes.ok) {
        console.error("Brevo-Fehler:", await brevoRes.text());
      }
    } catch (e) {
      console.error("Fehler beim Brevo-Senden:", e);
    }

    // Erfolgsmeldung
    return res.status(200).json({ message: "Vollmacht erfolgreich empfangen" });

  } catch (err) {
    console.error("Serverfehler:", err);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
}
