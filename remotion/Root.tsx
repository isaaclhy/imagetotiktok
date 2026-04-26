import React from 'react';
import { Composition } from 'remotion';
import { QuestionVideo, QuestionVideoProps } from './QuestionVideo';

const FPS = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuestionVideoComp = QuestionVideo as any;

export const RemotionRoot: React.FC = () => {
  const defaultProps: QuestionVideoProps = {
    title: 'Sample Title',
    questions: ['Question 1', 'Question 2', 'Question 3'],
    showQuestionsAsSlides: true,
    showBranding: true,
    minimalVideo: false,
  };

  /** Single hold for backdrop + text (Input select: video). */
  const MINIMAL_VIDEO_SECONDS = 18;

  function durationForProps(p: QuestionVideoProps): number {
    if (p.minimalVideo) {
      return FPS * MINIMAL_VIDEO_SECONDS;
    }
    const show = p.showQuestionsAsSlides !== false;
    const q = p.questions?.length ?? 0;
    return show ? FPS * 5 + (q + 1) * FPS * 10 : FPS * 5 + FPS * 10;
  }

  return (
    <Composition
      id="QuestionVideo"
      component={QuestionVideoComp}
      durationInFrames={durationForProps(defaultProps)}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps as any}
      calculateMetadata={({ props }) => {
        const p = props as unknown as QuestionVideoProps;
        return { durationInFrames: durationForProps(p) };
      }}
    />
  );
};
