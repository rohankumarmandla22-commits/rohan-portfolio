const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");

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
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
