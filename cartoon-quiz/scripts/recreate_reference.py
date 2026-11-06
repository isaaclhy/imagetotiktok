#!/usr/bin/env python3
"""Recreation of the 21.questions.quiz 'Quiz your Girlfriend!' reference (62.9s), timed to the reference.
Reuses helpers from quiz_video.py. Clean consequence ('massage') replaces the sexual one. Original art only."""
import sys, os, json, math, numpy as np
sys.path.insert(0, "/workspace"); import quiz_video as qv
from PIL import Image, ImageDraw
qv.D = D = "/workspace/rr"; qv.OUT = OUT = "/workspace/videos/reference_recreation.mp4"
W, H, FPS, SR = qv.W, qv.H, qv.FPS, qv.SR
TOTAL = 62.9
ff = lambda t: math.floor(t * FPS + 1e-6) / FPS
# (ref voice start, spoken line, on-screen fragments)  -- times from faster-whisper on the reference
INTRO = [  # "2 wrong," drawn in red like the reference
        (0.04, "Quiz your girlfriend!", ["HOOK"]),
         (1.34, "Boys, send this to her.", ["Boys!", "send this", "to her."]),
         (2.82, "If she gets two wrong, she owes you a massage!", ["If she gets", "2 wrong,", "she owes you a", "massage!"])]
QS = [(6.24, "What is her favorite food?", 1), (10.78, "What is her favorite video game?", 2), "MID",
      (28.74, "What are her parents' names?", 3), (34.40, "Who is her best friend?", 4),
      (39.50, "What is her favorite pastime?", 5), (45.00, "When is her birthday?", 6),
      (49.82, "What is her favorite sports team?", 7), (56.28, "What is her pet's name?", 8)]
MID = (16.08, "Can you type her name with your eyes shut? Try it in the comments. I'll give you extra time for this one.",
       ["Can you", "type her", "name", "with your", "eyes shut?", "(type in the", "comments.)", "I'll give you", "extra time", "for this one."])
MID_TIMER = (21.60, 28.74)
END = (61.64, "How many did she get?")
TICK_DT = 0.2
# measured from the reference audio: first tick of each question timer
TICK_START = {1: 7.65, 2: 12.83, 3: 31.00, 4: 36.38, 5: 41.74, 6: 47.15, 7: 52.91, 8: 58.38}
TICK_OVERRUN = 0.25   # reference ticks run ~2 ticks past the next question onset

def line(key, text):
    """clip (starts PRE before first word) + per-word offsets inside clip"""
    wav = f"{D}/vo_{key}.wav"; js = wav + ".json"; tag = text + qv.VOICE + qv.RATE
    if not (os.path.exists(js) and json.load(open(js))["text"] == tag):
        json.dump({"text": tag, "words": qv.run_tts(text, wav)}, open(js, "w"))
    a = qv.load(wav, qv.VOICE_FX); words = json.load(open(js))["words"]
    s0 = max(0, qv.onset(a) - int(qv.PRE * SR)); s1 = min(len(a), qv.offset(a) + int(.04 * SR))
    c = a[s0:s1].copy(); f = int(.003 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
    offs = [max(qv.PRE, w[0] - s0 / SR) for w in words]
    want = len([x for x in text.split() if any(ch.isalnum() for ch in x)])
    if not offs:
        span = max(0.2, len(c) / SR - qv.PRE)
        offs = [qv.PRE + span * i / max(1, want) for i in range(max(1, want))]
    elif len(offs) < want and offs[0] > .15:
        offs = [qv.PRE] + offs   # whisper dropped the first word
    offs[0] = qv.PRE
    # refine each word onset with energy rise near whisper time
    E = qv.env(c, .003); pk = E.max()
    for i in range(1, len(offs)):
        i0, i1 = int((offs[i] - .08) * SR), int((offs[i] + .06) * SR); seg = E[max(0, i0):i1]
        if len(seg) > 10:
            j = int(np.argmin(seg)); k = np.argmax(seg[j:] > pk * 10 ** (-32 / 20))
            if seg[j:][k] > pk * 10 ** (-32 / 20): offs[i] = min(offs[i], (max(0, i0) + j + k) / SR)
    return c, offs

def nw(fr): return 4 if fr == "(type in the" else len([x for x in fr.replace("(", "").replace("'", "").split() if any(ch.isalnum() for ch in x)])

def tick_sfx(tock=False):
    """modelled on the reference tick: partials ~1.7/2.96/7.6/9.4 kHz, ~35 ms decay, small noise click"""
    t = np.arange(int(.06 * SR)) / SR; k = .92 if tock else 1.0
    n = np.diff(np.random.RandomState(3).randn(len(t)), prepend=0) * np.exp(-t * 1500)
    s = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * d) for f, a, d in [(1700, .8, 220), (2960, 1, 260), (7620, .55, 380), (9380, .45, 420)])
    s = (s + .35 * n); s[:24] *= np.linspace(0, 1, 24); s[-100:] *= np.linspace(1, 0, 100)
    return (.5 if tock else .6) * s / np.abs(s).max()

def build():
    segs, ev = [], []; S = dict(pop=qv.sfx_pop(), qsw=qv.sfx_qswoosh(), tick=tick_sfx(), tock=tick_sfx(True))
    cp = qv.couple(); base = qv.base
    def place(key, T, text, frags):
        c, offs = line(key, text); t0 = T - qv.PRE
        ev.append((t0, c, 1, f"vo {key}", T)); starts, wi = [], 0
        for fr in frags:
            ts = ff(t0 + offs[min(wi, len(offs) - 1)]); starts.append(ts); wi += 3 if fr == "HOOK" else nw(fr)
            ev.append((ts, S["pop"], .6, f"pop '{fr}'", ts)); ev.append((t0 + offs[min(wi - (3 if fr == 'HOOK' else nw(fr)), len(offs)-1)], None, 0, f"word '{fr}'"))
        return starts, t0 + len(c) / SR
    # intro: fragments each hold until next fragment
    frs, st = [], []
    for i, (T, txt, fr) in enumerate(INTRO):
        s, _ = place(f"i{i}", T, txt, fr); frs += fr; st += s
    def intro(tl):
        im = base(); dr = ImageDraw.Draw(im); k = max([i for i in range(len(st)) if st[i] <= tl + 1e-3] or [0]); f = frs[k]
        if f == "HOOK":
            p = min(1, tl / .3); p = 1 - (1 - p) ** 3
            qv.sticker_text(dr, (540, 760), "Quiz your", qv.font(110)); qv.sticker_text(dr, (540, 890), "Girlfriend!", qv.font(110))
            dr.text((540, 1020), "(level: medium)", font=qv.font(62, True, 700), fill=qv.PINK, anchor="mm")
            im.paste(cp, (130, int(H - (H - 1150) * p)), cp)
        else: qv.multiline(dr, 540, 900, f, 120, **({"fill": (225, 30, 45)} if f == "2 wrong," else {}))
        return im
    q_starts = [ff(q[0] - .02) if q != "MID" else ff(MID[0] - .02) for q in QS] + [ff(END[0] - .02)]
    segs.append((0, q_starts[0], intro))
    for n, q in enumerate(QS):
        T0, T1 = q_starts[n], q_starts[n + 1]
        if q == "MID":
            ms, vend = place("mid", MID[0], MID[1], MID[2]); tA, tB = MID_TIMER
            def mid(tl, T0=T0, ms=ms, tA=tA, tB=tB):
                t = T0 + tl; im = base(); dr = ImageDraw.Draw(im)
                if t < tA - .1:
                    k = max([i for i in range(len(ms)) if ms[i] <= t + 1e-3] or [0]); fr = MID[2][k]
                    if fr.startswith("("): qv.multiline(dr, 540, 900, fr, 110, fill=qv.PINK)
                    else: qv.multiline(dr, 540, 900, fr, 120)
                else:
                    qv.multiline(dr, 540, 900, "(type in the comments.)", 110)
                    qv.stopwatch(im, min(1, (t - tA) / (tB - tA)), 99)
                return im
            segs.append((T0, T1 - T0, mid)); ta, tb = tA, T1 + TICK_OVERRUN
        else:
            vT, text, idx = q; c, offs = line(f"q{idx}", text); ev.append((vT - qv.PRE, c, 1, f"vo q{idx}", vT)); ev.append((T0, S["qsw"], .25, f"swoosh q{idx}"))
            ev.append((T0, S["pop"], .5, f"pop q{idx}", T0))
            ta = TICK_START[idx]; tb = T1 + TICK_OVERRUN
            sq = qv.square(idx, 560); txt = Image.new("RGBA", (W, 400), (0, 0, 0, 0)); qv.multiline(ImageDraw.Draw(txt), 540, 230, text, 92, maxw=880)
            def qa(tl, T0=T0, ta=ta, tb=tb, sq=sq, txt=txt):
                t = T0 + tl; im = base(); p = qv.back(tl / .25)
                im.paste(txt, (0, int((1 - p) * 120)), txt)
                sc = max(.05, qv.back((tl - .04) / .3, 2.0)); sz = int(sq.width * sc); s2 = sq.resize((sz, sz))
                im.paste(s2, (540 - sz // 2, 520 + sq.height // 2 - sz // 2), s2)
                qv.stopwatch(im, min(1, max(0, (t - ta) / (tb - TICK_OVERRUN - ta))), 99)
                return im
            segs.append((T0, T1 - T0, qa))
        k = 0; t = ta
        while t < tb: ev.append((ff(t) if abs(t * FPS - round(t * FPS)) < 1e-6 else t, S["tock" if k % 2 else "tick"], 1.0, f"tick {n}")); t += TICK_DT; k += 1
    c, offs = line("end", END[1]); ev.append((END[0] - qv.PRE, c, 1, "vo end", END[0])); ev.append((q_starts[-1], S["pop"], .6, "pop end", q_starts[-1]))
    def end(tl):
        im = base(); dr = ImageDraw.Draw(im); qv.multiline(dr, 540, 900, "How many did she get?", 120); return im
    segs.append((q_starts[-1], TOTAL - q_starts[-1], end))
    return segs, ev, TOTAL

qv.build = build
if __name__ == "__main__": qv.main()
