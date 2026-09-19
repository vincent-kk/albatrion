import { afterEach, describe, expect, it, vi } from 'vitest';

import { nodeFromJSONSchema } from '@/schema-form/core';
import type { JSONSchema } from '@/schema-form/types';

import type { ObjectNode } from '../nodes/ObjectNode';

const WARNING = 'SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM';

/**
 * Builds a form holding one nullable object whose `oneOf` starts with `nullBranch`.
 * Every case names its object differently: a development warning is printed once per message, and the message carries the path.
 * @param name - Property name of the nullable object
 * @param nullBranch - The `{ type: 'null' }` branch under test
 * @returns The nullable object's node
 */
const build = (
  name: string,
  nullBranch: NonNullable<JSONSchema['oneOf']>[number],
) => {
  const jsonSchema = {
    type: 'object',
    properties: {
      [name]: {
        type: ['object', 'null'],
        properties: {
          kind: { type: 'string', enum: ['a', 'b'], default: 'a' },
        },
        oneOf: [
          nullBranch,
          {
            type: 'object',
            '&if': "./kind === 'a'",
            properties: { aValue: { type: 'string' } },
          },
          {
            type: 'object',
            '&if': "./kind === 'b'",
            properties: { bValue: { type: 'string' } },
          },
        ],
      },
    },
  } satisfies JSONSchema;
  const root = nodeFromJSONSchema({ onChange: () => {}, jsonSchema });
  return root.find(name) as ObjectNode;
};

/** Number of printed development warnings that carry the null-branch code. */
const warningCount = (warn: ReturnType<typeof vi.spyOn>) =>
  warn.mock.calls.filter((call) => String(call[0]).includes(WARNING)).length;

/** A `{ type: 'null' }` branch only tells the validator that `null` is valid; the form gives it no fields and never selects it. */
describe('ObjectNode composition — null 분기는 검증 전용', () => {
  afterEach(() => vi.restoreAllMocks());

  it.fails(
    'null 분기의 조건은 활성 분기를 고르지 않아야 함 // LIMIT: null 분기를 작성할 수 없음',
    () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const target = build('conditioned', {
        type: 'null',
        '&if': "./kind === 'a'",
      });

      expect(target.oneOfIndex).toBe(1);
      expect(target.find('aValue')).not.toBeNull();
    },
  );

  it.fails(
    'null 분기의 properties는 필드가 되지 않아야 함 // LIMIT: null 분기를 작성할 수 없음',
    () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const target = build('propertied', {
        type: 'null',
        properties: { ghost: { type: 'string' } },
      });

      expect(target.find('ghost')).toBeNull();
      expect(target.find('aValue')).not.toBeNull();
    },
  );

  it.fails(
    '무시되는 조건이나 properties가 있으면 개발 환경에서 경고해야 함 // LIMIT: null 분기를 작성할 수 없음',
    () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      build('warned', { type: 'null', '&if': "./kind === 'a'" });

      expect(warningCount(warn)).toBe(1);
    },
  );

  it.fails(
    '조건도 properties도 없는 null 분기에는 경고하지 않아야 함 // LIMIT: null 분기를 작성할 수 없음',
    () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const target = build('plain', { type: 'null' });

      expect(target.oneOfIndex).toBe(1);
      expect(warningCount(warn)).toBe(0);
    },
  );
});
