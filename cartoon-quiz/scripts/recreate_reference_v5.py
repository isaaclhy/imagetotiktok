#!/usr/bin/env python3
"""v5 of the reference recreation: same as v4 but question layout (text, square, clock) shifted
down ~120px for more top padding clear of TikTok UI. Mid-roll timer screen shifted the same way."""
import sys, os, json, math, numpy as np
sys.path.insert(0, "/workspace"); import quiz_video as qv
import recreate_reference as rr
from PIL import Image, ImageDraw
qv.D = rr.D = D = "/workspace/rr5"; qv.OUT = OUT = "/workspace/videos/reference_recreation_v5.mp4"
qv.SPEED = 1.15; qv.RATE = f"kokoro{qv.SPEED}"
W, H, FPS, SR = qv.W, qv.H, qv.FPS, qv.SR
ff = rr.ff
RED = (225, 30, 45)
INTRO = [("Quiz your girlfriend!", [("Quiz your", 0, 112), ("Girlfriend!", 2, 112)]),
         ("Boys, send this to her.", [(w, i, 150) for i, w in enumerate(["Boys!", "send", "this", "to", "her."])]),
         ("If she gets two wrong, she owes you a massage!", [(w, i, 150) for i, w in enumerate(["If", "she", "gets", "2", "wrong,", "she", "owes", "you", "a", "massage!"])])]
QS = [("What is her favorite food?", 1), ("What is her favorite video game?", 2), "MID",
      ("What are her parents' names?", 3), ("Who is her best friend?", 4), ("What is her favorite pastime?", 5),
      ("When is her birthday?", 6), ("What is her favorite sports team?", 7), ("What is her pet's name?", 8)]
MID_SAY = "Can you type her name with your eyes shut? Try it in the comments. I'll give you extra time for this one."
MID_W = [("Can you type her name with your eyes shut?", (255, 255, 255)), ("Try it in the comments.", qv.PINK), ("I'll give you extra time for this one.", (255, 255, 255))]
_OLD = [[("Can you", 0), ("type her", 2), ("name", 4), ("with your", 5), ("eyes shut?", 7)],
               [("(type in the", 9), ("comments.)", 12)], [("I'll give you", 13), ("extra time", 16), ("for this one.", 18)]]
END = "How many did she get?"
Q_TIMER, MID_TIMER, EMERG = 3.0, 7.0, 5.0
GAP_LINE, GAP_SEG = 0.10, 0.12
# Question-screen layout: shift whole block down for TikTok top padding (>=250px above image).
SHIFT = 120
# Clock shifts a bit less than text/image so the rem<2s pink pulse ring stays above the
# bottom 350px TikTok zone (ring reaches ~+125px from center at max emergency scale).
CLOCK_SHIFT = 55
Q_TEXT_CY = 230 + SHIFT          # was 230
Q_SQ_Y = 520 + SHIFT             # was 520 (square top when fully scaled)
Q_SQ_SIZE = 560                  # keep size; bottom of sq at 640+560=1200
CLOCK_CY = 1340 + CLOCK_SHIFT    # was 1340; max pulse bottom ~CLOCK_CY+169 <= 1569 (measured)
qv.SW_C = (540, CLOCK_CY)
MID_TIP_CY = 900 + SHIFT         # mid-roll tip text during timer
MID_WORD_CY = 900                # full-screen mid words stay centered (no image/clock yet)

def line(key, text):
    c, offs = rr.line(key, text)
    # trim silences > 140 ms down to 90 ms (8 ms crossfade), shift word offsets
    E = qv.env(c, .005); th = E.max() * 10 ** (-40 / 20); q = E < th; cuts = []; i = 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if j - i > .14 * SR and i > 0 and j < len(q): cuts.append((i + int(.045 * SR), j - int(.045 * SR)))
            i = j
        else: i += 1
    xf = int(.008 * SR)
    for a, b in reversed(cuts):
        mixx = c[a:a + xf] * np.linspace(1, 0, xf) + c[b:b + xf] * np.linspace(0, 1, xf)
        c = np.concatenate([c[:a], mixx, c[b + xf:]]); d = (b - a) / SR
        offs = [o - d if o * SR >= b else o for o in offs]
    return c, offs

def riser(dur):
    t = np.arange(int(dur * SR)) / SR; f = 220 * (6 ** (t / dur)); ph = 2 * np.pi * np.cumsum(f) / SR
    s = (np.sin(ph) + .4 * np.sin(2 * ph)) * (t / dur) ** 1.6
    s += .25 * np.random.RandomState(5).randn(len(t)) * (t / dur) ** 2
    s[-int(.02 * SR):] *= np.linspace(1, 0, int(.02 * SR)); return .35 * s / np.abs(s).max()

_tiles = {}
def tile(text, size, fill=(255, 255, 255)):
    k = (text, size, fill)
    if k not in _tiles:
        f = qv.font(size); w = int(f.getlength(text)) + 60; h = int(size * 1.5) + 30
        im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); qv.sticker_text(ImageDraw.Draw(im), (w // 2 - 4, h // 2 - 4), text, f, fill=fill)
        _tiles[k] = im
    return _tiles[k]

def pop_paste(im, tl, cx, cy, age, dur=.2):
    if age < 0: return
    p = min(1, age / dur); sc = max(.05, .35 + .65 * qv.back(p, 2.2)); oy = int((1 - min(1, p * 1.3)) * 40)
    t2 = tl if abs(sc - 1) < 1e-3 else tl.resize((max(1, int(tl.width * sc)), max(1, int(tl.height * sc))))
    im.paste(t2, (int(cx - t2.width / 2), int(cy + oy - t2.height / 2)), t2)

def stack(im, items, t, cy=900):
    """items: (text, appear_time, size, fill) stacked vertically, each pops in at its time"""
    hs = [s * 1.2 for _, _, s, _ in items]; y = cy - sum(hs) / 2
    for (txt, ta, s, fill), h in zip(items, hs):
        f = qv.font(s); txt_s = s
        while f.getlength(txt) > 900: txt_s -= 6; f = qv.font(txt_s)
        pop_paste(im, tile(txt, txt_s, fill), 540, y + h / 2, t - ta); y += h

def word_layout(text, size, cy, maxw=880):
    f = qv.font(size)
    while any(f.getlength(l) > maxw for l in qv.wrap(text, f, maxw)): size -= 6; f = qv.font(size)
    lines = qv.wrap(text, f, maxw); lh = size * 1.18; y0 = cy - lh * (len(lines) - 1) / 2; out = []; sp = f.getlength(" ")
    for i, l in enumerate(lines):
        ws = l.split(); lw = f.getlength(l); x = 540 - lw / 2
        for w in ws: wl = f.getlength(w); out.append((w, x + wl / 2, y0 + i * lh, size)); x += wl + sp
    return out

yy, xx = np.mgrid[0:H, 0:W]
dist = np.minimum(np.minimum(xx, W - 1 - xx), np.minimum(yy, H - 1 - yy)).astype(np.float32)
VIG = np.clip(1 - dist / 230, 0, 1) ** 1.8; VIG = VIG[..., None]
SWT = 420
def emergency_clock(im, t, ta, tb):
    rem = max(0, tb - t); frac = min(1, max(0, (t - ta) / (tb - ta)))
    e = 0 if rem > EMERG else .35 + .65 * (1 - rem / EMERG)
    sw = Image.new("RGBA", (SWT, SWT), (0, 0, 0, 0)); old = qv.SW_C; qv.SW_C = (SWT // 2, SWT // 2)
    qv.stopwatch(sw, frac, rem if t >= ta else 99); qv.SW_C = old
    cx, cy = old
    if e > 0 and t >= ta:
        sc = 1 + .14 * e * max(0, math.cos(2 * math.pi * (t - ta) * (2 + 3 * e))) ** 4
        rs = np.random.RandomState(int(t * FPS)); cx += int(rs.uniform(-1, 1) * 14 * e); cy += int(rs.uniform(-1, 1) * 9 * e)
        ang = rs.uniform(-1, 1) * 7 * e
        sw = sw.rotate(ang, resample=Image.BICUBIC); s = int(SWT * sc); sw = sw.resize((s, s))
    im.paste(sw, (cx - sw.width // 2, cy - sw.height // 2), sw)
    if t >= ta and rem <= EMERG and rem > 0:
        n = math.ceil(rem - 1e-6); ph = (math.ceil(rem - 1e-6) - rem)  # 0 at each new second
        tl = tile(str(n), 110, RED if e > .5 or n <= 3 else (255, 255, 255))
        pop_paste(im, tl, 540 + 210, qv.SW_C[1], ph, .15)
    return im

def build():
    segs, ev = [], []; S = dict(pop=qv.sfx_pop(), qsw=qv.sfx_qswoosh(), tick=rr.tick_sfx(), tock=rr.tick_sfx(True))
    cp = qv.couple(); cps = cp.resize((500, 500), Image.LANCZOS); base = qv.base; T = 0.04
    def voice(key, text, T):
        c, offs = line(key, text); t0 = T - qv.PRE; ev.append((t0, c, 1, f"vo {key}", T)); return [t0 + o for o in offs], t0 + len(c) / SR
    def text_ev(label, ts, wt, g=.45):
        ev.append((ts, S["pop"], g, f"pop '{label}'", ts)); ev.append((wt, None, 0, f"word '{label}'"))
    # ---- intro: each sentence builds up line by line
    screens = []
    for i, (txt, frs) in enumerate(INTRO):
        wts, end = voice(f"i{i}", txt, T); items = []
        prev = -1
        for fr, wi, sz in frs:
            ts = ff(wts[min(wi, len(wts) - 1)])
            if ts <= prev + 1e-6: ts = prev + 1 / FPS   # whisper gave two words the same time: show 2nd one frame later
            prev = ts; text_ev(fr, ts, max(ts, wts[min(wi, len(wts) - 1)]))
            items.append((fr, ts, sz, RED if fr in ("2", "wrong,") else (255, 255, 255)))
        screens.append((ff(wts[0]), items)); T = end + GAP_LINE
    lvl_t = screens[0][1][1][1] + .2
    def intro(tl):
        im = base(); k = max(i for i in range(len(screens)) if screens[i][0] <= tl + 1e-3 or i == 0); items = screens[k][1]
        if k == 0:
            stack(im, items, tl, 830)
            pop_paste(im, tile("(level: medium)", 62, qv.PINK), 540, 990, tl - lvl_t)
            p = 1 - (1 - min(1, tl / .3)) ** 3; im.paste(cp, (130, int(H - (H - 1150) * p)), cp)
        else:
            cur = [it for it in items if it[1] <= tl + 1e-3] or items[:1]
            stack(im, [cur[-1]], tl)
        return im
    T = ff(T + GAP_SEG - GAP_LINE); segs.append((0, T, intro))
    for n, q in enumerate(QS):
        T0 = T
        if q == "MID":
            wts, vend = voice("mid", MID_SAY, T0 + .02); scr = []; items_all = []
            wi = 0
            for sc_text, col in MID_W:
                lay = word_layout(sc_text, 120, MID_WORD_CY); items = []
                for (w, x, y, s_) in lay:
                    j = min(wi, len(wts) - 1); ts = ff(wts[j]); ts = ts if not items_all or ts > items_all[-1] + 1e-6 else items_all[-1] + 1 / FPS; items_all.append(ts); text_ev(w, ts, max(ts, wts[j]), .3); items.append((w, x, y, s_, ts, col)); wi += 1
                scr.append(items)
            ta = ff(vend + .05); tb = ta + MID_TIMER
            def mid(tl, T0=T0, scr=scr, ta=ta, tb=tb):
                t = T0 + tl; im = base()
                if t < ta:
                    allw = [it for sc_ in scr for it in sc_]
                    cur = [it for it in allw if it[4] <= t + 1e-3] or allw[:1]
                    (w, x, y, s_, ts, col) = cur[-1]; f_ = qv.font(150); sz_ = 150
                    while f_.getlength(w) > 900: sz_ -= 6; f_ = qv.font(sz_)
                    pop_paste(im, tile(w, sz_, col), 540, MID_WORD_CY, t - ts, .16)
                else:
                    stack(im, [("(type in the comments.)", ta, 100, (255, 255, 255))], t, MID_TIP_CY)
                    im = emergency_clock(im, t, ta, tb)
                return im
        else:
            text, idx = q; wts, vend = voice(f"q{idx}", text, T0 + .02)
            ev.append((T0, S["qsw"], .25, f"swoosh q{idx}")); ev.append((T0, S["pop"], .45, f"pop sq{idx}", T0))
            lay = word_layout(text, 92, Q_TEXT_CY); wt = []
            for i, (w, x, y, s) in enumerate(lay):
                ts = ff(wts[0]); wt.append(ts)
                if i == 0: ev.append((wts[0], None, 0, f"word '{w}'")); ev.append((ts, None, 0, f"pop '{w}'", ts))
            sq = qv.square(idx, 560); ta = ff(vend + .05); tb = ta + Q_TIMER
            def qa(tl, T0=T0, ta=ta, tb=tb, sq=sq, lay=lay, wt=wt):
                t = T0 + tl; im = base()
                for (w, x, y, s), ts in zip(lay, wt): pop_paste(im, tile(w, s), x, y, t - ts, .16)
                sc = max(.05, qv.back((tl - .02) / .25, 2.0)); sz = int(sq.width * sc); s2 = sq.resize((sz, sz))
                im.paste(s2, (540 - sz // 2, Q_SQ_Y + sq.height // 2 - sz // 2), s2)
                return emergency_clock(im, t, ta, tb)
        segs.append((T0, tb - T0, mid if q == "MID" else qa))
        # ticks: 0.2 s; 0.1 s and louder in last 2 s; riser over the emergency window
        t = ta; k = 0
        while t < tb - 1e-6:
            rem = tb - t; hot = rem <= 2.0; e = 0 if rem > EMERG else 1 - rem / EMERG
            ev.append((ff(t) if hot is False and abs(t * FPS - round(t * FPS)) < 1e-6 else t, S["tock" if k % 2 else "tick"], 1.0 + .5 * e, f"tick {n}"))
            t += .1 if hot else rr.TICK_DT; k += 1
        rd = min(EMERG, tb - ta); ev.append((tb - rd, riser(rd), 1.0, f"riser {n}"))
        T = ff(tb)
    wts, vend = voice("end", END, T + .02); ev.append((T, S["pop"], .5, "pop end", T))
    t_end = ff(wts[0]); ev.append((wts[0], None, 0, "word 'How many did she get?'"))
    wts2, vend2 = voice("cb", "Comment below!", vend + .12); t_cb = ff(wts2[0]); text_ev("Comment below!", t_cb, wts2[0])
    T2 = ff(vend2 + .35)
    lay = word_layout(END, 120, 820)
    def end(tl, T0=T, lay=lay):
        t = T0 + tl; im = base()
        for (w, x, y, s) in lay: pop_paste(im, tile(w, s), x, y, t - t_end, .2)
        pop_paste(im, tile("Comment below!", 110, qv.PINK), 540, 1080, t - t_cb, .2)
        return im
    segs.append((T, T2 - T, end))
    wts3, vend3 = voice("cta", "Download Spill It for more questions!", T2 + .1)
    ev.append((T2, S["qsw"], .25, "swoosh cta"))
    ph = [("Download", 0, 120, (255, 255, 255)), ("Spill It", 1, 150, qv.PINK), ("for more questions!", 3, 100, (255, 255, 255))]
    items = []
    for fr, wi, sz, col in ph:
        j = min(wi, len(wts3) - 1); ts = ff(wts3[j]); text_ev(fr, ts, wts3[j]); items.append((fr, ts, sz, col))
    t_sub = ff(vend3 + .05)
    def cta(tl, T0=T2, items=items):
        t = T0 + tl; im = base()
        p = 1 - (1 - min(1, tl / .3)) ** 3; im.paste(cps, (540 - cps.width // 2, int(H - (H - 1060) * p)), cps)
        stack(im, items, t, 640)
        pop_paste(im, tile("Spill It - Couples Questions", 56, (255, 255, 255)), 540, 960, t - t_sub, .2)
        return im
    total = ff(vend3 + 1.2); segs.append((T2, total - T2, cta))
    return segs, ev, total

qv.build = build
import inspect
_src = inspect.getsource(qv.main).replace("lim = 10 ** (-1.5 / 20)", "lim = 10 ** (-1.6 / 20)")
exec(_src, qv.__dict__)
if __name__ == "__main__": qv.main()
