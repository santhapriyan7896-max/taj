/* =========================================================
   Taj Home Caterers — site script
   ---------------------------------------------------------
   EDIT THE CONFIG BLOCK BELOW. Everything else updates itself:
   phone numbers, WhatsApp links, email, address and the
   Instagram handle are injected across the whole page.
   ========================================================= */

const CONFIG = {
  // Business phone. Use full international format, digits only, no "+".
  // Example for India: "919876543210"  (91 = country code)
  phoneIntl: "910000000000",

  // How the number should read on screen.
  phoneDisplay: "+91 00000 00000",

  // WhatsApp number — usually the same as phoneIntl.
  whatsappIntl: "910000000000",

  // The message that is pre-typed for the customer when they tap WhatsApp.
  whatsappMessage: "Hi Taj Home Caterers! I'd like a quote for an event.",

  email: "hello@tajhomecaterers.com",

  address: "[Add your address here]",

  instagram: "https://instagram.com/tajhomecaterers",

  // ---- Where enquiry form submissions go -------------------
  // Easiest option: create a free form at https://formspree.io,
  // then paste your endpoint here, e.g.
  //   formEndpoint: "https://formspree.io/f/xyzabcde"
  // Leave it empty ("") and the form falls back to opening
  // WhatsApp with all the details pre-filled.
  formEndpoint: ""
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =========================================================
   1. Contact details injected everywhere
   ========================================================= */
function waLink(extra) {
  const text = extra ? `${CONFIG.whatsappMessage}\n\n${extra}` : CONFIG.whatsappMessage;
  return `https://wa.me/${CONFIG.whatsappIntl}?text=${encodeURIComponent(text)}`;
}

function applyConfig() {
  const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
  set('[data-role="tel-link"]',       el => el.setAttribute("href", `tel:+${CONFIG.phoneIntl}`));
  set('[data-role="phone-display"]',  el => (el.textContent = CONFIG.phoneDisplay));
  set('[data-role="wa-link"]',        el => el.setAttribute("href", waLink()));
  set('[data-role="mail-link"]',      el => el.setAttribute("href", `mailto:${CONFIG.email}`));
  set('[data-role="email-display"]',  el => (el.textContent = CONFIG.email));
  set('[data-role="address-display"]',el => (el.textContent = CONFIG.address));
  set('[data-role="ig-link"]',        el => el.setAttribute("href", CONFIG.instagram));
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================================================
   2. Reading progress bar
   ========================================================= */
function setupProgress() {
  const bar = document.querySelector("#progress i");
  if (!bar) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

/* =========================================================
   3. Navigation
   ========================================================= */
function setupNav() {
  const navWrap = document.getElementById("navWrap");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!navWrap || !toggle || !links) return;

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  const onScroll = () => navWrap.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const sections = [...document.querySelectorAll("main section[id]")];
  const anchors = new Map();
  links.querySelectorAll('a[href^="#"]').forEach(a => anchors.set(a.getAttribute("href").slice(1), a));

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver(
      entries =>
        entries.forEach(e => {
          const a = anchors.get(e.target.id);
          if (!a || !e.isIntersecting) return;
          anchors.forEach(x => x.classList.remove("active"));
          a.classList.add("active");
        }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(s => spy.observe(s));
  }
}

/* =========================================================
   4. Scroll reveal + word-split headings
   ========================================================= */
function splitHeadings() {
  document.querySelectorAll("[data-split]").forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const walk = node => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part.trim()) {
              frag.appendChild(document.createTextNode(part));
              return;
            }
            const w = document.createElement("span");
            w.className = "w";
            const i = document.createElement("i");
            i.textContent = part;
            w.appendChild(i);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
    // stagger each word
    el.querySelectorAll(".w > i").forEach((i, n) => {
      i.style.transitionDelay = `${Math.min(n * 45, 600)}ms`;
    });
  });
}

function setupReveal() {
  const items = document.querySelectorAll(".reveal, [data-split], .sec-head");
  if (!items.length) return;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    items.forEach(i => i.classList.add("in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) =>
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }),
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  items.forEach(i => io.observe(i));
}

/* =========================================================
   5. Animated counters
   ========================================================= */
function setupCounters() {
  const nums = document.querySelectorAll("[data-count]");
  if (!nums.length || !("IntersectionObserver" in window) || reduceMotion) return;

  const io = new IntersectionObserver(
    (entries, obs) =>
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const dur = 1500;
        const start = performance.now();
        const tick = now => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }),
    { threshold: 0.5 }
  );
  nums.forEach(n => io.observe(n));
}

/* =========================================================
   6. Hero parallax
   ========================================================= */
function setupParallax() {
  const media = document.getElementById("heroMedia");
  const hero = document.querySelector(".hero");
  if (!media || !hero || reduceMotion) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (y < hero.offsetHeight * 1.2) {
      media.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    }
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
}

/* =========================================================
   7. Magnetic buttons
   ========================================================= */
function setupMagnetic() {
  if (reduceMotion || !window.matchMedia("(hover: hover)").matches) return;
  document.querySelectorAll(".magnetic").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - r.left - r.width / 2;
      const my = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${mx * 0.16}px, ${my * 0.26 - 2}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}

/* =========================================================
   8. Marquee — duplicate for a seamless loop
   ========================================================= */
function setupMarquee() {
  const track = document.getElementById("marqueeTrack");
  if (track) track.innerHTML += track.innerHTML;
}

/* =========================================================
   9. THE SADHYA — dishes served onto the leaf as you scroll
   ---------------------------------------------------------
   Each entry is positioned as a percentage of the leaf stage.
   `art` returns the SVG for that dish. Reorder, rename or add
   entries freely — the caption, chips and progress all derive
   from this one array.
   ========================================================= */

// small drawing helpers, mirrored from images/_generate.py
const P = {
  gold: "#c9a227", gold3: "#e3c96f", gold1: "#f4e9c6",
  ivory: "#fffdf7", cream: "#faf6ec", clay: "#d8c9ac",
  rice: "#fbf6e8", coconut: "#f6efdd",
  turmeric: "#e0a52c", saffron: "#e2812f", tomato: "#c04a2e",
  chilli: "#a83824", spinach: "#54803f", mint: "#7ea75f",
  gravy: "#8a5330", beet: "#8e3f57", green9: "#12321e"
};

function svgWrap(inner, size = 120) {
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true">${inner}</svg>`;
}

// a serving of curry in a small dip
function dip(colour, extra = "") {
  return svgWrap(`
    <ellipse cx="60" cy="64" rx="46" ry="34" fill="${P.green9}" opacity=".2"/>
    <ellipse cx="60" cy="60" rx="46" ry="34" fill="${colour}"/>
    <ellipse cx="46" cy="50" rx="14" ry="9" fill="${P.ivory}" opacity=".22"/>
    ${extra}`);
}

// a mound of something (rice, poriyal…)
function heap(colour, seed = 1, r = 44) {
  let pts = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rr = r * (0.85 + (Math.sin(seed * 9.7 + i * 2.3) + 1) * 0.11);
    pts.push(`${(60 + Math.cos(a) * rr).toFixed(1)},${(60 + Math.sin(a) * rr * 0.86).toFixed(1)}`);
  }
  let lumps = "";
  for (let i = 0; i < 9; i++) {
    const a = seed * 3.1 + i * 1.7;
    const d = ((i * 37) % 100) / 100 * r * 0.55;
    lumps += `<circle cx="${(60 + Math.cos(a) * d).toFixed(1)}" cy="${(60 + Math.sin(a) * d * 0.8).toFixed(1)}" r="${(r * 0.13).toFixed(1)}" fill="${P.ivory}" opacity=".2"/>`;
  }
  return svgWrap(`
    <ellipse cx="60" cy="66" rx="${r}" ry="${r * 0.6}" fill="${P.green9}" opacity=".18"/>
    <polygon points="${pts.join(" ")}" fill="${colour}"/>${lumps}`);
}

const DISHES = [
  { name: "Banana leaf", note: "Laid wide end to the left, as tradition asks",
    x: 50, y: 50, size: 0, art: () => "" },   // decorative first beat, no art

  { name: "Salt & pickle", note: "The first thing on the leaf, always",
    x: 11, y: 30, size: 78,
    art: () => svgWrap(`
      <ellipse cx="42" cy="66" rx="20" ry="14" fill="${P.chilli}"/>
      <ellipse cx="80" cy="64" rx="15" ry="11" fill="${P.ivory}"/>
      <ellipse cx="80" cy="62" rx="12" ry="8" fill="${P.cream}"/>`) },

  { name: "Pappadam", note: "Crisp, and it goes on top of the rice later",
    x: 22, y: 26, size: 92,
    art: () => svgWrap(`
      <circle cx="60" cy="62" r="40" fill="${P.green9}" opacity=".18"/>
      <circle cx="60" cy="58" r="40" fill="${P.gold1}"/>
      <circle cx="60" cy="58" r="40" fill="none" stroke="${P.gold3}" stroke-width="3"/>
      <circle cx="48" cy="48" r="4" fill="${P.gravy}" opacity=".5"/>
      <circle cx="72" cy="66" r="3.4" fill="${P.gravy}" opacity=".45"/>
      <circle cx="62" cy="40" r="2.8" fill="${P.gravy}" opacity=".4"/>`) },

  { name: "Thoran", note: "Cabbage and coconut, dry-tossed",
    x: 33, y: 25, size: 96, art: () => heap(P.mint, 2, 40) },

  { name: "Avial", note: "Mixed vegetables in thick coconut and curd",
    x: 45, y: 24, size: 100, art: () => heap(P.coconut, 3, 42) },

  { name: "Beetroot pachadi", note: "Sweet, sour, and unmistakably pink",
    x: 57, y: 24, size: 92, art: () => dip(P.beet) },

  { name: "Olan", note: "Ash gourd simmered in coconut milk",
    x: 69, y: 25, size: 92, art: () => dip(P.ivory,
      `<circle cx="50" cy="56" r="9" fill="${P.spinach}" opacity=".55"/>
       <circle cx="72" cy="64" r="7" fill="${P.spinach}" opacity=".45"/>`) },

  { name: "Kootu curry", note: "Black chana, yam and roasted coconut",
    x: 81, y: 27, size: 92, art: () => dip(P.gravy) },

  { name: "Rice", note: "The centre of the leaf. Heaped, steaming",
    x: 43, y: 62, size: 190, art: () => heap(P.rice, 5, 50) },

  { name: "Parippu & ghee", note: "Dal first, with a spoon of ghee over it",
    x: 43, y: 62, size: 120,
    art: () => svgWrap(`
      <ellipse cx="60" cy="60" rx="34" ry="24" fill="${P.turmeric}" opacity=".95"/>
      <ellipse cx="54" cy="54" rx="11" ry="7" fill="${P.gold3}" opacity=".9"/>
      <ellipse cx="68" cy="64" rx="7" ry="5" fill="${P.gold1}" opacity=".8"/>`) },

  { name: "Sambar", note: "Poured over the rice, second course",
    x: 63, y: 63, size: 130,
    art: () => svgWrap(`
      <ellipse cx="60" cy="60" rx="40" ry="28" fill="${P.saffron}"/>
      <ellipse cx="60" cy="60" rx="40" ry="28" fill="${P.tomato}" opacity=".35"/>
      <circle cx="48" cy="54" r="6" fill="${P.spinach}" opacity=".8"/>
      <circle cx="72" cy="66" r="5" fill="${P.gravy}" opacity=".7"/>
      <circle cx="64" cy="50" r="4" fill="${P.turmeric}"/>`) },

  { name: "Rasam", note: "Thin, peppery, and it clears the palate",
    x: 82, y: 62, size: 110,
    art: () => dip(P.tomato,
      `<circle cx="52" cy="56" r="4" fill="${P.chilli}"/>
       <circle cx="70" cy="64" r="3.4" fill="${P.spinach}"/>`) },

  { name: "Payasam", note: "Served last, and often twice",
    x: 23, y: 65, size: 116,
    art: () => svgWrap(`
      <ellipse cx="60" cy="66" rx="40" ry="28" fill="${P.green9}" opacity=".2"/>
      <ellipse cx="60" cy="62" rx="40" ry="28" fill="${P.ivory}"/>
      <ellipse cx="60" cy="60" rx="32" ry="21" fill="${P.gold1}"/>
      <circle cx="52" cy="56" r="4" fill="${P.gravy}"/>
      <circle cx="66" cy="62" r="3.5" fill="${P.clay}"/>
      <circle cx="60" cy="52" r="3" fill="${P.gold}"/>`) }
];

function setupSadhya() {
  const track = document.getElementById("sadhyaTrack");
  const stage = document.getElementById("dishes");
  const veins = document.getElementById("leafVeins");
  if (!track || !stage) return;

  // draw leaf veins
  if (veins) {
    let v = "";
    for (let i = 1; i < 44; i++) {
      const x = 90 + i * (1220 / 44);
      v += `<line x1="${x.toFixed(0)}" y1="310" x2="${(x + 22).toFixed(0)}" y2="182"/>`;
      v += `<line x1="${x.toFixed(0)}" y1="310" x2="${(x + 22).toFixed(0)}" y2="438"/>`;
    }
    veins.innerHTML = v;
  }

  // build dish nodes
  const nodes = DISHES.map((d, i) => {
    if (!d.size) return null;
    const el = document.createElement("div");
    el.className = "dish";
    el.style.left = `${d.x}%`;
    el.style.top = `${d.y}%`;
    el.style.width = `${d.size / 10}%`;
    el.style.aspectRatio = "1";
    el.style.zIndex = String(10 + i);
    el.innerHTML = d.art() + `<span class="dish-label">${d.name}</span>`;
    stage.appendChild(el);
    return el;
  });

  // build the "served so far" chips
  const list = document.getElementById("servedList");
  const chips = DISHES.map(d => {
    const li = document.createElement("li");
    li.textContent = d.name;
    list?.appendChild(li);
    return li;
  });

  const dcIndex = document.getElementById("dcIndex");
  const dcName = document.getElementById("dcName");
  const dcNote = document.getElementById("dcNote");
  const countEl = document.getElementById("servedCount");
  const totalEl = document.getElementById("servedTotal");
  if (totalEl) totalEl.textContent = String(DISHES.length);

  // reduced motion: serve everything, skip the scroll choreography
  if (reduceMotion) {
    nodes.forEach(n => n && n.classList.add("served"));
    chips.forEach(c => c.classList.add("on"));
    if (countEl) countEl.textContent = String(DISHES.length);
    if (dcName) dcName.textContent = "The full sadhya";
    if (dcNote) dcNote.textContent = `${DISHES.length} dishes on one leaf`;
    if (dcIndex) dcIndex.textContent = String(DISHES.length).padStart(2, "0");
    return;
  }

  let shown = -1;

  const render = () => {
    const rect = track.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    // 0 → 1 across the sticky section, with a lead-in and a hold at the end
    let p = total > 0 ? (-rect.top) / total : 0;
    p = Math.max(0, Math.min(1, p));
    const eased = Math.max(0, Math.min(1, (p - 0.06) / 0.82));
    const count = Math.min(DISHES.length, Math.floor(eased * DISHES.length + 0.0001) + (eased > 0 ? 1 : 0));
    const idx = Math.max(0, count - 1);

    if (idx === shown) return;
    const goingForward = idx > shown;
    shown = idx;

    nodes.forEach((n, i) => {
      if (!n) return;
      const on = i <= idx;
      n.classList.toggle("served", on);
      if (on && goingForward && i === idx) {
        n.classList.remove("just-served");
        void n.offsetWidth;
        n.classList.add("just-served");
      }
    });
    chips.forEach((c, i) => c.classList.toggle("on", i <= idx));

    const d = DISHES[idx];
    if (dcIndex) dcIndex.textContent = String(idx + 1).padStart(2, "0");
    if (dcName) dcName.textContent = d.name;
    if (dcNote) dcNote.textContent = d.note;
    if (countEl) countEl.textContent = String(idx + 1);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      render();
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  render();
}

/* =========================================================
   10. Gallery filtering
   ========================================================= */
function setupGalleryFilters() {
  const filters = document.getElementById("galleryFilters");
  const grid = document.getElementById("galleryGrid");
  if (!filters || !grid) return;

  filters.addEventListener("click", e => {
    const btn = e.target.closest(".filter");
    if (!btn) return;
    filters.querySelectorAll(".filter").forEach(f => f.classList.remove("is-active"));
    btn.classList.add("is-active");
    const cat = btn.dataset.filter;
    grid.querySelectorAll(".g-item").forEach(item => {
      item.classList.toggle("hidden", !(cat === "all" || item.dataset.cat === cat));
    });
  });
}

/* =========================================================
   11. Lightbox
   ========================================================= */
function setupLightbox() {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCap = document.getElementById("lbCap");
  const grid = document.getElementById("galleryGrid");
  if (!lb || !grid) return;

  let visible = [];
  let index = 0;

  const collectFigs = () => [...grid.querySelectorAll(".g-item:not(.hidden)")].filter(f => f.querySelector("img"));

  const show = i => {
    if (!visible.length) return;
    index = (i + visible.length) % visible.length;
    const fig = visible[index];
    const img = fig.querySelector("img");
    const cap = fig.querySelector("figcaption");
    lbImg.src = img.getAttribute("src");
    lbImg.alt = img.getAttribute("alt") || "";
    lbCap.textContent = cap ? cap.textContent : "";
  };

  const close = () => {
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  };

  grid.addEventListener("click", e => {
    const fig = e.target.closest(".g-item");
    if (!fig || !fig.querySelector("img")) return;
    visible = collectFigs();
    const i = visible.indexOf(fig);
    if (i === -1) return;
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  });

  document.getElementById("lbClose")?.addEventListener("click", close);
  document.getElementById("lbPrev")?.addEventListener("click", () => show(index - 1));
  document.getElementById("lbNext")?.addEventListener("click", () => show(index + 1));
  lb.addEventListener("click", e => { if (e.target === lb) close(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}

/* =========================================================
   12. Sticky mobile action bar
   ========================================================= */
function setupActionBar() {
  const bar = document.getElementById("actionBar");
  const hero = document.querySelector(".hero");
  if (!bar || !hero) return;
  const onScroll = () => bar.classList.toggle("show", window.scrollY > hero.offsetHeight * 0.6);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* =========================================================
   13. Menu buttons pre-fill the form
   ========================================================= */
function setupMenuLinks() {
  document.querySelectorAll("[data-pkg]").forEach(btn => {
    btn.addEventListener("click", () => {
      const msg = document.getElementById("fmsg");
      if (!msg) return;
      const line = `I'm interested in ${btn.dataset.pkg} menu.`;
      if (!msg.value.includes(line)) msg.value = msg.value ? `${line}\n${msg.value}` : line;
    });
  });
}

/* =========================================================
   14. Enquiry form
   ========================================================= */
function setupForm() {
  const form = document.getElementById("enquiryForm");
  if (!form) return;

  const statusEl = document.getElementById("formStatus");
  const successEl = document.getElementById("formSuccess");
  const submitBtn = document.getElementById("submitBtn");

  const collect = () => Object.fromEntries(new FormData(form).entries());
  const fieldOf = i => i.closest(".field");

  const setError = (input, msg) => {
    const f = fieldOf(input);
    if (!f) return;
    f.classList.add("invalid");
    const err = f.querySelector(".err");
    if (err) err.textContent = msg;
  };
  const clearError = i => fieldOf(i)?.classList.remove("invalid");

  form.querySelectorAll("input,select,textarea").forEach(el => {
    el.addEventListener("input", () => clearError(el));
    el.addEventListener("change", () => clearError(el));
  });

  const validate = () => {
    let ok = true, firstBad = null;
    const name = form.querySelector("#fname");
    const phone = form.querySelector("#fphone");
    const evt = form.querySelector("#fevent");
    const guests = form.querySelector("#fguests");

    if (name.value.trim().length < 2) { setError(name, "Please tell us your name."); ok = false; firstBad ||= name; }
    if (phone.value.replace(/\D/g, "").length < 10) { setError(phone, "Please enter a valid phone number."); ok = false; firstBad ||= phone; }
    if (!evt.value) { setError(evt, "Please pick an event type."); ok = false; firstBad ||= evt; }
    if (!guests.value || Number(guests.value) < 1) { setError(guests, "Roughly how many guests?"); ok = false; firstBad ||= guests; }

    firstBad?.focus();
    return ok;
  };

  const summary = d =>
    [["Name", d.name], ["Phone", d.phone], ["Event", d.event_type], ["Date", d.event_date],
     ["Guests", d.guests], ["Preference", d.preference], ["Venue", d.venue], ["Notes", d.message]]
      .filter(([, v]) => v && String(v).trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

  const showSuccess = data => {
    const nameEl = document.getElementById("successName");
    if (nameEl) nameEl.textContent = data.name ? `, ${data.name.split(" ")[0]}` : "";
    form.hidden = true;
    if (!successEl) return;
    successEl.hidden = false;
    successEl.querySelectorAll('[data-role="wa-link"]').forEach(a =>
      a.setAttribute("href", waLink(summary(data)))
    );
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = "";
    if (!validate()) return;

    const data = collect();
    const label = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    // No backend configured — hand off to WhatsApp with everything filled in.
    if (!CONFIG.formEndpoint) {
      window.open(waLink(summary(data)), "_blank", "noopener");
      submitBtn.disabled = false;
      submitBtn.textContent = label;
      showSuccess(data);
      return;
    }

    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });
      if (!res.ok) throw new Error("Bad response");
      showSuccess(data);
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = label;
      if (statusEl) {
        statusEl.innerHTML =
          `Couldn't send just now. Please <a href="${waLink(summary(data))}" target="_blank" rel="noopener">message us on WhatsApp</a> or call <a href="tel:+${CONFIG.phoneIntl}">${CONFIG.phoneDisplay}</a>.`;
      }
    }
  });

  document.getElementById("resetForm")?.addEventListener("click", () => {
    form.reset();
    form.hidden = false;
    if (successEl) successEl.hidden = true;
    if (statusEl) statusEl.textContent = "";
    submitBtn.disabled = false;
    submitBtn.textContent = "Send Enquiry";
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/* =========================================================
   15. FAQ — one open at a time
   ========================================================= */
function setupFaq() {
  const items = [...document.querySelectorAll(".faq-item")];
  items.forEach(item =>
    item.addEventListener("toggle", () => {
      if (item.open) items.forEach(o => { if (o !== item) o.open = false; });
    })
  );
}

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  splitHeadings();
  setupProgress();
  setupNav();
  setupReveal();
  setupCounters();
  setupParallax();
  setupMagnetic();
  setupMarquee();
  setupSadhya();
  setupGalleryFilters();
  setupLightbox();
  setupActionBar();
  setupMenuLinks();
  setupForm();
  setupFaq();
});
