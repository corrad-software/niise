import nodemailer from "nodemailer";

export const createTransporter = () => {
  const config = useRuntimeConfig();

  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure === "true",
    auth: {
      user: config.mail.user,
      pass: config.mail.password,
    },
  });
};

export const sendMail = async ({
  to,
  subject,
  text,
  html,
  attachments = [],
}) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: useRuntimeConfig().mail.user,
      to,
      subject,
      text,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Mail sending failed:", error);
    return { success: false, error: error.message };
  }
};

// Usage example:
/*
await sendMail({
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Plain text version',
  html: '<h1>HTML version</h1>',
  attachments: [
    {
      filename: 'text1.txt',
      content: 'hello world!'
    }
  ]
})
*/
