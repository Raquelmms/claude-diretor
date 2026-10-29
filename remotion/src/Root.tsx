import React from 'react';
import {Composition} from 'remotion';
import {Director} from './Director';
import info from './data/info.json';

export const Root: React.FC = () => (
  <Composition id="Director" component={Director} durationInFrames={info.frames} fps={info.fps} width={1080} height={1920} />
);
