import { NextResponse } from "next/server";
import { site } from "@/data/site";

/**
 * Contact form endpoint.
 *
 * If RESEND_API_KEY is set (free tier at resend.com), messages are emailed to
 * CONTACT_TO_EMAIL (or the address in site.ts). Without a key it returns 503
 * and the form falls back to opening the visitor's mail app, so the form
 * always works — locally and on Vercel.
 */
export const runtime = "nodejs";

type Body = { name?: string; email?: string; message?: string; company?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this hidden field.
  if (body.company) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const message = (body.message ?? "").trim().slice(0, 5000);

  if (!name || !EMAIL_RE.test(email) || message.length < 10) {
    return NextResponse.json(
      { error: "Add your name, a valid email and a message of at least 10 characters." },
      { status: 422 },
    );
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Email delivery is not configured.", fallback: true }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [process.env.CONTACT_TO_EMAIL ?? site.email],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\n— ${name} <${email}>`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Couldn't send the message.", fallback: true }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
