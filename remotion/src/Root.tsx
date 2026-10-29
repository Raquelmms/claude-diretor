import React from 'react';
import {Composition} from 'remotion';
import {Diretor} from './Diretor';
import info from './dados/info.json';

export const Root: React.FC = () => (
  <Composition id="Diretor" component={Diretor} durationInFrames={info.frames} fps={info.fps} width={1080} height={1920} />
);
