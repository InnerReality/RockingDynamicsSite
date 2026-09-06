(() => {
  const key = "rocking-dynamics-theme";
  const root = document.documentElement;
  const system = window.matchMedia("(prefers-color-scheme: dark)");

  function preferredTheme() {
    const saved = localStorage.getItem(key);
    return saved === "light" || saved === "dark" ? saved : (system.matches ? "dark" : "light");
  }

  function apply(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      const next = theme === "dark" ? "light" : "dark";
      button.innerHTML = `<svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17V3.5Z" fill="currentColor"/></svg>`;
      button.setAttribute("aria-label", `Switch to ${next} mode`);
      button.setAttribute("title", `Switch to ${next} mode`);
    });
  }

  apply(preferredTheme());

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = root.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem(key, next);
        apply(next);
      });
    });

    system.addEventListener("change", (event) => {
      if (!localStorage.getItem(key)) apply(event.matches ? "dark" : "light");
    });
  });
})();
