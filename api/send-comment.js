/**
 * API serverless (Vercel): recebe POST JSON do formulário de comentários e envia e-mail via Resend.
 *
 * Variáveis de ambiente na Vercel:
 * - RESEND_API_KEY
 * - COMMENTS_EMAIL_TO        (destino: seu e-mail exclusivo do grimório)
 * - COMMENTS_EMAIL_FROM      (opcional; ex.: "Grimorio <notificacoes@seudominio.com>")
 * - COMMENTS_HOOK_SECRET     (opcional; se definido, o browser deve enviar o mesmo em X-Comment-Secret)
 *
 * @see docs/backend-comentarios.md
 */

function applyCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Comment-Secret");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export default async function handler(req, res) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var hookSecret = process.env.COMMENTS_HOOK_SECRET;
  var incomingSecret =
    req.headers["x-comment-secret"] ||
    req.headers["X-Comment-Secret"] ||
    "";
  if (hookSecret && incomingSecret !== hookSecret) {
    return res.status(403).json({ error: "Forbidden" });
  }

  var body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }

  var pageId = String((body && body.pageId) || "").slice(0, 120);
  var name = String((body && body.name) || "")
    .trim()
    .slice(0, 40);
  var text = String((body && body.text) || "")
    .trim()
    .slice(0, 500);
  var stars = Math.min(5, Math.max(0, parseInt(body && body.stars, 10) || 0));
  var pageUrl = String((body && body.pageUrl) || "").slice(0, 500);

  if (!pageId || !name || !text || stars < 1) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  var apiKey = process.env.RESEND_API_KEY;
  var to = process.env.COMMENTS_EMAIL_TO;
  var from =
    process.env.COMMENTS_EMAIL_FROM || "Grimorio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.error("send-comment: missing RESEND_API_KEY or COMMENTS_EMAIL_TO");
    return res.status(500).json({ error: "Server not configured" });
  }

  var subject = "[Os Sete Amaldiçoados] Comentário — " + pageId;
  var html =
    "<p><strong>Página:</strong> " +
    escapeHtml(pageId) +
    "</p>" +
    "<p><strong>URL:</strong> " +
    escapeHtml(pageUrl) +
    "</p>" +
    "<p><strong>Nome:</strong> " +
    escapeHtml(name) +
    "</p>" +
    "<p><strong>Estrelas:</strong> " +
    stars +
    "/5</p><hr/><p>" +
    escapeHtml(text).replace(/\n/g, "<br/>") +
    "</p>";

  var r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: from,
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!r.ok) {
    var errBody = await r.text().catch(function () {
      return "";
    });
    console.error("Resend error", r.status, errBody);
    return res.status(502).json({ error: "Email provider error" });
  }

  return res.status(200).json({ ok: true });
}
