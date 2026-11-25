import '../dom.mjs';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { useRestProperties } from '@winglet/react-utils';

export default { pkg: '@winglet/react-utils', fn: 'useRestProperties', input: '2000 hook calls in one rerender', inputKind: 'plain', kind: 'render', setup: () => {
  let result, next, count = 1;
  const Component = ({ value }) => { for (let i = 0; i < 2000; i++) result = useRestProperties(value); return null; };
  const root = createRoot(document.body.appendChild(document.createElement('div')));
  flushSync(() => root.render(createElement(Component, { value: { id: 'row', disabled: false, count } })));
  return { before: () => { count = count === 1 ? 2 : 1; next = { id: 'row', disabled: false, count }; }, run: () => flushSync(() => root.render(createElement(Component, { value: next }))), check: () => result === next };
} };
