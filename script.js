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
  gravy: "#8a5330", beet: "#8e3f57", green9: "#12321e",
  // non-veg
  fried: "#d98f2b", char: "#8a4a26", crust: "#c67c22",
  prawn: "#e07a46", eggWhite: "#fbf3e4", yolk: "#e8b02b",
  chicken: "#b8552a", mutton: "#6b3b21", masala: "#a33f22"
};

// Dish art is authored inside a 120 x 120 box and drawn directly into the
// leaf's SVG, so it needs no wrapper element of its own.
const ART_BOX = 120;
function svgWrap(inner) {
  return inner;
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

// ---- non-veg shapes ---------------------------------------------------

// a whole fried fish, head to the left
function fishFry() {
  return `
    <ellipse cx="60" cy="72" rx="44" ry="16" fill="${P.green9}" opacity=".18"/>
    <path d="M84 60 L108 42 L102 60 L108 78 Z" fill="${P.crust}"/>
    <path d="M22 60 Q46 26 84 60 Q46 94 22 60 Z" fill="${P.fried}"/>
    <path d="M50 40 Q60 30 70 44 Q60 46 50 40 Z" fill="${P.crust}"/>
    <ellipse cx="52" cy="52" rx="8" ry="4" fill="${P.char}" opacity=".45"/>
    <ellipse cx="66" cy="66" rx="9" ry="4" fill="${P.char}" opacity=".4"/>
    <ellipse cx="40" cy="64" rx="6" ry="3" fill="${P.char}" opacity=".35"/>
    <circle cx="36" cy="56" r="3.4" fill="#4a2c12"/>`;
}

// fried chunks — chicken 65, chukka, dry roasts
function chunks(colour, seed = 1, n = 7) {
  let out = `<ellipse cx="60" cy="70" rx="42" ry="18" fill="${P.green9}" opacity=".18"/>`;
  for (let i = 0; i < n; i++) {
    const a = seed * 2.3 + i * 2.399;
    const d = 6 + ((i * 29) % 100) / 100 * 26;
    const x = 60 + Math.cos(a) * d;
    const y = 60 + Math.sin(a) * d * 0.72;
    const r = 11 + ((i * 17) % 10);
    out += `<rect x="${(x - r / 2).toFixed(1)}" y="${(y - r / 2).toFixed(1)}" width="${r}" height="${(r * 0.86).toFixed(1)}" rx="${(r * 0.34).toFixed(1)}" fill="${colour}" transform="rotate(${((i * 47) % 90) - 45} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
    out += `<circle cx="${(x - r * 0.18).toFixed(1)}" cy="${(y - r * 0.2).toFixed(1)}" r="${(r * 0.16).toFixed(1)}" fill="${P.ivory}" opacity=".22"/>`;
  }
  // curry leaves
  out += `<ellipse cx="44" cy="44" rx="7" ry="3.4" fill="${P.spinach}" transform="rotate(-25 44 44)"/>`;
  out += `<ellipse cx="76" cy="74" rx="6" ry="3" fill="${P.spinach}" transform="rotate(20 76 74)"/>`;
  return out;
}

// prawn roast — three curled prawns
function prawns() {
  let out = `<ellipse cx="60" cy="70" rx="40" ry="17" fill="${P.green9}" opacity=".18"/>`;
  const place = [[44, 50, 1], [72, 58, -1], [56, 76, 1]];
  place.forEach(([cx, cy, dir], p) => {
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 1.15) - i * 0.42 * dir;
      const x = cx + Math.cos(a) * 13;
      const y = cy + Math.sin(a) * 13;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(6.4 - i * 0.55).toFixed(1)}" fill="${P.prawn}"/>`;
      if (i % 2 === 0)
        out += `<circle cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="${(3.4 - i * 0.3).toFixed(1)}" fill="${P.ivory}" opacity=".3"/>`;
    }
    const tx = cx + Math.cos(Math.PI * 1.15 - 6 * 0.42 * dir) * 13;
    const ty = cy + Math.sin(Math.PI * 1.15 - 6 * 0.42 * dir) * 13;
    out += `<path d="M${tx.toFixed(1)} ${ty.toFixed(1)} l${6 * dir} -5 l0 10 Z" fill="${P.crust}"/>`;
  });
  return out;
}

// egg roast — halved boiled eggs sitting in masala
function eggRoast() {
  let out = `
    <ellipse cx="60" cy="64" rx="46" ry="34" fill="${P.green9}" opacity=".2"/>
    <ellipse cx="60" cy="60" rx="46" ry="34" fill="${P.masala}"/>`;
  [[44, 54], [76, 62], [58, 78]].forEach(([x, y]) => {
    out += `<ellipse cx="${x}" cy="${y}" rx="15" ry="12" fill="${P.eggWhite}"/>`;
    out += `<ellipse cx="${x}" cy="${y}" rx="7" ry="5.6" fill="${P.yolk}"/>`;
  });
  return out;
}

/* Two feasts, same leaf. Add another by copying a block — the toggle,
   the leaf and the dish list underneath all build themselves from this. */
const FEASTS = {

veg: {
  label: "Vegetarian",
  note: "The classic sadhya — thirteen dishes, served in order from the left. Pure veg, cooked with separate equipment.",
  dishes: [
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
  ]
},

nonveg: {
  label: "Non-vegetarian",
  note: "The Chettinad-style spread — fries and roasts along the top, curries and rice below. Chicken, mutton, fish and prawn.",
  dishes: [

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
      <circle cx="48" cy="48" r="4" fill="${P.gravy}" opacity=".5"/>
      <circle cx="72" cy="66" r="3.4" fill="${P.gravy}" opacity=".45"/>
      <circle cx="62" cy="40" r="2.8" fill="${P.gravy}" opacity=".4"/>`) },

  { name: "Thoran", note: "Cabbage and coconut, the one veg side",
    x: 33, y: 25, size: 96, art: () => heap(P.mint, 2, 40) },

  { name: "Fish fry", note: "Whole seer fish, masala-rubbed and pan-fried",
    x: 45, y: 24, size: 116, art: () => fishFry() },

  { name: "Chicken 65", note: "Deep-fried, curry leaf and chilli",
    x: 57, y: 24, size: 102, art: () => chunks(P.chicken, 3, 8) },

  { name: "Egg roast", note: "Halved boiled eggs in onion masala",
    x: 69, y: 25, size: 98, art: () => eggRoast() },

  { name: "Prawn roast", note: "Tossed dry with pepper and shallots",
    x: 81, y: 27, size: 100, art: () => prawns() },

  { name: "Rice", note: "The centre of the leaf. Heaped, steaming",
    x: 41, y: 62, size: 190, art: () => heap(P.rice, 5, 50) },

  { name: "Meen kuzhambu", note: "Fish curry, tamarind-sour, poured over the rice",
    x: 41, y: 62, size: 118,
    art: () => svgWrap(`
      <ellipse cx="60" cy="60" rx="40" ry="28" fill="${P.chilli}"/>
      <ellipse cx="60" cy="60" rx="40" ry="28" fill="${P.tomato}" opacity=".45"/>
      <ellipse cx="50" cy="54" rx="11" ry="7" fill="${P.fried}" opacity=".9"/>
      <ellipse cx="70" cy="66" rx="9" ry="6" fill="${P.fried}" opacity=".8"/>
      <circle cx="64" cy="50" r="4" fill="${P.spinach}"/>`) },

  { name: "Chicken Chettinad", note: "Roasted spice, black pepper, coconut",
    x: 60, y: 63, size: 130,
    art: () => dip("#7d3418", `
      <ellipse cx="48" cy="54" rx="12" ry="9" fill="${P.chicken}" transform="rotate(-18 48 54)"/>
      <ellipse cx="72" cy="62" rx="11" ry="8" fill="${P.chicken}" transform="rotate(22 72 62)"/>
      <ellipse cx="58" cy="74" rx="10" ry="7" fill="${P.chicken}" transform="rotate(-8 58 74)"/>
      <circle cx="44" cy="44" r="3.6" fill="${P.spinach}"/>
      <circle cx="78" cy="48" r="3" fill="${P.spinach}"/>`) },

  { name: "Mutton curry", note: "Slow-cooked on the bone until it gives",
    x: 77, y: 63, size: 112,
    art: () => dip(P.mutton, `
      <ellipse cx="52" cy="56" rx="10" ry="7" fill="${P.char}"/>
      <ellipse cx="70" cy="66" rx="9" ry="6" fill="${P.char}"/>
      <circle cx="62" cy="48" r="4" fill="${P.spinach}"/>`) },

  { name: "Rasam", note: "Thin, peppery, and it clears the palate",
    x: 88, y: 52, size: 92,
    art: () => dip(P.tomato, `
      <circle cx="52" cy="56" r="4" fill="${P.chilli}"/>
      <circle cx="70" cy="64" r="3.4" fill="${P.spinach}"/>`) },

  { name: "Payasam", note: "Served last, and often twice",
    x: 21, y: 66, size: 108,
    art: () => svgWrap(`
      <ellipse cx="60" cy="66" rx="40" ry="28" fill="${P.green9}" opacity=".2"/>
      <ellipse cx="60" cy="62" rx="40" ry="28" fill="${P.ivory}"/>
      <ellipse cx="60" cy="60" rx="32" ry="21" fill="${P.gold1}"/>
      <circle cx="52" cy="56" r="4" fill="${P.gravy}"/>
      <circle cx="66" cy="62" r="3.5" fill="${P.clay}"/>
      <circle cx="60" cy="52" r="3" fill="${P.gold}"/>`) }
  ]
}

};

function setupSadhya() {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const LEAF_W = 1400, LEAF_H = 620;      // the leaf SVG's viewBox

  const layer = document.getElementById("dishLayer");
  const veins = document.getElementById("leafVeins");
  const key = document.getElementById("dishKey");
  const noteEl = document.getElementById("feastNote");
  const switcher = document.getElementById("feastSwitch");
  if (!layer) return;

  // draw the leaf veins once
  if (veins) {
    let v = "";
    for (let i = 1; i < 44; i++) {
      const x = 90 + i * (1220 / 44);
      v += `<line x1="${x.toFixed(0)}" y1="310" x2="${(x + 22).toFixed(0)}" y2="182"/>`;
      v += `<line x1="${x.toFixed(0)}" y1="310" x2="${(x + 22).toFixed(0)}" y2="438"/>`;
    }
    veins.innerHTML = v;
  }

  const parseArt = markup => {
    const doc = new DOMParser().parseFromString(
      `<svg xmlns="${SVG_NS}">${markup}</svg>`, "image/svg+xml");
    return doc.querySelector("parsererror") ? [] : [...doc.documentElement.childNodes];
  };

  // Lay one feast onto the leaf. Positions and sizes are in the leaf's own
  // viewBox units, so the browser scales them with it on every screen.
  const render = which => {
    const feast = FEASTS[which] || FEASTS.veg;

    layer.replaceChildren();
    feast.dishes.forEach(d => {
      const cx = (d.x / 100) * LEAF_W;
      const cy = (d.y / 100) * LEAF_H;
      const px = d.size * (LEAF_W / 1000);       // dish size in viewBox units
      const k = px / ART_BOX;                    // art is drawn in a 120-unit box

      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "dish");
      g.setAttribute("transform", `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);

      const art = document.createElementNS(SVG_NS, "g");
      art.setAttribute("transform", `scale(${k.toFixed(4)}) translate(-60 -60)`);
      parseArt(d.art()).forEach(n => art.appendChild(n));
      g.appendChild(art);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("class", "dish-label");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("y", (px * 0.5 + 22).toFixed(0));
      label.textContent = d.name;
      g.appendChild(label);

      layer.appendChild(g);
    });

    // the same names as a readable list — this is what carries the
    // information on small screens, where the on-leaf labels are hidden
    if (key) {
      key.replaceChildren();
      feast.dishes.forEach(d => {
        const li = document.createElement("li");
        const b = document.createElement("b");
        b.textContent = d.name;
        const s = document.createElement("span");
        s.textContent = d.note;
        li.append(b, s);
        key.appendChild(li);
      });
    }

    if (noteEl) noteEl.textContent = feast.note;

    document.querySelectorAll("[data-feast]").forEach(btn => {
      const on = btn.dataset.feast === which;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", String(on));
    });

    const leafSvg = document.querySelector(".leaf-svg");
    if (leafSvg) {
      leafSvg.setAttribute("aria-label",
        `A banana leaf laid with a ${feast.label.toLowerCase()} feast: ${feast.dishes.map(d => d.name).join(", ")}`);
    }
  };

  // build the toggle from FEASTS so adding a feast needs no markup change
  if (switcher) {
    Object.entries(FEASTS).forEach(([k, f]) => {
      const btn = document.createElement("button");
      btn.className = "fs-opt";
      btn.type = "button";
      btn.dataset.feast = k;
      btn.setAttribute("role", "tab");
      btn.textContent = f.label;
      switcher.appendChild(btn);
    });
    switcher.addEventListener("click", e => {
      const btn = e.target.closest("[data-feast]");
      if (btn) render(btn.dataset.feast);
    });
  }

  render("veg");
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
   14b. LAYOUT SELF-TEST  — only runs with ?selftest in the URL
   ---------------------------------------------------------
   Measures the real, laid-out geometry and paints a pass/fail
   badge. responsive-check.html loads every frame with this
   flag, so you can see at a glance whether the leaf fits on
   each device instead of squinting at it.

   Delete this function and its call to remove.
   ========================================================= */
function runSelfTest() {
  if (!location.search.includes("selftest")) return;

  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;left:6px;top:6px;z-index:9999;font:11px/1.45 ui-monospace,monospace;" +
    "background:rgba(12,8,5,.92);color:#fbe9dc;padding:8px 10px;border-radius:7px;" +
    "max-width:min(300px,88vw);pointer-events:none;white-space:pre-wrap";
  document.body.appendChild(box);

  const check = () => {
    const out = [];
    let pass = true;
    const add = (ok, label, detail) => {
      pass = pass && ok;
      out.push(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
    };

    const stage = document.querySelector(".leaf-stage");
    const dishes = [...document.querySelectorAll("g.dish")];

    if (stage) {
      const s = stage.getBoundingClientRect();
      add(s.width > 100 && s.height > 60, "leaf has size",
          `${Math.round(s.width)}x${Math.round(s.height)}`);
    } else {
      add(false, "leaf found");
    }

    if (dishes.length) {
      const r0 = dishes[0].getBoundingClientRect();
      const shapes = document.querySelectorAll(
        "#dishLayer circle,#dishLayer ellipse,#dishLayer polygon,#dishLayer path,#dishLayer rect").length;
      const sized = dishes.filter(d => {
        const r = d.getBoundingClientRect();
        return r.width > 3 && r.height > 3;
      }).length;
      add(sized === dishes.length, "dishes sized",
          `${sized}/${dishes.length} \u00b7 ${r0.width.toFixed(0)}x${r0.height.toFixed(0)}px`);
      add(shapes > 40, "art drawn", `${shapes} shapes`);
    } else {
      add(false, "dishes exist");
    }

    add(document.querySelectorAll("#dishKey li").length === dishes.length,
        "dish key matches leaf");

    const de = document.documentElement;
    add(de.scrollWidth <= de.clientWidth + 1, "no sideways scroll",
        `${de.scrollWidth}/${de.clientWidth}px`);

    box.style.borderLeft = `3px solid ${pass ? "#25d366" : "#e8563f"}`;
    box.textContent =
      `${window.innerWidth}x${window.innerHeight}  ${pass ? "ALL PASS" : "FAILURES"}\n` +
      out.join("\n");
  };

  // measure after fonts and layout have settled
  setTimeout(check, 350);
  window.addEventListener("resize", () => setTimeout(check, 150));
  window.addEventListener("scroll", () => { clearTimeout(box._t); box._t = setTimeout(check, 120); },
                          { passive: true });
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
  runSelfTest();
});
