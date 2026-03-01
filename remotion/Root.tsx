import React from 'react';
import { Composition } from 'remotion';
import { QuestionVideo, QuestionVideoProps } from './QuestionVideo';

const FPS = 30;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuestionVideoComp = QuestionVideo as any;

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
      defaultProps={defaultProps as any}
      calculateMetadata={({ props }) => {
        const p = props as unknown as QuestionVideoProps;
        return { durationInFrames: FPS * 5 + (p.questions.length + 1) * FPS * 10 };
      }}
    />
  );
};
