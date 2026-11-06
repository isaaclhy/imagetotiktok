#!/usr/bin/env python3
"""The shipped questions stay concise, and every option has a cached photograph."""
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BATCH = ROOT / "sets" / "girlfriend-this-or-that-batch10.json"
PHOTOS = ROOT / "assets" / "choice-photos"


def concise(option_a: str, option_b: str) -> str:
    left = option_a.strip()
    right = option_b.strip()
    return f"{left[:1].upper()}{left[1:]} or {right}?"


def slug(label: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")


class ConcisePhotoBatchTests(unittest.TestCase):
    def test_every_question_is_a_short_binary_line(self):
        data = json.loads(BATCH.read_text())
        self.assertEqual(len(data["videos"]), 10)
        seen = set()
        for video in data["videos"]:
            self.assertEqual(len(video["questions"]), 6)
            for question in video["questions"]:
                say = question["spokenQuestion"]
                self.assertEqual(say, concise(question["optionA"], question["optionB"]))
                lowered = say.lower()
                self.assertNotIn("would she", lowered)
                self.assertNotIn("would he", lowered)
                self.assertNotIn("choose", lowered)
                self.assertTrue(say.endswith("?"))
                self.assertIn(" or ", say)
                seen.add(question["id"])
        self.assertEqual(len(seen), 60)

    def test_every_option_has_a_real_photo_and_credit(self):
        data = json.loads(BATCH.read_text())
        manifest = json.loads((PHOTOS / "manifest.json").read_text())["items"]
        options = set()
        for video in data["videos"]:
            for question in video["questions"]:
                options.add(question["optionA"])
                options.add(question["optionB"])
        self.assertGreaterEqual(len(options), 100)
        for option in options:
            self.assertIn(option, manifest)
            item = manifest[option]
            photo = PHOTOS / item["file"]
            self.assertTrue(photo.exists(), option)
            self.assertGreater(photo.stat().st_size, 5000, option)
            self.assertTrue(item.get("page", "").startswith("https://commons.wikimedia.org/"))
            self.assertTrue(item.get("license"))
            self.assertEqual(item["file"], f"{slug(option)}.jpg")


if __name__ == "__main__":
    unittest.main()
