import { expect, it } from 'vitest';

import { bindPointerTemplate } from '../bindPointerTemplate';
import { normalizeValidationDataPath } from '../normalizeValidationDataPath';
import { parsePointer } from '../parsePointer';
import { parseStandardPointer } from '../parseStandardPointer';
import { readFormattedPointerSegment } from '../readPointerSegment';

it('binds only complete wildcard segments and keeps the existing encoded suffix', () => {
  expect(bindPointerTemplate('/rows/*/value', '/rows/2/value')).toBe(
    '/rows/2/value',
  );
  expect(bindPointerTemplate('/rows/*/a~1b/%2A', '/rows/3/a~1b/%2A')).toBe(
    '/rows/3/a~1b/%2A',
  );
});

it('keeps literal reserved names and names containing a star unchanged', () => {
  expect(bindPointerTemplate('/rows/%2A/value', '/rows/2/value')).toBe(
    '/rows/%2A/value',
  );
  expect(bindPointerTemplate('/rows/*x/value', '/rows/2/value')).toBe(
    '/rows/*x/value',
  );
});

it('binds nested indices and preserves an unbound wildcard after the occurrence ends', () => {
  expect(bindPointerTemplate('/rows/*/items/*', '/rows/2/items/4')).toBe(
    '/rows/2/items/4',
  );
  expect(bindPointerTemplate('/rows/*/items/*', '/rows/2')).toBe(
    '/rows/2/items/*',
  );
});

it('reuses a formatted name without decoding and escaping it again', () => {
  expect(readFormattedPointerSegment('/a~1b/%2A', -1)).toBe('%2A');
  expect(readFormattedPointerSegment('/a~1b/%2A', 0)).toBe('a~1b');
  expect(readFormattedPointerSegment('/a/', -1)).toBe('');
});

it('keeps the validator slash-only root alias separate from empty-name form and RFC pointers', () => {
  expect(normalizeValidationDataPath('/')).toBe('');
  expect(parsePointer('/').segments).toEqual(['']);
  expect(parseStandardPointer('/')).toEqual(['']);
  expect(normalizeValidationDataPath('/%2A')).toBe('/%2A');
});
