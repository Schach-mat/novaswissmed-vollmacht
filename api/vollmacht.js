import SibApiV3Sdk from 'sib-api-v3-sdk';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const {
    q2_name,
    q3_geburtsdatum,
    q4_geschlecht,
    q5_rezeptarzteinummer,
    q6_adresse,
    q7_email,
    q8_telefonnummer,
    q9_ort,
    q10_datum,
    q11_unterschriftPatient,
    q12_datenschutz
  } = req.body;

  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

  const emailHtml = `
  <html>
    <body style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #004085;">Digitale Vollmacht zur Weitergabe medizinischer Daten</h2>
      <p>Sehr geehrte Damen und Herren,</p>
      <p>Sie haben eine neue digitale Vollmacht erhalten. Hier sind die übermittelten Daten des Patienten:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Name:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q2_name.first} ${q2_name.last}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Geburtsdatum:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q3_geburtsdatum.month}/${q3_geburtsdatum.day}/${q3_geburtsdatum.year}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Geschlecht:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q4_geschlecht}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Rezeptarztnummer:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q5_rezeptarzteinummer}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Adresse:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q6_adresse.addr_line1}, ${q6_adresse.city}, ${q6_adresse.postal}, ${q6_adresse.country}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>E-Mail:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q7_email}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Telefonnummer:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q8_telefonnummer.area} ${q8_telefonnummer.phone}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Ort:</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q9_ort}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd; background-color: #f8f9fa;"><strong>Datum (Vollmacht):</strong></td>
          <td style="padding: 10px; border: 1px solid #ddd;">${q10_datum.month}/${q10_datum.day}/${q10_datum.year}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;"><strong>Digitale Unterschrift:</strong></p>
      <img src="${q11_unterschriftPatient}" alt="Digitale Unterschrift des Patienten" style="border: 1px solid #ccc; max-width: 100%; height: auto;">
      <p style="margin-top: 20px;"><strong>Datenschutz zugestimmt:</strong> ${q12_datenschutz}</p>
      <p style="margin-top: 40px; font-size: 12px; color: #777;">Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht auf diese Nachricht.</p>
    </body>
  </html>
  `;
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = 'Neue Digitale Vollmacht erhalten';
  sendSmtpEmail.htmlContent = emailHtml;
  sendSmtpEmail.sender = { "name": "NovaSwissMed", "email": "info@novaswissmed.com" };
  sendSmtpEmail.to = [{ "email": "info@novaswissmed.com" }];

  try {
    const data = await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
    console.log(data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
}
