/**
 * Configuração pública do site (lida no navegador).
 * Não coloque aqui API keys secretas — apenas URL pública do endpoint e, se usar, o mesmo “segredo”
 * que você configurou em COMMENTS_HOOK_SECRET na Vercel (opcional, contra spam).
 * @see docs/backend-comentarios.md
 */
window.__SITE_CONFIG__ = {
  /** Ex.: "https://seu-projeto.vercel.app/api/send-comment" — vazio = só localStorage */
  commentsApiUrl: "https://rpgresenha-b19oztnja-christian-lucio.vercel.app/api/send-comment",
  /** Opcional: mesmo valor da variável COMMENTS_HOOK_SECRET no servidor */
  commentsClientSecret: "",
};
