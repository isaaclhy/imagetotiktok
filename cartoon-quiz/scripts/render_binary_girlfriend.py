#!/usr/bin/env python3
"""Template 8 binary quiz. Same v15 cartoon, voice, and motion, with three changes:
more space under the title, heart pops on the kisses stake, and two-choice questions.
Question text comes from CARTOON_BANK. This file does not invent a researched bank.
"""
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import choice_icons
import quiz_video as qv
import recreate_reference as rr
import recreate_reference_v15 as v15
from PIL import Image, ImageDraw

ROOT = os.environ.get("CARTOON_QUIZ_ROOT", "/workspace")
WORK = os.environ.get("CARTOON_WORK", os.path.join(ROOT, "work", "binary"))
os.makedirs(WORK, exist_ok=True)
for name in ("img0.jpg", "music.mp3"):
    src = os.path.join(ROOT, "assets", "rr15", name)
    dst = os.path.join(WORK, name)
    if not os.path.exists(dst):
        os.symlink(src, dst)

v15.D = rr.D = qv.D = WORK
v15.qv.D = WORK
OUT = os.environ.get("CARTOON_OUT", os.path.join(ROOT, "out", "how-well-binary.mp4"))
qv.OUT = OUT
os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)

W, H, FPS, SR = qv.W, qv.H, qv.FPS, qv.SR
ff = rr.ff
# Title sits a little higher. The level line is a full gap below the bounced title,
# and the couple rests below that so the badge never lands on the lettering or the faces.
TITLE_CY = 700
LEVEL_GAP = 110
COUPLE_REST = 1280

v15.Q_TIMER = 3.9
Q_TEXT_CY = 300
CARD = 400
CARD_Y = 470
CLOCK_CY = 1395
qv.SW_C = (540, CLOCK_CY)


SPOKEN_FIX = {
    "Would she choose beach or mountains?": "Would she choose the beach or the mountains?",
}

LEVEL_TEXT = os.environ.get("CARTOON_LEVEL", "level: medium").strip()
if not LEVEL_TEXT.startswith("("):
    LEVEL_TEXT = f"({LEVEL_TEXT})"


def load_questions():
    path = os.environ.get("CARTOON_BANK")
    if not path:
        raise SystemExit("CARTOON_BANK is required")
    data = json.load(open(path))
    questions = data["questions"] if "questions" in data else data
    if len(questions) != 6:
        raise SystemExit(f"Each video needs 6 binary questions, got {len(questions)}")
    out = []
    for i, raw in enumerate(questions, start=1):
        if i == 3:
            out.append("MID")
        spoken = raw.get("spokenQuestion") or raw.get("say")
        spoken = SPOKEN_FIX.get(spoken, spoken)
        out.append({
            "say": spoken,
            "left": (raw.get("optionA") or raw.get("left") or "").strip(),
            "right": (raw.get("optionB") or raw.get("right") or "").strip(),
            "illustrationLeft": raw.get("illustrationA") or raw.get("iconLeft"),
            "illustrationRight": raw.get("illustrationB") or raw.get("iconRight"),
            "id": raw.get("id", str(i)),
        })
    return out


def heart_tile(size=130):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = size * 0.26
    c1 = (size * 0.36, size * 0.38)
    c2 = (size * 0.64, size * 0.38)
    outline = (0, 0, 0, 255)
    fill = (255, 64, 160, 255)
    for cx, cy in (c1, c2):
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill, outline=outline, width=max(3, size // 28))
    d.polygon(
        [
            (size * 0.12, size * 0.46),
            (size * 0.88, size * 0.46),
            (size * 0.50, size * 0.90),
        ],
        fill=fill,
        outline=outline,
    )
    return im


HEART = heart_tile()


def choice_card(illustration, label, size=CARD):
    art = choice_icons.icon_for(illustration, label).convert("RGBA").resize((size - 28, size - 28), Image.LANCZOS)
    canvas = Image.new("RGBA", (size + 16, size + 86), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), 36, fill=255)
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    canvas.paste(shadow, (14, 14), mask)
    art_canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    art_canvas.paste(art, (14, 14), art)
    art_canvas.putalpha(mask)
    canvas.alpha_composite(art_canvas, (0, 0))
    label_size = 52
    label_im = v15.tile(label, label_size)
    while label_im.width > size + 10 and label_size > 28:
        label_size -= 4
        label_im = v15.tile(label, label_size)
    canvas.alpha_composite(label_im, ((canvas.width - label_im.width) // 2, size + 8))
    return canvas


def title_bottom(items, cy):
    heights = [size * 1.2 for _, _, size, _ in items]
    last = items[-1][2]
    center = cy - sum(heights) / 2 + sum(heights[:-1]) + heights[-1] / 2
    # Settled tile plus the ease-out-back overshoot and the slide, so the badge clears the bounce.
    return center + (last * 1.5 + 30) * 0.62 + 36


def couple_low(im, age, rest=COUPLE_REST, scale=0.72):
    if age < 0:
        return
    cp = qv.couple()
    side = int(cp.width * scale)
    img = cp.resize((side, side), Image.LANCZOS)
    p = min(1, age / 0.45)
    y = int(H - (H - rest) * qv.back(p, 1.6))
    sway = int(10 * math.sin(max(0, age - 0.45) * 2 * math.pi * 0.8))
    bob = -abs(math.sin(max(0, age - 0.45) * math.pi * 1.4)) * 10
    im.paste(img, (int(540 + sway - img.width / 2), int(y + bob)), img)


def kisses_hearts(im, age):
    if age < 0:
        return
    spots = [(150, 640), (930, 620), (120, 980), (960, 960), (200, 1280), (880, 1260)]
    for i, (x, y) in enumerate(spots):
        local = age - i * 0.11
        if local < 0:
            continue
        rise = int(min(local, 1.2) * 70)
        wobble = int(8 * math.sin(local * 6 + i))
        v15.pop_paste(im, HEART, x + wobble, y - rise, local, 0.22)


def reuse_intro_audio():
    src = os.path.join(ROOT, "assets", "rr15")
    for name in ("vo_i0", "vo_i1", "vo_i2", "vo_i3", "vo_mid", "vo_end", "vo_cb", "vo_cta"):
        for ext in (".wav", ".wav.json"):
            source = os.path.join(src, name + ext)
            dest = os.path.join(WORK, name + ext)
            if os.path.exists(source) and not os.path.exists(dest):
                os.symlink(source, dest)


def build():
    reuse_intro_audio()
    questions = load_questions()
    segs, ev = [], []
    sounds = dict(pop=qv.sfx_pop(), qsw=qv.sfx_qswoosh(), tick=rr.tick_sfx(), tock=rr.tick_sfx(True))
    base = qv.base
    couple = qv.couple()
    couple_small = couple.resize((500, 500), Image.LANCZOS)
    T = 0.04

    def voice(key, text, start):
        clip, offs = v15.line(key, text)
        t0 = start - qv.PRE
        ev.append((t0, clip, 1, f"vo {key}", start))
        return [t0 + o for o in offs], t0 + len(clip) / SR

    def text_ev(label, ts, wt, gain=0.45):
        ev.append((ts, sounds["pop"], gain, f"pop '{label}'", ts))
        ev.append((wt, None, 0, f"word '{label}'"))

    screens = []
    kiss_time = None
    for i, (txt, frags) in enumerate(v15.INTRO):
        wts, end = voice(f"i{i}", txt, T)
        items = []
        prev = -1
        for frag, wi, size in frags:
            ts = ff(wts[min(wi, len(wts) - 1)])
            if i == 0:
                ts = ff(wts[0])
            elif ts <= prev + 1e-6:
                ts = prev + 1 / FPS
            prev = ts
            text_ev(frag, ts, max(ts, wts[min(wi, len(wts) - 1)]))
            items.append((frag, ts, size, v15.RED if frag in ("2", "wrong,") else (255, 255, 255)))
            if frag == "kisses":
                kiss_time = ts
        screens.append((ff(wts[0]), items))
        T = end + (0.05 if i == 0 else 0.10)
        if i < 2:
            ev.append((ff(wts[0]), sounds["qsw"], 0.25, f"swoosh intro{i}"))
    level_t = screens[0][1][2][1] + 0.2
    level_cy = title_bottom(screens[0][1], TITLE_CY) + LEVEL_GAP + (62 * 1.5 + 30) / 2

    def intro(tl, screens=screens, level_cy=level_cy, kiss_time=kiss_time):
        im = base()
        k = max(i for i in range(len(screens)) if screens[i][0] <= tl + 1e-3 or i == 0)
        items = screens[k][1]
        if k == 0:
            v15.title_stack(im, items, tl, TITLE_CY)
            v15.pop_paste(im, v15.tile(LEVEL_TEXT, 62, qv.PINK), 540, level_cy, tl - level_t)
            couple_low(im, tl - screens[0][0], rest=max(COUPLE_REST, level_cy + 150))
        else:
            cur = [it for it in items if it[1] <= tl + 1e-3] or items[:1]
            v15.stack(im, [cur[-1]], tl, 780)
            if k == 3 and kiss_time is not None:
                kisses_hearts(im, tl - (kiss_time - screens[0][0]))
                couple_low(im, tl - screens[k][0], rest=1460, scale=0.62)
        return im

    T = ff(T + 0.02)
    segs.append((0, T, intro))

    for n, q in enumerate(questions):
        T0 = T
        if q == "MID":
            wts, vend = voice("mid", v15.MID_SAY, T0 + 0.02)
            screens_m = []
            seen = []
            wi = 0
            for sc_text, col in v15.MID_W:
                lay = v15.word_layout(sc_text, 120, v15.MID_WORD_CY)
                items = []
                for (word, x, y, size) in lay:
                    j = min(wi, len(wts) - 1)
                    ts = ff(wts[j])
                    if seen and ts <= seen[-1] + 1e-6:
                        ts = seen[-1] + 1 / FPS
                    seen.append(ts)
                    text_ev(word, ts, max(ts, wts[j]), 0.3)
                    items.append((word, x, y, size, ts, col))
                    wi += 1
                screens_m.append(items)
            ta = ff(vend + 0.05)
            tb = ta + v15.MID_TIMER

            def mid(tl, T0=T0, screens_m=screens_m, ta=ta, tb=tb):
                t = T0 + tl
                im = base()
                if t < ta:
                    allw = [it for sc in screens_m for it in sc]
                    cur = [it for it in allw if it[4] <= t + 1e-3] or allw[:1]
                    word, x, y, size, ts, col = cur[-1]
                    face = qv.font(150)
                    sz = 150
                    while face.getlength(word) > 900:
                        sz -= 6
                        face = qv.font(sz)
                    v15.pop_paste(im, v15.tile(word, sz, col), 540, v15.MID_WORD_CY, t - ts, 0.16)
                else:
                    v15.stack(im, [("(type in the comments.)", ta, 100, (255, 255, 255))], t, v15.MID_TIP_CY)
                    im = v15.emergency_clock(im, t, ta, tb)
                return im

            draw = mid
        else:
            say = q["say"]
            idx = n + 1
            wts, vend = voice(f"q{idx}", say, T0 + 0.02)
            ev.append((T0, sounds["qsw"], 0.25, f"swoosh q{idx}"))
            ev.append((T0, sounds["pop"], 0.45, f"pop choices {idx}", T0))
            lay = v15.word_layout(say, 72, Q_TEXT_CY, maxw=940)
            shown = ff(wts[0])
            text_ev(say, shown, wts[0])
            left = choice_card(q["illustrationLeft"], q["left"])
            right = choice_card(q["illustrationRight"], q["right"])
            ta = ff(vend + 0.05)
            tb = ta + v15.Q_TIMER

            def qa(tl, T0=T0, ta=ta, tb=tb, lay=lay, shown=shown, left=left, right=right):
                t = T0 + tl
                im = base()
                for word, x, y, size in lay:
                    v15.pop_paste(im, v15.tile(word, size), x, y, t - shown, 0.16)
                sc = max(0.05, qv.back((tl - 0.02) / 0.25, 2.0))
                for card, cx in ((left, 280), (right, 800)):
                    w = max(1, int(card.width * sc))
                    h = max(1, int(card.height * sc))
                    pic = card.resize((w, h), Image.LANCZOS)
                    im.paste(pic, (int(cx - w / 2), int(CARD_Y + (1 - sc) * 40)), pic)
                return v15.emergency_clock(im, t, ta, tb)

            draw = qa
        segs.append((T0, tb - T0, draw))
        t = ta
        k = 0
        while t < tb - 1e-6:
            rem = tb - t
            hot = rem <= 2.0
            e = 0 if rem > v15.EMERG else 1 - rem / v15.EMERG
            ev.append((t, sounds["tock" if k % 2 else "tick"], 1.0 + 0.5 * e, f"tick {n}"))
            t += 0.1 if hot else rr.TICK_DT
            k += 1
        rd = min(v15.EMERG, tb - ta)
        ev.append((tb - rd, v15.riser(rd), 1.0, f"riser {n}"))
        T = ff(tb)

    wts, vend = voice("end", v15.END, T + 0.02)
    ev.append((T, sounds["pop"], 0.5, "pop end", T))
    t_end = ff(wts[0])
    wts2, vend2 = voice("cb", "Comment below!", vend + 0.12)
    t_cb = ff(wts2[0])
    text_ev("Comment below!", t_cb, wts2[0])
    T2 = ff(vend2 + 0.35)
    lay = v15.word_layout(v15.END, 120, 820)

    def end(tl, T0=T, lay=lay):
        t = T0 + tl
        im = base()
        for word, x, y, size in lay:
            v15.pop_paste(im, v15.tile(word, size), x, y, t - t_end, 0.2)
        v15.pop_paste(im, v15.tile("Comment below!", 110, qv.PINK), 540, 1080, t - t_cb, 0.2)
        return im

    segs.append((T, T2 - T, end))
    wts3, vend3 = voice("cta", "Download Spill It for more questions!", T2 + 0.1)
    ev.append((T2, sounds["qsw"], 0.25, "swoosh cta"))
    phrases = [("Download", 0, 120, (255, 255, 255)), ("Spill It", 1, 150, qv.PINK), ("for more questions!", 3, 100, (255, 255, 255))]
    items = []
    for frag, wi, size, col in phrases:
        j = min(wi, len(wts3) - 1)
        ts = ff(wts3[j])
        text_ev(frag, ts, wts3[j])
        items.append((frag, ts, size, col))
    t_sub = ff(vend3 + 0.05)

    def cta(tl, T0=T2, items=items):
        t = T0 + tl
        im = base()
        p = 1 - (1 - min(1, tl / 0.3)) ** 3
        im.paste(couple_small, (540 - couple_small.width // 2, int(H - (H - 1060) * p)), couple_small)
        v15.stack(im, items, t, 640)
        v15.pop_paste(im, v15.tile("Spill It - Couples Questions", 56, (255, 255, 255)), 540, 960, t - t_sub, 0.2)
        return im

    total = ff(vend3 + 1.2)
    segs.append((T2, total - T2, cta))
    return segs, ev, total


qv.build = build

if __name__ == "__main__":
    qv.main()
