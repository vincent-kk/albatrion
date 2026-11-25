import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useRestProperties } from '@winglet/react-utils';

export default { pkg: '@winglet/react-utils', fn: 'useRestProperties', input: '2000 hook calls in one rerender', inputKind: 'plain', kind: 'render', setup: () => {
  let result, next;
  const initial = { id: 'row', disabled: false, count: 1 };
  const Component = ({ value }) => { for (let i = 0; i < 2000; i++) result = useRestProperties(value); return null; };
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Component, { value: initial })));
  return { before: () => { next = { id: 'row', disabled: false, count: 1 }; }, run: () => flushSync(() => root.render(createElement(Component, { value: next }))), check: () => result === initial };
} };
