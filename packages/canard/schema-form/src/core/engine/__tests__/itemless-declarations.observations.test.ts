import { it } from 'vitest';

import { checkSourceScene } from './fixtures/itemlessDeclarationsSource';

it.each([
  'dense-root',
  'dense-nested',
  'empty',
  'sparse',
  'own-undefined',
  'nan-negative-zero',
  'wrong-kind-null',
  'wrong-kind-number',
  'wrong-kind-object',
  'frozen-caller',
  'caller-post-mutation',
  'props-defaultValue',
  'schema-default',
  'no-default',
  'explicit-undefined',
  'disable-auto-true',
  'disable-auto-false',
  'children-reference-bits',
  'extras-snapshot-alias',
  'first-listener-commit',
  'retained-container-contents',
])('preserves caller and retained observation history: %s', checkSourceScene);
