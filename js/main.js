/**
 * Tema, fonte, lista de capítulos, atualizações e anotações (dados em js/catalog.js), progresso de leitura.
 */
(function () {
  "use strict";

  var CHAPTER_DIR = "pages/capitulos/";
  var caps = (window.CATALOGO && window.CATALOGO.capitulos) || [];

  var LS_THEME = "sete_theme";
  var LS_FONT = "sete_font_size";
  var LS_READ = "sete_read_hrefs";
  var LS_LAST = "sete_last_read";

  function canonicalChapterHref(file) {
    return CHAPTER_DIR + file;
  }

  function chapterLinkPrefix() {
    var raw = document.body.getAttribute("data-chapter-base");
    return raw !== null ? raw : CHAPTER_DIR;
  }

  function migrateLegacyChapterPaths() {
    try {
      var map = {
        "pages/cap-01.html": canonicalChapterHref("cap-01.html"),
        "pages/cap-02.html": canonicalChapterHref("cap-02.html"),
      };
      var raw = localStorage.getItem(LS_READ);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      localStorage.setItem(LS_READ, JSON.stringify(arr.map(function (h) { return map[h] || h; })));
      var lastRaw = localStorage.getItem(LS_LAST);
      if (!lastRaw) return;
      var last = JSON.parse(lastRaw);
      if (last && map[last.href]) {
        last.href = map[last.href];
        localStorage.setItem(LS_LAST, JSON.stringify(last));
      }
    } catch (_) {}
  }

  function getReadSet() {
    try {
      var raw = localStorage.getItem(LS_READ);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? new Set(arr) : new Set();
    } catch {
      return new Set();
    }
  }

  function saveReadSet(set) {
    localStorage.setItem(LS_READ, JSON.stringify(Array.from(set)));
  }

  function markRead(title, canonicalHref) {
    var set = getReadSet();
    set.add(canonicalHref);
    saveReadSet(set);
    localStorage.setItem(LS_LAST, JSON.stringify({ title: title, href: canonicalHref }));
  }

  function getLastRead() {
    try {
      var raw = localStorage.getItem(LS_LAST);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function escapeHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderChapters() {
    var ul = document.getElementById("chapter-list");
    if (!ul) return;
    var read = getReadSet();
    ul.innerHTML = "";
    var linkPrefix = chapterLinkPrefix();
    caps.forEach(function (ch) {
      var li = document.createElement("li");
      var isBreve = ch.status === "breve";
      var canonical = canonicalChapterHref(ch.file);
      var wasRead = read.has(canonical);
      var a = document.createElement("a");
      a.className = "chapter-link" + (isBreve ? " disabled" : "");
      var href = isBreve ? "#" : linkPrefix + ch.file;
      a.href = href;
      if (!isBreve) {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          markRead(ch.title, canonical);
          window.location.href = href;
        });
      }
      var rowTop = document.createElement("div");
      rowTop.className = "row-top";
      rowTop.innerHTML =
        '<span class="num">' + escapeHtml(ch.num) + '</span><span class="ctitle">' + escapeHtml(ch.title) + "</span>";
      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = ch.meta;
      var badges = document.createElement("div");
      badges.className = "badges";
      if (isBreve) badges.innerHTML += '<span class="badge breve">em breve</span>';
      else if (wasRead) badges.innerHTML += '<span class="badge lido">lido</span>';
      else if (ch.status === "novo") badges.innerHTML += '<span class="badge novo">novo</span>';
      a.appendChild(rowTop);
      a.appendChild(meta);
      if (badges.innerHTML) a.appendChild(badges);
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  /** Monta a lista de atualizações */
  function renderAtualizacoes() {
    var root = document.getElementById("atualizacoes-root");
    var lista = window.CATALOGO && window.CATALOGO.atualizacoes;
    if (!root || !lista) return;
    root.innerHTML = "";
    var ul = document.createElement("ul");
    ul.className = "updates-list";
    lista.forEach(function (upd) {
      var li = document.createElement("li");
      li.className = "update-item";
      li.innerHTML =
        '<div class="update-meta">' +
        '<span class="update-date">' + escapeHtml(upd.data) + '</span>' +
        '<span class="update-time">' + escapeHtml(upd.horario) + '</span>' +
        '</div>' +
        '<p class="update-desc">' + escapeHtml(upd.descricao) + '</p>';
      ul.appendChild(li);
    });
    root.appendChild(ul);
  }

  /** Monta a lista de anotações */
  function renderAnotacoes() {
    var root = document.getElementById("anotacoes-root");
    var lista = window.CATALOGO && window.CATALOGO.anotacoes;
    if (!root || !lista) return;
    root.innerHTML = "";
    lista.forEach(function (anot) {
      var section = document.createElement("section");
      section.className = "note-item";
      section.innerHTML =
        '<h2>' + escapeHtml(anot.titulo) + '</h2>' +
        '<p>' + escapeHtml(anot.texto) + '</p>';
      root.appendChild(section);
    });
  }

  function checkContinue() {
    var card = document.getElementById("continue-card");
    if (!card) return;
    var last = getLastRead();
    if (!last || !last.title || !last.href) return;
    card.classList.add("visible");
    var titleEl = card.querySelector(".chapter-title");
    if (titleEl) titleEl.textContent = last.title;
  }

  function continueReading() {
    var last = getLastRead();
    if (last && last.href) window.location.href = last.href;
  }

  function changeFont(delta) {
    var root = document.documentElement;
    var current = parseInt(getComputedStyle(root).getPropertyValue("--font-size").trim(), 10);
    var base = Number.isFinite(current) ? current : 16;
    var next = Math.min(24, Math.max(13, base + delta));
    root.style.setProperty("--font-size", next + "px");
    localStorage.setItem(LS_FONT, String(next));
  }

  function applySavedFont() {
    var saved = localStorage.getItem(LS_FONT);
    var n = saved ? parseInt(saved, 10) : NaN;
    if (Number.isFinite(n) && n >= 13 && n <= 24) {
      document.documentElement.style.setProperty("--font-size", n + "px");
    }
  }

  function toggleTheme() {
    var html = document.documentElement;
    var next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
    html.setAttribute("data-theme", next);
    localStorage.setItem(LS_THEME, next);
    updateThemeButtonText();
  }

  function applySavedTheme() {
    var t = localStorage.getItem(LS_THEME);
    document.documentElement.setAttribute("data-theme", t === "light" || t === "dark" ? t : "dark");
  }

  function updateThemeButtonText() {
    var btn = document.getElementById("btn-theme");
    if (!btn) return;
    var theme = document.documentElement.getAttribute("data-theme");
    btn.textContent = theme === "light" ? "🌑 Modo Escuro" : "☀ Modo Claro";
  }

  function bindControls() {
    document.getElementById("btn-font-minus")?.addEventListener("click", function () { changeFont(-1); });
    document.getElementById("btn-font-plus")?.addEventListener("click", function () { changeFont(1); });
    document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);
    var cont = document.getElementById("continue-card");
    if (cont) {
      cont.addEventListener("click", continueReading);
      cont.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          continueReading();
        }
      });
    }
  }

  function init() {
    migrateLegacyChapterPaths();
    applySavedTheme();
    applySavedFont();
    updateThemeButtonText();
    bindControls();
    renderChapters();
    renderAtualizacoes();
    renderAnotacoes();
    checkContinue();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
