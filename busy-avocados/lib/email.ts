import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationCode(email: string, code: string, name: string) {
  await resend.emails.send({
    from: 'Busy Avocados <onboarding@resend.dev>',
    to: email,
    subject: `Your verification code: ${code}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h2 style="color: #2D5016; margin-bottom: 8px;">Hi ${name},</h2>
        <p style="color: #3D4F2C; font-size: 16px; line-height: 1.6;">
          Your verification code for Busy Avocados is:
        </p>
        <div style="background: #EAF5DA; border: 2px solid #A8D87A; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 36px; font-weight: bold; color: #2D5016; letter-spacing: 8px;">${code}</span>
        </div>
        <p style="color: #7A8F6A; font-size: 14px;">
          This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendContactNotification(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}) {
  const recipientEmail = process.env.CONTACT_EMAIL || 'anna@busyavocados.com.au';

  await resend.emails.send({
    from: 'Busy Avocados Website <onboarding@resend.dev>',
    to: recipientEmail,
    subject: `New enquiry from ${data.firstName} ${data.lastName}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px;">
        <h2 style="color: #2D5016;">New Contact Form Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #7A8F6A; width: 120px;">Name</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #1E2A14;">${data.firstName} ${data.lastName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #7A8F6A;">Email</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #1E2A14;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #7A8F6A;">Phone</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #D6E8C0; color: #1E2A14;">${data.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #7A8F6A; vertical-align: top;">Message</td>
            <td style="padding: 12px 0; color: #1E2A14; line-height: 1.6;">${data.message.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>
      </div>
    `,
  });
}
