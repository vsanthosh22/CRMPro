(function () {
  "use strict";

  const STORAGE_KEY = "crm-theme";
  const DEFAULT     = "dark";

  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return DEFAULT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-bs-theme", theme);

    const btn = document.getElementById("crm-theme-btn");
    if (btn) {
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
      btn.setAttribute("aria-pressed", theme === "dark" ? "false" : "true");
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-bs-theme") || DEFAULT;
    const next    = current === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);

    const liveEl = document.getElementById("crm-live-polite");
    if (liveEl) {
      liveEl.textContent = "";
      requestAnimationFrame(() => {
        liveEl.textContent = next === "dark" ? "Dark theme enabled." : "Light theme enabled.";
      });
    }
  }

  applyTheme(getSavedTheme());

  function attachToggle() {
    const btn = document.getElementById("crm-theme-btn");
    if (!btn) return;
    applyTheme(document.documentElement.getAttribute("data-bs-theme") || DEFAULT);
    btn.addEventListener("click", toggleTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachToggle);
  } else {
    attachToggle();
  }
  window.CRMTheme = { toggle: toggleTheme, apply: applyTheme };
})();
