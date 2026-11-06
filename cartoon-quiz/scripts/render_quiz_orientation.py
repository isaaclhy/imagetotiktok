#!/usr/bin/env python3
"""More Quiz your girlfriend / Quiz your boyfriend videos in the original v5b layout.

Open questions. One real photograph illustrates the topic. The viewer supplies the answer.
Girlfriend sets ask about him. Boyfriend sets ask about her.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import quiz_video as qv
import recreate_reference as rr
import recreate_reference_v5b as v5b
from PIL import Image, ImageDraw

ROOT = os.environ.get("CARTOON_QUIZ_ROOT", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
WORK = os.environ["CARTOON_WORK"]
os.makedirs(WORK, exist_ok=True)
src = os.path.join(ROOT, "assets", "rr5b")
for name in ("img0.jpg", "music.mp3"):
    dest = os.path.join(WORK, name)
    if not os.path.exists(dest):
        os.symlink(os.path.join(src, name), dest)

qv.D = rr.D = v5b.D = WORK
qv.OUT = os.environ["CARTOON_OUT"]
os.makedirs(os.path.dirname(os.path.abspath(qv.OUT)), exist_ok=True)

bank = json.load(open(os.environ["CARTOON_BANK"]))
orientation = bank["orientation"]
questions = bank["questions"]
if len(questions) != 8:
    raise SystemExit(f"v5b format needs 8 questions, got {len(questions)}")

if orientation == "girlfriend":
    v5b.INTRO = [
        ("Quiz your girlfriend!", [("Quiz your", 0, 112), ("Girlfriend!", 2, 112)]),
        ("Boys, send this to her.", [(word, i, 150) for i, word in enumerate(["Boys!", "send", "this", "to", "her."])]),
        ("If she gets two wrong, she owes you a massage!", [(word, i, 150) for i, word in enumerate(["If", "she", "gets", "2", "wrong,", "she", "owes", "you", "a", "massage!"])]),
    ]
    v5b.MID_SAY = "Can you type his name with your eyes shut? Try it in the comments. I'll give you extra time for this one."
    v5b.MID_W = [
        ("Can you type his name with your eyes shut?", (255, 255, 255)),
        ("Try it in the comments.", qv.PINK),
        ("I'll give you extra time for this one.", (255, 255, 255)),
    ]
    v5b.END = "How many did she get?"
elif orientation == "boyfriend":
    v5b.INTRO = [
        ("Quiz your boyfriend!", [("Quiz your", 0, 112), ("Boyfriend!", 2, 112)]),
        ("Girls, send this to him.", [(word, i, 150) for i, word in enumerate(["Girls!", "send", "this", "to", "him."])]),
        ("If he gets two wrong, he owes you a massage!", [(word, i, 150) for i, word in enumerate(["If", "he", "gets", "2", "wrong,", "he", "owes", "you", "a", "massage!"])]),
    ]
    v5b.MID_SAY = "Can you type her name with your eyes shut? Try it in the comments. I'll give you extra time for this one."
    v5b.MID_W = [
        ("Can you type her name with your eyes shut?", (255, 255, 255)),
        ("Try it in the comments.", qv.PINK),
        ("I'll give you extra time for this one.", (255, 255, 255)),
    ]
    v5b.END = "How many did he get?"
else:
    raise SystemExit(f"Unknown orientation {orientation}")

photos = []
for question in questions:
    photo = os.path.join(ROOT, "assets", "choice-photos", f"{question['photo']}.jpg")
    if not os.path.exists(photo):
        raise SystemExit(f"Missing photograph {photo}")
    lowered = question["say"].lower()
    if orientation == "girlfriend" and " her " in f" {lowered} ":
        raise SystemExit(f"Girlfriend quiz question talks about her: {question['say']}")
    if orientation == "boyfriend" and " his " in f" {lowered} ":
        raise SystemExit(f"Boyfriend quiz question talks about him: {question['say']}")
    photos.append(photo)

qs = []
for index, question in enumerate(questions, start=1):
    if index == 3:
        qs.append("MID")
    qs.append((question["say"], index))
v5b.QS = qs


def square(i, size=640, radius=36):
    im = Image.open(photos[i - 1]).convert("RGB").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius, fill=255)
    out = Image.new("RGBA", (size + 16, size + 16), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    out.paste(shadow, (14, 14), mask)
    framed = im.convert("RGBA")
    framed.putalpha(mask)
    out.alpha_composite(framed, (0, 0))
    return out


# Original swoosh is tied to the word Boys. Girls gets the same swoosh.
_build = v5b.build

def build():
    segs, ev, total = _build()
    for event in ev:
        if len(event) >= 4 and event[3] == "swoosh Boys!":
            # Boyfriend intros say Girls instead. The pop time is unchanged.
            pass
    return segs, ev, total

# Patch the Boys swoosh check by wrapping text_ev path: edit the module function source condition.
import inspect
source = inspect.getsource(v5b.build)
source = source.replace('if fr == "Boys!":', 'if fr in ("Boys!", "Girls!"):')
namespace = v5b.__dict__
exec(compile(source, "recreate_reference_v5b.py", "exec"), namespace)
v5b.qv.square = square
v5b.qv.build = namespace["build"]
v5b.qv.main()
