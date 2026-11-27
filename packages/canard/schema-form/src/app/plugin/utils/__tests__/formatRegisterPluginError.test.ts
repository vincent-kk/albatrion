import { describe, expect, it } from 'vitest';

import type { SchemaFormPlugin } from '../../type';
import { formatRegisterPluginError } from '../formatRegisterPluginError';

describe('formatRegisterPluginError', () => {
  it('플러그인 등록 에러 메시지를 포맷해야 합니다', () => {
    const plugin = {
      renderKit: { InputRenderer: () => null },
    } as SchemaFormPlugin;
    const error = new Error('Invalid component');
    const result = formatRegisterPluginError(plugin, error);

    expect(result).toContain('Failed to register');
    expect(result).toContain('Invalid component');
    expect(result).toContain('How to fix');
  });

  it('lists FieldRenderer by its registered slot name', () => {
    const result = formatRegisterPluginError(
      { FieldRenderer: () => null } as SchemaFormPlugin,
      new Error('Invalid component'),
    );

    expect(result).toContain('FieldRenderer');
    expect(result).not.toContain('FormGroup');
  });

  it('빈 플러그인도 처리해야 합니다', () => {
    const result = formatRegisterPluginError(
      {} as SchemaFormPlugin,
      new Error('Unknown'),
    );

    expect(result).toContain('Failed to register');
  });

  describe('에러 메시지 일관성 테스트', () => {
    it('모든 포맷터가 "How to fix" 섹션을 포함해야 합니다', () => {
      const formatters = [
        formatRegisterPluginError({} as SchemaFormPlugin, new Error()),
      ];

      for (const message of formatters) {
        expect(message).toContain('How to fix');
      }
    });
  });

  describe('에러 메시지 스냅샷', () => {
    it('formatRegisterPluginError 스냅샷', () => {
      const mockPlugin: SchemaFormPlugin = {
        InputRenderer: () => null,
        LabelRenderer: () => null,
        fieldInputDefinitions: [
          { test: { type: 'string' }, Component: () => null },
        ],
        validator: {
          bind: () => {},
          compile: () => () => null,
          compileGuard: () => () => true,
        },
      };
      const result = formatRegisterPluginError(
        mockPlugin,
        new Error(
          'Plugin conflict: fieldInputDefinitions[0] conflicts with existing definition',
        ),
      );
      expect(result).toMatchSnapshot();
    });
  });
});
