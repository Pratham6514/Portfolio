(function () {
  const FILTERS = {
    ALL: "all",
  };

  let activeCategory = FILTERS.ALL;
  let searchQuery = "";
  let searchTimer = null;

  function getInitialTheme() {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch (error) {
      /* storage unavailable */
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    return "dark";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      const isDark = theme === "dark";
      toggle.setAttribute("aria-checked", isDark ? "true" : "false");
      toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* storage unavailable */
    }
  }

  function toggleTheme() {
    const current = document.documentElement.dataset.theme || getInitialTheme();
    applyTheme(current === "dark" ? "light" : "dark");
  }

  function enableThemeTransitions() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.documentElement.classList.add("theme-ready");
      });
    });
  }

  function initTheme() {
    applyTheme(document.documentElement.dataset.theme || getInitialTheme());
    const toggle = document.getElementById("theme-toggle");
    if (toggle) toggle.addEventListener("click", toggleTheme);
    enableThemeTransitions();
  }

  function initNav() {
    const toggle = document.getElementById("nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    const sections = ["about", "skills", "projects", "contact"]
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);

    const links = Array.from(nav.querySelectorAll("a"));

    function highlight() {
      const offset = window.scrollY + 90;
      let currentId = sections[0] ? sections[0].id : "";
      sections.forEach(function (section) {
        if (section.offsetTop <= offset) currentId = section.id;
      });
      links.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
      });
    }

    window.addEventListener("scroll", highlight, { passive: true });
    highlight();
  }

  function initProfileFallback() {
    const image = document.getElementById("profile-image");
    const fallback = document.getElementById("profile-fallback");
    if (!image || !fallback) return;
    image.addEventListener("error", function () {
      image.hidden = true;
      fallback.hidden = false;
    });
  }

  function initContactForm() {
    const form = document.getElementById("contact-form");
    const success = document.getElementById("form-success");
    if (!form) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const message = document.getElementById("contact-message").value.trim();
      const subject = encodeURIComponent("Portfolio message from " + name);
      const body = encodeURIComponent(message + "\n\nFrom: " + name + " <" + email + ">");
      window.location.href = "mailto:pancholi04360@gmail.com?subject=" + subject + "&body=" + body;
      if (success) success.hidden = false;
    });
  }

  function matchesSearch(project, query) {
    if (!query) return true;
    const haystack = [project.title, project.description, project.tag]
      .concat(project.technologies)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  }

  function matchesCategory(project, category) {
    if (category === FILTERS.ALL) return true;
    return project.categories.indexOf(category) !== -1;
  }

  function createIcon(pathD) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("aria-hidden", "true");
    pathD.forEach(function (d) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
    });
    return svg;
  }

  function createCard(project) {
    const article = document.createElement("article");
    article.className = "project-card";

    const tag = document.createElement("p");
    tag.className = "card-tag";
    tag.textContent = project.tag;

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const tech = document.createElement("div");
    tech.className = "tech-list";
    project.technologies.forEach(function (name) {
      const span = document.createElement("span");
      span.textContent = name;
      tech.appendChild(span);
    });

    const links = document.createElement("div");
    links.className = "card-links";

    const github = document.createElement("a");
    github.href = project.githubUrl;
    github.target = "_blank";
    github.rel = "noopener noreferrer";
    github.textContent = "GitHub";
    github.appendChild(
      createIcon([
        "M9 19c-4.3 1.4-4.3-2.1-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.2 2.8 5.1 3.1 5.1 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 3.7 9.5c0 4.6 2.7 5.7 5.5 6-.6.5-.6 1.2-.5 2V21",
      ])
    );
    links.appendChild(github);

    if (project.liveUrl !== null) {
      const live = document.createElement("a");
      live.href = project.liveUrl;
      live.target = "_blank";
      live.rel = "noopener noreferrer";
      live.textContent = "Live App ↗";
      links.appendChild(live);
    }

    article.append(tag, title, description, tech, links);
    return article;
  }

  function renderProjects() {
    const grid = document.getElementById("project-grid");
    const empty = document.getElementById("project-empty");
    const count = document.getElementById("project-count");
    if (!grid || typeof projects === "undefined") return;

    const filtered = projects.filter(function (project) {
      return matchesSearch(project, searchQuery) && matchesCategory(project, activeCategory);
    });

    grid.replaceChildren();
    filtered.forEach(function (project) {
      grid.appendChild(createCard(project));
    });

    if (empty) empty.hidden = filtered.length !== 0;
    if (count) {
      count.textContent =
        filtered.length === 1 ? "Showing 1 project" : "Showing " + filtered.length + " projects";
    }
  }

  function initProjectControls() {
    const search = document.getElementById("project-search");
    const chips = document.querySelectorAll(".chip");

    if (search) {
      search.addEventListener("input", function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          searchQuery = search.value.toLowerCase().trim();
          renderProjects();
        }, 150);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCategory = chip.getAttribute("data-filter") || FILTERS.ALL;
        chips.forEach(function (item) {
          const selected = item === chip;
          item.classList.toggle("is-active", selected);
          item.setAttribute("aria-pressed", String(selected));
        });
        renderProjects();
      });
    });

    renderProjects();
  }

  initTheme();
  initNav();
  initProfileFallback();
  initContactForm();
  initProjectControls();
})();
