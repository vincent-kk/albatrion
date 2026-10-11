import { describe, expect, it } from 'vitest';

import { SetValueOption } from '../../types/value';
import { writeSchemaNode } from '../index';
import { createTestTree } from './fixtures/createTestTree';

// filid:contract settle-discriminator-comparison
describe('판별 게이트의 엄격 비교', () => {
  it('const 0에 −0을 쓰면 분기를 켭니다', () => {
    const { root } = createTestTree({ type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'number' } },
      oneOf: [{ properties: {
        kind: { type: 'number', const: 0 }, payload: { type: 'string' },
      } }],
    });
    writeSchemaNode(root, { kind: -0, payload: '선택됨' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.kind?.emit).toBe(-0);
    expect(root.structure?.payload?.emit).toBe('선택됨');
    expect(root.emit).toEqual({ kind: -0, payload: '선택됨' });
    expect(root.runtime.diagnostics?.status).toBe('stable');
  });

  it.each([
    { name: 'enum [0]에 −0', tag: 0, value: -0 },
    { name: 'enum [−0]에 0', tag: -0, value: 0 },
  ])('$name을 쓰면 분기를 켭니다', ({ tag, value }) => {
    const { root } = createTestTree({ type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'number' } },
      oneOf: [{ properties: {
        kind: { type: 'number', enum: [tag] }, payload: { type: 'string' },
      } }],
    });
    writeSchemaNode(root, { kind: value, payload: '선택됨' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.payload?.emit).toBe('선택됨');
    expect(root.emit).toEqual({ kind: value, payload: '선택됨' });
    expect(root.runtime.diagnostics?.status).toBe('stable');
  });

  it('수 1과 문자열 1은 서로의 분기를 켜지 않습니다', () => {
    const { root } = createTestTree({ type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: ['number', 'string'] } },
      oneOf: [
        { properties: { kind: { type: ['number', 'string'], const: 1 },
          numeric: { type: 'string' } } },
        { properties: { kind: { type: ['number', 'string'], const: '1' },
          textual: { type: 'string' } } },
      ],
    });
    writeSchemaNode(root, { kind: 1, numeric: '수', textual: '문자열' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.numeric?.emit).toBe('수');
    expect(root.structure?.textual).toBeUndefined();
    expect(root.emit).toEqual({ kind: 1, numeric: '수' });
    writeSchemaNode(root, { kind: '1', numeric: '수', textual: '문자열' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.numeric).toBeUndefined();
    expect(root.structure?.textual?.emit).toBe('문자열');
    expect(root.emit).toEqual({ kind: '1', textual: '문자열' });
    expect(root.runtime.diagnostics?.status).toBe('stable');
  });

  it('NaN은 NaN const와 유한 enum의 어느 분기도 켜지 않습니다', () => {
    const { root } = createTestTree({ type: 'object',
      controls: { discriminator: 'kind' },
      properties: { kind: { type: 'number' } },
      oneOf: [
        { properties: { kind: { type: 'number', const: NaN },
          nan: { type: 'string' } } },
        { properties: { kind: { type: 'number', enum: [0, 1] },
          finite: { type: 'string' } } },
      ],
    });
    writeSchemaNode(root, { kind: NaN, nan: '숨김', finite: '숨김' },
      'callerReplace', SetValueOption.Overwrite);
    expect(root.structure?.nan).toBeUndefined();
    expect(root.structure?.finite).toBeUndefined();
    expect(root.emit).toEqual({ kind: NaN });
    expect(root.runtime.diagnostics?.status).toBe('stable');
  });
});
