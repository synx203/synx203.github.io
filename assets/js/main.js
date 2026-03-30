(() => {
  document.documentElement.classList.add("js");

  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector("#site-nav");
  const revealItems = [...document.querySelectorAll(".reveal")];
  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  const yearNode = document.querySelector("[data-year]");
  const fallbackImages = [...document.querySelectorAll("img[data-fallback]")];
  const videoGates = [...document.querySelectorAll(".video-frame .video-gate")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      const next = String(!isOpen);
      navToggle.setAttribute("aria-expanded", next);
      siteNav.setAttribute("data-open", next);
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navToggle.setAttribute("aria-expanded", "false");
        siteNav.setAttribute("data-open", "false");
      });
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
      { threshold: 0.18, rootMargin: "0px 0px -5% 0px" }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (!reduceMotion && parallaxItems.length) {
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

    const onScroll = () => window.requestAnimationFrame(updateParallax);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateParallax);
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

    gate.addEventListener("click", () => {
      iframe.setAttribute("src", source);
      frame.setAttribute("data-loaded", "true");
    }, { once: true });
  });

})();
