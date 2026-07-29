#!/usr/bin/env python3
"""
Generates the illustrated SVG artwork used across the Taj Home Caterers site.

Run from inside the images/ folder:   python3 _generate.py

Artwork is generated once per theme:

    images/          → "terracotta" (clay + saffron, herb green as accent)
                       — the palette the site actually ships with
    images/forest/   → "forest"     (deep green + gold) — kept for reference

Compositions are shared across themes; only the palette differs.

To add a theme, add an entry to PALETTES and re-run. To change a composition,
edit the relevant g_* function — it applies to every theme at once.

Delete this script and the SVGs once real photographs replace the artwork.
"""

import math
import os
import random

# ---------------------------------------------------------------- palettes
#
# The drawing code refers to structural roles, not literal colours:
#   DEEP_*  the dark anchor ramp     ACC_*  the accent ramp
#   CREAM / IVORY / SAND / LINE / CLAY   neutral surfaces
# Each theme simply rebinds them.

PALETTES = {
    "forest": {
        "DEEP_900": "#12321e", "DEEP_800": "#1b4429", "DEEP": "#1f4d2e",
        "DEEP_600": "#2d6b41", "DEEP_300": "#8bb79a",
        "ACC_700": "#9a7c1e", "ACC": "#c9a227", "ACC_300": "#e3c96f", "ACC_100": "#f4e9c6",
        "CREAM": "#faf6ec", "IVORY": "#fffdf7", "SAND": "#f2ebdc",
        "LINE": "#e4dac5", "CLAY": "#d8c9ac",
        # food accents
        "TURMERIC": "#e0a52c", "SAFFRON": "#e2812f", "TOMATO": "#c04a2e",
        "CHILLI": "#a83824", "SPINACH": "#54803f", "MINT": "#7ea75f",
        "GRAVY": "#8a5330", "COCONUT": "#f6efdd", "BEET": "#8e3f57", "RICE": "#fbf6e8",
        "outdir": "forest",
    },
    "terracotta": {
        "DEEP_900": "#5c2110", "DEEP_800": "#7b2d16", "DEEP": "#8f3519",
        "DEEP_600": "#a8471f", "DEEP_300": "#dda183",
        "ACC_700": "#a8791f", "ACC": "#f2c14e", "ACC_300": "#f7d98a", "ACC_100": "#fdf0d0",
        "CREAM": "#fdf1e3", "IVORY": "#fff9f0", "SAND": "#f7e6d3",
        "LINE": "#edd3b6", "CLAY": "#dfc0a0",
        # food accents — pushed warmer, with green kept as the counterpoint
        "TURMERIC": "#e8a92b", "SAFFRON": "#e07a28", "TOMATO": "#c2452a",
        "CHILLI": "#9d2f1d", "SPINACH": "#3f6b4a", "MINT": "#6f9a58",
        "GRAVY": "#8a4a26", "COCONUT": "#fbf1de", "BEET": "#8e3f57", "RICE": "#fdf7ea",
        "outdir": ".",
    },
}

# A banana leaf is green in every theme.
LEAF_DARK, LEAF_LIGHT = "#2d6b41", "#8bb79a"

# populated by use_palette()
FOODS = []
OUTDIR = "."


def use_palette(name):
    """Bind every colour name into module globals for the chosen theme."""
    global FOODS, OUTDIR
    p = PALETTES[name]
    for k, v in p.items():
        if k != "outdir":
            globals()[k] = v
    FOODS = [p["TURMERIC"], p["SAFFRON"], p["TOMATO"], p["SPINACH"],
             p["GRAVY"], p["BEET"], p["MINT"], p["CHILLI"]]
    OUTDIR = p["outdir"]
    os.makedirs(OUTDIR, exist_ok=True)


# Aliases so the existing drawing code reads naturally.
# (These are rebound by use_palette on every run.)
GREEN_900 = GREEN_800 = GREEN = GREEN_600 = GREEN_300 = ""
GOLD_700 = GOLD = GOLD_300 = GOLD_100 = ""
CREAM = IVORY = SAND = LINE = CLAY = ""
TURMERIC = SAFFRON = TOMATO = CHILLI = SPINACH = MINT = GRAVY = COCONUT = BEET = RICE = ""


def _alias():
    """Map the DEEP_/ACC_ roles onto the GREEN_/GOLD_ names used below."""
    g = globals()
    g["GREEN_900"], g["GREEN_800"], g["GREEN"] = g["DEEP_900"], g["DEEP_800"], g["DEEP"]
    g["GREEN_600"], g["GREEN_300"] = g["DEEP_600"], g["DEEP_300"]
    g["GOLD_700"], g["GOLD"], g["GOLD_300"], g["GOLD_100"] = g["ACC_700"], g["ACC"], g["ACC_300"], g["ACC_100"]


# ---------------------------------------------------------------- helpers
def hdr(w, h, extra=""):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" '
            f'width="{w}" height="{h}" role="img">{extra}')


def defs(*blocks):
    return "<defs>" + "".join(blocks) + "</defs>"


def lin(gid, c1, c2, x1=0, y1=0, x2=0, y2=1):
    return (f'<linearGradient id="{gid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">'
            f'<stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/>'
            f'</linearGradient>')


def rad(gid, c1, c2):
    return (f'<radialGradient id="{gid}"><stop offset="0" stop-color="{c1}"/>'
            f'<stop offset="1" stop-color="{c2}"/></radialGradient>')


def cloth(w, h, base=None, warp=None, seed=1):
    """Table surface with a woven texture and a soft vignette."""
    base = base or SAND
    warp = warp or LINE
    rnd = random.Random(seed)
    out = [f'<rect width="{w}" height="{h}" fill="{base}"/>']
    for x in range(0, w, 46):
        out.append(f'<rect x="{x}" y="0" width="2" height="{h}" fill="{warp}" opacity=".55"/>')
    for y in range(0, h, 46):
        out.append(f'<rect x="0" y="{y}" width="{w}" height="2" fill="{warp}" opacity=".4"/>')
    for _ in range(90):
        x, y = rnd.randint(0, w), rnd.randint(0, h)
        out.append(f'<circle cx="{x}" cy="{y}" r="{rnd.randint(1,3)}" fill="{CLAY}" opacity=".35"/>')
    out.append(f'<rect width="{w}" height="{h}" fill="url(#vig)"/>')
    return "".join(out)


def plate(cx, cy, r, rim=None, face=None, ring=True):
    rim = rim or GOLD_300
    face = face or IVORY
    s = [f'<circle cx="{cx}" cy="{cy}" r="{r+5}" fill="{GREEN_900}" opacity=".10"/>',
         f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{face}"/>']
    if ring:
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r-7}" fill="none" stroke="{rim}" '
                 f'stroke-width="2.5" opacity=".8"/>')
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.62:.1f}" fill="none" stroke="{rim}" '
                 f'stroke-width="1.2" opacity=".45"/>')
    return "".join(s)


def bowl(cx, cy, r, fill, rim=None):
    rim = rim or IVORY
    return (f'<circle cx="{cx}" cy="{cy}" r="{r+4}" fill="{GREEN_900}" opacity=".10"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{rim}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-7}" fill="{fill}"/>'
            f'<ellipse cx="{cx-r*0.28:.1f}" cy="{cy-r*0.30:.1f}" rx="{r*0.26:.1f}" '
            f'ry="{r*0.16:.1f}" fill="{IVORY}" opacity=".28"/>')


def mound(cx, cy, r, fill, seed=3, lumps=9):
    """A heap of food — irregular blob plus lumps for texture."""
    rnd = random.Random(seed)
    pts = []
    for i in range(14):
        a = i / 14 * math.tau
        rr = r * rnd.uniform(0.86, 1.1)
        pts.append(f"{cx + math.cos(a)*rr:.1f},{cy + math.sin(a)*rr*0.9:.1f}")
    s = [f'<polygon points="{" ".join(pts)}" fill="{fill}"/>']
    for _ in range(lumps):
        a, d = rnd.uniform(0, math.tau), rnd.uniform(0, r * 0.6)
        s.append(f'<circle cx="{cx+math.cos(a)*d:.1f}" cy="{cy+math.sin(a)*d*0.85:.1f}" '
                 f'r="{rnd.uniform(r*0.10, r*0.22):.1f}" fill="{IVORY}" opacity=".16"/>')
    return "".join(s)


def garnish(cx, cy, r, seed=5, n=7, colours=None):
    colours = colours or (MINT, TOMATO, GOLD_300)
    rnd = random.Random(seed)
    s = []
    for _ in range(n):
        a, d = rnd.uniform(0, math.tau), rnd.uniform(0, r)
        c = rnd.choice(colours)
        s.append(f'<circle cx="{cx+math.cos(a)*d:.1f}" cy="{cy+math.sin(a)*d:.1f}" '
                 f'r="{rnd.uniform(2.5,5.5):.1f}" fill="{c}" opacity=".9"/>')
    return "".join(s)


def leaf(cx, cy, w, h, dark=None, light=None):
    """Banana leaf, seen from above — green in every theme."""
    dark = dark or LEAF_DARK
    light = light or LEAF_LIGHT
    s = [f'<path d="M{cx-w/2} {cy} Q{cx-w/2} {cy-h/2} {cx} {cy-h/2} '
         f'Q{cx+w/2} {cy-h/2} {cx+w/2} {cy} Q{cx+w/2} {cy+h/2} {cx} {cy+h/2} '
         f'Q{cx-w/2} {cy+h/2} {cx-w/2} {cy}Z" fill="{dark}"/>',
         f'<line x1="{cx-w/2+14}" y1="{cy}" x2="{cx+w/2-14}" y2="{cy}" '
         f'stroke="{light}" stroke-width="3" opacity=".55"/>']
    n = int(w / 26)
    for i in range(1, n):
        x = cx - w / 2 + i * (w / n)
        s.append(f'<path d="M{x} {cy} l14 -{h*0.36:.0f}" stroke="{light}" stroke-width="1.4" '
                 f'fill="none" opacity=".35"/>')
        s.append(f'<path d="M{x} {cy} l14 {h*0.36:.0f}" stroke="{light}" stroke-width="1.4" '
                 f'fill="none" opacity=".35"/>')
    return "".join(s)


def glass(cx, cy, w, h, fill):
    return (f'<path d="M{cx-w/2} {cy-h/2} L{cx+w/2} {cy-h/2} L{cx+w/2*0.7:.0f} {cy+h/2} '
            f'L{cx-w/2*0.7:.0f} {cy+h/2}Z" fill="{IVORY}" opacity=".9"/>'
            f'<path d="M{cx-w/2+5} {cy-h/2+12} L{cx+w/2-5} {cy-h/2+12} '
            f'L{cx+w/2*0.7-3:.0f} {cy+h/2-4} L{cx-w/2*0.7+3:.0f} {cy+h/2-4}Z" fill="{fill}" opacity=".85"/>'
            f'<rect x="{cx-w/2+6}" y="{cy-h/2+6}" width="4" height="{h*0.6:.0f}" fill="{IVORY}" opacity=".7" rx="2"/>')


def steam(x, y, n=3, colour=None, op=".35"):
    colour = colour or IVORY
    s = []
    for i in range(n):
        ox = x + (i - n // 2) * 15
        s.append(f'<path d="M{ox} {y} c-8 -16 8 -26 0 -42 c-8 -16 6 -24 0 -34" '
                 f'stroke="{colour}" stroke-width="3.5" fill="none" opacity="{op}" '
                 f'stroke-linecap="round"/>')
    return "".join(s)


def frame(w, h, colour=None, op=".5"):
    colour = colour or GOLD_300
    return (f'<rect x="16" y="16" width="{w-32}" height="{h-32}" fill="none" '
            f'stroke="{colour}" stroke-width="2" opacity="{op}" rx="6"/>')


def vig():
    return rad("vig", "rgba(0,0,0,0)", "rgba(40,20,10,0.16)")


def write(name, body):
    path = os.path.join(OUTDIR, name)
    with open(path, "w", encoding="utf-8") as f:
        f.write(body + "</svg>")
    print("wrote", path)


# ---------------------------------------------------------------- hero
def make_hero():
    """Overhead banquet spread. Composed to sit to the right of the headline,
    so the left third stays visually quiet."""
    w, h = 1800, 1100
    rnd = random.Random(11)
    s = [hdr(w, h), defs(vig(), lin("hg", DEEP_900, DEEP_800, 0, 0, 1, 1),
                         rad("warm", GOLD_700, "rgba(18,50,30,0)"),
                         rad("glow", GOLD_300, "rgba(227,201,111,0)"))]
    s.append(f'<rect width="{w}" height="{h}" fill="url(#hg)"/>')
    s.append(f'<ellipse cx="{w*0.68:.0f}" cy="{h*0.5:.0f}" rx="{w*0.46:.0f}" ry="{h*0.72:.0f}" '
             f'fill="url(#warm)" opacity=".5"/>')

    cx, cy = int(w * 0.66), int(h * 0.5)

    # faint concentric rings behind the spread
    for r in range(300, 900, 78):
        s.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" '
                 f'stroke="{GOLD_300}" stroke-width="1" opacity=".06"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="520" fill="url(#glow)" opacity=".13"/>')

    # outer ring — large serving bowls
    for i in range(11):
        a = i / 11 * math.tau - 0.35
        bx, by = cx + math.cos(a) * 505, cy + math.sin(a) * 415
        s.append(bowl(bx, by, 98, FOODS[i % len(FOODS)], rim=CREAM))
        s.append(garnish(bx, by, 52, seed=i, n=7))

    # middle ring — smaller katoris
    for i in range(7):
        a = i / 7 * math.tau + 0.55
        bx, by = cx + math.cos(a) * 288, cy + math.sin(a) * 236
        s.append(bowl(bx, by, 68, FOODS[(i + 4) % len(FOODS)], rim=CREAM))
        s.append(garnish(bx, by, 34, seed=i + 30, n=4))

    # centre showpiece
    s.append(plate(cx, cy, 158, rim=GOLD))
    s.append(mound(cx, cy, 108, "#efdcae", seed=9, lumps=22))       # biryani rice
    s.append(mound(cx - 22, cy - 12, 58, TURMERIC, seed=14, lumps=9))  # saffron streak
    s.append(mound(cx + 34, cy + 20, 44, SAFFRON, seed=17, lumps=7))
    s.append(garnish(cx, cy, 86, seed=21, n=24, colours=(TOMATO, SPINACH, GRAVY, CHILLI)))
    s.append(steam(cx, cy - 132, 3, GOLD_100, ".22"))

    # a few loose garnishes on the cloth
    for _ in range(26):
        a, d = rnd.uniform(0, math.tau), rnd.uniform(600, 780)
        x, y = cx + math.cos(a) * d, cy + math.sin(a) * d * 0.8
        s.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{rnd.uniform(4,11):.1f}" '
                 f'fill="{rnd.choice([GOLD_300, SAFFRON, GREEN_300, TOMATO])}" '
                 f'opacity="{rnd.uniform(.18,.45):.2f}"/>')

    # scattered spice dust
    for _ in range(110):
        x, y = rnd.randint(0, w), rnd.randint(0, h)
        s.append(f'<circle cx="{x}" cy="{y}" r="{rnd.uniform(1.5,4):.1f}" '
                 f'fill="{rnd.choice([GOLD_300, SAFFRON, GREEN_300])}" opacity="{rnd.uniform(.05,.18):.2f}"/>')

    # left-hand scrim so headline text stays legible (soft, no hard edge)
    s.append(f'<defs><linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">'
             f'<stop offset=\"0\" stop-color=\"{DEEP_900}\" stop-opacity=".62"/>'
             f'<stop offset=\"0.34\" stop-color=\"{DEEP_900}\" stop-opacity=".34"/>'
             f'<stop offset=\"0.68\" stop-color=\"{DEEP_900}\" stop-opacity="0"/>'
             '</linearGradient></defs>')
    s.append(f'<rect width="{w}" height="{h}" fill="url(#scrim)"/>')

    write("hero.svg", "".join(s))


# ---------------------------------------------------------------- gallery
def scene(name, w=1200, h=900, seed=1, build=None, base=None, dark=False):
    base = base or (DEEP_900 if dark else SAND)
    s = [hdr(w, h), defs(vig(), rad("warm", GOLD_100, SAND)), cloth(w, h, base=base, seed=seed)]
    s.append(build(w, h, random.Random(seed)))
    s.append(frame(w, h))
    write(name, "".join(s))


def g_kitty_table(w, h, rnd):
    cx, cy = w // 2, h // 2
    s = [f'<circle cx="{cx}" cy="{cy}" r="330" fill="{IVORY}" opacity=".55"/>',
         f'<circle cx="{cx}" cy="{cy}" r="330" fill="none" stroke="{GOLD_300}" stroke-width="2" opacity=".5"/>']
    for i in range(4):
        a = i / 4 * math.tau + math.pi / 4
        px, py = cx + math.cos(a) * 215, cy + math.sin(a) * 195
        s.append(plate(px, py, 96))
        s.append(mound(px, py, 52, FOODS[i], seed=i + 2))
        s.append(garnish(px, py, 44, seed=i + 7, n=6))
    s.append(plate(cx, cy, 108, rim=GOLD))
    s.append(mound(cx, cy, 62, SAFFRON, seed=15, lumps=12))
    s.append(garnish(cx, cy, 48, seed=4, n=10))
    s.append(steam(cx, cy - 86, 3, GREEN_900, ".14"))
    return "".join(s)


def g_wedding_buffet(w, h, rnd):
    s = [f'<rect x="70" y="150" width="{w-140}" height="{h-300}" rx="26" fill="{IVORY}" opacity=".7"/>',
         f'<rect x="70" y="150" width="{w-140}" height="{h-300}" rx="26" fill="none" stroke="{GOLD_300}" stroke-width="2"/>']
    cols, rows = 3, 4
    for r in range(rows):
        for c in range(cols):
            bx = 70 + (w - 140) * (c + 0.5) / cols
            by = 150 + (h - 300) * (r + 0.5) / rows
            col = FOODS[(r * cols + c) % len(FOODS)]
            s.append(bowl(bx, by, 66, col))
            s.append(garnish(bx, by, 34, seed=r * 5 + c, n=5))
    s.append(steam(w // 2, 200, 4, GREEN_900, ".12"))
    return "".join(s)


def g_chaat_counter(w, h, rnd):
    """Chef standing behind a live counter, shot straight on."""
    top = h * 0.58
    s = [f'<rect width="{w}" height="{top:.0f}" fill="{GREEN_800}"/>']
    # warm backdrop lights
    for i in range(9):
        x = (i + 0.5) * w / 9
        s.append(f'<circle cx="{x:.0f}" cy="{h*0.10:.0f}" r="13" fill="{GOLD_300}" opacity=".85"/>')
        s.append(f'<circle cx="{x:.0f}" cy="{h*0.10:.0f}" r="34" fill="{GOLD}" opacity=".16"/>')
    s.append(f'<path d="M0 {h*0.10:.0f} Q{w/2:.0f} {h*0.17:.0f} {w} {h*0.10:.0f}" stroke="{GOLD_700}" '
             f'stroke-width="3" fill="none" opacity=".5"/>')

    # chef, standing behind the counter
    ccx = w * 0.5
    head_y = top - 250
    s += [
        # arms
        f'<rect x="{ccx-150:.0f}" y="{top-140:.0f}" width="70" height="128" rx="34" fill="{COCONUT}" '
        f'transform="rotate(-18 {ccx-150:.0f} {top-140:.0f})"/>',
        f'<rect x="{ccx+82:.0f}" y="{top-140:.0f}" width="70" height="128" rx="34" fill="{COCONUT}" '
        f'transform="rotate(18 {ccx+150:.0f} {top-140:.0f})"/>',
        # torso
        f'<path d="M{ccx-108:.0f} {top+10:.0f} L{ccx-92:.0f} {top-152:.0f} '
        f'Q{ccx:.0f} {top-192:.0f} {ccx+92:.0f} {top-152:.0f} L{ccx+108:.0f} {top+10:.0f}Z" fill="{IVORY}"/>',
        # apron band
        f'<rect x="{ccx-96:.0f}" y="{top-64:.0f}" width="192" height="18" fill="{GOLD}" opacity=".9"/>',
        # buttons
        f'<circle cx="{ccx-34:.0f}" cy="{top-126:.0f}" r="6" fill="{GOLD_300}"/>',
        f'<circle cx="{ccx-34:.0f}" cy="{top-98:.0f}" r="6" fill="{GOLD_300}"/>',
        # neck + head
        f'<rect x="{ccx-24:.0f}" y="{head_y+52:.0f}" width="48" height="42" fill="{CLAY}"/>',
        f'<circle cx="{ccx:.0f}" cy="{head_y+20:.0f}" r="60" fill="{CLAY}"/>',
        # toque
        f'<rect x="{ccx-58:.0f}" y="{head_y-42:.0f}" width="116" height="42" rx="8" fill="{IVORY}"/>',
        f'<ellipse cx="{ccx-34:.0f}" cy="{head_y-56:.0f}" rx="34" ry="30" fill="{IVORY}"/>',
        f'<ellipse cx="{ccx+2:.0f}" cy="{head_y-72:.0f}" rx="38" ry="34" fill="{IVORY}"/>',
        f'<ellipse cx="{ccx+38:.0f}" cy="{head_y-56:.0f}" rx="32" ry="28" fill="{IVORY}"/>',
        # face
        f'<circle cx="{ccx-21:.0f}" cy="{head_y+12:.0f}" r="5.5" fill="{GREEN_900}"/>',
        f'<circle cx="{ccx+21:.0f}" cy="{head_y+12:.0f}" r="5.5" fill="{GREEN_900}"/>',
        f'<path d="M{ccx-19:.0f} {head_y+40:.0f} q19 16 38 0" stroke="{GREEN_900}" stroke-width="4" '
        f'fill="none" stroke-linecap="round"/>',
    ]

    # counter
    s.append(f'<rect x="0" y="{top:.0f}" width="{w}" height="{h-top:.0f}" fill="{GREEN}"/>')
    s.append(f'<rect x="0" y="{top:.0f}" width="{w}" height="24" fill="{GOLD}"/>')
    for i in range(5):
        bx = (i + 0.5) * w / 5
        by = top + (h - top) * 0.52
        s.append(bowl(bx, by, 66, FOODS[i], rim=CREAM))
        s.append(garnish(bx, by, 34, seed=i, n=6))
    s.append(steam(w * 0.5, top - 6, 3, GOLD_100, ".45"))
    return "".join(s)


def g_sweets(w, h, rnd):
    s = [f'<rect x="80" y="80" width="{w-160}" height="{h-160}" rx="22" fill="{GOLD_100}"/>',
         f'<rect x="80" y="80" width="{w-160}" height="{h-160}" rx="22" fill="none" stroke="{GOLD}" stroke-width="3"/>']
    shapes = ["circle", "diamond", "square", "circle", "diamond", "square"]
    cols, rows = 4, 3
    for r in range(rows):
        for c in range(cols):
            x = 80 + (w - 160) * (c + 0.5) / cols
            y = 80 + (h - 160) * (r + 0.5) / rows
            col = [TURMERIC, COCONUT, SAFFRON, BEET, GOLD_300, GRAVY][(r * cols + c) % 6]
            sh = shapes[(r + c) % len(shapes)]
            s.append(f'<circle cx="{x}" cy="{y}" r="66" fill="{IVORY}" opacity=".8"/>')
            if sh == "circle":
                s.append(f'<circle cx="{x}" cy="{y}" r="44" fill="{col}"/>')
                s.append(f'<circle cx="{x-12}" cy="{y-14}" r="12" fill="{IVORY}" opacity=".3"/>')
            elif sh == "diamond":
                s.append(f'<rect x="{x-38}" y="{y-38}" width="76" height="76" rx="8" fill="{col}" '
                         f'transform="rotate(45 {x} {y})"/>')
            else:
                s.append(f'<rect x="{x-40}" y="{y-32}" width="80" height="64" rx="10" fill="{col}"/>')
            s.append(f'<circle cx="{x+16}" cy="{y-18}" r="5" fill="{GOLD}" opacity=".85"/>')
    return "".join(s)


def g_corporate_buffet(w, h, rnd):
    """Long chafing-dish buffet line, viewed straight on."""
    top = h * 0.34
    s = [f'<rect x="50" y="{top:.0f}" width="{w-100}" height="{h*0.48:.0f}" rx="18" fill="{GREEN_800}"/>',
         f'<rect x="50" y="{top:.0f}" width="{w-100}" height="26" rx="12" fill="{GOLD}"/>',
         f'<rect x="50" y="{top+h*0.48-40:.0f}" width="{w-100}" height="40" rx="12" fill="{GREEN_900}" opacity=".5"/>']
    for i in range(6):
        bx = 50 + (w - 100) * (i + 0.5) / 6
        by = top + h * 0.22
        # chafing tray with lid propped behind
        s.append(f'<rect x="{bx-96:.0f}" y="{by-118:.0f}" width="192" height="56" rx="26" '
                 f'fill="{CLAY}" opacity=".55"/>')
        s.append(f'<rect x="{bx-100:.0f}" y="{by-62:.0f}" width="200" height="122" rx="14" fill="{IVORY}"/>')
        s.append(f'<rect x="{bx-84:.0f}" y="{by-46:.0f}" width="168" height="90" rx="10" '
                 f'fill="{FOODS[i%len(FOODS)]}"/>')
        s.append(garnish(bx, by, 44, seed=i, n=7))
        s.append(f'<rect x="{bx-104:.0f}" y="{by+60:.0f}" width="208" height="14" rx="7" fill="{GOLD_700}"/>')
        s.append(steam(bx, by - 74, 2, GOLD_100, ".28"))
    # menu cards above the line
    for i in range(4):
        x = 170 + i * (w - 340) / 3
        s.append(f'<rect x="{x-70:.0f}" y="{h*0.10:.0f}" width="140" height="100" rx="10" '
                 f'fill="{IVORY}" opacity=".92"/>')
        s.append(f'<rect x="{x-52:.0f}" y="{h*0.10+20:.0f}" width="104" height="14" rx="7" fill="{GOLD_300}"/>')
        s.append(f'<rect x="{x-52:.0f}" y="{h*0.10+46:.0f}" width="80" height="9" rx="5" fill="{LINE}"/>')
        s.append(f'<rect x="{x-52:.0f}" y="{h*0.10+64:.0f}" width="92" height="9" rx="5" fill="{LINE}"/>')
    return "".join(s)


def g_starters(w, h, rnd):
    cx, cy = w // 2, h // 2
    s = [plate(cx, cy, 300, rim=GOLD)]
    for i in range(6):
        a = i / 6 * math.tau
        px, py = cx + math.cos(a) * 165, cy + math.sin(a) * 165
        s.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="62" fill="{FOODS[i]}"/>')
        s.append(f'<circle cx="{px-16:.0f}" cy="{py-18:.0f}" r="16" fill="{IVORY}" opacity=".22"/>')
        s.append(garnish(px, py, 34, seed=i, n=4, colours=(MINT, GOLD_300)))
    s.append(f'<circle cx="{cx}" cy="{cy}" r="58" fill="{MINT}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="40" fill="{SPINACH}" opacity=".7"/>')
    return "".join(s)


def g_sadhya(w, h, rnd):
    cx, cy = w // 2, h // 2
    s = [leaf(cx, cy, w - 160, h - 260)]
    xs = [cx - 300, cx - 190, cx - 80, cx + 30, cx + 140, cx + 250]
    for i, x in enumerate(xs):
        s.append(f'<ellipse cx="{x}" cy="{cy+130}" rx="42" ry="30" fill="{FOODS[i%len(FOODS)]}"/>')
        s.append(f'<ellipse cx="{x-10}" cy="{cy+122}" rx="14" ry="8" fill="{IVORY}" opacity=".2"/>')
    s.append(mound(cx - 60, cy - 40, 110, RICE, seed=6, lumps=18))
    s.append(f'<circle cx="{cx+170}" cy="{cy-60}" r="52" fill="{TURMERIC}"/>')
    s.append(f'<circle cx="{cx+280}" cy="{cy-30}" r="40" fill="{COCONUT}"/>')
    s.append(f'<path d="M{cx-330} {cy-90} q40 -30 80 0 q-40 30 -80 0Z" fill="{GOLD_300}"/>')
    s.append(steam(cx - 60, cy - 150, 3, IVORY, ".3"))
    return "".join(s)


def g_dosa(w, h, rnd):
    cx, cy = w // 2, h // 2 + 30
    s = [f'<circle cx="{cx}" cy="{cy}" r="330" fill="{GREEN_900}"/>',
         f'<circle cx="{cx}" cy="{cy}" r="330" fill="none" stroke="{GOLD}" stroke-width="4" opacity=".6"/>',
         f'<circle cx="{cx}" cy="{cy}" r="300" fill="#241f19"/>']
    # dosa
    s.append(f'<circle cx="{cx}" cy="{cy}" r="248" fill="{TURMERIC}"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="248" fill="none" stroke="{SAFFRON}" stroke-width="10" opacity=".8"/>')
    for _ in range(90):
        a, d = rnd.uniform(0, math.tau), rnd.uniform(0, 240)
        s.append(f'<circle cx="{cx+math.cos(a)*d:.0f}" cy="{cy+math.sin(a)*d:.0f}" '
                 f'r="{rnd.uniform(3,11):.1f}" fill="{SAFFRON}" opacity="{rnd.uniform(.2,.55):.2f}"/>')
    s.append(mound(cx, cy, 78, GOLD_300, seed=3, lumps=10))
    s.append(steam(cx, cy - 190, 4, GOLD_100, ".35"))
    # ladle
    s.append(f'<rect x="{cx+250}" y="{cy-330}" width="18" height="240" rx="9" fill="{GOLD_700}" '
             f'transform="rotate(24 {cx+250} {cy-330})"/>')
    return "".join(s)


def g_dessert_table(w, h, rnd):
    base = h * 0.74            # table top line
    ccx = w * 0.5
    s = [f'<rect x="60" y="{base:.0f}" width="{w-120}" height="{h-base-70:.0f}" rx="18" fill="{IVORY}"/>',
         f'<rect x="60" y="{base:.0f}" width="{w-120}" height="18" rx="9" fill="{GOLD_300}"/>',
         f'<rect x="60" y="{base+18:.0f}" width="{w-120}" height="{h-base-88:.0f}" fill="{SAND}" opacity=".5"/>']

    # tiered cake — bottom tier widest, sitting on the table
    tiers = [(300, 130), (216, 112), (140, 96)]
    y = base
    for i, (rw, rh) in enumerate(tiers):
        y -= rh
        s.append(f'<rect x="{ccx-rw/2:.0f}" y="{y:.0f}" width="{rw}" height="{rh}" rx="12" fill="{COCONUT}"/>')
        s.append(f'<rect x="{ccx-rw/2:.0f}" y="{y:.0f}" width="{rw}" height="22" rx="11" fill="{BEET}" opacity=".6"/>')
        s.append(f'<rect x="{ccx-rw/2:.0f}" y="{y+rh-10:.0f}" width="{rw}" height="10" fill="{CLAY}" opacity=".35"/>')
        n = max(2, int(rw / 52))
        for k in range(n):
            dx = ccx - rw / 2 + rw * (k + 0.5) / n
            s.append(f'<circle cx="{dx:.0f}" cy="{y+rh*0.62:.0f}" r="9" fill="{GOLD}"/>')
    # cake topper
    s.append(f'<path d="M{ccx:.0f} {y-56:.0f} l13 27 30 4 -22 21 6 30 -27-15 -27 15 6-30 -22-21 30-4z" fill="{GOLD}"/>')

    # cupcakes flanking the cake
    for side in (-1, 1):
        for k in range(3):
            x = ccx + side * (240 + k * 130)
            if x < 130 or x > w - 130:
                continue
            top_y = base - 92
            s.append(f'<path d="M{x-42:.0f} {top_y:.0f} l12 82 h60 l12 -82Z" fill="{GOLD_300}"/>')
            s.append(f'<path d="M{x-42:.0f} {top_y:.0f} l12 82 h60 l12 -82Z" fill="{GREEN_900}" opacity=".08"/>')
            s.append(f'<circle cx="{x:.0f}" cy="{top_y-14:.0f}" r="46" fill="{[BEET, COCONUT, TURMERIC][k%3]}"/>')
            s.append(f'<circle cx="{x-14:.0f}" cy="{top_y-30:.0f}" r="13" fill="{IVORY}" opacity=".3"/>')
            s.append(f'<circle cx="{x:.0f}" cy="{top_y-56:.0f}" r="11" fill="{TOMATO}"/>')

    # dessert bowls on the table front
    for i in range(4):
        x = 190 + i * (w - 380) / 3
        s.append(bowl(x, base + 62, 40, [SAFFRON, BEET, COCONUT, TURMERIC][i]))
    return "".join(s)


def g_meal_boxes(w, h, rnd):
    s = []
    cols, rows = 3, 2
    for r in range(rows):
        for c in range(cols):
            x = 100 + (w - 200) * c / cols
            y = 120 + (h - 240) * r / rows
            bw, bh = (w - 200) / cols - 40, (h - 240) / rows - 40
            s.append(f'<rect x="{x:.0f}" y="{y:.0f}" width="{bw:.0f}" height="{bh:.0f}" rx="14" '
                     f'fill="{IVORY}" stroke="{LINE}" stroke-width="3"/>')
            s.append(f'<line x1="{x+bw/2:.0f}" y1="{y+10:.0f}" x2="{x+bw/2:.0f}" y2="{y+bh-10:.0f}" '
                     f'stroke="{LINE}" stroke-width="3"/>')
            s.append(f'<line x1="{x+bw/2:.0f}" y1="{y+bh/2:.0f}" x2="{x+bw-10:.0f}" y2="{y+bh/2:.0f}" '
                     f'stroke="{LINE}" stroke-width="3"/>')
            s.append(mound(x + bw * 0.26, y + bh * 0.5, bw * 0.17, RICE, seed=r * 3 + c))
            s.append(f'<rect x="{x+bw*0.56:.0f}" y="{y+bh*0.16:.0f}" width="{bw*0.34:.0f}" '
                     f'height="{bh*0.28:.0f}" rx="8" fill="{FOODS[(r*cols+c)%len(FOODS)]}"/>')
            s.append(f'<rect x="{x+bw*0.56:.0f}" y="{y+bh*0.58:.0f}" width="{bw*0.34:.0f}" '
                     f'height="{bh*0.26:.0f}" rx="8" fill="{FOODS[(r*cols+c+3)%len(FOODS)]}"/>')
            s.append(f'<rect x="{x+12:.0f}" y="{y+12:.0f}" width="52" height="14" rx="7" fill="{GOLD_300}"/>')
    return "".join(s)


def g_evening_setup(w, h, rnd):
    s = [f'<rect width="{w}" height="{h}" fill="{GREEN_900}"/>']
    for _ in range(60):
        x, y = rnd.randint(0, w), rnd.randint(0, int(h * 0.5))
        s.append(f'<circle cx="{x}" cy="{y}" r="{rnd.uniform(2,5):.1f}" fill="{GOLD_300}" '
                 f'opacity="{rnd.uniform(.2,.8):.2f}"/>')
    # string lights
    for row in range(2):
        y0 = 90 + row * 70
        s.append(f'<path d="M0 {y0} Q{w/4} {y0+60} {w/2} {y0} T{w} {y0}" stroke="{GOLD_700}" '
                 f'stroke-width="2" fill="none" opacity=".6"/>')
        for i in range(14):
            t = i / 13
            x = t * w
            yy = y0 + 60 * math.sin(t * math.pi * 2) * 0.5 + 14
            s.append(f'<circle cx="{x:.0f}" cy="{yy:.0f}" r="7" fill="{GOLD_300}" opacity=".9"/>')
            s.append(f'<circle cx="{x:.0f}" cy="{yy:.0f}" r="16" fill="{GOLD}" opacity=".18"/>')
    # counter
    s.append(f'<rect x="80" y="{h*0.52:.0f}" width="{w-160}" height="{h*0.34:.0f}" rx="20" fill="{GREEN_800}"/>')
    s.append(f'<rect x="80" y="{h*0.52:.0f}" width="{w-160}" height="18" rx="9" fill="{GOLD}"/>')
    for i in range(5):
        bx = 80 + (w - 160) * (i + 0.5) / 5
        by = h * 0.52 + h * 0.17
        s.append(bowl(bx, by, 62, FOODS[i], rim=CREAM))
        s.append(garnish(bx, by, 32, seed=i, n=5))
    s.append(steam(w * 0.5, h * 0.52 - 6, 4, GOLD_100, ".3"))
    return "".join(s)


def g_mocktails(w, h, rnd):
    s = [f'<rect x="70" y="{h*0.62:.0f}" width="{w-140}" height="{h*0.24:.0f}" rx="16" fill="{IVORY}" opacity=".75"/>']
    cols = [TOMATO, SAFFRON, MINT, BEET, TURMERIC]
    for i, c in enumerate(cols):
        x = 70 + (w - 140) * (i + 0.5) / len(cols)
        y = h * 0.44
        s.append(glass(x, y, 130, 250, c))
        s.append(f'<circle cx="{x+46:.0f}" cy="{y-118:.0f}" r="22" fill="{MINT}" opacity=".9"/>')
        s.append(f'<rect x="{x-8:.0f}" y="{y-190:.0f}" width="8" height="110" rx="4" fill="{GOLD}" '
                 f'transform="rotate(12 {x} {y-140:.0f})"/>')
        for k in range(4):
            s.append(f'<circle cx="{x-30+k*18:.0f}" cy="{y+40+k*12:.0f}" r="{5-k*0.6:.1f}" '
                     f'fill="{IVORY}" opacity=".45"/>')
    return "".join(s)


# ---------------------------------------------------------------- extras
def make_og():
    w, h = 1200, 630
    s = [hdr(w, h), defs(lin("og", GREEN_900, GREEN_800), rad("warm", GOLD_700, "rgba(0,0,0,0)"))]
    s.append(f'<rect width="{w}" height="{h}" fill="url(#og)"/>')
    s.append(f'<ellipse cx="{w*0.78:.0f}" cy="{h*0.5:.0f}" rx="420" ry="380" fill="url(#warm)" opacity=".6"/>')
    cx, cy = int(w * 0.78), int(h * 0.5)
    for i in range(7):
        a = i / 7 * math.tau
        s.append(bowl(cx + math.cos(a) * 190, cy + math.sin(a) * 175, 52, FOODS[i % len(FOODS)]))
    s.append(plate(cx, cy, 84, rim=GOLD))
    s.append(mound(cx, cy, 52, RICE, seed=4, lumps=12))
    s.append(f'<text x="90" y="{h*0.44:.0f}" font-family="Georgia,serif" font-size="72" '
             f'font-weight="700" fill="{IVORY}">Taj Home Caterers</text>')
    s.append(f'<text x="92" y="{h*0.55:.0f}" font-family="Helvetica,Arial,sans-serif" font-size="26" '
             f'letter-spacing="6" fill="{GOLD_300}">CATERING SINCE 2009</text>')
    s.append(f'<rect x="92" y="{h*0.60:.0f}" width="110" height="4" rx="2" fill="{GOLD}"/>')
    write("og-image.svg", "".join(s))


def make_favicon():
    s = [hdr(512, 512), defs(lin("fg", GREEN, GREEN_900))]
    s.append(f'<rect width="512" height="512" rx="112" fill="url(#fg)"/>')
    s.append(f'<circle cx="256" cy="256" r="196" fill="none" stroke="{GOLD}" stroke-width="8" opacity=".55"/>')
    s.append(f'<text x="256" y="272" text-anchor="middle" font-family="Georgia,serif" font-size="200" '
             f'font-weight="700" fill="{GOLD_300}">T</text>')
    s.append(f'<path d="M366 128l14 30 30 14-30 14-14 30-14-30-30-14 30-14z" fill="{GOLD}"/>')
    write("favicon.svg", "".join(s))


def make_leaf_texture():
    """Standalone banana leaf used by the sadhya scroll section."""
    w, h = 1400, 620
    s = [hdr(w, h), defs(lin("lg", GREEN_600, GREEN_800, 0, 0, 1, 1))]
    s.append(f'<path d="M40 310 Q40 40 700 40 Q1360 40 1360 310 Q1360 580 700 580 Q40 580 40 310Z" '
             f'fill="url(#lg)"/>')
    s.append(f'<line x1="90" y1="310" x2="1310" y2="310" stroke="{GREEN_300}" stroke-width="5" opacity=".45"/>')
    for i in range(1, 44):
        x = 90 + i * (1220 / 44)
        s.append(f'<path d="M{x:.0f} 310 l22 -128" stroke="{GREEN_300}" stroke-width="2" opacity=".28" fill="none"/>')
        s.append(f'<path d="M{x:.0f} 310 l22 128" stroke="{GREEN_300}" stroke-width="2" opacity=".28" fill="none"/>')
    write("banana-leaf.svg", "".join(s))


# ---------------------------------------------------------------- run
def build_all():
    make_hero()
    make_og()
    make_favicon()
    make_leaf_texture()

    scene("gallery-01.svg", seed=1, build=g_kitty_table)
    scene("gallery-02.svg", w=1000, h=1400, seed=2, build=g_wedding_buffet)
    scene("gallery-03.svg", seed=3, build=g_chaat_counter)
    scene("gallery-04.svg", seed=4, build=g_sweets)
    scene("gallery-05.svg", w=1600, h=900, seed=5, build=g_corporate_buffet)
    scene("gallery-06.svg", seed=6, build=g_starters)
    scene("gallery-07.svg", seed=7, build=g_sadhya)
    scene("gallery-08.svg", w=1000, h=1400, seed=8, build=g_dosa)
    scene("gallery-09.svg", seed=9, build=g_dessert_table)
    scene("gallery-10.svg", seed=10, build=g_meal_boxes)
    scene("gallery-11.svg", seed=11, build=g_evening_setup, base=None, dark=True)
    scene("gallery-12.svg", seed=12, build=g_mocktails)


if __name__ == "__main__":
    import sys
    wanted = sys.argv[1:] or list(PALETTES)
    for theme in wanted:
        if theme not in PALETTES:
            raise SystemExit(f"unknown theme '{theme}' — choose from {', '.join(PALETTES)}")
        print(f"\n── {theme} ──")
        use_palette(theme)
        _alias()
        build_all()
    print("\ndone")
