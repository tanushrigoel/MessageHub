import { resend } from "@/lib/Resend";
import { ApiResponse } from "@/types/Apiresponse";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: `${email}`,
      subject: "Verification code",
      html: `<p>Congrats ${username} sending your <strong>first email with this code ${verifyCode}</strong>!</p>`,
    });
    return { success: true, message: "Email sent successfully" };
  } catch (emailError) {
    console.error("Error sending verification email", emailError);
    return { success: false, message: "Failed to send email" };
  }
}
