import React from 'react';
import { Composition } from 'remotion';
import { QuestionVideo, QuestionVideoProps } from './QuestionVideo';

const FPS = 30;

const QuestionVideoComp = QuestionVideo as React.FC<Record<string, unknown>>;

export const RemotionRoot: React.FC = () => {
  const defaultProps: QuestionVideoProps = { title: 'Sample Title', questions: ['Question 1', 'Question 2', 'Question 3'] };

  return (
    <Composition
      id="QuestionVideo"
      component={QuestionVideoComp}
      durationInFrames={FPS * 5 + (defaultProps.questions.length + 1) * FPS * 10}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps as Record<string, unknown>}
      calculateMetadata={({ props }) => {
        const p = props as unknown as QuestionVideoProps;
        return { durationInFrames: FPS * 5 + (p.questions.length + 1) * FPS * 10 };
      }}
    />
  );
};
