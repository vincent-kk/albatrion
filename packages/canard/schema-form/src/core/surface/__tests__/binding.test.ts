import { describe, expect, it, vi } from 'vitest';

import { adoptFieldNodeTree } from '../utils/binding/adoptFieldNodeTree';
import { buildFieldNodeTree } from '../utils/binding/buildFieldNodeTree';
import { finishFieldNodeInput } from '../utils/binding/finishFieldNodeInput';
import { mountFieldNode } from '../utils/binding/mountFieldNode';
import { readFieldNodeInteractionReset } from '../utils/binding/readFieldNodeInteractionReset';
import { reloadFieldNodeForm } from '../utils/binding/reloadFieldNodeForm';
import { writeFieldNodeInput } from '../utils/binding/writeFieldNodeInput';

describe('binding-only surface', () => {
  it('70C-01 build retains the default load snapshot without mounting', () => {
    const onChange = vi.fn();
    const root = buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'default',
      onChange,
    });
    expect(root.value).toBeUndefined();
    expect(root.defaultValue).toBe('default');
    expect(onChange).not.toHaveBeenCalled();
    mountFieldNode(root);
    expect(root.value).toBe('default');
    expect(onChange).toHaveBeenCalledWith('default');
  });

  it('REACT-009 WRITE-083 child input delegates through the public node view', () => {
    const root = buildFieldNodeTree({
      jsonSchema: {
        type: 'object',
        properties: { field: { type: 'string', options: { trim: true } } },
      },
      defaultValue: { field: 'initial' },
    });
    mountFieldNode(root);
    const child = root.find('/field');
    if (!child) throw new Error('Expected mounted child');
    writeFieldNodeInput(child, ' changed ');
    finishFieldNodeInput(child);
    expect(child.value).toBe('changed');
    expect(readFieldNodeInteractionReset(child)).toBe(0);
    reloadFieldNodeForm(root, root.defaultValue);
    expect(child.value).toBe('initial');
    expect(readFieldNodeInteractionReset(child)).toBe(1);
  });

  it('WRITE-046 binding adoption preserves old values and rejects unmarked writes', () => {
    const previous = buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'old',
    });
    mountFieldNode(previous);
    const next = buildFieldNodeTree({
      jsonSchema: { type: 'string' },
      defaultValue: 'new',
    });
    adoptFieldNodeTree(previous, next);
    mountFieldNode(next);
    writeFieldNodeInput(previous, 'late');
    expect(previous.value).toBe('old');
    expect(next.value).toBe('new');
    expect(() => previous.setValue('unmarked')).toThrowError(
      expect.objectContaining({
        code: expect.stringContaining('DISPOSED_NODE_WRITE'),
      }),
    );
  });
});
