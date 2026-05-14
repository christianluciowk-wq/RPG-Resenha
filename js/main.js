/**
 * Os Sete Amaldiçoados — lógica global (tema, fonte, capítulos, progresso).
 * Capítulos vivem em /pages/capitulos/; URLs canônicas usam sempre esse prefixo
 * para o cartão “Continuar lendo” e para marcar “lido” de qualquer página.
 */
(function () {
  "use strict";

  /** Prefixo fixo a partir da raiz do site (para localStorage e último capítulo). */
  const CHAPTER_DIR = "pages/capitulos/";

  /**
   * Cadastro único de capítulos. `file` é só o nome do arquivo dentro da pasta capitulos.
   * @type {{ num: string, title: string, meta: string, status: 'novo'|'breve', file: string }[]}
   */
  const CHAPTERS = [
    {
      num: "I",
      title: "Onde o silêncio tem dentes",
      meta: "Era da Fratura — Prólogo",
      status: "novo",
      file: "cap-01.html",
    },
    {
      num: "II",
      title: "Cartas na mesa do abismo",
      meta: "Era da Fratura — Arco do Pacto",
      status: "breve",
      file: "cap-02.html",
    },
  ];

  const LS_THEME = "sete_theme";
  const LS_FONT = "sete_font_size";
  const LS_READ = "sete_read_hrefs";
  const LS_LAST = "sete_last_read";

  /** href canônico usado em progresso / “lido” (sempre a partir da raiz do site). */
  function canonicalChapterHref(file) {
    return CHAPTER_DIR + file;
  }

  /**
   * Prefixo para links na lista atual: em `pages/capitulos/index.html` use `data-chapter-base=""`.
   * Em outras páginas, omita o atributo para cair no padrão `pages/capitulos/`.
   */
  function chapterLinkPrefix() {
    var raw = document.body.getAttribute("data-chapter-base");
    if (raw !== null) {
      return raw;
    }
    return CHAPTER_DIR;
  }

  /** Migra progresso antigo (antes da pasta `capitulos/`). */
  function migrateLegacyChapterPaths() {
    try {
      var map = {
        "pages/cap-01.html": canonicalChapterHref("cap-01.html"),
        "pages/cap-02.html": canonicalChapterHref("cap-02.html"),
      };
      var raw = localStorage.getItem(LS_READ);
      var arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return;
      var next = arr.map(function (h) {
        return map[h] || h;
      });
      localStorage.setItem(LS_READ, JSON.stringify(next));
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

  function markRead(index, title, canonicalHref) {
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

    CHAPTERS.forEach(function (ch, index) {
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
          markRead(index, ch.title, canonical);
          window.location.href = href;
        });
      }

      var rowTop = document.createElement("div");
      rowTop.className = "row-top";
      rowTop.innerHTML =
        '<span class="num">' +
        escapeHtml(ch.num) +
        '</span><span class="ctitle">' +
        escapeHtml(ch.title) +
        "</span>";

      var meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = ch.meta;

      var badges = document.createElement("div");
      badges.className = "badges";

      if (isBreve) {
        badges.innerHTML += '<span class="badge breve">em breve</span>';
      } else if (wasRead) {
        badges.innerHTML += '<span class="badge lido">lido</span>';
      } else if (ch.status === "novo") {
        badges.innerHTML += '<span class="badge novo">novo</span>';
      }

      a.appendChild(rowTop);
      a.appendChild(meta);
      if (badges.innerHTML) a.appendChild(badges);
      li.appendChild(a);
      ul.appendChild(li);
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
    card.dataset.href = last.href;
  }

  function continueReading() {
    var last = getLastRead();
    if (last && last.href) {
      window.location.href = last.href;
    }
  }

  function changeFont(delta) {
    var root = document.documentElement;
    var current = parseInt(
      getComputedStyle(root).getPropertyValue("--font-size").trim(),
      10
    );
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
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }

  function updateThemeButtonText() {
    var btn = document.getElementById("btn-theme");
    if (!btn) return;
    var theme = document.documentElement.getAttribute("data-theme");
    btn.textContent = theme === "light" ? "🌑 Modo Escuro" : "☀ Modo Claro";
  }

  function bindControls() {
    document.getElementById("btn-font-minus")?.addEventListener("click", function () {
      changeFont(-1);
    });
    document.getElementById("btn-font-plus")?.addEventListener("click", function () {
      changeFont(1);
    });
    document.getElementById("btn-theme")?.addEventListener("click", toggleTheme);

    var cont = document.getElementById("continue-card");
    if (cont) {
      cont.addEventListener("click", function () {
        continueReading();
      });
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
    checkContinue();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
