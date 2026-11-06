#!/usr/bin/env python3
"""Render one cartoon quiz in the original v15 / v5b design.

Uses the supplied renderer, illustrations, Playfair stickers, and Kokoro af_heart.
Pre-baked vo_*.wav files are reused when the line text still matches.
A new question set regenerates only the lines whose text changed.
"""
import datetime
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.environ["CARTOON_QUIZ_ROOT"] = ROOT
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

template = os.environ.get("CARTOON_TEMPLATE", "8")
day = os.environ.get("CARTOON_DAY") or datetime.date.today().isoformat()
out = os.environ.get("CARTOON_OUT")
if not out:
    raise SystemExit("CARTOON_OUT is required")
os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
os.environ["CARTOON_OUT"] = out

# Same illustration index as the delivered video. Wording rotates; the picture stays on topic.
HER_SETS = [
    None,
    [
        ("What does she always order to eat?", 1),
        ("What movie does she make you rewatch?", 2),
        "MID",
        ("What does she drink every time?", 3),
        ("What do her mom and dad go by?", 4),
        ("Who does she call her best friend?", 5),
        ("What day is her birthday?", 6),
        ("What color is all over her closet?", 7),
        ("What is her pet called?", 8),
    ],
    [
        ("What food does she never get tired of?", 1),
        ("What is the movie she quotes?", 2),
        "MID",
        ("What is her usual drink order?", 3),
        ("What are her parents called?", 4),
        ("Who is the friend she tells everything?", 5),
        ("When is her birthday again?", 6),
        ("What is her favorite color to wear?", 7),
        ("What did she name her pet?", 8),
    ],
]
HIM_SETS = [
    None,
    [
        ("What food does he always want?", 1),
        ("What video game does he play the most?", 2),
        "MID",
        ("What do his parents go by?", 3),
        ("Who is the friend he texts first?", 4),
        ("What does he do for fun?", 5),
        ("What day is his birthday?", 6),
        ("What sports team does he root for?", 7),
        ("What is his pet called?", 8),
    ],
    [
        ("What is his go-to meal?", 1),
        ("What game is always on his screen?", 2),
        "MID",
        ("What are his mom and dad called?", 3),
        ("Who is his closest friend?", 4),
        ("What is his favorite way to spend a day off?", 5),
        ("When is his birthday?", 6),
        ("Which team does he never shut up about?", 7),
        ("What did he name his pet?", 8),
    ],
]

if template == "9":
    import recreate_reference_v5b as mod
    sets = HIM_SETS
else:
    import recreate_reference_v15 as mod
    sets = HER_SETS

variant = int(day.replace("-", "")) % len(sets)
chosen = sets[variant]
if chosen is not None:
    mod.QS = chosen
print(f"CARTOON_VARIANT={variant}", flush=True)
mod.qv.main()
print(f"CARTOON_MP4={mod.qv.OUT}", flush=True)
