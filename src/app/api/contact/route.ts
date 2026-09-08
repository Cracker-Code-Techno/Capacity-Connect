import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendContactEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    // Rate limit: 3 requests per 5 minutes to prevent spam
    const limitResult = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 5 * 60 * 1000 });

    if (!limitResult.success) {
      return NextResponse.json(
        { message: "Too many messages sent. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": "300",
            "X-RateLimit-Limit": limitResult.limit.toString(),
            "X-RateLimit-Remaining": limitResult.remaining.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Fire and forget email
    sendContactEmail(name, email, subject, message).catch((err) => {
      console.error("[CONTACT_FORM] Failed to send email:", err);
    });

    return NextResponse.json({ message: "Message sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("[CONTACT_FORM] Internal Error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
