(() => {
  const root = document.documentElement;
  root.classList.add("js");

  const siteHeader = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const staggerGroups = [...document.querySelectorAll("[data-stagger]")];
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  const yearNode = document.querySelector("[data-year]");
  const fallbackImages = [...document.querySelectorAll("img[data-fallback]")];
  const videoGates = [...document.querySelectorAll(".video-frame .video-gate")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktopNavBreakpoint = 912;

  const closeNav = () => {
    if (!navToggle || !siteNav) {
      return;
    }

    navToggle.setAttribute("aria-expanded", "false");
    siteNav.setAttribute("data-open", "false");
  };

  const syncHeader = () => {
    if (!siteHeader) {
      return;
    }

    siteHeader.setAttribute("data-scrolled", String(window.scrollY > 12));
  };

  const setRevealDelays = () => {
    staggerGroups.forEach((group) => {
      const step = Number(group.getAttribute("data-stagger")) || 100;
      [...group.children]
        .filter((child) => child.classList.contains("reveal"))
        .forEach((item, index) => {
          if (!item.hasAttribute("data-delay")) {
            item.style.setProperty("--reveal-delay", `${index * step}ms`);
          }
        });
    });

    revealItems.forEach((item) => {
      const delay = item.getAttribute("data-delay");
      if (delay !== null) {
        item.style.setProperty("--reveal-delay", `${Number(delay) || 0}ms`);
      }
    });
  };

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  setRevealDelays();
  syncHeader();

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      const next = String(!isOpen);
      navToggle.setAttribute("aria-expanded", next);
      siteNav.setAttribute("data-open", next);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      const navIsOpen = siteNav.getAttribute("data-open") === "true";
      if (navIsOpen && !siteNav.contains(target) && !navToggle.contains(target)) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > desktopNavBreakpoint) {
        closeNav();
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            instance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (!reduceMotion && parallaxItems.length) {
    let animationFrame = 0;

    const updateParallax = () => {
      const vpHeight = window.innerHeight || document.documentElement.clientHeight;

      parallaxItems.forEach((node) => {
        const amount = Number(node.getAttribute("data-parallax")) || 12;
        const rect = node.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - vpHeight / 2) / vpHeight;
        const translateY = Math.max(-amount, Math.min(amount, offset * amount));
        node.style.setProperty("--parallax-y", `${translateY.toFixed(2)}px`);
      });
    };

    const requestParallax = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        updateParallax();
      });
    };

    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", updateParallax);
    window.addEventListener("load", updateParallax);
    updateParallax();
  }

  fallbackImages.forEach((image) => {
    const fallbackSrc = image.getAttribute("data-fallback");
    if (!fallbackSrc) {
      return;
    }

    image.addEventListener(
      "error",
      () => {
        if (image.getAttribute("src") !== fallbackSrc) {
          image.setAttribute("src", fallbackSrc);
        }
      },
      { once: true }
    );
  });

  videoGates.forEach((gate) => {
    const frame = gate.closest(".video-frame");
    const iframe = frame?.querySelector("iframe.tiktok-iframe[data-src]");
    const source = iframe?.getAttribute("data-src");
    const thumb = frame?.getAttribute("data-thumb");

    if (!frame || !iframe || !source) {
      return;
    }

    if (thumb) {
      frame.style.setProperty("--video-thumb", `url("${thumb}")`);
    }

    gate.addEventListener(
      "click",
      () => {
        iframe.setAttribute("src", source);
        frame.setAttribute("data-loaded", "true");
      },
      { once: true }
    );
  });

  window.addEventListener("scroll", syncHeader, { passive: true });
})();
