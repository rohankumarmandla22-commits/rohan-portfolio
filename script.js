document.documentElement.classList.add("js");

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const compactLayout = window.matchMedia("(max-width: 620px)");
const commandToggle = document.querySelector("#command-trigger");
const commandPrompts = document.querySelector("#command-prompts");
const commandItems = [...document.querySelectorAll("#command-prompts a, #command-prompts button")];
const toast = document.querySelector("#site-toast");
let toastTimeout = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function updateLocalTime() {
  const now = new Date();
  const clock = document.querySelector("#local-time");
  if (!clock) return;
  clock.dateTime = now.toISOString();
  clock.textContent = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).format(now);
}

updateLocalTime();
window.setInterval(updateLocalTime, 1000);
const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());

function setCommandOpen(open, restoreFocus = true) {
  commandPrompts.hidden = !open;
  commandToggle.setAttribute("aria-expanded", String(open));
  if (open) commandItems[0]?.focus();
  else if (restoreFocus) commandToggle.focus();
}

commandToggle.addEventListener("click", () => {
  setCommandOpen(commandToggle.getAttribute("aria-expanded") !== "true");
});
commandPrompts.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setCommandOpen(false, false)));
commandPrompts.querySelectorAll("[data-command-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(`.skill-filter[data-filter="${button.dataset.commandFilter}"]`)?.click();
    setCommandOpen(false, false);
  });
});
document.addEventListener("keydown", (event) => {
  const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
  const isCommandK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
  const isEditing = event.target instanceof Element &&
    (event.target.matches("input, textarea, select") || event.target.isContentEditable);
  if ((isSlash || isCommandK) && !isEditing) {
    event.preventDefault();
    if (commandPrompts.hidden) setCommandOpen(true);
    else commandItems[0]?.focus();
  } else if (event.key === "Escape") {
    if (!commandPrompts.hidden) setCommandOpen(false);
    document.querySelectorAll("dialog[open]").forEach((dialog) => dialog.close());
  }
});

async function copyEmail() {
  const email = "rohankumarmanda22@gmail.com";
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
    } else {
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Clipboard access was denied.");
    }
    showToast("Email address copied.");
  } catch {
    showToast(`Copy unavailable — email: ${email}`);
  }
}

document.querySelectorAll("[data-copy-email]").forEach((button) => button.addEventListener("click", async () => {
  await copyEmail();
  if (commandPrompts.contains(button)) setCommandOpen(false, false);
}));

const resumeLink = document.querySelector(".resume-link");
resumeLink.addEventListener("click", async (event) => {
  event.preventDefault();
  try {
    const response = await fetch(resumeLink.href, { method: "HEAD" });
    if (!response.ok) {
      showToast("Resume PDF has not been uploaded yet.");
      return;
    }
    const download = document.createElement("a");
    download.href = resumeLink.href;
    download.download = "Rohan_Kumar_Mandla_Resume.pdf";
    download.click();
  } catch {
    showToast("Resume PDF is unavailable right now.");
  }
});

const profileFrame = document.querySelector(".portrait-frame");
const profileImage = document.querySelector("#profile-image");
fetch(profileImage.dataset.src || "profile.jpg", { method: "HEAD" })
  .then((response) => {
    if (!response.ok) return;
    profileImage.src = profileImage.dataset.src || "profile.jpg";
    profileImage.addEventListener("load", () => profileFrame.classList.remove("has-fallback"), { once: true });
    profileImage.addEventListener("error", () => profileFrame.classList.add("has-fallback"), { once: true });
  })
  .catch(() => profileFrame.classList.add("has-fallback"));

const repoCount = document.querySelector("#repo-count");
const repoCountLabel = document.querySelector("#repo-count-label");
const repoStatus = document.querySelector("#repo-status");
const repoController = new AbortController();
const repoTimeout = window.setTimeout(() => repoController.abort(), 4500);
fetch("https://api.github.com/users/rohankumarmandla22-commits", {
  headers: { Accept: "application/vnd.github+json" },
  signal: repoController.signal
})
  .then((response) => {
    if (!response.ok) throw new Error(`GitHub API responded with ${response.status}.`);
    return response.json();
  })
  .then((profile) => {
    if (!Number.isInteger(profile.public_repos)) throw new Error("GitHub repository count was unavailable.");
    repoCount.textContent = String(profile.public_repos);
    repoCountLabel.textContent = "PUBLIC REPOSITORIES";
    repoStatus.textContent = "Live count from the public GitHub profile.";
  })
  .catch(() => {
    repoCount.textContent = "3+";
    repoCountLabel.textContent = "DEPLOYED WEB APPS";
    repoStatus.textContent = "Showing deployed projects; live repository count is unavailable.";
  })
  .finally(() => {
    window.clearTimeout(repoTimeout);
  });

const tiltTargets = [...document.querySelectorAll("[data-tilt]")];
const tiltStates = new Map(tiltTargets.map((target) => {
  const glare = document.createElement("span");
  glare.className = "tilt-glare";
  glare.setAttribute("aria-hidden", "true");
  target.append(glare);
  return [target, {
    x: 0, y: 0, vx: 0, vy: 0, vgx: 0, vgy: 0, targetX: 0, targetY: 0,
    glareX: 50, glareY: 50, targetGlareX: 50, targetGlareY: 50, active: false
  }];
}));
let tiltFrame = 0;
let lastTiltFrame = 0;

function animateTilts(now) {
  tiltFrame = 0;
  const delta = Math.min((now - (lastTiltFrame || now - 16.67)) / 1000, 0.034);
  lastTiltFrame = now;
  let needsAnotherFrame = false;
  tiltStates.forEach((state, target) => {
    if (!state.active) return;
    const stiffness = 175;
    const damping = 24;
    const ax = (state.targetX - state.x) * stiffness - state.vx * damping;
    const ay = (state.targetY - state.y) * stiffness - state.vy * damping;
    const agx = (state.targetGlareX - state.glareX) * stiffness - state.vgx * damping;
    const agy = (state.targetGlareY - state.glareY) * stiffness - state.vgy * damping;
    state.vx += ax * delta;
    state.vy += ay * delta;
    state.vgx += agx * delta;
    state.vgy += agy * delta;
    state.x += state.vx * delta;
    state.y += state.vy * delta;
    state.glareX += state.vgx * delta;
    state.glareY += state.vgy * delta;
    target.style.setProperty("--tilt-x", `${state.x.toFixed(2)}deg`);
    target.style.setProperty("--tilt-y", `${state.y.toFixed(2)}deg`);
    target.style.setProperty("--glare-x", `${state.glareX.toFixed(1)}%`);
    target.style.setProperty("--glare-y", `${state.glareY.toFixed(1)}%`);

    const settled = Math.abs(state.targetX - state.x) < 0.025 &&
      Math.abs(state.targetY - state.y) < 0.025 &&
      Math.abs(state.targetGlareX - state.glareX) < 0.1 &&
      Math.abs(state.targetGlareY - state.glareY) < 0.1 &&
      Math.abs(state.vx) < 0.025 && Math.abs(state.vy) < 0.025 &&
      Math.abs(state.vgx) < 0.05 && Math.abs(state.vgy) < 0.05;
    if (settled) {
      state.x = state.targetX;
      state.y = state.targetY;
      state.glareX = state.targetGlareX;
      state.glareY = state.targetGlareY;
      state.vx = 0;
      state.vy = 0;
      state.vgx = 0;
      state.vgy = 0;
      state.active = false;
    } else {
      needsAnotherFrame = true;
    }
  });
  if (needsAnotherFrame) tiltFrame = window.requestAnimationFrame(animateTilts);
  else lastTiltFrame = 0;
}

function scheduleTiltFrame() {
  if (!tiltFrame) tiltFrame = window.requestAnimationFrame(animateTilts);
}

tiltTargets.forEach((target) => {
  const state = tiltStates.get(target);
  target.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
    const bounds = target.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    state.targetX = -y * 9;
    state.targetY = x * 12;
    state.targetGlareX = (x + 0.5) * 100;
    state.targetGlareY = (y + 0.5) * 100;
    state.active = true;
    scheduleTiltFrame();
  });
  target.addEventListener("pointerleave", () => {
    state.targetX = 0;
    state.targetY = 0;
    state.targetGlareX = 50;
    state.targetGlareY = 50;
    state.active = true;
    scheduleTiltFrame();
  });
});

const techMarquee = document.querySelector(".tech-marquee");
if (techMarquee) {
  const marqueeTracks = [...techMarquee.querySelectorAll(".tech-marquee-track")];
  marqueeTracks.forEach((track, index) => {
    const regularSpeed = index === 0 ? "36s" : "44s";
    track.style.setProperty("--marquee-duration", regularSpeed);
    track.dataset.regularSpeed = regularSpeed;
  });
  techMarquee.addEventListener("pointerenter", () => {
    if (reducedMotion.matches) return;
    marqueeTracks.forEach((track) => track.style.setProperty("--marquee-duration", "82s"));
  });
  techMarquee.addEventListener("pointerleave", () => {
    marqueeTracks.forEach((track) => track.style.setProperty("--marquee-duration", track.dataset.regularSpeed));
  });
}

const skillCards = [...document.querySelectorAll(".skill-card")];
const skillFilters = [...document.querySelectorAll(".skill-filter")];
let filterRevision = 0;

skillFilters.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    skillFilters.forEach((filter) => {
      const active = filter === button;
      filter.classList.toggle("is-active", active);
      filter.setAttribute("aria-pressed", String(active));
    });
    const visibleCards = skillCards.filter((card) => category === "all" || card.dataset.category === category);
    const revision = ++filterRevision;
    const gsap = window.gsap;
    skillCards.forEach((card) => {
      const matches = visibleCards.includes(card);
      const wasHidden = card.hidden || card.classList.contains("is-filter-hidden") || getComputedStyle(card).visibility === "hidden";
      gsap?.killTweensOf(card);
      gsap?.set(card, { clearProps: "transform,opacity,visibility" });

      if (!matches) {
        card.inert = true;
        card.classList.add("is-filter-hidden");
        if (reducedMotion.matches) {
          card.hidden = true;
          return;
        }
        card.hidden = false;
        window.setTimeout(() => {
          if (revision === filterRevision && card.classList.contains("is-filter-hidden")) card.hidden = true;
        }, 240);
        return;
      }

      card.hidden = false;
      card.inert = false;
      if (wasHidden && !reducedMotion.matches) {
        card.classList.remove("is-filter-hidden");
        card.classList.add("is-filter-entering");
      } else {
        card.classList.remove("is-filter-hidden");
      }
    });
    window.ScrollTrigger?.refresh();
  });
});

const skillDialog = document.querySelector("#skill-detail-dialog");
const skillDetailTitle = document.querySelector("#skill-detail-title");
const skillDetailDescription = document.querySelector("#skill-detail-description");
const skillDetailConcepts = document.querySelector("#skill-detail-concepts");
const skillDetailArchitecture = document.querySelector("#skill-detail-architecture");
const skillDetailProjects = document.querySelector("#skill-detail-projects");
const skillProjects = {
  "job-tracker": {
    title: "Smart Internship & Job Tracker",
    href: "https://rohankumarmandla22-commits.github.io/job-tracker/"
  },
  "sorting-visualizer": {
    title: "Algorithm & Sorting Visualizer",
    href: "https://rohankumarmandla22-commits.github.io/Algorithm-Sorting-Visualizer/"
  },
  "study-planner": {
    title: "Study Planner & Pomodoro Focus Hub",
    href: "https://rohankumarmandla22-commits.github.io/AI-study-planner/"
  }
};
let activeSkillCard = null;

function openSkillDetails(card) {
  activeSkillCard = card;
  skillDetailTitle.textContent = card.querySelector("h3").textContent;
  skillDetailDescription.textContent = card.querySelector(".skill-context").textContent.trim();
  skillDetailArchitecture.textContent = card.dataset.architecture;
  skillDetailConcepts.replaceChildren(...card.dataset.concepts.split("|").map((concept) => {
    const item = document.createElement("li");
    item.textContent = concept;
    return item;
  }));
  skillDetailProjects.replaceChildren();

  const projectIds = card.dataset.projects.split(/\s+/).filter(Boolean);
  const relatedProjects = projectIds.map((id) => skillProjects[id]).filter(Boolean);
  if (relatedProjects.length) {
    relatedProjects.forEach((project) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      const arrow = document.createElement("span");
      link.href = project.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = project.title;
      arrow.textContent = "↗";
      arrow.setAttribute("aria-hidden", "true");
      link.append(arrow);
      item.append(link);
      skillDetailProjects.append(item);
    });
  } else {
    const item = document.createElement("li");
    item.className = "skill-detail-empty";
    item.textContent = "No featured project currently uses this skill; it is part of my current practice and learning.";
    skillDetailProjects.append(item);
  }

  card.setAttribute("aria-expanded", "true");
  skillDialog.showModal();
}

skillCards.forEach((card) => {
  card.addEventListener("click", () => openSkillDetails(card));
  card.addEventListener("animationend", (event) => {
    if (event.animationName === "skill-card-enter") card.classList.remove("is-filter-entering");
  });
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openSkillDetails(card);
  });
});
skillDialog.addEventListener("click", (event) => {
  if (event.target === skillDialog) skillDialog.close();
});
skillDialog.addEventListener("close", () => {
  if (!activeSkillCard) return;
  activeSkillCard.setAttribute("aria-expanded", "false");
  activeSkillCard.focus();
  activeSkillCard = null;
});

const projectPreviewDialog = document.querySelector("#project-preview-dialog");
const projectPreviewTitle = document.querySelector("#project-preview-title");
const projectPreviewFrame = document.querySelector("#project-preview-frame");
const projectPreviewExternal = document.querySelector("#project-preview-external");
let activePreviewButton = null;

document.querySelectorAll(".project-preview-open").forEach((button) => {
  button.addEventListener("click", () => {
    activePreviewButton = button;
    projectPreviewTitle.textContent = button.dataset.previewTitle;
    projectPreviewFrame.title = `${button.dataset.previewTitle} live preview`;
    projectPreviewExternal.href = button.dataset.previewUrl;
    projectPreviewFrame.src = button.dataset.previewUrl;
    projectPreviewDialog.showModal();
  });
});
document.querySelector(".project-preview-close").addEventListener("click", () => projectPreviewDialog.close());
projectPreviewDialog.addEventListener("click", (event) => {
  if (event.target === projectPreviewDialog) projectPreviewDialog.close();
});
projectPreviewDialog.addEventListener("close", () => {
  projectPreviewFrame.src = "about:blank";
  activePreviewButton?.focus();
  activePreviewButton = null;
});

const storyStages = [...document.querySelectorAll(".story-stage")];
const journeyStage = document.querySelector("#journey-stage");
if ("IntersectionObserver" in window && storyStages.length && journeyStage) {
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stage = entry.target.dataset.stage;
      journeyStage.textContent = stage;
      storyStages.forEach((item) => item.classList.toggle("is-current", item === entry.target));
    });
  }, { threshold: 0.45 });
  storyStages.forEach((stage) => stageObserver.observe(stage));
}

const contactForm = document.querySelector("#contact-form");
const contactFeedback = document.querySelector("#contact-feedback");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const formData = new FormData(contactForm);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email || !message) return;
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  contactFeedback.textContent = "Your message is ready in your email app—review it there to send.";
  showToast("Opening a prefilled email draft.");
  window.location.href = `mailto:rohankumarmanda22@gmail.com?subject=${subject}&body=${body}`;
});

const cursor = document.querySelector(".custom-cursor");
const cursorLabel = cursor.querySelector(".cursor-label");
const canvas = document.querySelector("#cosmic-canvas");
const context = canvas.getContext("2d", { alpha: true });
const pointer = { x: innerWidth / 2, y: innerHeight / 2, targetX: innerWidth / 2, targetY: innerHeight / 2, active: false, speed: 0, lastX: 0, lastY: 0, lastTime: 0 };
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;
let motionFrame = 0;
let motionRunning = false;
let canvasRunning = false;
let scrollTarget = 0;
let scrollBlend = 0;
let lastFrameTime = 0;
let activeCursorTarget = null;
let activeCursorLabel = "";
const morphingBlobs = [...document.querySelectorAll("[data-morph-blob]")].map((element) => {
  const [x, y, radius, amplitude, speed] = element.dataset.morphBlob.split(",").map(Number);
  return { element, x, y, radius, amplitude, speed };
});
const circuitTraces = [...document.querySelectorAll(".circuit-trace")].map((svg) => {
  const path = svg.querySelector(".circuit-path");
  return {
    path,
    packet: svg.querySelector(".data-packet"),
    section: svg.closest("section"),
    length: path.getTotalLength(),
    progress: 0
  };
});

function makeOrganicPath(blob, now) {
  const points = [];
  const phase = now * 0.00028 * blob.speed;
  for (let index = 0; index < 14; index += 1) {
    const angle = (index / 14) * Math.PI * 2;
    const ripple = 1 + blob.amplitude * (
      Math.sin(phase + index * 1.71) + Math.cos(phase * 0.72 + index * 2.15) * 0.38
    );
    points.push({
      x: blob.x + Math.cos(angle) * blob.radius * ripple,
      y: blob.y + Math.sin(angle) * blob.radius * 0.78 * ripple
    });
  }
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  let path = `M ${midpoint(points[13], points[0]).x} ${midpoint(points[13], points[0]).y}`;
  points.forEach((point, index) => {
    const mid = midpoint(point, points[(index + 1) % points.length]);
    path += ` Q ${point.x} ${point.y} ${mid.x} ${mid.y}`;
  });
  return `${path} Z`;
}

function updateSvgMotion(now) {
  morphingBlobs.forEach((blob) => blob.element.setAttribute("d", makeOrganicPath(blob, now)));
  circuitTraces.forEach((trace) => {
    const bounds = trace.section.getBoundingClientRect();
    const target = Math.max(0, Math.min(1, (window.innerHeight - bounds.top) / (window.innerHeight + bounds.height)));
    trace.progress += (target - trace.progress) * 0.18;
    if (Math.abs(target - trace.progress) < 0.001) trace.progress = target;
    const point = trace.path.getPointAtLength(trace.length * trace.progress);
    trace.path.style.strokeDasharray = `${trace.progress.toFixed(3)} 1`;
    trace.packet.setAttribute("cx", point.x.toFixed(2));
    trace.packet.setAttribute("cy", point.y.toFixed(2));
    trace.packet.style.opacity = String(0.18 + Math.sin(trace.progress * Math.PI) * 0.82);
  });
}

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 1.4);
  canvasWidth = document.documentElement.clientWidth || window.innerWidth;
  canvasHeight = window.innerHeight;
  root.style.setProperty("--viewport-width", `${canvasWidth}px`);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  const count = Math.min(115, Math.max(58, Math.round((canvasWidth * canvasHeight) / 11500)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * 2 - 1,
    y: Math.random() * 2 - 1,
    z: 0.2 + Math.random() * 0.8,
    vx: (Math.random() - 0.5) * 0.035,
    vy: (Math.random() - 0.5) * 0.035
  }));
}

function blendChannel(from, to, amount) {
  return Math.round(from + (to - from) * amount);
}

function scrollColor(progress) {
  const palette = [
    [66, 133, 244],
    [36, 193, 224],
    [52, 168, 83],
    [251, 188, 4]
  ];
  const position = progress * (palette.length - 1);
  const index = Math.min(palette.length - 2, Math.floor(position));
  const amount = position - index;
  return palette[index].map((channel, i) => blendChannel(channel, palette[index + 1][i], amount));
}

function drawCanvas(now, delta) {
  if (!context || !canvasRunning) return;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  scrollBlend += (scrollTarget - scrollBlend) * 0.025;
  updateSvgMotion(now);
  const [red, green, blue] = scrollColor(scrollBlend);
  const time = now * 0.00012;
  const auroras = [
    { x: 0.19 + Math.sin(time) * 0.1, y: 0.18 + Math.cos(time * 1.2) * 0.09, radius: 0.52, color: [red, green, blue] },
    { x: 0.76 + Math.cos(time * 0.78) * 0.11, y: 0.45 + Math.sin(time * 1.1) * 0.12, radius: 0.48, color: [36, 193, 224] },
    { x: 0.45 + Math.sin(time * 0.63) * 0.13, y: 0.92 + Math.cos(time * 0.8) * 0.08, radius: 0.42, color: [52, 168, 83] }
  ];

  auroras.forEach((blob) => {
    const shiftX = pointer.active ? (pointer.x / canvasWidth - 0.5) * 20 : 0;
    const shiftY = pointer.active ? (pointer.y / canvasHeight - 0.5) * 14 : 0;
    const x = canvasWidth * blob.x + shiftX;
    const y = canvasHeight * blob.y + shiftY;
    const radius = Math.max(canvasWidth, canvasHeight) * blob.radius;
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${blob.color.join(",")}, 0.11)`);
    gradient.addColorStop(0.42, `rgba(${blob.color.join(",")}, 0.035)`);
    gradient.addColorStop(1, `rgba(${blob.color.join(",")}, 0)`);
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  });

  const projected = [];
  particles.forEach((particle) => {
    particle.z -= delta * 0.045;
    if (particle.z < 0.2) {
      particle.z = 1;
      particle.x = Math.random() * 2 - 1;
      particle.y = Math.random() * 2 - 1;
    }
    const depth = 0.55 + particle.z * 0.55;
    let x = canvasWidth / 2 + particle.x * canvasWidth * 0.63 * depth;
    let y = canvasHeight / 2 + particle.y * canvasHeight * 0.7 * depth;
    if (pointer.active) {
      const dx = pointer.x - x;
      const dy = pointer.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance < 220 && distance > 0) {
        const influence = (1 - distance / 220) * (0.12 + pointer.speed * 0.3) * delta;
        particle.x += (dx / canvasWidth) * influence;
        particle.y += (dy / canvasHeight) * influence;
        x = canvasWidth / 2 + particle.x * canvasWidth * 0.63 * depth;
        y = canvasHeight / 2 + particle.y * canvasHeight * 0.7 * depth;
      }
    }
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    if (particle.x < -1.2 || particle.x > 1.2) particle.vx *= -1;
    if (particle.y < -1.2 || particle.y > 1.2) particle.vy *= -1;
    particle.vx *= 0.998;
    particle.vy *= 0.998;
    projected.push({ x, y, depth, z: particle.z });
  });

  const connectionDistance = Math.min(145, Math.max(100, canvasWidth / 8));
  projected.forEach((point, index) => {
    for (let nextIndex = index + 1; nextIndex < projected.length; nextIndex += 1) {
      const next = projected[nextIndex];
      const distance = Math.hypot(point.x - next.x, point.y - next.y);
      if (distance >= connectionDistance) continue;
      context.globalAlpha = (1 - distance / connectionDistance) * (0.055 + point.z * 0.12);
      context.strokeStyle = `rgb(${red},${green},${blue})`;
      context.lineWidth = 0.45 + point.z * 0.55;
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(next.x, next.y);
      context.stroke();
    }
    if (pointer.active) {
      const distance = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      if (distance < 190) {
        context.globalAlpha = (1 - distance / 190) * (0.16 + pointer.speed * 0.28);
        context.strokeStyle = `rgb(${red},${green},${blue})`;
        context.lineWidth = 0.7 + point.z * 0.6;
        context.shadowColor = `rgb(${red},${green},${blue})`;
        context.shadowBlur = 8;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.lineTo(pointer.x, pointer.y);
        context.stroke();
        context.shadowBlur = 0;
      }
    }
    context.globalAlpha = 0.18 + point.z * 0.36;
    context.fillStyle = point.z > 0.72 ? "#f5f8ff" : `rgb(${red},${green},${blue})`;
    context.shadowColor = `rgb(${red},${green},${blue})`;
    context.shadowBlur = 3 + point.z * 6;
    context.beginPath();
    context.arc(point.x, point.y, 0.7 + point.z * 1.5, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  });
  context.globalAlpha = 1;
}

function updateCursor() {
  if (!cursor.classList.contains("is-visible")) return;
  pointer.x = pointer.targetX;
  pointer.y = pointer.targetY;
  cursor.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
}

function motionTick(now) {
  if (!motionRunning) return;
  const delta = Math.min((now - (lastFrameTime || now)) / 1000, 0.04);
  lastFrameTime = now;
  drawCanvas(now, delta);
  updateCursor();
  if (canvasRunning || cursor.classList.contains("is-visible")) {
    motionFrame = window.requestAnimationFrame(motionTick);
  } else {
    motionRunning = false;
    lastFrameTime = 0;
  }
}

function startMotionLoop() {
  if (motionRunning || document.hidden || reducedMotion.matches) return;
  motionRunning = true;
  motionFrame = window.requestAnimationFrame(motionTick);
}

function stopMotionLoop() {
  motionRunning = false;
  window.cancelAnimationFrame(motionFrame);
  lastFrameTime = 0;
}

function startCanvas() {
  if (!context || reducedMotion.matches || document.hidden) return;
  resizeCanvas();
  canvasRunning = true;
  startMotionLoop();
}

function stopCanvas() {
  canvasRunning = false;
  context?.clearRect(0, 0, canvasWidth, canvasHeight);
  if (!cursor.classList.contains("is-visible")) stopMotionLoop();
}

function updateScrollColor() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  scrollTarget = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
}

function updatePointer(event) {
  if (event.pointerType === "touch") return;
  const now = performance.now();
  pointer.targetX = event.clientX;
  pointer.targetY = event.clientY;
  pointer.speed = pointer.lastTime ? Math.min(1, Math.hypot(event.clientX - pointer.lastX, event.clientY - pointer.lastY) / Math.max(12, now - pointer.lastTime)) : 0;
  pointer.lastX = event.clientX;
  pointer.lastY = event.clientY;
  pointer.lastTime = now;
  pointer.active = true;
  if (finePointer.matches && !reducedMotion.matches) {
    cursor.classList.add("is-visible");
    root.classList.add("has-custom-cursor");
  }
  root.style.setProperty("--pointer-x", `${event.clientX}px`);
  root.style.setProperty("--pointer-y", `${event.clientY}px`);
  startMotionLoop();
  const spotlitCard = event.target.closest(".project-card");
  if (spotlitCard) {
    const bounds = spotlitCard.getBoundingClientRect();
    spotlitCard.classList.add("is-spotlit");
    spotlitCard.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    spotlitCard.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }
  const spotlitSkill = event.target.closest(".skill-card");
  if (spotlitSkill) {
    const bounds = spotlitSkill.getBoundingClientRect();
    spotlitSkill.classList.add("is-spotlit");
    spotlitSkill.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    spotlitSkill.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }
}

window.addEventListener("pointermove", updatePointer, { passive: true });
window.addEventListener("pointerout", (event) => {
  if (event.relatedTarget) return;
  pointer.active = false;
  cursor.classList.remove("is-visible", "has-label");
  activeCursorTarget = null;
  root.classList.remove("has-custom-cursor");
  document.querySelectorAll(".project-card.is-spotlit, .skill-card.is-spotlit").forEach((card) => card.classList.remove("is-spotlit"));
}, { passive: true });
document.addEventListener("pointerout", (event) => {
  const card = event.target.closest(".project-card.is-spotlit, .skill-card.is-spotlit");
  if (card && (!event.relatedTarget || !card.contains(event.relatedTarget))) card.classList.remove("is-spotlit");
});
window.addEventListener("resize", () => {
  if (canvasRunning) resizeCanvas();
  updateScrollColor();
  if (compactLayout.matches) window.gsap?.set(".portrait-column, .fact-card, .story-stage", { x: 0 });
});
window.addEventListener("scroll", updateScrollColor, { passive: true });
document.addEventListener("pointerover", (event) => {
  const target = event.target.closest("[data-cursor]");
  if (!target || target === activeCursorTarget) return;
  activeCursorTarget = target;
  activeCursorLabel = target.dataset.cursor;
  cursorLabel.textContent = activeCursorLabel;
  cursor.classList.add("has-label");
});
document.addEventListener("pointerout", (event) => {
  if (!activeCursorTarget || !activeCursorTarget.contains(event.target)) return;
  if (event.relatedTarget && activeCursorTarget.contains(event.relatedTarget)) return;
  activeCursorTarget = null;
  activeCursorLabel = "";
  cursor.classList.remove("has-label");
});

document.querySelectorAll("[data-magnetic]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
    const bounds = element.getBoundingClientRect();
    const x = (event.clientX - bounds.left - bounds.width / 2) / bounds.width;
    const y = (event.clientY - bounds.top - bounds.height / 2) / bounds.height;
    element.style.setProperty("--magnetic-x", `${x * 7}px`);
    element.style.setProperty("--magnetic-y", `${y * 6}px`);
  });
  element.addEventListener("pointerleave", () => {
    element.style.setProperty("--magnetic-x", "0px");
    element.style.setProperty("--magnetic-y", "0px");
  });
});

let scrollAnimationsReady = false;
let revealObserver = null;

function revealWithoutGsap() {
  revealObserver?.disconnect();
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

}

function setupScrollAnimations() {
  if (reducedMotion.matches) {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const gsap = window.gsap;
  const scrollTrigger = window.ScrollTrigger;
  if (!gsap || !scrollTrigger) {
    revealWithoutGsap();
    return;
  }
  if (scrollAnimationsReady) return;
  scrollAnimationsReady = true;
  root.classList.add("gsap-ready");
  revealObserver?.disconnect();
  gsap.registerPlugin(scrollTrigger);

  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .fromTo(".hero-copy", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.72 })
    .fromTo(".hero-title-line", {
      autoAlpha: 0,
      y: 48,
      rotateX: -8,
      clipPath: "inset(0 0 100% 0)",
      transformOrigin: "50% 100%"
    }, {
      autoAlpha: 1,
      y: 0,
      rotateX: 0,
      clipPath: "inset(0 0 0% 0)",
      duration: 1.08,
      stagger: 0.17,
      ease: "power4.out"
    }, "-=0.38")
    .fromTo(".hero-description", {
      autoAlpha: 0,
      y: 18,
      clipPath: "inset(0 0 100% 0)"
    }, {
      autoAlpha: 1,
      y: 0,
      clipPath: "inset(0 0 0% 0)",
      duration: 0.82,
      ease: "power3.out"
    }, "-=0.55")
    .fromTo(".portrait-column", { autoAlpha: 0, x: compactLayout.matches ? 0 : 35, scale: 0.97 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.9, ease: "power3.out" }, "-=0.62");
  gsap.fromTo(".metric-card", { autoAlpha: 0, y: 16 }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.65,
    stagger: 0.09,
    ease: "power2.out",
    delay: 0.55
  });

  document.querySelectorAll(".section-heading, .story-heading, .contact-inner").forEach((heading) => {
    gsap.fromTo(heading, { autoAlpha: 0, y: 38 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: { trigger: heading, start: "top 84%", once: true }
    });
  });

  const factsGrid = document.querySelector(".about-facts");
  gsap.fromTo(".fact-card", { autoAlpha: 0, x: compactLayout.matches ? 0 : 24, y: compactLayout.matches ? 18 : 0 }, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    duration: 0.72,
    stagger: 0.12,
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: { trigger: factsGrid, start: "top 84%", once: true }
  });

  const skillsGrid = document.querySelector(".skills-grid");
  gsap.fromTo(".skill-card", { autoAlpha: 0, y: 42, scale: 0.94, rotationX: 8, rotationY: -5, transformPerspective: 900 }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    duration: 0.84,
    stagger: { each: 0.105, from: "start" },
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: { trigger: skillsGrid, start: "top 82%", once: true }
  });
  gsap.fromTo(".tech-marquee", { autoAlpha: 0, y: 24 }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: { trigger: ".tech-marquee", start: "top 90%", once: true }
  });

  const projectsGrid = document.querySelector(".projects-grid");
  gsap.fromTo(".project-card", { autoAlpha: 0, y: 52, scale: 0.95, rotationX: 7, rotationY: -4, transformPerspective: 1000 }, {
    autoAlpha: 1,
    y: 0,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    duration: 0.92,
    stagger: { each: 0.16, from: "start" },
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: { trigger: projectsGrid, start: "top 82%", once: true }
  });

  gsap.fromTo(".story-stage", { autoAlpha: 0, x: compactLayout.matches ? 0 : 28, y: compactLayout.matches ? 18 : 0 }, {
    autoAlpha: 1,
    x: 0,
    y: 0,
    duration: 0.75,
    stagger: 0.12,
    ease: "power3.out",
    clearProps: "transform",
    scrollTrigger: { trigger: ".story-timeline", start: "top 82%", once: true }
  });

  const assigned = new Set([
    ...document.querySelectorAll(".hero-copy, .portrait-column, .hero-metrics, .section-heading, .story-heading, .contact-inner, .fact-card, .skill-card, .project-card, .story-stage")
  ]);
  document.querySelectorAll(".reveal").forEach((element) => {
    if (assigned.has(element)) return;
    gsap.fromTo(element, { autoAlpha: 0, y: 28 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.7,
      ease: "power3.out",
      clearProps: "transform",
      scrollTrigger: { trigger: element, start: "top 88%", once: true }
    });
  });

  scrollTrigger.refresh();
}

function updateMotionPreference() {
  if (reducedMotion.matches) {
    stopCanvas();
    stopMotionLoop();
    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    lastTiltFrame = 0;
    tiltStates.forEach((state, target) => {
      state.active = false;
      state.x = 0;
      state.y = 0;
      state.vx = 0;
      state.vy = 0;
      state.vgx = 0;
      state.vgy = 0;
      state.glareX = 50;
      state.glareY = 50;
      state.targetX = 0;
      state.targetY = 0;
      state.targetGlareX = 50;
      state.targetGlareY = 50;
      target.style.setProperty("--tilt-x", "0deg");
      target.style.setProperty("--tilt-y", "0deg");
      target.style.setProperty("--glare-x", "50%");
      target.style.setProperty("--glare-y", "50%");
    });
    cursor.classList.remove("is-visible", "has-label");
    root.classList.remove("has-custom-cursor");
    window.gsap?.killTweensOf("*");
    window.ScrollTrigger?.getAll().forEach((trigger) => trigger.kill());
    scrollAnimationsReady = false;
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
    return;
  }
  if (finePointer.matches) root.classList.add("has-custom-cursor");
  startCanvas();
  setupScrollAnimations();
}

window.addEventListener("resize", updateScrollColor, { passive: true });
document.addEventListener("visibilitychange", () => {
  root.classList.toggle("page-hidden", document.hidden);
  if (document.hidden) {
    stopCanvas();
    stopMotionLoop();
    window.cancelAnimationFrame(tiltFrame);
    tiltFrame = 0;
    lastTiltFrame = 0;
  } else {
    startCanvas();
    if ([...tiltStates.values()].some((state) => state.active)) scheduleTiltFrame();
  }
});
reducedMotion.addEventListener("change", updateMotionPreference);
finePointer.addEventListener("change", () => {
  if (!finePointer.matches || reducedMotion.matches) root.classList.remove("has-custom-cursor");
});

updateScrollColor();
updateMotionPreference();
