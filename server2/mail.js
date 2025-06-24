import nodemailer from "nodemailer";


export async function sendMail(toEmail,message) {
  try {
    // Load HTML template
    // const emailHtml = fs.readFileSync(
    //   path.join(__dirname, "index2.html"),
    //   "utf-8"
    // );

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "onetruestory001@gmail.com",
        pass: "dafd zueg bwrb ddlv",
      },
    });

    // Email options
    const mailOptions = {
      from: `onetruestory001@gmail.com`,
      to: toEmail,
      subject: "Email Subject",
      html: message,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    return { success: true };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error };
  }
}











