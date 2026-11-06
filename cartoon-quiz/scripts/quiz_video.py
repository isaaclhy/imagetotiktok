#!/usr/bin/env python3
"""Quiz your Boyfriend! TikTok video for Spill It - Couples Questions.
Edit QUESTIONS / INTRO / MID below and re-run: python3 quiz_video.py"""
import asyncio, json, os, subprocess, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

D = "/workspace/qv"; OUT = "/workspace/videos/quiz_your_partner.mp4"
W, H, FPS, SR = 1080, 1920, 30, 48000
LEAD = 0.02   # text/pop lead over first spoken word (s)
VOICE_FX = 'highpass=f=100,equalizer=f=4000:t=q:w=1.2:g=3.5,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80:makeup=1'
fq = lambda t: math.ceil(t * FPS - 1e-6) / FPS   # snap up to frame
BG = (198, 219, 240); PINK = (255, 64, 160)
VOICE, SPEED = "af_heart", 1.05; RATE, PITCH = f"kokoro{SPEED}", ""
_ROOT = os.environ.get("CARTOON_QUIZ_ROOT", "/workspace")
SERIF = os.path.join(_ROOT, "assets/fonts/PlayfairDisplay-VariableFont_wght.ttf")
SERIF_I = os.path.join(_ROOT, "assets/fonts/PlayfairDisplay-Italic-VariableFont_wght.ttf")

HOOK_TITLE, HOOK_SUB = "Quiz your Boyfriend!", "(level: medium)"
INTRO = ["Girls!", "HOOK", "send", "this", "to", "him!", "if", "he", "gets", "2", "wrong,", "he", "owes", "you", "a", "date", "night!"]
INTRO_SAY = "Girls! Quiz your boyfriend! Send this to him! If he gets two wrong, he owes you a date night!"
HOOK_WORDS = 3
MID_SAY = "Can you type his name with your eyes shut? Try it in the comments. I'll give you extra time for this one."
MID = ["Can you", "type his name", "with your", "eyes shut?", "Try it", "in the", "comments.",
       "I'll give you", "extra time", "for this one."]
QUESTIONS = [("What is her favorite food?", 1), ("What is her favorite show?", 2),
             ("What are her parents' names?", 3), ("Who is her best friend?", 4),
             ("What is her favorite pastime?", 5), ("When is her birthday?", 6),
             ("What is her dream vacation?", 7), ("What is her pet's name?", 8)]
Q_LEN, MID_TIMER = 5.0, 8.0
BADGE_T = 0.4
CTA_AFTER = 4

def font(sz, italic=False, wght=900):
    f = ImageFont.truetype(SERIF_I if italic else SERIF, sz)
    try: f.set_variation_by_axes([wght])
    except Exception: pass
    return f

# ---------------- TTS ----------------
KOKORO = None; _WH = None
def _tts(text, path):
    """Kokoro-82M (onnx) single natural take -> wav; word times via faster-whisper alignment."""
    global KOKORO, _WH
    import soundfile as sf
    from kokoro_onnx import Kokoro
    if KOKORO is None:
        onnx = os.environ.get("KOKORO_ONNX", os.path.join(_ROOT, "models/kokoro-v1.0.onnx"))
        voices = os.environ.get("KOKORO_VOICES", os.path.join(_ROOT, "models/voices-v1.0.bin"))
        KOKORO = Kokoro(onnx, voices)
    a, sr = KOKORO.create(text, voice=VOICE, speed=SPEED, lang="en-us"); sf.write(path, a, sr)
    from faster_whisper import WhisperModel
    if _WH is None: _WH = WhisperModel("small.en", device="cpu", compute_type="int8")
    import librosa; a16 = librosa.resample(np.asarray(a, np.float32), orig_sr=sr, target_sr=16000)
    segs, _ = _WH.transcribe(a16, word_timestamps=True, initial_prompt=text, language="en")
    ww = [(w.start, w.word.strip()) for sg in segs for w in sg.words]
    want = [x for x in text.replace("'", "").split() if any(c.isalnum() for c in x)]
    if len(ww) != len(want): print("WARN whisper words", len(ww), "!=", len(want), ww)
    return [list(x) for x in ww]

def run_tts(text, path): return _tts(text, path)
def tts(key, text):
    mp3 = f"{D}/vo_{key}.wav"; js = mp3 + ".json"
    if not (os.path.exists(js) and json.load(open(js))["text"] == text + VOICE + RATE + PITCH):
        w = run_tts(text, mp3); json.dump({"text": text + VOICE + RATE + PITCH, "words": w}, open(js, "w"))
    a = load(mp3, VOICE_FX); words = json.load(open(js))["words"]
    on, off = onset(a), offset(a)
    s0 = max(0, on - int(PRE * SR)); s1 = min(len(a), off + int(0.04 * SR))
    c = a[s0:s1].copy(); f = int(0.003 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
    return c, words   # clip's first word onset is at exactly PRE seconds

PRE = 0.005
def env(a, win=0.005):
    k = int(win * SR); return np.sqrt(np.convolve(a ** 2, np.ones(k) / k, "same"))
def onset(a, rel_db=-30):
    e = env(a); th = e.max() * 10 ** (rel_db / 20); return int(np.argmax(e > th))
def offset(a, rel_db=-40):
    e = env(a); th = e.max() * 10 ** (rel_db / 20); return len(a) - int(np.argmax(e[::-1] > th))

def load(path, af=None):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()

def frag_times(frags, words):
    """start time of each fragment = timestamp of its first word"""
    out, wi = [], 0
    for fr in frags:
        out.append(words[min(wi, len(words) - 1)][0])
        wi += len([x for x in fr.replace("'", "").split() if any(c.isalnum() for c in x)])
    return out

# ---------------- SFX ----------------
t_ = lambda d: np.arange(int(d * SR)) / SR
def sfx_pop():
    t = t_(0.06); f = 1500 * np.exp(-t * 70) + 380
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 75)
    s[:int(.001 * SR)] *= np.linspace(0, 1, int(.001 * SR)); return 0.7 * fade(s)
def fade(s, d=0.004):
    n = int(d * SR); s[-n:] *= np.linspace(1, 0, n); return s
def sfx_tick():
    t = t_(0.03); n = np.diff(np.random.RandomState(1).randn(len(t)), prepend=0)
    s = (0.25 * n * np.exp(-t * 900) + np.sin(2 * np.pi * 3600 * t) + 0.5 * np.sin(2 * np.pi * 1800 * t)) * np.exp(-t * 260)
    return 0.45 * fade(s)
def sfx_ding():
    t = t_(1.6); f0 = 2350
    s = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, a, d in
            [(1, 1, 2.5), (2.32, .5, 4), (4.25, .3, 6), (6.8, .15, 9)])
    s[:int(.004 * SR)] *= np.linspace(0, 1, int(.004 * SR))
    return 0.4 * fade(s, 0.05)
def sfx_swoosh():
    t = t_(0.5); n = np.random.RandomState(2).randn(len(t))
    out = np.zeros_like(n); y = 0; fc = 300 + 4000 * np.sin(np.pi * t / .5) ** 2
    for i in range(len(n)):  # sweeping one-pole lowpass
        a = 1 - math.exp(-2 * math.pi * fc[i] / SR); y += a * (n[i] - y); out[i] = y
    return 0.9 * out * np.sin(np.pi * t / .5) ** 2

def sfx_riser():
    d = .45; t = t_(d); n = np.random.RandomState(7).randn(len(t))
    out = np.zeros_like(n); y = 0; fc = 400 + 6000 * (t / d) ** 2
    for i in range(len(n)):
        a = 1 - math.exp(-2 * math.pi * fc[i] / SR); y += a * (n[i] - y); out[i] = y
    out = out * (t / d) ** 2; return 0.7 * out / np.max(np.abs(out))
def sfx_sparkle():
    t = t_(0.5); s = np.zeros_like(t); rs = np.random.RandomState(9)
    for k in range(6):
        t0 = k * .05; f = 3000 + rs.rand() * 3000; m = t >= t0; tt = t[m] - t0
        s[m] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 30)
    return 0.25 * fade(s / np.max(np.abs(s)), .02)
# ---------------- drawing ----------------
def sfx_qswoosh():
    d = .22; t = t_(d); n = np.random.RandomState(5).randn(len(t))
    out = np.zeros_like(n); y = 0; fc = 800 + 7000 * (t / d) ** 1.5
    for i in range(len(n)):
        a = 1 - math.exp(-2 * math.pi * fc[i] / SR); y += a * (n[i] - y); out[i] = y
    e = np.minimum(1, t / .012) * np.exp(-((t - .06) / .09) ** 2 * .7) * np.minimum(1, (d - t) / .02)
    out = out * e; return 0.9 * out / np.max(np.abs(out))

def back(p, s=1.6):  # easeOutBack with overshoot
    p = min(1, max(0, p)); p -= 1; return 1 + (s + 1) * p ** 3 + s * p ** 2

def sticker_text(dr, xy, text, f, fill=(255, 255, 255), shadow=9, stroke=3, anchor="mm"):
    x, y = xy
    dr.text((x + shadow, y + shadow), text, font=f, fill=(0, 0, 0), anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))
    dr.text((x, y), text, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0))

def wrap(text, f, maxw):
    lines, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if f.getlength(t) <= maxw or not cur: cur = t
        else: lines.append(cur); cur = w
    return lines + [cur]

def multiline(dr, cx, cy, text, size, maxw=900, **kw):
    f = font(size)
    while True:
        lines = wrap(text, f, maxw)
        if all(f.getlength(l) <= maxw for l in lines): break
        size -= 6; f = font(size)
    lh = size * 1.18; y0 = cy - lh * (len(lines) - 1) / 2
    for i, l in enumerate(lines): sticker_text(dr, (cx, y0 + i * lh), l, f, **kw)

def square(i, size=640, radius=36):
    im = Image.open(f"{D}/img{i}.jpg").convert("RGB").resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size, size), radius, fill=255)
    out = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
    sh = Image.new("RGBA", (size, size), (0, 0, 0, 255)); out.paste(sh, (14, 14), m)
    im = im.convert("RGBA"); im.putalpha(m); out.alpha_composite(im, (0, 0))
    return out

def couple():
    im = Image.open(f"{D}/img0.jpg").convert("RGB")
    mask = Image.new("L", im.size, 0)
    tmp = im.copy()
    for c in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(tmp, c, (255, 0, 255), thresh=40)
    a = np.array(tmp); bgm = (a[..., 0] == 255) & (a[..., 1] == 0) & (a[..., 2] == 255)
    rgba = np.dstack([np.array(im), np.where(bgm, 0, 255).astype(np.uint8)])
    return Image.fromarray(rgba, "RGBA").resize((820, 820), Image.LANCZOS)

SW_C, SW_R = (540, 1340), 92
def stopwatch(img, frac, rem=99.0):
    dr = ImageDraw.Draw(img); cx, cy = SW_C; r = SW_R
    hot = rem < 2.0
    if hot:  # pulsing ring each half second in the last 2 s
        ph = (2.0 - rem) % .5 / .5; rr = int(r + 18 + 50 * ph); w = max(2, int(14 * (1 - ph)))
        dr.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=PINK, width=w)
        r = int(r * (1 + .07 * (1 - ph)))
    dr.rounded_rectangle((cx - 22, cy - r - 46, cx + 22, cy - r - 20), 6, fill=(0, 0, 0))   # crown
    dr.rectangle((cx - 9, cy - r - 22, cx + 9, cy - r + 4), fill=(0, 0, 0))
    for s in (-1, 1):  # side buttons
        ang = math.radians(-90 + s * 45); bx, by = cx + (r + 14) * math.cos(ang), cy + (r + 14) * math.sin(ang)
        dr.ellipse((bx - 13, by - 13, bx + 13, by + 13), fill=(0, 0, 0))
    dr.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(255, 255, 255), outline=(0, 0, 0), width=12)
    if frac > 0:
        ir = r - 20
        if frac >= 1: dr.ellipse((cx - ir, cy - ir, cx + ir, cy + ir), fill=(0, 0, 0))
        else: dr.pieslice((cx - ir, cy - ir, cx + ir, cy + ir), -90, -90 + 360 * frac, fill=PINK if hot else (0, 0, 0))

def base(): return Image.new("RGB", (W, H), BG)

# ---------------- build timeline ----------------
def build():
    segs = []  # (start, dur, render(tlocal)->Image)
    events = []  # (time, buffer, gain, label)
    S = {k: f() for k, f in dict(pop=sfx_pop, tick=sfx_tick, ding=sfx_ding, swoosh=sfx_swoosh, qswoosh=sfx_qswoosh, riser=sfx_riser, sparkle=sfx_sparkle).items()}
    T = 0.0
    cp = couple()
    def take_seq(key, say, frags, T, nwords):
        """ONE continuous TTS take; fragments placed at word-boundary times, refined by onset detection."""
        mp3 = f"{D}/vo_{key}_take.wav"; js = mp3 + ".json"
        if not (os.path.exists(js) and json.load(open(js))["text"] == say + VOICE + RATE + PITCH):
            w = run_tts(say, mp3); json.dump({"text": say + VOICE + RATE + PITCH, "words": w}, open(js, "w"))
        a = load(mp3, VOICE_FX); words = json.load(open(js))["words"]
        on, off = onset(a), offset(a); s0 = max(0, on - int(PRE * SR))
        c = a[s0:min(len(a), off + int(0.04 * SR))].copy(); f = int(0.003 * SR); c[:f] *= np.linspace(0, 1, f); c[-f:] *= np.linspace(1, 0, f)
        E = env(c, 0.003); pk = E.max()
        starts, wi = [], 0
        for fr in frags:
            n = nwords if fr == "HOOK" else len([x for x in fr.replace("'", "").split() if any(ch.isalnum() for ch in x)])
            tb = words[wi][0] - s0 / SR
            # refine: first sample within [-60ms,+80ms] of boundary exceeding -32 dB rel peak after a quieter point
            i0, i1 = max(0, int((tb - .12) * SR), int(((starts[-1] if starts else 0) + .06) * SR)), int((tb + .08) * SR); seg = E[i0:i1]
            j = int(np.argmin(seg[:int(.15 * SR)])) if len(seg) else 0
            tm = (i0 + j + int(np.argmax(seg[j:] > pk * 10 ** (-32 / 20)))) / SR if len(seg) > j + 1 else tb
            tm = tm if (abs(tm - tb) < .12 and (not starts or tm > starts[-1] + .06)) else tb; starts.append(max(PRE, tm)); wi += n
        t0 = 0.1; ft = [t0 + x - PRE for x in starts]
        ft = [math.floor((T + x) * FPS + 1e-6) / FPS - T for x in ft]   # text on frame <= onset, lead <= 1 frame
        events.append((T + t0 - PRE, c, 1, f"vo {key} take", T + t0))
        for fr, x, sp in zip(frags, ft, starts): events.append((T + x, S["pop"], 0.6, f"pop '{fr}'", T + x)); events.append((T + t0 - PRE + sp, None, 0, f"word '{fr}'", T + t0 - PRE + sp))
        dur = fq(t0 + len(c) / SR + 0.12)
        def r(tl, frags=frags, ft=ft):
            im = base(); dr = ImageDraw.Draw(im)
            k = max(i for i in range(len(ft)) if ft[i] <= tl + 1e-3) if tl >= ft[0] - 1e-3 else -1
            if k >= 0 and frags[k] == "HOOK":
                tt = tl - ft[k]; p = min(1, tt / 0.35); p = 1 - (1 - p) ** 3; y = int(H - (H - 640) * p)
                sticker_text(dr, (540, 330), HOOK_TITLE, font(100)); dr.text((540, 450), HOOK_SUB, font=font(66, True, 700), fill=PINK, anchor="mm")
                im.paste(cp, (130, y), cp)
            elif k >= 0: multiline(dr, 540, 900, frags[k], 150 if frags[k] == "Girls!" else 210)
            return im
        segs.append((T, dur, r)); return T + dur
    events.append((0.0, S["swoosh"], 0.6, "swoosh"))
    T = take_seq("intro", INTRO_SAY, INTRO, T, HOOK_WORDS)
    def timer_seg(T, dur, draw_static, label, anim=None):
        st = draw_static()
        def r(tl, st=st, dur=dur, anim=anim):
            im = anim(tl) if anim else st.copy(); stopwatch(im, min(1, tl / dur), dur - tl); return im
        segs.append((T, dur, r))
        tk = [k for k in range(int(round(dur)) - 2)] + list(np.arange(dur - 2, dur - .2, .5))
        for k in tk: events.append((T + k, S["tick"], 0.5, f"tick {label}"))
        events.append((T + dur - 14 / FPS, S["riser"], .22, f"riser {label}")); events.append((T + dur - 1 / FPS, S["sparkle"], .35, f"sparkle {label}"))
        events.append((T + dur - 1 / FPS, S["ding"], 0.6, f"ding {label}"))
        return T + dur
    def do_cta(T):
        vo, _ = tts("cta", "Download Spill It for more questions!")
        def cta(tl):
            im = base(); dr = ImageDraw.Draw(im)
            multiline(dr, 540, 640, "Spill It", 170)
            multiline(dr, 540, 820, "Couples Questions", 100)
            cp2 = cp.resize((420, 420)); im.paste(cp2, (330, 920), cp2)
            f = font(64); tw = f.getlength("Download for more questions!")
            x0, y0, x1, y1 = 540 - tw / 2 - 50, 1370, 540 + tw / 2 + 50, 1490
            dr.rounded_rectangle((x0 + 10, y0 + 10, x1 + 10, y1 + 10), 60, fill=(0, 0, 0))
            dr.rounded_rectangle((x0, y0, x1, y1), 60, fill=PINK, outline=(0, 0, 0), width=6)
            dr.text((540, 1428), "Download for more questions!", font=f, fill=(255, 255, 255), anchor="mm")
            return im
        cd = fq(max(2.5, len(vo) / SR + 0.5))
        segs.append((T, cd, cta)); events.extend([(T, S["pop"], .6, "pop cta"), (T + 0.1 + LEAD - PRE, vo, 1, "vo cta", T + .1 + LEAD)]); T += cd
        return T
    for q in QUESTIONS:
        if q == "MID":
            T = take_seq("mid", MID_SAY, MID, T, 0)
            def st():
                im = base(); dr = ImageDraw.Draw(im)
                dr.text((540, 330), "(type in the comments.)", font=font(64, True, 700), fill=PINK, anchor="mm")
                return im
            sw = SW_C
            T = timer_seg(T, MID_TIMER, st, "mid"); continue
        text, idx = q
        vo, _ = tts(f"q{idx}", text)
        bg0 = base(); sq = square(idx)
        def st(text=text): return bg0
        txt = Image.new("RGBA", (W, 520), (0, 0, 0, 0)); multiline(ImageDraw.Draw(txt), 540, 330, text, 96, maxw=900)
        bdg = Image.new("RGBA", (420, 110), (0, 0, 0, 0)); bd = ImageDraw.Draw(bdg)
        bd.rounded_rectangle((8, 8, 412, 102), 50, fill=(0, 0, 0)); bd.rounded_rectangle((0, 0, 404, 94), 50, fill=PINK, outline=(0, 0, 0), width=5)
        bd.text((202, 47), f"Question {idx}/{len(QUESTIONS)}", font=font(54), fill=(255, 255, 255), anchor="mm")
        def anim(tl, txt=txt, sq=sq, bdg=bdg):
            im = bg0.copy()
            p = back(tl / .25); dy = int((1 - p) * 140); a = min(1, tl / .1)
            t2 = txt if a >= 1 else Image.fromarray((np.array(txt) * [1, 1, 1, a]).astype(np.uint8))
            im.paste(t2, (0, dy), t2)
            sc = max(.05, back((tl - .04) / .3, 2.0))
            if tl > .5: sc *= 1 + .018 * math.sin((tl - .5) * 2 * math.pi / 1.6)   # gentle breathing zoom
            if Q_LEN - tl < .3: sc *= 1 + .06 * math.sin((Q_LEN - tl) / .3 * math.pi)  # bump into the ding
            sz = max(8, int(sq.width * sc))
            s2 = sq.resize((sz, sz), Image.LANCZOS); cx, cy = W // 2, 470 + sq.height // 2 + int((1 - min(1, sc)) * 120)
            im.paste(s2, (cx - sz // 2, cy - sz // 2), s2)
            if tl >= BADGE_T:  # badge pops in staggered after the image
                bs = back((tl - BADGE_T) / .22, 2.2); w = max(4, int(bdg.width * bs)); h = max(4, int(bdg.height * bs))
                b2 = bdg.resize((w, h), Image.LANCZOS); im.paste(b2, (W // 2 - w // 2, 1525 - h // 2), b2)
            return im
        events.append((T + BADGE_T, S["pop"], .35, f"pop badge q{idx}"))
        events.append((T + 0.1 + LEAD - PRE, vo, 1, f"vo q{idx}", T + 0.1 + LEAD)); events.append((T, S["qswoosh"], .32, f"swoosh q{idx}", T))
        T = timer_seg(T, Q_LEN, st, f"q{idx}", anim)
        if idx == CTA_AFTER: T = do_cta(T)
    # end card
    vo, _ = tts("end", "How many did he get? Let me know in the comments!")
    def end(tl):
        im = base(); dr = ImageDraw.Draw(im)
        multiline(dr, 540, 820, "How many did he get?", 140, maxw=880)
        dr.text((540, 1120), "(Let me know in the comments!)", font=font(60, True, 700), fill=PINK, anchor="mm")
        return im
    ed = fq(max(3.0, len(vo) / SR + 0.5))
    segs.append((T, ed, end)); events += [(T, S["pop"], .6, "pop end"), (T + 0.1 + LEAD - PRE, vo, 1, "vo end", T + .1 + LEAD)]; T += ed
    return segs, events, T

def main():
    segs, events, total = build()
    nf = int(round(total * FPS)); total = nf / FPS
    # audio (all event times are frame multiples -> exact sample indices, 1600 samples/frame @48k)
    N = int(round(total * SR)); voice = np.zeros(N + SR, np.float32); fx = np.zeros_like(voice)
    for ev in events:
        t0, buf, g, lab = ev[:4]
        if buf is None: continue
        tgt = voice if lab.startswith("vo") else fx
        i = int(round(t0 * SR)); n = min(len(buf), len(tgt) - i); tgt[i:i + n] += g * buf[:n]
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    voice *= 10 ** ((-16 - meter.integrated_loudness(voice[:N].astype(np.float64))) / 20)
    mus = load(f"{D}/music.mp3", "highpass=f=60,equalizer=f=3500:t=q:w=1.5:g=-3")
    mus = np.tile(mus, int(len(voice) / len(mus)) + 1)[:len(voice)]
    mus *= 10 ** ((-22 - meter.integrated_loudness(mus[:N].astype(np.float64))) / 20)
    # sidechain duck: -7 dB under voice, 20 ms attack / 300 ms release
    e = (env(voice, 0.02) > 10 ** (-45 / 20)).astype(np.float32); g = np.empty_like(e); y = 1.0
    aa, ar = math.exp(-1 / (0.02 * SR)), math.exp(-1 / (0.3 * SR)); tg = np.where(e > 0, 10 ** (-7 / 20), 1.0)
    from scipy.signal import lfilter
    # attack/release via two smoothing passes on target gain
    down = lfilter([1 - aa], [1, -aa], tg - 1) + 1; up = lfilter([1 - ar], [1, -ar], tg - 1) + 1
    g = np.minimum(down, up).astype(np.float32)
    bed = (fx + mus * g)[:N]; v = voice[:N].copy(); lim = 10 ** (-1.5 / 20)
    # offline look-ahead peak limiter on the voice (zero latency: gain curve applied in place)
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    vg = np.minimum(1.0, 10 ** (-3 / 20) / (np.abs(v) + 1e-9))
    vg = uniform_filter1d(minimum_filter1d(vg, int(0.006 * SR)), int(0.004 * SR)); v *= np.minimum(vg, 1.0)
    bg = np.minimum(1.0, 10 ** (-6 / 20) / (np.abs(bed) + 1e-9))
    bed = bed * np.minimum(uniform_filter1d(minimum_filter1d(bg, int(0.006 * SR)), int(0.004 * SR)), 1.0)
    print("voice peak dBFS %.2f" % (20 * np.log10(np.abs(v).max())))
    k = 1.0
    while np.max(np.abs(v + k * bed)) > lim and k > 0.3: k *= 0.97   # trim SFX/music bed first, keep voice at -16 LUFS
    mix = v + k * bed; pk = np.max(np.abs(mix)); mix *= min(1.0, lim / pk); print("bed gain %.2f dB, final scale %.2f dB" % (20 * np.log10(k), 20 * np.log10(min(1, lim / pk))))
    mix.astype(np.float32).tofile(f"{D}/mix.f32")
    (voice[:N] * mix.max() / max(1e-9, pk)).astype(np.float32).tofile(f"{D}/voice.f32")
    with open(f"{D}/events.txt", "w") as f:
        for ev in sorted(events, key=lambda e: e[0]):
            f.write(f"{(ev[4] if len(ev) > 4 else ev[0]):8.4f}  {ev[3]}\n")
    # video
    p = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", f"{D}/mix.f32",
                          "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                          "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", "-shortest", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    for fi in range(nf):
        t = fi / FPS
        s = next(s for s in reversed(segs) if s[0] <= t + 1e-3)
        p.stdin.write(s[2](t - s[0]).tobytes())
    p.stdin.close(); p.wait()
    print("done", OUT, f"{total:.2f}s")

if __name__ == "__main__": main()
