// /api/vollmacht.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = req.body;

    // 1. Spam-Honeypot prüfen
    if (data.company && data.company.trim() !== "") {
      return res.status(400).json({ error: "Spam detected" });
    }

    // 2. Pflichtfelder prüfen
    const required = ["name", "dob", "address", "email", "confirm", "privacy"];
    for (const field of required) {
      if (!data[field]) {
        return res.status(400).json({ error: `Feld ${field} fehlt` });
      }
    }

    // 3. Hier kannst du die Daten speichern oder weiterleiten:
    //    - In eine Datenbank (z. B. MongoDB, PostgreSQL)
    //    - Per E-Mail via Brevo (siehe unten)

    // Beispiel: Ausgabe ins Log (Entwicklung)
    console.log("Neue Vollmacht:", data);

    // 4. E-Mail-Benachrichtigung via Brevo senden
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "NovaSwissMed", email: "no-reply@novaswissmed.ch" },
        to: [{ email: "info@novaswissmed.ch" }],
        subject: "Neue digitale Vollmacht",
        htmlContent: `<h3>Neue digitale Vollmacht</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Geburtsdatum:</strong> ${data.dob}</p>
          <p><strong>Adresse:</strong> ${data.address}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefon:</strong> ${data.phone || "-"}</p>
          <p><strong>Ort/Datum:</strong> ${data.place}, ${data.dateSigned}</p>
          <pre>${data.vollmachtText}</pre>`
      }),
    });

    if (!brevoRes.ok) {
      console.error("Fehler beim Brevo-Senden", await brevoRes.text());
    }

    // 5. Erfolgsmeldung zurück
    return res.status(200).json({ message: "Vollmacht erfolgreich empfangen" });

  } catch (err) {
    console.error("Fehler:", err);
    return res.status(500).json({ error: "Serverfehler" });
  }
}
