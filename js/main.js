/* ==========================================================================
   IRFAN KHAN — PERSONAL PORTFOLIO JAVASCRIPT (ES6+)
   Theme Toggle, Navigation, Scroll Reveals, Project Filters & Contact Form
   ========================================================================== */

(() => {
    const savedTheme = localStorage.getItem("ik-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", initialTheme);
})();

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* -------------------- 1. LIGHT / DARK THEME TOGGLE -------------------- */
    const themeToggle = document.getElementById("theme-toggle");

    const syncThemeButton = (theme) => {
        if (!themeToggle) return;
        const isDark = theme === "dark";
        themeToggle.setAttribute("aria-pressed", String(isDark));
        themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
    };

    syncThemeButton(document.documentElement.getAttribute("data-theme") || "light");

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("ik-theme", next);
            syncThemeButton(next);
        });
    }

    /* -------------------- 2. HEADER SCROLL STATE -------------------- */
    const header = document.getElementById("site-header");

    const updateHeaderState = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 24);
    };

    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();

    /* -------------------- 3. MOBILE NAVIGATION -------------------- */
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");

    const closeMobileMenu = () => {
        if (!menuToggle || !navMenu) return;
        navMenu.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("is-open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
        });

        navMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("click", (event) => {
            if (
                navMenu.classList.contains("is-open") &&
                !navMenu.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMobileMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && navMenu.classList.contains("is-open")) {
                closeMobileMenu();
                menuToggle.focus();
            }
        });
    }

    /* -------------------- 4. SMOOTH ANCHOR SCROLLING -------------------- */
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            const targetId = anchor.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start"
            });
        });
    });

    /* -------------------- 5. SECTION REVEAL ANIMATIONS -------------------- */
    const revealTargets = document.querySelectorAll("[data-reveal]");

    if (revealTargets.length > 0 && !prefersReducedMotion && "IntersectionObserver" in window) {
        document.documentElement.classList.add("reveal-ready");

        document.querySelectorAll(".skills-grid, .services-grid, .projects-grid").forEach((grid) => {
            const items = grid.querySelectorAll("[data-reveal]");
            items.forEach((item, index) => {
                item.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
            });
        });

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        revealTargets.forEach((el) => revealObserver.observe(el));
    } else {
        revealTargets.forEach((el) => el.classList.add("is-visible"));
    }

    /* -------------------- 6. PROJECT CATEGORY FILTER -------------------- */
    const filterButtons = document.querySelectorAll(".filter-btn[data-filter]");
    const projectCards = document.querySelectorAll(".project-card[data-category]");
    const emptyState = document.getElementById("project-empty");

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selected = button.dataset.filter;

                filterButtons.forEach((btn) => {
                    btn.classList.remove("active");
                    btn.setAttribute("aria-pressed", "false");
                });

                button.classList.add("active");
                button.setAttribute("aria-pressed", "true");

                let visibleCount = 0;

                projectCards.forEach((card) => {
                    const categories = (card.dataset.category || "").split(/\s+/);
                    const matches = selected === "all" || categories.includes(selected);
                    card.classList.toggle("is-hidden", !matches);
                    if (matches) visibleCount += 1;
                });

                if (emptyState) {
                    emptyState.hidden = visibleCount > 0;
                }
            });
        });
    }

    /* -------------------- 7. TOAST HELPER FOR PLACEHOLDERS & RESUME -------------------- */
    let toastTimer = null;

    const showToast = (message) => {
        let toast = document.getElementById("status-toast");

        if (!toast) {
            toast = document.createElement("div");
            toast.id = "status-toast";
            toast.className = "status-toast";
            toast.setAttribute("role", "status");
            toast.setAttribute("aria-live", "polite");

            const textSpan = document.createElement("span");
            textSpan.className = "status-toast-message";

            const closeBtn = document.createElement("button");
            closeBtn.type = "button";
            closeBtn.className = "status-toast-close";
            closeBtn.setAttribute("aria-label", "Dismiss notification");
            closeBtn.textContent = "×";
            closeBtn.addEventListener("click", () => {
                toast.classList.remove("is-visible");
            });

            toast.append(textSpan, closeBtn);
            document.body.appendChild(toast);
        }

        const msgEl = toast.querySelector(".status-toast-message");
        if (msgEl) msgEl.textContent = message;

        toast.classList.add("is-visible");

        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            toast.classList.remove("is-visible");
        }, 5500);
    };

    document.querySelectorAll("[data-placeholder-notice]").forEach((el) => {
        el.addEventListener("click", (event) => {
            event.preventDefault();
            const notice = el.getAttribute("data-placeholder-notice");
            if (notice) showToast(notice);
        });
    });

    document.querySelectorAll("[data-resume-download]").forEach((resumeLink) => {
        resumeLink.addEventListener("click", async (event) => {
            const href = resumeLink.getAttribute("href");
            if (!href) return;

            if (window.location.protocol === "http:" || window.location.protocol === "https:") {
                event.preventDefault();
                try {
                    const response = await fetch(href, { method: "HEAD" });
                    if (response.ok) {
                        const tempLink = document.createElement("a");
                        tempLink.href = href;
                        tempLink.download = "Irfan-Khan-Resume.pdf";
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        tempLink.remove();
                    } else {
                        showToast(
                            "Resume PDF placeholder: Place your PDF at assets/resume/Irfan-Khan-Resume.pdf to enable direct download."
                        );
                    }
                } catch {
                    showToast(
                        "Resume PDF placeholder: Place your PDF at assets/resume/Irfan-Khan-Resume.pdf to enable direct download."
                    );
                }
            }
        });
    });

    /* -------------------- 8. CONTACT FORM VALIDATION -------------------- */
    const contactForm = document.getElementById("contact-form-element");
    const formStatus = document.getElementById("form-status");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const nameField = contactForm.querySelector('[name="name"]');
            const emailField = contactForm.querySelector('[name="email"]');
            const subjectField = contactForm.querySelector('[name="subject"]');
            const messageField = contactForm.querySelector('[name="message"]');

            const name = nameField ? nameField.value.trim() : "";
            const email = emailField ? emailField.value.trim() : "";
            const subject = subjectField ? subjectField.value : "Portfolio Enquiry";
            const message = messageField ? messageField.value.trim() : "";

            if (formStatus) {
                formStatus.classList.remove("is-error", "is-success");
            }

            if (!name || !email || !message) {
                if (formStatus) {
                    formStatus.textContent = "Please complete your name, email address, and message.";
                    formStatus.classList.add("is-error");
                }
                return;
            }

            if (emailField && !emailField.checkValidity()) {
                if (formStatus) {
                    formStatus.textContent = "Please enter a valid email address.";
                    formStatus.classList.add("is-error");
                }
                emailField.focus();
                return;
            }

            const targetEmail = contactForm.dataset.recipientEmail || "YOUR_EMAIL@example.com";
            const mailSubject = encodeURIComponent(`[Portfolio] ${subject} — ${name}`);
            const mailBody = encodeURIComponent(
                `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`
            );

            if (targetEmail === "YOUR_EMAIL@example.com") {
                if (formStatus) {
                    formStatus.textContent =
                        "Form validated! Replace YOUR_EMAIL@example.com in contact.html to enable direct email delivery.";
                    formStatus.classList.add("is-success");
                }
                showToast("Message validated. Update YOUR_EMAIL@example.com in the HTML to enable live email delivery.");
            } else {
                if (formStatus) {
                    formStatus.textContent = "Opening your default email client to send this message...";
                    formStatus.classList.add("is-success");
                }
                window.location.href = `mailto:${targetEmail}?subject=${mailSubject}&body=${mailBody}`;
            }

            contactForm.reset();
        });
    }

    /* -------------------- 9. FOOTER COPYRIGHT YEAR -------------------- */
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }
});
