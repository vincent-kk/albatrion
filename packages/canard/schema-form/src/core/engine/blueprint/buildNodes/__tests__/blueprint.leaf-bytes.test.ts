import { describe, it } from 'vitest';

import type { BlueprintSchema } from '../../types/schema';
import { assertTemplateLeafBytes } from './fixtures/assertTemplateLeafBytes';

// filid:contract template-leaf-bytes
describe('template leaf JSON bytes', () => {
  it('preserves quotes, backslashes, empty names and RFC6901 segments', () => {
    for (const name of ['', '"', '\\', '~/', '/~', 'a"b\\c'])
      assertTemplateLeafBytes({
        type: 'object',
        properties: { [name]: { type: 'string' } },
      });
  });

  it('uses the exact JSON spelling for every control byte and DEL', () => {
    for (let code = 0; code <= 32; code++)
      assertTemplateLeafBytes({
        type: 'object',
        properties: {
          ['before' + String.fromCharCode(code) + 'after']: { type: 'string' },
        },
      });
    assertTemplateLeafBytes({
      type: 'object',
      properties: { ['\u007f']: { type: 'string' } },
    });
  });

  it('preserves separators, Unicode and all surrogate boundary spellings', () => {
    for (const name of [
      '\u2028',
      '\u2029',
      '한글',
      '😀',
      '\ud800',
      '\udfff',
      'end\udbff',
      '\udc00\ud800',
      '\ud800\ud800',
      '\udc00\udc00',
    ])
      assertTemplateLeafBytes({
        type: 'object',
        properties: { [name]: { type: 'string' } },
      });
  });

  it('preserves inherited gate descriptor bytes on exotic property paths', () => {
    for (const name of ['"\\\n', '\ud800', '\udc00\ud800', '\u2028\u2029'])
      assertTemplateLeafBytes({
        type: 'object',
        properties: {
          [name]: {
            type: 'object',
            oneOf: [
              {
                controls: { active: 'true' },
                properties: { value: { type: 'string' } },
              },
            ],
          },
        },
      });
  });

  it('encodes the resolved reference location instead of the referring path', () => {
    assertTemplateLeafBytes({
      type: 'object',
      $defs: { ['quote"\\']: { type: 'string' } },
      properties: {
        first: { $ref: '#/$defs/quote%22%5C' },
        second: { $ref: '#/$defs/quote%22%5C' },
      },
    } as BlueprintSchema);
  });

});
