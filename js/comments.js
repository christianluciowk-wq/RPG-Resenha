/**
 * Comentários: lista no localStorage por página + envio opcional ao autor via HTTP (Vercel + e-mail).
 * Ordem de scripts no HTML: `site-config.js` antes deste arquivo.
 * @see docs/backend-comentarios.md
 */
(function () {
  "use strict";

  /** Migra chaves antigas (paths de arquivos renomeados/movidos). */
  function migrateCommentStorageKeys() {
    try {
      var pairs = [
        ["sete_comments_personagem-alves", "sete_comments_personagens-alves"],
        ["sete_comments_personagem-mira", "sete_comments_personagens-mira"],
        ["sete_comments_personagem-arquivista", "sete_comments_personagens-arquivista"],
        [
          "sete_comments_personagem-nomes-rasurados",
          "sete_comments_personagens-nomes-rasurados",
        ],
        ["sete_comments_cap-01", "sete_comments_capitulos-cap-01"],
      ];
      for (var i = 0; i < pairs.length; i++) {
        var oldK = pairs[i][0];
        var newK = pairs[i][1];
        if (!localStorage.getItem(newK) && localStorage.getItem(oldK)) {
          localStorage.setItem(newK, localStorage.getItem(oldK));
        }
      }
    } catch (_) {}
  }

  migrateCommentStorageKeys();

  /**
   * Identificador estável da página para localStorage e para o assunto do e-mail.
   * Ex.: `personagens-alves`, `capitulos-cap-01`, `topicos`.
   */
  function getPageId() {
    var path = (window.location.pathname || "").replace(/\\/g, "/");
    var segments = path.split("/").filter(Boolean);
    var file = segments.length ? segments[segments.length - 1] : "index";
    var base = file.replace(/\.html$/i, "") || "index";
    var parent = segments.length > 1 ? segments[segments.length - 2] : "";
    if (parent === "personagens") {
      return "personagens-" + base;
    }
    if (parent === "capitulos") {
      return "capitulos-" + base;
    }
    return base;
  }

  function storageKey() {
    return "sete_comments_" + getPageId();
  }

  function loadComments() {
    try {
      var raw = localStorage.getItem(storageKey());
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveComments(list) {
    localStorage.setItem(storageKey(), JSON.stringify(list));
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /** Config vinda de `js/site-config.js` (`window.__SITE_CONFIG__`). */
  function getSiteConfig() {
    return window.__SITE_CONFIG__ || {};
  }

  /**
   * Envia uma cópia do comentário ao backend (e-mail). Sem URL configurada, não faz nada.
   * @param {{ name: string, text: string, stars: number, ts: number }} entry
   * @param {string} pageId
   * @returns {Promise<{ skipped?: boolean }>}
   */
  async function postCommentRemote(entry, pageId) {
    var cfg = getSiteConfig();
    var url = (cfg.commentsApiUrl || "").trim();
    if (!url) {
      return { skipped: true };
    }

    var headers = { "Content-Type": "application/json" };
    var secret = (cfg.commentsClientSecret || "").trim();
    if (secret) {
      headers["X-Comment-Secret"] = secret;
    }

    var res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        pageId: pageId,
        name: entry.name,
        text: entry.text,
        stars: entry.stars,
        ts: entry.ts,
        pageUrl: window.location.href,
      }),
    });

    if (!res.ok) {
      var errText = await res.text().catch(function () {
        return "";
      });
      throw new Error(errText || res.statusText);
    }
    return {};
  }

  var selectedStars = 0;

  function renderStarInputs(container) {
    container.innerHTML = "";
    for (var i = 1; i <= 5; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "star" + (i <= selectedStars ? " active" : "");
      b.dataset.value = String(i);
      b.setAttribute("aria-label", i + " estrelas");
      b.textContent = "★";
      b.addEventListener("click", function (ev) {
        var idx = parseInt(ev.currentTarget.dataset.value, 10);
        selectedStars = idx;
        updateStarVisual(container);
      });
      b.addEventListener("mouseenter", function (ev) {
        var idx = parseInt(ev.currentTarget.dataset.value, 10);
        highlightStars(container, idx);
      });
      container.appendChild(b);
    }
  }

  function highlightStars(container, upTo) {
    var buttons = container.querySelectorAll("button.star");
    buttons.forEach(function (btn, idx) {
      var v = idx + 1;
      btn.classList.toggle("active", v <= upTo);
    });
  }

  function updateStarVisual(container) {
    var buttons = container.querySelectorAll("button.star");
    buttons.forEach(function (btn, idx) {
      var v = idx + 1;
      btn.classList.toggle("active", v <= selectedStars);
    });
  }

  function renderCommentList(container) {
    var list = loadComments();
    container.innerHTML = "";
    if (list.length === 0) {
      var p = document.createElement("p");
      p.className = "text-muted";
      p.textContent = "Nenhum comentário ainda.";
      container.appendChild(p);
      return;
    }

    list.forEach(function (c) {
      var card = document.createElement("div");
      card.className = "comment-card";
      var n = Math.min(5, Math.max(0, c.stars || 0));
      var starsHtml = "";
      for (var i = 1; i <= 5; i++) {
        starsHtml +=
          i <= n
            ? '<span class="full">★</span>'
            : '<span class="empty">★</span>';
      }
      var dateStr =
        c.ts != null ? new Date(c.ts).toLocaleDateString("pt-BR") : "";
      card.innerHTML =
        '<div class="author">' +
        escapeHtml(c.name || "") +
        "</div>" +
        '<div class="stars">' +
        starsHtml +
        "</div>" +
        '<div class="body">' +
        escapeHtml(c.text || "") +
        "</div>" +
        '<div class="date">' +
        escapeHtml(dateStr) +
        "</div>";
      container.appendChild(card);
    });
  }

  function initComments() {
    var root = document.getElementById("comments-root");
    if (!root) return;

    var starRow = document.getElementById("comment-stars");
    var nameInput = document.getElementById("comment-name");
    var textInput = document.getElementById("comment-text");
    var listEl = document.getElementById("comment-list");
    var form = document.getElementById("comment-form");

    if (!starRow || !nameInput || !textInput || !listEl || !form) return;

    renderStarInputs(starRow);
    starRow.addEventListener("mouseleave", function () {
      updateStarVisual(starRow);
    });
    renderCommentList(listEl);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (nameInput.value || "").trim().slice(0, 40);
      var text = (textInput.value || "").trim().slice(0, 500);

      if (!name) {
        alert("Informe seu nome.");
        return;
      }
      if (!text) {
        alert("Escreva um comentário.");
        return;
      }
      if (selectedStars < 1) {
        alert("Selecione pelo menos uma estrela.");
        return;
      }

      var entry = {
        name: name,
        text: text,
        stars: selectedStars,
        ts: Date.now(),
      };

      var all = loadComments();
      all.unshift(entry);
      saveComments(all);

      nameInput.value = "";
      textInput.value = "";
      selectedStars = 0;
      updateStarVisual(starRow);
      renderCommentList(listEl);

      var pageId = getPageId();
      postCommentRemote(entry, pageId).catch(function () {
        alert(
          "O comentário foi salvo neste aparelho, mas o envio por e-mail ao autor falhou. " +
            "Confira a URL da API em js/site-config.js e o deploy descrito em docs/backend-comentarios.md."
        );
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComments);
  } else {
    initComments();
  }
})();
