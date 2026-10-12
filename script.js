/* ==========================================================
   Your works are stored in works.json (same folder).
   To add a new work, open works.json and copy one block.
   - category: "digital" or "traditional"
   - image: path to your picture (example: "images/my-art.jpg").
            Leave it empty ("") to show a colored box for now.
   - link: the store page of that product
   ========================================================== */
let WORKS = [];

const PAGE_SIZE = 6;     // works shown at first, and each time "See more" is clicked
const PREVIEW_CHARS = 50; // characters shown before "Read more"

const grid = document.getElementById("grid");
const emptyMsg = document.getElementById("empty");
const seeMoreBtn = document.getElementById("seeMore");
const filterBtns = document.querySelectorAll(".filter");

let currentFilter = "all";
let currentList = [];
let shown = 0;

const LABELS = { digital: "Digital art", traditional: "Traditional art" };

function makeCard(work) {
  const card = document.createElement("article");
  card.className = "card";

  // Picture or colored box
  const media = document.createElement("div");
  media.className = "card-media";
  if (work.image) {
    const img = document.createElement("img");
    img.src = work.image;
    img.alt = work.name;
    img.loading = "lazy";
    media.appendChild(img);
  } else {
    const box = document.createElement("div");
    box.className = "placeholder " + work.category;
    box.textContent = work.name.charAt(0);
    box.setAttribute("aria-hidden", "true");
    media.appendChild(box);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = LABELS[work.category] || "";

  const title = document.createElement("h3");
  title.textContent = work.name;

  // Description with Read more / Read less
  const desc = document.createElement("p");
  desc.className = "desc";
  const full = work.description;
  const needsToggle = full.length > PREVIEW_CHARS;
  const short = full.slice(0, PREVIEW_CHARS).trimEnd() + "...";
  desc.textContent = needsToggle ? short : full;
  body.append(tag, title, desc);

  if (needsToggle) {
    const toggle = document.createElement("button");
    toggle.className = "readmore";
    toggle.type = "button";
    toggle.textContent = "Read more";
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      desc.textContent = open ? short : full;
      toggle.textContent = open ? "Read more" : "Read less";
      toggle.setAttribute("aria-expanded", String(!open));
    });
    body.appendChild(toggle);
  }

  // Link to the product page in the store
  const link = document.createElement("a");
  link.className = "card-link";
  link.href = work.link;
  link.target = "_blank";
  link.rel = "noopener";
  const linkText = document.createElement("span");
  linkText.textContent = "View in store";
  link.appendChild(linkText);
  body.appendChild(link);

  card.append(media, body);
  return card;
}

function showNext() {
  const next = currentList.slice(shown, shown + PAGE_SIZE);
  next.forEach((work) => grid.appendChild(makeCard(work)));
  shown += next.length;
  seeMoreBtn.hidden = shown >= currentList.length;
}

function applyFilter(filter) {
  currentFilter = filter;
  currentList = WORKS.filter((w) => filter === "all" || w.category === filter);
  shown = 0;
  grid.replaceChildren();
  emptyMsg.hidden = currentList.length > 0;
  showNext();

  filterBtns.forEach((btn) => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
}

filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => applyFilter(btn.dataset.filter))
);
seeMoreBtn.addEventListener("click", showNext);

document.getElementById("year").textContent = new Date().getFullYear();

// Load the works from works.json, then show them
fetch("works.json")
  .then((res) => {
    if (!res.ok) throw new Error("Could not read works.json");
    return res.json();
  })
  .then((data) => {
    WORKS = data;
    applyFilter("all");
  })
  .catch(() => {
    emptyMsg.textContent =
      "Could not load the works. Check that works.json is in the same folder, and open the site from a server (see the note in the chat).";
    emptyMsg.hidden = false;
  });
