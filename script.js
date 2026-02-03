(function () {
  const hamburger = document.querySelector(".hamburger");
  const nav = document.querySelector("nav");
  const navLinks = document.querySelector(".nav-links");
  const form = document.getElementById("appointmentForm");
  const success = document.getElementById("formSuccess");
  const yearEl = document.getElementById("year");

  // PWA: register service worker (requires http(s) or localhost)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("./sw.js")
        .then(function (registration) {
          console.log("Service Worker registered successfully:", registration.scope);
          
          // Check for updates periodically
          setInterval(function () {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour
          
          // Handle updates
          registration.addEventListener("updatefound", function () {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", function () {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New service worker available, reload to activate
                  console.log("New service worker available. Reloading...");
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch(function (error) {
          console.error("Service Worker registration failed:", error);
        });
    });
    
    // Listen for service worker controller changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
  
  // PWA: Handle install prompt
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    // You can show a custom install button here if desired
    // For now, we'll let the browser handle it automatically
  });

  // Hero gallery -> swap main hero image (scoped to HERO section only)
  const heroMediaRoot = document.querySelector(".section--hero .hero-media");
  const heroFrame = heroMediaRoot ? heroMediaRoot.querySelector(".hero-media-frame") : null;
  let heroFrameImg = heroFrame ? heroFrame.querySelector("img") : null;
  const heroGallery = heroMediaRoot ? heroMediaRoot.querySelector(".hero-gallery") : null;

  function setActiveThumb(activeImg) {
    if (!heroGallery) return;
    heroGallery.querySelectorAll("img").forEach(function (img) {
      img.classList.toggle("is-active", img === activeImg);
    });
  }

  function normalizeSrc(src) {
    try {
      return new URL(src, window.location.href).pathname;
    } catch {
      return String(src || "");
    }
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
    // Initial active state based on current hero src (robust to %20 vs spaces)
    const initialSrc = heroFrameImg.getAttribute("src") || "";
    const initialNorm = normalizeSrc(initialSrc);
    let initialThumb = null;
    heroGallery.querySelectorAll("img").forEach(function (img) {
      if (normalizeSrc(img.getAttribute("src") || "") === initialNorm) {
        initialThumb = img;
      }
    });
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

    // Auto-rotate hero image every 5 minutes (pauses on hover / tab hidden)
    const HERO_ROTATE_MS = 4500;
    let heroPaused = false;
    let heroTimer = null;

    function getThumbs() {
      return Array.from(heroGallery.querySelectorAll("img"));
    }

    function getActiveIndex(thumbs) {
      const current = heroFrameImg ? heroFrameImg.getAttribute("src") || "" : "";
      const currentNorm = normalizeSrc(current);
      const idx = thumbs.findIndex(function (t) {
        return normalizeSrc(t.getAttribute("src") || "") === currentNorm;
      });
      return idx >= 0 ? idx : 0;
    }

    function tickHero() {
      if (heroPaused || document.hidden) return;
      const thumbs = getThumbs();
      if (thumbs.length <= 1) return;
      const nextIdx = (getActiveIndex(thumbs) + 1) % thumbs.length;
      const thumb = thumbs[nextIdx];
      swapHeroImage(thumb.getAttribute("src"), thumb);
    }

    function startHeroTimer() {
      if (heroTimer || getThumbs().length <= 1) return;
      heroTimer = window.setInterval(tickHero, HERO_ROTATE_MS);
    }

    function stopHeroTimer() {
      if (!heroTimer) return;
      window.clearInterval(heroTimer);
      heroTimer = null;
    }

    if (heroMediaRoot) {
      heroMediaRoot.addEventListener("mouseenter", function () {
        heroPaused = true;
      });
      heroMediaRoot.addEventListener("mouseleave", function () {
        heroPaused = false;
      });
      heroMediaRoot.addEventListener("focusin", function () {
        heroPaused = true;
      });
      heroMediaRoot.addEventListener("focusout", function () {
        heroPaused = false;
      });
    }

    document.addEventListener("visibilitychange", function () {
      // When coming back, allow next tick to run on schedule
      if (!document.hidden) heroPaused = false;
    });

    startHeroTimer();
  }

  // About section gallery -> auto-rotate clinic gallery images
  const aboutMediaRoot = document.querySelector(".hero-media--compact");
  const aboutFrame = aboutMediaRoot ? aboutMediaRoot.querySelector(".hero-media-frame") : null;
  let aboutFrameImg = aboutFrame ? aboutFrame.querySelector("img") : null;
  const aboutGallery = aboutMediaRoot ? aboutMediaRoot.querySelector(".hero-gallery") : null;

  function swapAboutImage(nextSrc, activeThumb) {
    if (!aboutFrame || !aboutFrameImg || !nextSrc) return;
    const currentSrc = aboutFrameImg.getAttribute("src");
    if (currentSrc === nextSrc) {
      if (activeThumb) {
        aboutGallery.querySelectorAll("img").forEach(function (img) {
          img.classList.remove("is-active");
        });
        activeThumb.classList.add("is-active");
      }
      return;
    }

    const newImg = new Image();
    newImg.decoding = "async";
    newImg.loading = "eager";
    newImg.src = nextSrc;

    newImg.onload = function () {
      const nextEl = document.createElement("img");
      nextEl.setAttribute("src", nextSrc);
      nextEl.setAttribute("alt", "");
      nextEl.setAttribute("decoding", "async");
      nextEl.setAttribute("loading", "eager");
      nextEl.classList.add("is-top", "is-fade-in");

      aboutFrame.appendChild(nextEl);

      const prevEl = aboutFrameImg;
      prevEl.classList.add("is-fade-out");

      requestAnimationFrame(function () {
        nextEl.classList.remove("is-fade-in");
      });

      const cleanup = function () {
        prevEl.removeEventListener("transitionend", cleanup);
        if (prevEl.parentNode) prevEl.parentNode.removeChild(prevEl);
        nextEl.classList.remove("is-top");
        aboutFrameImg = nextEl;
      };

      prevEl.addEventListener("transitionend", cleanup);

      if (activeThumb) {
        aboutGallery.querySelectorAll("img").forEach(function (img) {
          img.classList.remove("is-active");
        });
        activeThumb.classList.add("is-active");
      }
    };

    newImg.onerror = function () {
      // no-op
    };
  }

  if (aboutGallery && aboutFrameImg) {
    // Initial active state
    const initialSrc = aboutFrameImg.getAttribute("src") || "";
    const initialNorm = normalizeSrc(initialSrc);
    let initialThumb = null;
    aboutGallery.querySelectorAll("img").forEach(function (img) {
      if (normalizeSrc(img.getAttribute("src") || "") === initialNorm) {
        initialThumb = img;
      }
    });
    
    // If current image doesn't match any gallery image, start with first gallery image after a brief delay
    if (!initialThumb && aboutGallery.querySelectorAll("img").length > 0) {
      initialThumb = aboutGallery.querySelectorAll("img")[0];
      setTimeout(function() {
        const firstGallerySrc = initialThumb.getAttribute("src");
        swapAboutImage(firstGallerySrc, initialThumb);
      }, 500);
    }
    
    if (initialThumb) {
      aboutGallery.querySelectorAll("img").forEach(function (img) {
        img.classList.remove("is-active");
      });
      initialThumb.classList.add("is-active");
    }

    // Click/keyboard handlers for manual navigation
    aboutGallery.querySelectorAll("img").forEach(function (thumb) {
      thumb.setAttribute("role", "button");
      thumb.setAttribute("tabindex", "0");
      thumb.addEventListener("click", function () {
        const nextSrc = thumb.getAttribute("src");
        // Pause auto-rotation temporarily when user clicks
        stopAboutTimer();
        swapAboutImage(nextSrc, thumb);
        // Resume auto-rotation after 3 seconds
        setTimeout(function() {
          startAboutTimer();
        }, 3000);
      });
      thumb.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const nextSrc = thumb.getAttribute("src");
          // Pause auto-rotation temporarily when user interacts
          stopAboutTimer();
          swapAboutImage(nextSrc, thumb);
          // Resume auto-rotation after 3 seconds
          setTimeout(function() {
            startAboutTimer();
          }, 3000);
        }
      });
    });

    // Auto-rotate about gallery images every 4.5 seconds
    const ABOUT_ROTATE_MS = 4500;
    let aboutPaused = false;
    let aboutTimer = null;

    function getAboutThumbs() {
      return Array.from(aboutGallery.querySelectorAll("img"));
    }

    function getAboutActiveIndex(thumbs) {
      const current = aboutFrameImg ? aboutFrameImg.getAttribute("src") || "" : "";
      const currentNorm = normalizeSrc(current);
      const idx = thumbs.findIndex(function (t) {
        return normalizeSrc(t.getAttribute("src") || "") === currentNorm;
      });
      return idx >= 0 ? idx : 0;
    }

    function tickAbout() {
      if (aboutPaused || document.hidden) return;
      const thumbs = getAboutThumbs();
      if (thumbs.length <= 1) return;
      const nextIdx = (getAboutActiveIndex(thumbs) + 1) % thumbs.length;
      const thumb = thumbs[nextIdx];
      swapAboutImage(thumb.getAttribute("src"), thumb);
    }

    function startAboutTimer() {
      if (aboutTimer || getAboutThumbs().length <= 1) return;
      aboutTimer = window.setInterval(tickAbout, ABOUT_ROTATE_MS);
    }

    function stopAboutTimer() {
      if (!aboutTimer) return;
      window.clearInterval(aboutTimer);
      aboutTimer = null;
    }

    // Pause on hover/focus
    if (aboutMediaRoot) {
      aboutMediaRoot.addEventListener("mouseenter", function () {
        aboutPaused = true;
      });
      aboutMediaRoot.addEventListener("mouseleave", function () {
        aboutPaused = false;
      });
      aboutMediaRoot.addEventListener("focusin", function () {
        aboutPaused = true;
      });
      aboutMediaRoot.addEventListener("focusout", function () {
        aboutPaused = false;
      });
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) aboutPaused = false;
    });

    startAboutTimer();
  }

  // Footer year
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Reviews slider (Google-style)
  const reviewStage = document.querySelector(".reviews-stage");
  const reviewCards = Array.from(document.querySelectorAll(".review-card"));
  const reviewDotsWrap = document.querySelector(".review-dots");
  const prevBtn = document.querySelector("[data-review-prev]");
  const nextBtn = document.querySelector("[data-review-next]");

  function setActiveReview(nextIndex) {
    if (!reviewCards.length) return;
    const total = reviewCards.length;
    const idx = (nextIndex + total) % total;
    reviewCards.forEach(function (card, i) {
      card.classList.toggle("is-active", i === idx);
    });
    if (reviewDotsWrap) {
      reviewDotsWrap.querySelectorAll(".review-dot").forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === idx);
      });
    }
    activeReviewIndex = idx;
  }

  let activeReviewIndex = 0;
  let reviewTimer = null;
  let reviewPaused = false;

  function startReviewTimer() {
    if (reviewTimer || reviewCards.length <= 1) return;
    reviewTimer = window.setInterval(function () {
      if (reviewPaused) return;
      setActiveReview(activeReviewIndex + 1);
    }, 4500);
  }

  function stopReviewTimer() {
    if (!reviewTimer) return;
    window.clearInterval(reviewTimer);
    reviewTimer = null;
  }

  if (reviewCards.length) {
    // Create dots
    if (reviewDotsWrap) {
      reviewDotsWrap.innerHTML = "";
      reviewCards.forEach(function (_card, i) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "review-dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("aria-label", "Go to review " + (i + 1));
        dot.addEventListener("click", function () {
          setActiveReview(i);
        });
        reviewDotsWrap.appendChild(dot);
      });
    }

    // Buttons
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        setActiveReview(activeReviewIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        setActiveReview(activeReviewIndex + 1);
      });
    }

    // Pause on hover/focus
    if (reviewStage) {
      reviewStage.addEventListener("mouseenter", function () {
        reviewPaused = true;
      });
      reviewStage.addEventListener("mouseleave", function () {
        reviewPaused = false;
      });
      reviewStage.addEventListener("focusin", function () {
        reviewPaused = true;
      });
      reviewStage.addEventListener("focusout", function () {
        reviewPaused = false;
      });
    }

    setActiveReview(0);
    startReviewTimer();
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

  // Auto-select service from URL parameter
  const serviceSelect = document.getElementById("service");
  function selectServiceFromURL() {
    if (!serviceSelect) return;
    
    // Get the hash from URL (e.g., #appointment?service=Hydra%20Facial%20%26%20Glow)
    const hash = window.location.hash;
    if (!hash || !hash.includes("service=")) return;
    
    // Extract service parameter from hash
    const hashParts = hash.split("?");
    if (hashParts.length < 2) return;
    
    try {
      const params = new URLSearchParams(hashParts[1]);
      const serviceName = params.get("service");
      
      if (serviceName) {
        // Decode the service name
        const decodedService = decodeURIComponent(serviceName.replace(/\+/g, " "));
        
        // Try to find exact match in options
        const options = serviceSelect.querySelectorAll("option");
        for (let i = 0; i < options.length; i++) {
          const optionValue = options[i].value;
          const optionText = options[i].textContent.trim();
          
          // Match by value or text content
          if (optionValue === decodedService || optionText === decodedService) {
            serviceSelect.value = optionValue;
            
            // Scroll to appointment section smoothly after a brief delay
            setTimeout(function() {
              const appointmentSection = document.getElementById("appointment");
              if (appointmentSection) {
                const headerOffset = 100;
                const elementPosition = appointmentSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                  top: offsetPosition,
                  behavior: "smooth"
                });
              }
            }, 150);
            break;
          }
        }
      }
    } catch (e) {
      // Silently fail if URL parsing fails
      console.error("Error parsing service from URL:", e);
    }
  }

  // Run on page load (with delay to ensure DOM is ready)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", selectServiceFromURL);
  } else {
    // DOM is already ready
    setTimeout(selectServiceFromURL, 100);
  }

  // Also run when hash changes (for same-page navigation)
  window.addEventListener("hashchange", function() {
    setTimeout(selectServiceFromURL, 100);
  });

  // Handle Book Now button clicks with data-service attribute
  document.querySelectorAll('a[href^="#appointment"][data-service]').forEach(function(link) {
    link.addEventListener("click", function(e) {
      const serviceName = this.getAttribute("data-service");
      if (serviceName && serviceSelect) {
        // Set the service immediately
        const options = serviceSelect.querySelectorAll("option");
        for (let i = 0; i < options.length; i++) {
          if (options[i].value === serviceName || options[i].textContent.trim() === serviceName) {
            serviceSelect.value = options[i].value;
            break;
          }
        }
      }
    });
  });

  // EmailJS Configuration - Replace with your actual keys
  const EMAILJS_CONFIG = {
    PUBLIC_KEY: "gFI-rk8wvwAWAW_nM", // Replace with your EmailJS Public Key
    SERVICE_ID: "service_uk38hjn", // Replace with your EmailJS Service ID
    TEMPLATE_ID_CLINIC: "template_hk1l74j", // Template for clinic notification
    TEMPLATE_ID_USER: "template_nyze7h7" // Template for user confirmation
  };

  // Initialize EmailJS
  if (typeof emailjs !== "undefined") {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }

  // Appointment form validation + EmailJS integration
  if (form && success) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;

      // Remove previous error states
      form.querySelectorAll(".field-error").forEach(function (field) {
        field.classList.remove("field-error");
      });

      // Validate required fields
      form.querySelectorAll("input[required]").forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.classList.add("field-error");
        }
      });

      // Validate email format
      const emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
          valid = false;
          emailField.classList.add("field-error");
        }
      }

      // Validate service selection
      if (serviceSelect && !serviceSelect.value) {
        valid = false;
        serviceSelect.classList.add("field-error");
      }

      if (!valid) {
        const firstError = form.querySelector(".field-error");
        if (firstError) {
          firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Disable submit button to prevent double submission
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      // Collect form data (parameter names must match EmailJS templates: name, email, phone, service, date, time, message)
      const timeSelect = form.querySelector("#time");
      const formData = {
        name: form.querySelector("#name").value.trim(),
        email: form.querySelector("#email").value.trim(),
        phone: form.querySelector("#phone").value.trim(),
        service: serviceSelect ? serviceSelect.value : "",
        date: form.querySelector("#date").value || "Not specified",
        time: timeSelect && timeSelect.value ? timeSelect.value : "Not specified",
        message: form.querySelector("#message").value.trim() || "No additional message"
      };

      // Check required EmailJS keys (Public Key and Service ID must be your real values from dashboard)
      const hasPublicKey = EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== "gFI-rk8wvwAWAW_nM";
      const hasServiceId = EMAILJS_CONFIG.SERVICE_ID && EMAILJS_CONFIG.SERVICE_ID !== "service_uk38hjn";
      const hasClinicTemplate = EMAILJS_CONFIG.TEMPLATE_ID_CLINIC && EMAILJS_CONFIG.TEMPLATE_ID_CLINIC !== "template_hk1l74j";
      const hasUserTemplate = EMAILJS_CONFIG.TEMPLATE_ID_USER && EMAILJS_CONFIG.TEMPLATE_ID_USER !== "template_nyze7h7";

      if (!hasPublicKey || !hasServiceId || !hasClinicTemplate) {
        console.warn("EmailJS: Set PUBLIC_KEY, SERVICE_ID, and TEMPLATE_ID_CLINIC in script.js (from EmailJS dashboard).");
        success.hidden = false;
        success.textContent = "Form is not connected to email yet. We'll contact you shortly at " + formData.email + ".";
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        return;
      }

      if (typeof emailjs === "undefined") {
        console.error("EmailJS SDK not loaded. Check the script tag in index.html.");
        success.hidden = false;
        success.textContent = "Your request has been received. We'll contact you shortly at " + formData.email + ".";
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        return;
      }

      // Send email to clinic (IvoryAppointmentReply: name, email, phone, service, date, time, message)
      const clinicParams = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: formData.service,
        date: formData.date,
        time: formData.time,
        message: formData.message
      };
      const clinicEmailPromise = emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID_CLINIC,
        clinicParams
      );

      // Optionally send confirmation to user (Appointment Reply: name, service, date, time; To Email uses {{email}} in template)
      const userParams = {
        name: formData.name,
        email: formData.email,
        service: formData.service,
        date: formData.date,
        time: formData.time
      };
      const promises = [clinicEmailPromise];
      if (hasUserTemplate) {
        promises.push(
          emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID_USER, userParams)
        );
      }

      // Handle email sending
      Promise.all(promises)
        .then(function (responses) {
          console.log("EmailJS sent successfully:", responses.length, "email(s)");
          success.hidden = false;
          success.textContent = hasUserTemplate
            ? "Your appointment request has been submitted successfully. We've sent a confirmation email to " + formData.email + ". We'll contact you shortly."
            : "Your appointment request has been submitted successfully. We'll contact you shortly at " + formData.email + ".";
          form.reset();
          success.scrollIntoView({ behavior: "smooth", block: "center" });
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        })
        .catch(function (error) {
          console.error("EmailJS send failed:", error);
          if (error && error.text) console.error("EmailJS error text:", error.text);
          success.hidden = false;
          success.textContent = "Your appointment request has been received. We'll contact you shortly at " + formData.email + ".";
          form.reset();
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
  }
})();


