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

const revealElements = [...document.querySelectorAll(".reveal, .badge-list span")];
const scrollRevealTargets = [...document.querySelectorAll(
  ".section-heading, .about-copy, .about-details, .detail-card, .currently-learning, .skill-card, .project-card, .contact-copy, .contact-form, .badge-list span"
)];
const motionGsap = window.gsap;
const scrollPlugin = window.ScrollTrigger;
let revealObserver = null;
let scrollRevealsReady = false;

function setupScrollReveals() {
  if (motionPreference.matches) {
    revealObserver?.disconnect();
    revealObserver = null;
    scrollRevealsReady = false;
    motionGsap?.killTweensOf(revealElements);
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  if (scrollRevealsReady) return;
  revealObserver?.disconnect();
  revealObserver = null;

  if (motionGsap && scrollPlugin) {
    scrollRevealsReady = true;
    motionGsap.registerPlugin(scrollPlugin);
    document.querySelectorAll(".section").forEach((section) => {
      const targets = section.querySelectorAll(
        ".section-heading, .about-copy, .about-details, .detail-card, .currently-learning, .skill-card, .project-card, .contact-copy, .contact-form"
      );
      if (targets.length) {
        motionGsap.fromTo(targets, {
          autoAlpha: 0,
          y: 58,
          scale: 0.93,
          rotateX: 5,
          transformPerspective: 1000
        }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          clearProps: "transform",
          scrollTrigger: { trigger: section, start: "top 78%", once: true }
        });
      }

      section.querySelectorAll(".badge-list").forEach((list) => {
        motionGsap.fromTo(list.children, { autoAlpha: 0, y: 16, scale: 0.9 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.48,
          ease: "back.out(1.7)",
          stagger: 0.055,
          clearProps: "transform",
          scrollTrigger: { trigger: list.closest(".skill-card"), start: "top 76%", once: true }
        });
      });
    });
    return;
  }

  if ("IntersectionObserver" in window) {
    scrollRevealsReady = true;
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    scrollRevealsReady = true;
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }
}

const typedRole = document.querySelector(".typed-role");
const roleOptions = ["useful products", "thoughtful experiences", "better tools"];
let roleTimer = 0;
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

function startTypewriter() {
  if (!typedRole || motionPreference.matches) return;
  window.clearTimeout(roleTimer);
  roleTimer = window.setTimeout(typeNextCharacter, 900);
}

function setupHeroEntrance() {
  const words = [...document.querySelectorAll(".hero-word")];
  if (motionGsap && !motionPreference.matches) {
    const timeline = motionGsap.timeline({ defaults: { ease: "power4.out" } });
    timeline
      .from(".eyebrow", { autoAlpha: 0, y: 18, duration: 0.55 })
      .from(".hero-intro", { autoAlpha: 0, y: 24, duration: 0.65 }, "-=0.25")
      .from(words, { autoAlpha: 0, yPercent: 120, rotateX: -55, transformOrigin: "50% 100%", duration: 0.85, stagger: 0.11 }, "-=0.25")
      .from(".hero-role, .hero-bio, .hero-actions, .hero-socials", { autoAlpha: 0, y: 25, duration: 0.62, stagger: 0.12 }, "-=0.38")
      .from(".hero-art", { autoAlpha: 0, scale: 0.78, rotateY: -18, duration: 1.1, ease: "elastic.out(1, 0.75)" }, "-=0.8");
  } else {
    words.forEach((word) => {
      word.style.opacity = "1";
      word.style.transform = "none";
    });
  }
}

const headlineScrambleTimers = new Map();

function setupHeadlineScramble() {
  const headline = document.querySelector("#hero-title");
  if (!headline) return;
  const glyphs = "01<>[]{}/\\=+*";
  const timers = headlineScrambleTimers;

  function scramble(word) {
    if (motionPreference.matches || timers.has(word)) return;
    const original = word.dataset.word || word.textContent;
    word.dataset.word = original;
    word.classList.add("scrambling");
    let frame = 0;
    const totalFrames = 14;
    const timer = window.setInterval(() => {
      frame += 1;
      const revealed = Math.floor((frame / totalFrames) * original.length);
      word.textContent = [...original].map((character, index) => {
        if (character === " " || index < revealed) return character;
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      }).join("");
      if (frame >= totalFrames) {
        window.clearInterval(timer);
        timers.delete(word);
        word.textContent = original;
        word.classList.remove("scrambling");
      }
    }, 34);
    timers.set(word, timer);
  }

  headline.querySelectorAll(".hero-word").forEach((word) => {
    word.dataset.word = word.textContent;
    word.addEventListener("pointerenter", () => scramble(word));
    word.addEventListener("focus", () => scramble(word));
    word.addEventListener("pointerleave", () => {
      const timer = timers.get(word);
      if (timer) {
        window.clearInterval(timer);
        timers.delete(word);
      }
      word.textContent = word.dataset.word;
      word.classList.remove("scrambling");
    });
    word.addEventListener("blur", () => {
      const timer = timers.get(word);
      if (timer) window.clearInterval(timer);
      timers.delete(word);
      word.textContent = word.dataset.word;
      word.classList.remove("scrambling");
    });
  });
  headline.addEventListener("focusin", () => {
    headline.querySelectorAll(".hero-word").forEach(scramble);
  });
  headline.addEventListener("focusout", () => {
    headline.querySelectorAll(".hero-word").forEach((word) => {
      const timer = timers.get(word);
      if (timer) window.clearInterval(timer);
      timers.delete(word);
      word.textContent = word.dataset.word;
      word.classList.remove("scrambling");
    });
  });
}

const hero = document.querySelector(".hero");
const particleCanvas = document.querySelector(".hero-particles");
let stopParticleAnimation = () => {};
let particleAnimationStarted = false;

function startParticleAnimation() {
  if (!hero || !particleCanvas || motionPreference.matches || particleAnimationStarted) return;

  const context = particleCanvas.getContext("2d");
  if (!context) return;

  const pointer = { x: 0, y: 0, active: false, speed: 0, lastX: 0, lastY: 0, lastTime: 0 };
  let particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let inView = true;
  let resizeObserver;
  let visibilityObserver;
  let lastFrame = 0;

  function resizeCanvas() {
    const bounds = particleCanvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    particleCanvas.width = Math.round(width * pixelRatio);
    particleCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const particleCount = Math.max(48, Math.min(104, Math.round((width * height) / 10500)));
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 0.5) * 18,
      depth: 0.3 + Math.random() * 0.7
    }));
  }

  function draw(now = performance.now()) {
    if (!running || !inView || document.hidden) return;

    const delta = Math.min((now - (lastFrame || now)) / 1000, 0.04);
    lastFrame = now;
    const time = now * 0.00012;
    context.clearRect(0, 0, width, height);
    const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
    const auroras = [
      { x: 0.23 + Math.sin(time) * 0.1, y: 0.3 + Math.cos(time * 1.2) * 0.12, radius: 0.43, color: "80, 255, 218" },
      { x: 0.69 + Math.cos(time * 0.8) * 0.14, y: 0.38 + Math.sin(time * 1.1) * 0.14, radius: 0.48, color: "150, 255, 104" },
      { x: 0.52 + Math.sin(time * 0.7) * 0.18, y: 0.78 + Math.cos(time * 0.9) * 0.1, radius: 0.38, color: "83, 151, 255" }
    ];

    auroras.forEach((blob) => {
      const x = width * blob.x + (pointer.active ? (pointer.x - width / 2) * 0.06 : 0);
      const y = height * blob.y + (pointer.active ? (pointer.y - height / 2) * 0.04 : 0);
      const radius = Math.max(width, height) * blob.radius;
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(${blob.color}, 0.17)`);
      gradient.addColorStop(0.42, `rgba(${blob.color}, 0.075)`);
      gradient.addColorStop(1, `rgba(${blob.color}, 0)`);
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    });

    const linkDistance = Math.min(155, Math.max(110, width / 8));
    const projected = [];
    particles.forEach((particle) => {
      const dx = pointer.active ? pointer.x - particle.x : 0;
      const dy = pointer.active ? pointer.y - particle.y : 0;
      const distance = Math.hypot(dx, dy);
      if (pointer.active && distance < 260 && distance > 0) {
        const influence = (1 - distance / 260) * (1.2 + pointer.speed * 5.2);
        particle.vx += (dx / distance) * influence;
        particle.vy += (dy / distance) * influence;
      }

      const drift = 0.985 ** (delta * 60);
      particle.vx *= drift;
      particle.vy *= drift;
      const speedLimit = 38 + (pointer.active && distance < 260 ? pointer.speed * 210 : 0);
      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > speedLimit) {
        particle.vx = (particle.vx / speed) * speedLimit;
        particle.vy = (particle.vy / speed) * speedLimit;
      }
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.depth += delta * (0.025 + pointer.speed * 0.22);
      if (particle.depth > 1) {
        particle.depth = 0.25;
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
        particle.vx = (Math.random() - 0.5) * 20;
        particle.vy = (Math.random() - 0.5) * 20;
      }
      if (particle.x < -24 || particle.x > width + 24) particle.vx *= -0.75;
      if (particle.y < -24 || particle.y > height + 24) particle.vy *= -0.75;
      particle.x = Math.max(-24, Math.min(width + 24, particle.x));
      particle.y = Math.max(-24, Math.min(height + 24, particle.y));
      projected.push({ x: particle.x, y: particle.y, depth: particle.depth, speed: Math.hypot(particle.vx, particle.vy) });
    });

    projected.forEach((particle, index) => {
      for (let nextIndex = index + 1; nextIndex < projected.length; nextIndex += 1) {
        const next = projected[nextIndex];
        const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
        if (distance < linkDistance) {
          context.globalAlpha = (1 - distance / linkDistance) * (0.2 + particle.depth * 0.22);
          context.strokeStyle = `rgba(141, 229, 203, ${context.globalAlpha})`;
          context.lineWidth = 0.5 + particle.depth * 0.6;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(next.x, next.y);
          context.stroke();
        }
      }

      if (pointer.active) {
        const distance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        if (distance < 220) {
          context.globalAlpha = (1 - distance / 220) * (0.45 + pointer.speed * 0.5);
          context.strokeStyle = accent;
          context.lineWidth = 0.7 + particle.depth;
          context.shadowColor = "#8de5cb";
          context.shadowBlur = 9 + pointer.speed * 8;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(pointer.x, pointer.y);
          context.stroke();
          context.shadowBlur = 0;
        }
      }

      context.globalAlpha = 0.38 + particle.depth * 0.52;
      context.fillStyle = particle.depth > 0.72 ? "#d4ff9a" : "#8de5cb";
      context.shadowColor = particle.depth > 0.72 ? accent : "#8de5cb";
      context.shadowBlur = 5 + particle.depth * 10;
      context.beginPath();
      context.arc(particle.x, particle.y, 0.9 + particle.depth * 1.5, 0, Math.PI * 2);
      context.fill();
      if (particle.speed > 26) {
        context.globalAlpha = Math.min(0.62, particle.speed / 160);
        context.lineWidth = 0.8;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(particle.x - particle.vx * 0.065, particle.y - particle.vy * 0.065);
        context.stroke();
      }
      context.shadowBlur = 0;
    });

    context.globalAlpha = 1;
    frame = window.requestAnimationFrame(draw);
  }

  function trackPointer(event) {
    if (event.pointerType === "touch") return;
    const bounds = particleCanvas.getBoundingClientRect();
    const now = performance.now();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    pointer.speed = pointer.lastTime ? Math.min(1, Math.hypot(x - pointer.lastX, y - pointer.lastY) / Math.max(10, now - pointer.lastTime)) : 0;
    pointer.x = x;
    pointer.y = y;
    pointer.lastX = x;
    pointer.lastY = y;
    pointer.lastTime = now;
    pointer.active = x >= 0 && x <= width && y >= 0 && y <= height;
  }

  function clearPointer() {
    pointer.active = false;
    pointer.speed = 0;
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      running = false;
      window.cancelAnimationFrame(frame);
    } else if (!motionPreference.matches && inView) {
      running = true;
      lastFrame = 0;
      frame = window.requestAnimationFrame(draw);
    }
  }

  resizeCanvas();
  running = true;
  particleAnimationStarted = true;
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", trackPointer, { passive: true });
  hero.addEventListener("pointerleave", clearPointer);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(hero);
  }
  if ("IntersectionObserver" in window) {
    visibilityObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (!inView) {
        window.cancelAnimationFrame(frame);
      } else if (running && !document.hidden) {
        lastFrame = 0;
        frame = window.requestAnimationFrame(draw);
      }
    });
    visibilityObserver.observe(hero);
  }
  draw();

  stopParticleAnimation = () => {
    running = false;
    window.cancelAnimationFrame(frame);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("pointermove", trackPointer);
    hero.removeEventListener("pointerleave", clearPointer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    context.clearRect(0, 0, width, height);
    particleAnimationStarted = false;
  };
}

const canTiltCards = window.matchMedia("(hover: hover) and (pointer: fine)");
const projectCards = [...document.querySelectorAll(".project-card")];
const heroArt = document.querySelector(".hero-art");
const magneticButtons = [...document.querySelectorAll(".button-primary, .project-links a")];
const cursorFollower = document.querySelector(".cursor-follower");
let cursorX;
let cursorY;
let cursorVisible = false;

projectCards.forEach((card) => {
  const tiltX = motionGsap?.quickTo(card, "rotationX", { duration: 0.4, ease: "power2.out" });
  const tiltY = motionGsap?.quickTo(card, "rotationY", { duration: 0.4, ease: "power2.out" });

  card.addEventListener("pointermove", (event) => {
    if (!canTiltCards.matches || motionPreference.matches || !motionGsap || event.pointerType === "touch") return;
    const bounds = card.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    card.style.setProperty("--beam-angle", `${(Math.atan2(vertical, horizontal) * 180) / Math.PI + 140}deg`);
    const firstMove = !card.classList.contains("is-tilting");
    card.classList.add("is-tilting");
    tiltY(horizontal * 12);
    tiltX(vertical * -10);
    if (firstMove) motionGsap.to(card, { y: -7, scale: 1.012, transformPerspective: 1000, duration: 0.3, ease: "power2.out", overwrite: "auto" });
  });

  card.addEventListener("pointerleave", () => {
    card.classList.remove("is-tilting");
    if (motionGsap) {
      tiltX(0);
      tiltY(0);
      motionGsap.to(card, { y: 0, scale: 1, duration: 0.65, ease: "elastic.out(1, 0.72)", overwrite: "auto" });
    }
  });
});

if (heroArt) {
  const rotateX = motionGsap?.quickTo(heroArt, "rotationX", { duration: 0.42, ease: "power2.out" });
  const rotateY = motionGsap?.quickTo(heroArt, "rotationY", { duration: 0.42, ease: "power2.out" });

  heroArt.addEventListener("pointermove", (event) => {
    if (!canTiltCards.matches || motionPreference.matches || !motionGsap || event.pointerType === "touch") return;
    const bounds = heroArt.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
    const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroArt.classList.add("is-tilting");
    rotateY(horizontal * 18);
    rotateX(vertical * -16);
  });

  heroArt.addEventListener("pointerleave", () => {
    heroArt.classList.remove("is-tilting");
    if (motionGsap) {
      rotateX(0);
      rotateY(0);
    }
  });
}

magneticButtons.forEach((button) => {
  button.addEventListener("pointermove", (event) => {
    if (!canTiltCards.matches || motionPreference.matches || event.pointerType === "touch" || !button.matches(".button-primary")) return;
    const bounds = button.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
    const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    button.style.setProperty("--magnetic-x", `${x * 9}px`);
    button.style.setProperty("--magnetic-y", `${y * 7}px`);
  });

  button.addEventListener("pointerleave", () => {
    button.style.setProperty("--magnetic-x", "0px");
    button.style.setProperty("--magnetic-y", "0px");
  });

  button.addEventListener("click", (event) => {
    if (motionPreference.matches) return;
    const bounds = button.getBoundingClientRect();
    const x = event.detail === 0 ? bounds.width / 2 : event.clientX - bounds.left;
    const y = event.detail === 0 ? bounds.height / 2 : event.clientY - bounds.top;
    const ripple = document.createElement("span");
    ripple.className = "button-ripple";
    ripple.setAttribute("aria-hidden", "true");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    button.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  });
});

if (cursorFollower) {
  if (motionGsap) {
    motionGsap.set(cursorFollower, { x: -40, y: -40, autoAlpha: 0 });
    cursorX = motionGsap.quickTo(cursorFollower, "x", { duration: 0.22, ease: "power3.out" });
    cursorY = motionGsap.quickTo(cursorFollower, "y", { duration: 0.22, ease: "power3.out" });
  }
  window.addEventListener("pointermove", (event) => {
    if (!canTiltCards.matches || motionPreference.matches || event.pointerType === "touch") return;
    if (motionGsap) {
      cursorX(event.clientX - 17);
      cursorY(event.clientY - 17);
      if (!cursorVisible) {
        cursorVisible = true;
        motionGsap.to(cursorFollower, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      }
    } else {
      cursorFollower.style.opacity = "1";
      cursorFollower.style.transform = `translate3d(${event.clientX - 17}px, ${event.clientY - 17}px, 0)`;
    }
  }, { passive: true });
  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button")) cursorFollower.classList.add("is-hovering");
  });
  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button")) cursorFollower.classList.remove("is-hovering");
  });
  window.addEventListener("blur", () => {
    cursorVisible = false;
    if (motionGsap) motionGsap.to(cursorFollower, { autoAlpha: 0, duration: 0.2 });
  });
  window.addEventListener("pointerout", (event) => {
    if (event.relatedTarget) return;
    cursorVisible = false;
    if (motionGsap) motionGsap.to(cursorFollower, { autoAlpha: 0, duration: 0.2 });
  });
}

function updateMotionPreference() {
  window.clearTimeout(roleTimer);
  if (motionPreference.matches) {
    typedRole.textContent = roleOptions[0];
    revealObserver?.disconnect();
    revealObserver = null;
    scrollRevealsReady = false;
    headlineScrambleTimers.forEach((timer, word) => {
      window.clearInterval(timer);
      word.textContent = word.dataset.word;
      word.classList.remove("scrambling");
    });
    headlineScrambleTimers.clear();
    stopParticleAnimation();
    motionGsap?.killTweensOf(revealElements);
    motionGsap?.killTweensOf(document.querySelectorAll(".hero-word, .eyebrow, .hero-intro, .hero-role, .hero-bio, .hero-actions, .hero-socials"));
    if (scrollPlugin && motionGsap) scrollPlugin.getAll().forEach((trigger) => trigger.kill());
    motionGsap?.killTweensOf(projectCards);
    motionGsap?.killTweensOf(heroArt);
    motionGsap?.killTweensOf(document.querySelectorAll(".tech-badge"));
    motionGsap?.set(scrollRevealTargets, { autoAlpha: 1, clearProps: "transform" });
    motionGsap?.set(document.querySelectorAll(".hero-word, .eyebrow, .hero-intro, .hero-role, .hero-bio, .hero-actions, .hero-socials"), { autoAlpha: 1, clearProps: "transform" });
    motionGsap?.set(document.querySelectorAll(".tech-badge"), { clearProps: "transform" });
    projectCards.forEach((card) => {
      motionGsap?.set(card, { clearProps: "transform" });
      card.classList.remove("is-tilting");
    });
    magneticButtons.forEach((button) => {
      button.style.setProperty("--magnetic-x", "0px");
      button.style.setProperty("--magnetic-y", "0px");
    });
    heroArt?.classList.remove("is-tilting");
    if (heroArt) motionGsap?.set(heroArt, { clearProps: "transform" });
    cursorFollower?.classList.remove("is-hovering");
    if (cursorFollower) motionGsap?.set(cursorFollower, { autoAlpha: 0, clearProps: "transform" });
    cursorVisible = false;
    revealElements.forEach((element) => element.classList.add("is-visible"));
    document.querySelectorAll(".hero-word").forEach((word) => {
      word.style.opacity = "1";
      word.style.transform = "none";
    });
    return;
  }

  setupScrollReveals();
  setupHeroEntrance();
  startParticleAnimation();
  startTypewriter();
  document.querySelectorAll(".tech-badge").forEach((badge, index) => {
    if (motionGsap) motionGsap.to(badge, { y: index % 2 ? -9 : 9, duration: 2.3 + index * 0.18, ease: "sine.inOut", yoyo: true, repeat: -1, delay: index * 0.16 });
  });
}

motionPreference.addEventListener("change", updateMotionPreference);
setupHeadlineScramble();
updateMotionPreference();
window.addEventListener("load", () => {
  setupScrollReveals();
  scrollPlugin?.refresh();
}, { once: true });
document.fonts?.ready.then(() => scrollPlugin?.refresh());
