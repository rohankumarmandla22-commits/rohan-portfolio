const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

const savedTheme = localStorage.getItem("portfolio-theme");
if (savedTheme === "light" || savedTheme === "dark") {
  root.dataset.theme = savedTheme;
}

function updateThemeLabel() {
  const isLight = root.dataset.theme === "light";
  themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
  themeToggle.title = `Switch to ${isLight ? "dark" : "light"} theme`;
}

updateThemeLabel();

themeToggle.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("portfolio-theme", root.dataset.theme);
  updateThemeLabel();
});

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open menu" : "Close menu");
  navLinks.classList.toggle("is-open", !expanded);
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  });
});

document.querySelector(".resume-button").addEventListener("click", () => {
  const resume = [
    "ROHAN KUMAR MANDLA",
    "Full-Stack Developer & AI Enthusiast",
    "rohankumarmanda22@gmail.com | github.com | linkedin.com",
    "",
    "PROFILE",
    "Computer science student building thoughtful, useful digital experiences. Interested in full-stack development and applied AI.",
    "",
    "EDUCATION",
    "B.Tech in Computer Science | JOY UNIVERSITY",
    "",
    "SKILLS",
    "Frontend: React, Next.js, TypeScript, HTML, CSS, Tailwind",
    "Backend: Node.js, Express, Python, PostgreSQL, REST APIs",
    "Tools: Git, GitHub, Figma, Docker, VS Code, Vercel",
    "Languages: JavaScript, TypeScript, Python, Java, SQL",
    "",
    "SELECTED PROJECTS",
    "AI Learning Platform - Personalized AI-powered lessons (Next.js, OpenAI API, PostgreSQL)",
    "LinkedIn Job Tracker - Application tracking browser extension (React, Chrome API, Firebase)",
    "Personal Portfolio - Responsive portfolio website (HTML, CSS, JavaScript)",
    "",
    "Replace this sample resume content with your current details before sharing."
  ].join("\n");
  const file = new Blob([resume], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Rohan-Kumar-Mandla-Resume.txt";
  link.click();
  URL.revokeObjectURL(url);
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;

  const data = new FormData(contactForm);
  const subject = `Portfolio hello from ${data.get("name")}`;
  const body = `${data.get("message")}\n\nReply to: ${data.get("email")}`;
  formStatus.textContent = "Opening your email app to send this message…";
  window.location.href = `mailto:rohankumarmanda22@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelector("#current-year").textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !motionPreference.matches) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}

const typedRole = document.querySelector(".typed-role");
const roleOptions = ["Full-Stack Developer", "Problem Solver", "AI Enthusiast"];
let roleTimer;
let roleIndex = 0;
let deletingRole = false;

function typeNextCharacter() {
  if (!typedRole || motionPreference.matches) return;

  const role = roleOptions[roleIndex];
  const currentText = typedRole.textContent;
  const nextText = deletingRole ? role.slice(0, currentText.length - 1) : role.slice(0, currentText.length + 1);
  typedRole.textContent = nextText;

  let delay = deletingRole ? 38 : 72;
  if (!deletingRole && nextText === role) {
    deletingRole = true;
    delay = 1500;
  } else if (deletingRole && nextText === "") {
    deletingRole = false;
    roleIndex = (roleIndex + 1) % roleOptions.length;
    delay = 300;
  }
  roleTimer = window.setTimeout(typeNextCharacter, delay);
}

if (typedRole && !motionPreference.matches) {
  roleTimer = window.setTimeout(typeNextCharacter, 900);
}

const progressFill = document.querySelector(".scroll-progress span");
let progressFrame = 0;

function updateScrollProgress() {
  if (!progressFill || progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    progressFill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    progressFrame = 0;
  });
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const hero = document.querySelector(".hero");
const particleCanvas = document.querySelector(".hero-particles");
let stopParticleAnimation = () => {};

function startParticleAnimation() {
  if (!hero || !particleCanvas || motionPreference.matches) return;

  const context = particleCanvas.getContext("2d");
  if (!context) return;

  const pointer = { x: 0, y: 0, active: false };
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;

  function resizeCanvas() {
    const bounds = hero.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    particleCanvas.width = Math.round(width * pixelRatio);
    particleCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = Math.max(22, Math.min(58, Math.round((width * height) / 14500)));
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28
    }));
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    const linkDistance = Math.min(130, Math.max(90, width / 8));

    particles.forEach((particle, index) => {
      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 115 && distance > 0) {
          const force = (115 - distance) / 1150;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }
      }

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.995;
      particle.vy *= 0.995;
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
        if (distance < linkDistance) {
          context.globalAlpha = (1 - distance / linkDistance) * 0.19;
          context.strokeStyle = accent;
          context.lineWidth = 0.7;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }

      context.globalAlpha = 0.4;
      context.fillStyle = accent;
      context.beginPath();
      context.arc(particle.x, particle.y, 1.25, 0, Math.PI * 2);
      context.fill();
    });

    context.globalAlpha = 1;
    frame = window.requestAnimationFrame(draw);
  }

  function trackPointer(event) {
    const bounds = hero.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", trackPointer, { passive: true });
  document.addEventListener("visibilitychange", handleVisibilityChange);
  draw();

  function handleVisibilityChange() {
    if (document.hidden) {
      window.cancelAnimationFrame(frame);
    } else if (!motionPreference.matches) {
      frame = window.requestAnimationFrame(draw);
    }
  }

  stopParticleAnimation = () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("pointermove", trackPointer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    context.clearRect(0, 0, width, height);
  };
}

startParticleAnimation();

const canTiltCards = window.matchMedia("(hover: hover) and (pointer: fine)");
if (canTiltCards.matches && !motionPreference.matches) {
  document.querySelectorAll(".project-card").forEach((card) => {
    let tiltFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      if (tiltFrame) return;

      tiltFrame = window.requestAnimationFrame(() => {
        const horizontal = pointerX / bounds.width - 0.5;
        const vertical = pointerY / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${horizontal * 5}deg`);
        card.style.setProperty("--tilt-y", `${vertical * -5}deg`);
        card.style.setProperty("--pointer-x", `${pointerX}px`);
        card.style.setProperty("--pointer-y", `${pointerY}px`);
        card.classList.add("is-tilting");
        tiltFrame = 0;
      });
    });

    card.addEventListener("pointerleave", () => {
      window.cancelAnimationFrame(tiltFrame);
      tiltFrame = 0;
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.classList.remove("is-tilting");
    });
  });
}

motionPreference.addEventListener("change", (event) => {
  if (event.matches) {
    window.clearTimeout(roleTimer);
    if (typedRole) typedRole.textContent = roleOptions[0];
    stopParticleAnimation();
    revealElements.forEach((element) => element.classList.add("is-visible"));
    document.querySelectorAll(".project-card").forEach((card) => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.classList.remove("is-tilting");
    });
  }
});
