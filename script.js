// ---------- Tiny helper ----------
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

// ---------- Theme (with persistence) ----------
const root = document.documentElement;
const storedTheme = localStorage.getItem("theme");
if (storedTheme === "dark") root.classList.add("dark");
$("#themeToggle").addEventListener("click", () => {
  const isDark = root.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// ---------- Mobile nav ----------
const navToggle = $(".nav-toggle");
const menu = $("#primary-menu");
if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = menu.style.display === "flex";
    menu.style.display = open ? "none" : "flex";
    navToggle.setAttribute("aria-expanded", String(!open));
  });
}
// Close menu on link click (mobile)
$$(".menu a").forEach(a => a.addEventListener("click", () => {
  if (getComputedStyle(navToggle).display !== "none") {
    menu.style.display = "none";
    navToggle.setAttribute("aria-expanded", "false");
  }
}));

// ---------- Smooth scroll ----------
$$('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href").slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ---------- Dynamic content (Demo data) ----------
const announcements = [
  { title: "Parent-Teacher Conferences", date: "2025-10-02", body: "Sign up via the shared sheet. Each meeting is 15 minutes." },
  { title: "Field Trip Permission Slips", date: "2025-09-30", body: "Please return slips by Tuesday. Volunteers welcome!" },
  { title: "Unit 2 Assessments", date: "2025-10-06", body: "Assessments will be held during regular class time." },
];

const resources = [
  { title: "Syllabus (English Literature)", type: "PDF", url: "#", note: "Overview, grading, and policies" },
  { title: "Poetry Slides — Metaphor & Meter", type: "Slide", url: "#", note: "Interactive lesson slides" },
  { title: "Writing Rubric", type: "Doc", url: "#", note: "Criteria for essays and short responses" },
  { title: "Research Databases (Library)", type: "Link", url: "#", note: "Peer‑reviewed journals & magazines" },
  { title: "Shakespeare Sonnet Worksheet", type: "PDF", url: "#", note: "Practice with sonnet structure" },
];

const schedule = [
  { when: "Mon, 8:30–10:00", title: "English 9 — Room 204" },
  { when: "Mon, 10:15–11:45", title: "English 10 — Room 210" },
  { when: "Tue, 9:00–10:30", title: "Dept. Planning Meeting — Library" },
  { when: "Wed, 1:00–2:30", title: "English 9 — Room 204" },
  { when: "Thu, 11:00–12:00", title: "Office Hours — Room 110" },
  { when: "Fri, 8:30–10:00", title: "English 10 — Room 210" },
];

// ---------- Render helpers ----------
function cardAnnouncement(a) {
  const li = document.createElement("article");
  li.className = "card";
  li.innerHTML = `
    <h3>${a.title}</h3>
    <p class="muted">${new Date(a.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
    <p>${a.body}</p>
  `;
  return li;
}

function cardResource(r) {
  const div = document.createElement("article");
  div.className = "card";
  div.innerHTML = `
    <div style="display:flex; align-items:center; gap:.6rem;">
      <h3 style="margin:0;">${r.title}</h3>
      <span class="badge">${r.type}</span>
    </div>
    <p class="muted">${r.note}</p>
    <div style="display:flex; gap:.6rem; margin-top:.4rem;">
      <a class="btn btn-outline" href="${r.url}" target="_blank" rel="noopener">Open</a>
    </div>
  `;
  return div;
}

function itemSchedule(s) {
  const li = document.createElement("li");
  li.innerHTML = `<strong>${s.when}</strong> — ${s.title}`;
  return li;
}

// ---------- Populate sections ----------
const announcementList = $("#announcementList");
const resourceList = $("#resourceList");
const scheduleList = $("#scheduleList");
announcements.forEach(a => announcementList.appendChild(cardAnnouncement(a)));
resources.forEach(r => resourceList.appendChild(cardResource(r)));
schedule.forEach(s => scheduleList.appendChild(itemSchedule(s)));

// ---------- Resource filtering ----------
const searchInput = $("#resourceSearch");
const typeFilter = $("#typeFilter");

function filterResources() {
  const q = (searchInput.value || "").toLowerCase();
  const t = typeFilter.value;
  resourceList.innerHTML = "";
  resources
    .filter(r => (!t || r.type === t) && (r.title.toLowerCase().includes(q) || r.note.toLowerCase().includes(q)))
    .forEach(r => resourceList.appendChild(cardResource(r)));
}
searchInput.addEventListener("input", filterResources);
typeFilter.addEventListener("change", filterResources);

// ---------- Assignments (LocalStorage) ----------
const assignmentForm = $("#assignmentForm");
const assignmentList = $("#assignmentList");
const assignmentEmpty = $("#assignmentEmpty");
const ASSIGN_KEY = "teacherhub.assignments.v1";

function loadAssignments() {
  try {
    return JSON.parse(localStorage.getItem(ASSIGN_KEY) || "[]");
  } catch { return []; }
}
function saveAssignments(items) {
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(items));
}
function renderAssignments() {
  const items = loadAssignments();
  assignmentList.innerHTML = "";
  if (items.length === 0) {
    assignmentEmpty.hidden = false;
    return;
  }
  assignmentEmpty.hidden = true;
  items.forEach((it, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${it.title}</strong> — due ${new Date(it.due).toLocaleDateString()}
        ${it.details ? `<div class="muted">${it.details}</div>` : ""}
      </div>
      <button class="btn btn-outline tag" data-idx="${idx}">Remove</button>
    `;
    assignmentList.appendChild(li);
  });
}
renderAssignments();
assignmentList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-idx]");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const items = loadAssignments();
  items.splice(idx, 1);
  saveAssignments(items);
  renderAssignments();
});

assignmentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(assignmentForm);
  const title = String(data.get("title") || "").trim();
  const due = String(data.get("due") || "");
  const details = String(data.get("details") || "").trim();

  // Simple validation
  let ok = true;
  const setErr = (name, msg) => {
    const el = $(`.error[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };
  setErr("title"); setErr("due");

  if (!title) { setErr("title", "Title is required."); ok = false; }
  if (!due) { setErr("due", "Due date is required."); ok = false; }

  if (!ok) return;

  const items = loadAssignments();
  items.push({ title, due, details });
  saveAssignments(items);
  assignmentForm.reset();
  renderAssignments();
});

// ---------- Contact form (demo only) ----------
const contactForm = $("#contactForm");
const contactSuccess = $("#contactSuccess");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const message = String(data.get("message") || "").trim();

  let ok = true;
  const setErr = (name, msg) => {
    const el = $(`.error[data-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };
  setErr("name"); setErr("email"); setErr("message");

  if (!name) { setErr("name", "Name is required."); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("email", "Valid email required."); ok = false; }
  if (!message) { setErr("message", "Message cannot be empty."); ok = false; }

  if (!ok) return;

  // In a real site, you'd POST to a backend. Here we store locally.
  const inbox = JSON.parse(localStorage.getItem("teacherhub.inbox.v1") || "[]");
  inbox.push({ name, email, message, ts: Date.now() });
  localStorage.setItem("teacherhub.inbox.v1", JSON.stringify(inbox));
  contactSuccess.hidden = false;
  contactForm.reset();
  setTimeout(() => (contactSuccess.hidden = true), 3000);
});

// ---------- Footer year ----------
$("#year").textContent = new Date().getFullYear();
