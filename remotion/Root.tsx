import React from 'react';
import { Composition } from 'remotion';
import { QuestionVideo, QuestionVideoProps } from './QuestionVideo';

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  const defaultProps = { title: 'Sample Title', questions: ['Question 1', 'Question 2', 'Question 3'] };

  return (
    <Composition
      id="QuestionVideo"
      component={QuestionVideo}
      durationInFrames={FPS * 5 + (defaultProps.questions.length + 1) * FPS * 10}
      fps={FPS}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
      calculateMetadata={({ props }: { props: QuestionVideoProps }) => ({
        durationInFrames: FPS * 5 + (props.questions.length + 1) * FPS * 10,
      })}
    />
  );
};
