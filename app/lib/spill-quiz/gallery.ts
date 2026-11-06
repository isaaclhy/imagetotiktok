import type { SpillQuizTemplateId } from '@/app/lib/spill-quiz/script';

/** Desktop shows five cards. Narrower screens step down so a row never overflows. */
export const QUIZ_GALLERY_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5';

export function quizTemplateCover(templateId: SpillQuizTemplateId): string {
  return templateId === 8
    ? '/video-templates/template-8-cover.jpg'
    : '/video-templates/template-9-cover.jpg';
}

export function matchesQuizTemplate(templateKey: string, templateId: SpillQuizTemplateId): boolean {
  if (templateId === 8) return templateKey === 'know-girlfriend';
  return templateKey === 'quiz-girlfriend' || templateKey === 'quiz-boyfriend';
}

/** Static poster only. The gallery must not point a card at the MP4. */
export function quizPosterSrc(filename: string, templateId: SpillQuizTemplateId): string {
  const base = filename.replace(/\.mp4$/i, '').replace(/[^A-Za-z0-9._-]+/g, '');
  if (!base || base.includes('..')) return quizTemplateCover(templateId);
  return `/video-templates/posters/${base}.jpg`;
}
