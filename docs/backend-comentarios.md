# Comentários por e-mail (backend na Vercel)

## Estrutura do repositório (após a reorganização)

| Caminho | Função |
|---------|--------|
| `index.html` | Entrada do grimório, navegação para capítulos/personagens/tópicos |
| `pages/capitulos/index.html` | Lista de capítulos (`main.js`, `data-chapter-base=""`) |
| `pages/capitulos/cap-*.html` | Leitura de cada capítulo + comentários |
| `pages/personagens/index.html` | Lista de personagens com links |
| `pages/personagens/*.html` | Ficha “procurado” + comentários |
| `pages/topicos.html` | Lore + comentários |
| `images/personagens/*.jpg` | Retratos do panfleto (substitua pelas suas artes) |
| `js/main.js` | Tema, fonte, array `CHAPTERS`, lista de capítulos, progresso |
| `js/site-config.js` | URL pública da API de comentários (e segredo opcional) |
| `js/comments.js` | Formulário, `localStorage`, POST para a API |
| `api/send-comment.js` | Serverless Vercel → e-mail via Resend |
| `docs/backend-comentarios.md` | Este guia |

Redirecionamentos legados: `pages/personagens.html` → `personagens/index.html`; `pages/cap-01.html` → `capitulos/cap-01.html`.

---

Este grimório é **HTML/CSS/JS estático**. Os comentários continuam aparecendo na página de cada leitor via **`localStorage`**. Para você receber uma **cópia por e-mail** em uma caixa dedicada, o projeto inclui uma **função serverless** em `api/send-comment.js`, pensada para deploy na **Vercel** com o serviço **Resend** (envio de e-mail transacional).

## Fluxo resumido

1. O leitor envia o formulário (`js/comments.js`).
2. O comentário é guardado no `localStorage` daquele navegador (como antes).
3. Se `commentsApiUrl` estiver preenchido em `js/site-config.js`, o mesmo payload é enviado em **POST** para a API.
4. A API (`api/send-comment.js`) monta um HTML simples e chama a API do **Resend**, que entrega no seu **`COMMENTS_EMAIL_TO`**.

## 1. Conta Resend e domínio

1. Crie conta em [https://resend.com](https://resend.com).
2. Gere uma **API Key** (`RESEND_API_KEY`).
3. Para produção, **verifique um domínio** e use um remetente real, por exemplo: `Grimorio <notificacoes@seudominio.com>`.
4. Para testes rápidos, a Resend permite enviar **apenas para o seu e-mail** usando o remetente de teste `onboarding@resend.dev` (veja a documentação atual da Resend para limites).

## 2. Projeto na Vercel

1. Conecte este repositório à Vercel (import Git).
2. Framework: **Other** (site estático na raiz; a pasta `api/` vira serverless automaticamente).
3. Em **Settings → Environment Variables**, adicione:

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `RESEND_API_KEY` | Sim | Chave da API Resend |
| `COMMENTS_EMAIL_TO` | Sim | E-mail onde você quer receber cada comentário |
| `COMMENTS_EMAIL_FROM` | Não | Remetente (deve ser permitido na Resend). Padrão: `Grimorio <onboarding@resend.dev>` |
| `COMMENTS_HOOK_SECRET` | Não | Se definido, o browser precisa enviar o **mesmo** valor no header `X-Comment-Secret` (configure também em `js/site-config.js` → `commentsClientSecret`) |

4. Faça deploy. A URL da função será algo como:  
   `https://<projeto>.vercel.app/api/send-comment`

## 3. Configuração no site (`js/site-config.js`)

Edite `js/site-config.js` (ou copie de `js/site-config.example.js`):

```javascript
window.__SITE_CONFIG__ = {
  commentsApiUrl: "https://<projeto>.vercel.app/api/send-comment",
  commentsClientSecret: "", // igual a COMMENTS_HOOK_SECRET, se usar
};
```

**CORS** está liberado com `Access-Control-Allow-Origin: *` para permitir POST a partir do GitHub Pages ou de outro host estático. Se quiser restringir, altere `api/send-comment.js` para refletir apenas o seu domínio.

## 4. GitHub Pages + API na Vercel

- O site pode ficar no **GitHub Pages** (`usuario.github.io/repo/`).
- A API fica na **Vercel**; em `site-config.js` use a **URL absoluta** da Vercel em `commentsApiUrl`.
- Não é necessário mover o grimório para a Vercel, só apontar a URL da API.

## 5. Segurança e spam

- O segredo `COMMENTS_HOOK_SECRET` **não impede** que alguém descubra o valor no JS minificado, mas **dificulta** bots genéricos que só disparam POST na URL.
- Para proteção forte, seria preciso **CAPTCHA** (Turnstile/reCAPTCHA) ou **auth** — fora do escopo deste arquivo; a API pode ser estendida depois.

## 6. Chaves do `localStorage` por página

O `js/comments.js` grava em `sete_comments_<pageId>`, onde `pageId` inclui a pasta:

- `personagens-alves`, `capitulos-cap-01`, `topicos`, etc.

Há migração automática das chaves antigas (`personagem-alves` → `personagens-alves`, `cap-01` → `capitulos-cap-01`).

## 7. Imagens dos “procurados”

Arquivos em `images/personagens/*.jpg` (ou `.png`). Os placeholders atuais podem ser substituídos por arte final; nomes esperados nos HTML:

- `alves.jpg`, `mira.jpg`, `arquivista.jpg`, `nomes-rasurados.jpg`

(Veja a tabela no início deste documento para a árvore completa de pastas.)
