import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

const FROM = process.env.EMAIL_FROM ?? "Capacity Connect <noreply@capacityconnect.app>";
const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Reset your Capacity Connect password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0b101c;color:#e5e7eb;border-radius:16px">
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;color:#ffffff">Password Reset</h1>
        <p style="font-size:15px;color:#9ca3af;margin:0 0 24px">
          You requested a password reset for your Capacity Connect account.<br/>
          This link expires in <strong style="color:#a855f7">1 hour</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.05em">
          RESET PASSWORD
        </a>
        <p style="font-size:13px;color:#6b7280;margin-top:24px">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #1f2937;margin:24px 0"/>
        <p style="font-size:12px;color:#374151">Capacity Connect · Learning Platform</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;
  const transporter = getTransporter();

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Verify your Capacity Connect email",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0b101c;color:#e5e7eb;border-radius:16px">
        <h1 style="font-size:24px;font-weight:800;margin:0 0 8px;color:#ffffff">Verify your email</h1>
        <p style="font-size:15px;color:#9ca3af;margin:0 0 24px">
          Thanks for signing up for Capacity Connect! Please verify your email to activate your account.<br/>
          This link expires in <strong style="color:#a855f7">24 hours</strong>.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.05em">
          VERIFY EMAIL
        </a>
        <p style="font-size:13px;color:#6b7280;margin-top:24px">
          If you didn't sign up, you can safely ignore this email.
        </p>
        <hr style="border:none;border-top:1px solid #1f2937;margin:24px 0"/>
        <p style="font-size:12px;color:#374151">Capacity Connect · Learning Platform</p>
      </div>
    `,
  });
}

export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const transporter = getTransporter();
  const supportEmail = process.env.EMAIL_SUPPORT ?? FROM;

  await transporter.sendMail({
    from: FROM,
    to: supportEmail, // Send to the support inbox
    replyTo: email, // So hitting 'reply' replies to the user
    subject: `[Contact Form] ${subject}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#0b101c;color:#e5e7eb;border-radius:16px">
        <h1 style="font-size:20px;font-weight:800;margin:0 0 16px;color:#ffffff">New Contact Form Submission</h1>
        <p style="font-size:14px;color:#9ca3af;margin:0 0 8px"><strong>Name:</strong> ${name}</p>
        <p style="font-size:14px;color:#9ca3af;margin:0 0 8px"><strong>Email:</strong> ${email}</p>
        <p style="font-size:14px;color:#9ca3af;margin:0 0 24px"><strong>Subject:</strong> ${subject}</p>
        
        <div style="background:#1f2937;padding:16px;border-radius:8px;font-size:15px;color:#e5e7eb;white-space:pre-wrap;">
          ${message}
        </div>
        
        <hr style="border:none;border-top:1px solid #1f2937;margin:32px 0 24px"/>
        <p style="font-size:12px;color:#374151">Capacity Connect · Auto-generated message</p>
      </div>
    `,
  });
}
