(function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");
  const navLinks = document.querySelector(".nav-links");
  const form = document.getElementById("appointmentForm");
  const success = document.getElementById("formSuccess");
  const yearEl = document.getElementById("year");

  // Hero gallery -> swap main hero image
  const heroFrame = document.querySelector(".hero-media-frame");
  let heroFrameImg = heroFrame ? heroFrame.querySelector("img") : null;
  const heroGallery = document.querySelector(".hero-gallery");

  function setActiveThumb(activeImg) {
    if (!heroGallery) return;
    heroGallery.querySelectorAll("img").forEach(function (img) {
      img.classList.toggle("is-active", img === activeImg);
    });
  }

  function swapHeroImage(nextSrc, activeThumb) {
    if (!heroFrame || !heroFrameImg || !nextSrc) return;
    const currentSrc = heroFrameImg.getAttribute("src");
    if (currentSrc === nextSrc) {
      if (activeThumb) setActiveThumb(activeThumb);
      return;
    }

    const newImg = new Image();
    newImg.decoding = "async";
    newImg.loading = "eager";
    newImg.src = nextSrc;

    newImg.onload = function () {
      // Crossfade: keep old visible, fade new in on top, then remove old
      const nextEl = document.createElement("img");
      nextEl.setAttribute("src", nextSrc);
      nextEl.setAttribute("alt", "");
      nextEl.setAttribute("decoding", "async");
      nextEl.setAttribute("loading", "eager");
      nextEl.classList.add("is-top", "is-fade-in");

      heroFrame.appendChild(nextEl);

      const prevEl = heroFrameImg;
      prevEl.classList.add("is-fade-out");

      // Trigger transition
      requestAnimationFrame(function () {
        nextEl.classList.remove("is-fade-in");
      });

      const cleanup = function () {
        prevEl.removeEventListener("transitionend", cleanup);
        if (prevEl.parentNode) prevEl.parentNode.removeChild(prevEl);
        nextEl.classList.remove("is-top");
        heroFrameImg = nextEl;
      };

      prevEl.addEventListener("transitionend", cleanup);

      if (activeThumb) setActiveThumb(activeThumb);
    };

    newImg.onerror = function () {
      // no-op
    };
  }

  if (heroGallery && heroFrameImg) {
    // Initial active state based on current hero src
    const initialSrc = heroFrameImg.getAttribute("src");
    const initialThumb = heroGallery.querySelector('img[src="' + initialSrc + '"]');
    if (initialThumb) setActiveThumb(initialThumb);

    heroGallery.querySelectorAll("img").forEach(function (thumb) {
      thumb.setAttribute("role", "button");
      thumb.setAttribute("tabindex", "0");
      thumb.addEventListener("click", function () {
        const nextSrc = thumb.getAttribute("src");
        swapHeroImage(nextSrc, thumb);
      });
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const nextSrc = thumb.getAttribute("src");
          swapHeroImage(nextSrc, thumb);
        }
      });
    });
  }

  // Footer year
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setNavOpen(nextOpen) {
    if (!hamburger || !nav) return;
    nav.classList.toggle("nav-open", nextOpen);
    hamburger.setAttribute("aria-expanded", String(nextOpen));
    document.body.classList.toggle("nav-lock", nextOpen);
  }

  function isNavOpen() {
    return !!(nav && nav.classList.contains("nav-open"));
  }

  // Toggle mobile navigation
  if (hamburger && nav) {
    hamburger.addEventListener("click", function (e) {
      e.stopPropagation();
      setNavOpen(!isNavOpen());
    });
  }

  // Close when clicking a link
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setNavOpen(false);
      });
    });
  }

  // Close when clicking outside nav (or on backdrop)
  document.addEventListener("click", function (e) {
    if (!isNavOpen() || !nav) return;
    const target = e.target;
    if (target instanceof Node && nav.contains(target)) return;
    setNavOpen(false);
  });

  // Close on ESC
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isNavOpen()) {
      setNavOpen(false);
    }
  });

  // Appointment form validation + success feedback
  if (form && success) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll("input[required]").forEach(function (field) {
        field.classList.remove("field-error");
        if (!field.value) {
          valid = false;
          field.classList.add("field-error");
        }
      });

      if (!valid) {
        const firstError = form.querySelector(".field-error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }

      // Backend API call would be placed here.
      success.hidden = false;
      form.reset();
    });
  }
})();


