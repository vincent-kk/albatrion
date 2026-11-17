import { it } from 'vitest';

import { checkSourceScene } from './fixtures/itemlessDeclarationsSource';

it.each([
  'common-items',
  'prefix-items',
  'legacy-tuple-additional',
  'union',
  'terminal',
  'recursive-items',
  'ref-items',
  'omit-empty-trailing',
  'oneOf-inactive-items',
  'allOf-items',
  'anyOf-items',
  'then-else-inactive-items',
  'controls-active-toggle',
  'controls-fields-diagnostic',
  'revive-latent',
  'empty-tuple',
  'boolean-items-true',
  'boolean-items-false',
  'additional-boolean-no-items',
  'fresh-blueprints',
  'pre-requested-empty-memo',
  'nested-ref-hosts',
  'batch-input-interpret',
  'derive-inject-target',
])('preserves candidate, memo and fallback history: %s', checkSourceScene);
