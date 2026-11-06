#!/usr/bin/env python3
"""Girlfriend quizzes ask about him. Boyfriend quizzes ask about her."""
import json
import unittest
from pathlib import Path

BATCH = Path(__file__).resolve().parents[1] / "sets" / "quiz-orientation-batch10.json"


class QuizOrientationTests(unittest.TestCase):
    def test_five_and_five_open_questions(self):
        data = json.loads(BATCH.read_text())
        videos = data["videos"]
        self.assertEqual(len(videos), 10)
        girl = [video for video in videos if video["orientation"] == "girlfriend"]
        boy = [video for video in videos if video["orientation"] == "boyfriend"]
        self.assertEqual(len(girl), 5)
        self.assertEqual(len(boy), 5)
        seen = set()
        for video in videos:
            self.assertEqual(len(video["questions"]), 8)
            for question in video["questions"]:
                say = question["say"]
                self.assertNotIn(say, seen)
                seen.add(say)
                lowered = say.lower()
                self.assertNotIn("would she choose", lowered)
                self.assertNotIn("would he choose", lowered)
                if video["orientation"] == "girlfriend":
                    self.assertRegex(lowered, r"\b(he|his)\b")
                    self.assertNotRegex(lowered, r"\b(she|her)\b")
                    self.assertTrue(video["title"].startswith("Quiz your girlfriend"))
                else:
                    self.assertRegex(lowered, r"\b(she|her)\b")
                    self.assertNotRegex(lowered, r"\b(he|his)\b")
                    self.assertTrue(video["title"].startswith("Quiz your boyfriend"))


if __name__ == "__main__":
    unittest.main()
