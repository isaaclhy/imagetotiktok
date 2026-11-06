import assert from 'node:assert/strict';
import test from 'node:test';
import {
  QUIZ_GALLERY_GRID_CLASS,
  matchesQuizTemplate,
  quizPosterSrc,
} from './gallery';

test('template 8 and template 9 stay on their own saved videos', () => {
  assert.equal(matchesQuizTemplate('know-girlfriend', 8), true);
  assert.equal(matchesQuizTemplate('quiz-girlfriend', 8), false);
  assert.equal(matchesQuizTemplate('quiz-girlfriend', 9), true);
  assert.equal(matchesQuizTemplate('quiz-boyfriend', 9), true);
  assert.equal(matchesQuizTemplate('quiz-boyfriend', 8), false);
  assert.equal(matchesQuizTemplate('know-girlfriend', 9), false);
  assert.equal(matchesQuizTemplate('test-artifact', 8), false);
});

test('gallery cards use a poster image, not the mp4', () => {
  assert.equal(
    quizPosterSrc('how-well-tot-01.mp4', 8),
    '/video-templates/posters/how-well-tot-01.jpg'
  );
  assert.equal(quizPosterSrc('how-well-tot-01.mp4', 8).endsWith('.mp4'), false);
  assert.equal(quizPosterSrc('../secret.mp4', 8), '/video-templates/template-8-cover.jpg');
  assert.equal(quizPosterSrc('', 9), '/video-templates/template-9-cover.jpg');
});

test('desktop is five columns and the base layout is fewer', () => {
  assert.match(QUIZ_GALLERY_GRID_CLASS, /lg:grid-cols-5/);
  assert.match(QUIZ_GALLERY_GRID_CLASS, /grid-cols-2/);
  assert.doesNotMatch(QUIZ_GALLERY_GRID_CLASS, /grid-cols-5(?!\s|$)/);
  assert.equal(QUIZ_GALLERY_GRID_CLASS.startsWith('grid grid-cols-5'), false);
});
