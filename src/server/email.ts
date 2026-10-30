import "server-only";
import { Resend } from "resend";
import { env } from "./env";

/** Escapes user-supplied text before it goes into email HTML. */
export function escapeHtml(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let client: Resend | null | undefined;
function resend() {
  if (client === undefined) client = env().RESEND_API_KEY ? new Resend(env().RESEND_API_KEY) : null;
  return client;
}

type Email = { to: string | string[]; subject: string; html: string; text: string };

/**
 * Never throws and never breaks a request. Without RESEND_API_KEY (local dev) the email is
 * printed to the terminal instead.
 */
export async function sendEmail(email: Email): Promise<void> {
  const to = (Array.isArray(email.to) ? email.to : [email.to]).filter(Boolean);
  if (!to.length) return;
  try {
    const r = resend();
    if (!r) {
      console.info(`\n[email:dev] To: ${to.join(", ")}\n[email:dev] Subject: ${email.subject}\n${email.text}\n`);
      return;
    }
    const { error } = await r.emails.send({
      from: env().EMAIL_FROM ?? "Doctraders <onboarding@resend.dev>",
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    if (error) console.error("[email] send failed:", error.message);
  } catch (e) {
    console.error("[email] send failed:", (e as Error).message);
  }
}

/**
 * Simple branded email. `rows` and `paragraphs` are plain text (escaped here).
 * Returns both HTML and a plain-text version.
 */
export function layout(opts: {
  title: string;
  paragraphs?: string[];
  rows?: [string, string | number | null | undefined][];
  button?: { label: string; url: string };
}): { html: string; text: string } {
  const p = (opts.paragraphs ?? []).map((t) => `<p style="margin:0 0 12px;color:#544e45;font-size:14px;line-height:1.5">${escapeHtml(t)}</p>`).join("");
  const rows = (opts.rows ?? []).filter(([, v]) => v !== undefined && v !== null && v !== "");
  const table = rows.length
    ? `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:14px">${rows
        .map(([k, v]) => `<tr><td style="padding:6px 0;color:#726b60;width:40%">${escapeHtml(k)}</td><td style="padding:6px 0;color:#1c1916;font-weight:600">${escapeHtml(v)}</td></tr>`)
        .join("")}</table>`
    : "";
  const button = opts.button
    ? `<p style="margin:20px 0 0"><a href="${escapeHtml(opts.button.url)}" style="display:inline-block;background:#a81c25;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:10px 18px;border-radius:8px">${escapeHtml(opts.button.label)}</a></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f7f4ef;font-family:Inter,Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
<p style="font-size:22px;font-weight:800;margin:0 0 16px;color:#1c1916">Doc<span style="color:#c8262f">traders</span></p>
<div style="background:#ffffff;border:1px solid #f0ece6;border-radius:12px;padding:24px">
<h1 style="margin:0 0 12px;font-size:18px;color:#1c1916">${escapeHtml(opts.title)}</h1>${p}${table}${button}
</div>
<p style="color:#9d9588;font-size:12px;margin:16px 0 0">You are receiving this because you have an account on Doctraders.</p>
</div></body></html>`;
  const text = [
    opts.title,
    "",
    ...(opts.paragraphs ?? []),
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(opts.button ? ["", `${opts.button.label}: ${opts.button.url}`] : []),
  ].join("\n");
  return { html, text };
}

export const appUrl = (path: string) => `${env().APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
