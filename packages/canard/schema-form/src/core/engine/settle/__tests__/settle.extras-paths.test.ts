import { describe, expect, it } from 'vitest';

import {
  FieldNodeWriteKind,
  WriteOption,
} from '@/schema-form/core/engine/types/value';

import { createTestTree } from '../../__tests__/fixtures/createTestTree';
import { writeFieldNode } from '../utils/write/writeFieldNode';

describe('nested extras path projection', () => {
  it('active #/payload/flag should read extras payload.flag, not root.flag', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: {
          type: 'string',
          controls: { active: '#/payload/flag === true' },
        },
      },
    });
    writeFieldNode(
      root,
      { flag: false, payload: { flag: true }, target: 'kept' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.target?.isActive).toBe(true);
    expect(root.__outputValue__).toEqual(
      expect.objectContaining({ flag: false, target: 'kept' }),
    );
  });

  it('inverse: root.flag true and payload.flag false should keep target inactive', () => {
    const { root } = createTestTree({
      type: 'object',
      properties: {
        flag: { type: 'boolean' },
        target: {
          type: 'string',
          controls: { active: '#/payload/flag === true' },
        },
      },
    });
    writeFieldNode(
      root,
      { flag: true, payload: { flag: false }, target: 'kept' },
      FieldNodeWriteKind.CallerReplace,
      WriteOption.Overwrite,
    );
    expect(root.__childrenByName__?.target).toBeUndefined();
    expect(root.__outputValue__).not.toEqual(
      expect.objectContaining({ target: 'kept' }),
    );
  });
});
