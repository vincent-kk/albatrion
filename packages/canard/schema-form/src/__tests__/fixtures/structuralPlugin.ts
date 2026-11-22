import { createElement } from 'react';

export const LabelRenderer = () =>
  createElement('label', null, 'Registered label');

export const validator = {
  compile: () => () => [{ dataPath: '/value', keyword: 'registered' }],
  compileGuard: () => () => true,
};
