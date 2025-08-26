export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const brevoApiKey = process.env.BREVO_API_KEY;

  try {
    const data = req.body;

    // Inhalt der Vollmacht (als Text oder HTML)
    const vollmachtText = `
      DIGITALE VOLLMACHT ZUR WEITERGABE MEDIZINISCHER DATEN

      Ich, ${data.name}, geboren am ${data.dob}, wohnhaft in ${data.address},
      erteile hiermit NovaSwissMed, vertreten durch Herrn Mohammad Kheir Naji,
      die Vollmacht, meine medizinischen Daten an zur Behandlung erforderliche
      medizinische Institutionen weiterzugeben.

      Ort, Datum: ${data.place}, ${data.dateSigned}
      Bestätigung: Formular digital abgesendet
    `;

    // 📧 E-Mail an dich (als Nachweis für die Klinik)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "NovaSwissMed", email: "info@novaswissmed.ch" }, // deine Absenderadresse
        to: [{ email: "info@novaswissmed.ch", name: "NovaSwissMed" }], // deine Empfängeradresse
        subject: "Neue digitale Vollmacht von " + data.name,
        htmlContent: `
          <h2>Neue digitale Vollmacht</h2>
          <p><strong>Patient:</strong> ${data.name}</p>
          <p><strong>Geburtsdatum:</strong> ${data.dob}</p>
          <p><strong>Adresse:</strong> ${data.address}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefon:</strong> ${data.phone || "-"}</p>
          <p><strong>Ort & Datum:</strong> ${data.place}, ${data.dateSigned}</p>
          <hr>
          <pre>${vollmachtText}</pre>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error("Brevo API Fehler: " + (await response.text()));
    }

    // Optional: Kopie an den Patienten
    if (data.email) {
      await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "NovaSwissMed", email: "info@novaswissmed.ch" },
          to: [{ email: data.email, name: data.name }],
          subject: "Ihre digitale Vollmacht – Bestätigung",
          htmlContent: `
            <p>Sehr geehrte/r ${data.name},</p>
            <p>vielen Dank, Ihre digitale Vollmacht wurde erfolgreich erteilt.</p>
            <p>Hier der Inhalt Ihrer Vollmacht:</p>
            <pre>${vollmachtText}</pre>
          `,
        }),
      });
    }

    res.status(200).json({ message: "Vollmacht gesendet" });
  } catch (error) {
    console.error("Fehler beim Mailversand:", error);
    res.status(500).json({ message: "Serverfehler", error: error.message });
  }
}
