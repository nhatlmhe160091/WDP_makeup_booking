// lib/sendEmail.ts
import { EMAIL_NAME, MAIL_VERIFIED, RESEND_API_KEY } from "@quanlysanbong/constants/MainContent";
import { Resend } from "resend";

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: `${EMAIL_NAME} <${MAIL_VERIFIED}>`,
      to: [to],
      subject: subject,
      html: html
    });

    return { success: true, response };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
