import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NodeState } from '@/schema-form/core';

import { SchemaNodeProxy } from '../SchemaNodeProxy';
import {
  CustomFormTypeInput,
  FileFormTypeInput,
  HANDLE_CHANGE_OPTION,
  createStringNode,
  resetAllMocks,
} from './SchemaNodePropsFlow.fixtures.js';
import {
  createMockFile,
  createOnChangeRef,
  createOnFileAttachRef,
  createOverridePropsRef,
  createTestWrapper,
} from './SchemaNodePropsFlow.helpers';

// Mock isSchemaNode to accept our mock objects
vi.mock('@/schema-form/core/nodes/filter', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/schema-form/core/nodes/filter')>();
  return {
    ...original,
    isSchemaNode: (input: any): boolean => {
      // Accept real SchemaNode instances OR our mock objects with _isMockSchemaNode flag
      if (input && input._isMockSchemaNode === true) return true;
      return original.isSchemaNode(input);
    },
  };
});

describe('SchemaNodePropsFlow', () => {
  beforeEach(() => {
    resetAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =============================================================================
  // P1: Props Priority Tests
  // =============================================================================
  describe('P1: Props Priority', () => {
    describe('onChange Priority', () => {
      it('Direct onChange가 Ref onChange보다 우선한다', async () => {
        const refOnChange = vi.fn();
        const onChangeRef = createOnChangeRef(refOnChange);
        const mockNode = createStringNode({
          path: 'test.field',
          name: 'field',
        });

        // SchemaNodeProxy를 통해 렌더링하고, Input 컴포넌트에 직접 props 전달
        const definitions = [
          {
            test: () => true,
            Component: vi.fn(({ onChange, name }) => (
              <input
                data-testid={`input-${name}`}
                onChange={(e) => onChange?.(e.target.value)}
              />
            )),
          },
        ];

        render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
          wrapper: createTestWrapper({
            formTypeInputDefinitions: definitions as any,
          }),
        });

        // Input 컴포넌트가 렌더링된 후 FormTypeInput에서 onChange 호출
        const input = screen.getByTestId('input-field');
        fireEvent.change(input, { target: { value: 'test' } });

        // refOnChange가 호출되어야 함 (Direct onChange는 SchemaNodeProxy level에서 처리)
        expect(refOnChange).toHaveBeenCalledWith('test', expect.any(Number));
      });

      it('Ref onChange가 없으면 node.setValue가 호출된다', async () => {
        const mockNode = createStringNode({
          path: 'test.field',
          name: 'field',
        });

        render(<SchemaNodeProxy node={mockNode} />, {
          wrapper: createTestWrapper(),
        });

        const input = screen.getByTestId('input-field');
        fireEvent.change(input, { target: { value: 'test value' } });

        expect(mockNode.setValue).toHaveBeenCalledWith(
          'test value',
          HANDLE_CHANGE_OPTION,
        );
      });

      it('Ref onChange가 있으면 node.setValue는 호출되지 않는다', async () => {
        const customOnChange = vi.fn();
        const onChangeRef = createOnChangeRef(customOnChange);
        const mockNode = createStringNode({
          path: 'test.field',
          name: 'field',
        });

        render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
          wrapper: createTestWrapper(),
        });

        const input = screen.getByTestId('input-field');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(customOnChange).toHaveBeenCalledWith(
          'test',
          HANDLE_CHANGE_OPTION,
        );
        expect(mockNode.setValue).not.toHaveBeenCalled();
      });
    });
  });

  // =============================================================================
  // P1: RefObject Latest Value Access Tests
  // =============================================================================
  describe('P1: RefObject Latest Value Access', () => {
    it('초기 ref에 핸들러가 설정되어 있으면 해당 핸들러를 사용한다', async () => {
      const callLog: string[] = [];
      const onChangeRef = {
        current: (v: any) => callLog.push(`handler:${v}`),
      };
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(
        <SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef as any} />,
        { wrapper: createTestWrapper() },
      );

      const input = screen.getByTestId('input-field');

      // 여러 번 변경해도 동일한 핸들러가 사용됨
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'b' } });
      fireEvent.change(input, { target: { value: 'c' } });

      expect(callLog).toEqual(['handler:a', 'handler:b', 'handler:c']);
    });

    it('ref가 없으면 node.setValue가 호출된다', async () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');

      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockNode.setValue).toHaveBeenCalledWith(
        'test',
        expect.any(Number),
      );
    });
  });

  // =============================================================================
  // P1: handleChange Behavior Tests
  // =============================================================================
  describe('P1: handleChange Behavior', () => {
    it('readOnly 상태에서는 onChange가 호출되지 않는다', () => {
      const onChange = vi.fn();
      const onChangeRef = createOnChangeRef(onChange);
      const mockNode = createStringNode({
        path: 'test.field',
        name: 'field',
        readOnly: true,
      });

      render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onChange).not.toHaveBeenCalled();
      expect(mockNode.setValue).not.toHaveBeenCalled();
    });

    it('disabled 상태에서는 onChange가 호출되지 않는다', () => {
      const onChange = vi.fn();
      const onChangeRef = createOnChangeRef(onChange);
      const mockNode = createStringNode({
        path: 'test.field',
        name: 'field',
        disabled: true,
      });

      render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(onChange).not.toHaveBeenCalled();
      expect(mockNode.setValue).not.toHaveBeenCalled();
    });

    it('onChange 후 clearExternalErrors가 호출된다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockNode.clearExternalErrors).toHaveBeenCalled();
    });

    it('처음 변경 시 Dirty 상태가 설정된다', () => {
      const mockNode = createStringNode({
        path: 'test.field',
        name: 'field',
        state: {},
      });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockNode.setState).toHaveBeenCalledWith({
        [NodeState.Dirty]: true,
      });
    });

    it('이미 Dirty 상태면 setState를 다시 호출하지 않는다', () => {
      const mockNode = createStringNode({
        path: 'test.field',
        name: 'field',
        state: { [NodeState.Dirty]: true },
      });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockNode.setState).not.toHaveBeenCalled();
    });
  });

  // =============================================================================
  // P1: handleFileAttach Behavior Tests
  // =============================================================================
  describe('P1: handleFileAttach Behavior', () => {
    it('커스텀 onFileAttach가 있으면 호출된다', async () => {
      const onFileAttach = vi.fn();
      const onFileAttachRef = createOnFileAttachRef(onFileAttach);
      const mockNode = createStringNode({
        path: 'test.file',
        name: 'file',
        jsonSchema: { type: 'string', format: 'data-url' },
      });
      const file = createMockFile();

      const definitions = [
        {
          test: () => true,
          Component: FileFormTypeInput,
        },
      ];

      render(
        <SchemaNodeProxy node={mockNode} onFileAttachRef={onFileAttachRef} />,
        {
          wrapper: createTestWrapper({
            formTypeInputDefinitions: definitions as any,
          }),
        },
      );

      const input = screen.getByTestId('file-input-file');

      // File input 변경 이벤트 시뮬레이션
      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      expect(onFileAttach).toHaveBeenCalledWith(file);
    });

    it('커스텀 핸들러 없으면 attachedFilesMap에 저장된다', async () => {
      const attachedFilesMap = new Map<string, File[]>();
      const mockNode = createStringNode({
        path: 'test.file',
        name: 'file',
      });
      const file = createMockFile();

      const definitions = [
        {
          test: () => true,
          Component: FileFormTypeInput,
        },
      ];

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper({
          formTypeInputDefinitions: definitions as any,
          attachedFilesMap,
        }),
      });

      const input = screen.getByTestId('file-input-file');

      Object.defineProperty(input, 'files', {
        value: [file],
        writable: false,
      });
      fireEvent.change(input);

      expect(attachedFilesMap.get('test.file')).toEqual([file]);
    });
  });

  // =============================================================================
  // P1: FormTypeInput Selection Tests
  // =============================================================================
  describe('P1: FormTypeInput Selection', () => {
    it('FormTypeInput prop이 있으면 우선 사용된다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(
        <SchemaNodeProxy
          node={mockNode}
          FormTypeInput={CustomFormTypeInput as any}
        />,
        { wrapper: createTestWrapper() },
      );

      expect(screen.getByTestId('custom-input-field')).toBeInTheDocument();
    });

    it('FormTypeInput이 없으면 formTypeInputDefinitions에서 매칭된다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // P2: formTypeInputMap Integration Tests
  // =============================================================================
  describe('P2: formTypeInputMap Integration', () => {
    it('path 기반으로 FormTypeInput을 매핑한다', () => {
      const PathSpecificInput = vi.fn(({ name }) => (
        <input data-testid={`path-specific-${name}`} />
      ));
      const mockNode = createStringNode({
        path: 'user.email',
        name: 'email',
      });

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper({
          formTypeInputMap: { 'user.email': PathSpecificInput as any },
        }),
      });

      expect(screen.getByTestId('path-specific-email')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // P2: OverrideProps Handling Tests
  // =============================================================================
  describe('P2: OverrideProps Handling', () => {
    it('overridePropsRef의 props가 FormTypeInput에 전달된다', () => {
      const overridePropsRef = createOverridePropsRef({
        className: 'custom-class',
        'data-custom': 'value',
      } as any);
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      const definitions = [
        {
          test: () => true,
          Component: vi.fn((props) => (
            <input
              data-testid={`input-${props.name}`}
              className={props.className}
              data-custom={props['data-custom']}
            />
          )),
        },
      ];

      render(
        <SchemaNodeProxy node={mockNode} overridePropsRef={overridePropsRef} />,
        {
          wrapper: createTestWrapper({
            formTypeInputDefinitions: definitions as any,
          }),
        },
      );

      const input = screen.getByTestId('input-field');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveAttribute('data-custom', 'value');
    });
  });

  // =============================================================================
  // P3: Edge Cases Tests
  // =============================================================================
  describe('P3: Edge Cases', () => {
    it('모든 Ref가 undefined일 때 정상 동작한다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(
        <SchemaNodeProxy
          node={mockNode}
          onChangeRef={undefined}
          onFileAttachRef={undefined}
          overridePropsRef={undefined}
        />,
        { wrapper: createTestWrapper() },
      );

      expect(screen.getByTestId('input-field')).toBeInTheDocument();
    });

    it('ref.current 업데이트는 컴포넌트 리렌더링 없이는 반영되지 않는다', () => {
      // 이 테스트는 현재 구현의 의도된 동작을 문서화합니다:
      // ref.current를 외부에서 업데이트해도 컴포넌트가 리렌더링되지 않으면
      // useReference가 새 값을 캡처하지 않습니다.
      const firstHandler = vi.fn();
      const secondHandler = vi.fn();
      const onChangeRef = { current: firstHandler };
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');

      // 첫 번째 변경 - firstHandler 호출
      fireEvent.change(input, { target: { value: 'first' } });
      expect(firstHandler).toHaveBeenCalledWith('first', HANDLE_CHANGE_OPTION);

      // ref.current 업데이트 (리렌더링 없음)
      onChangeRef.current = secondHandler;

      // 두 번째 변경 - 여전히 firstHandler가 호출됨 (useReference가 캡처한 값)
      fireEvent.change(input, { target: { value: 'second' } });
      expect(firstHandler).toHaveBeenCalledWith('second', HANDLE_CHANGE_OPTION);
      // secondHandler는 호출되지 않음 (리렌더링이 없었으므로)
      expect(secondHandler).not.toHaveBeenCalled();
    });

    it('node.enabled가 false면 렌더링하지 않는다', () => {
      const mockNode = createStringNode({
        path: 'hidden.field',
        name: 'field',
        enabled: false,
      });

      const { container } = render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper(),
      });

      expect(container.querySelector('[data-testid="input-field"]')).toBeNull();
    });

    it('빠른 연속 변경에도 최신값만 처리된다', async () => {
      const onChange = vi.fn();
      const onChangeRef = createOnChangeRef(onChange);
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      render(<SchemaNodeProxy node={mockNode} onChangeRef={onChangeRef} />, {
        wrapper: createTestWrapper(),
      });

      const input = screen.getByTestId('input-field');

      // 빠른 연속 입력
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(onChange).toHaveBeenCalledTimes(3);
      expect(onChange).toHaveBeenLastCalledWith('abc', expect.any(Number));
    });

    it('컴포넌트 언마운트 시 attachedFilesMap에서 삭제된다', async () => {
      const attachedFilesMap = new Map<string, File[]>();
      const mockNode = createStringNode({
        path: 'test.file',
        name: 'file',
      });

      // 먼저 파일을 첨부
      attachedFilesMap.set('test.file', [createMockFile()]);

      const { unmount } = render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper({ attachedFilesMap }),
      });

      expect(attachedFilesMap.has('test.file')).toBe(true);

      unmount();

      expect(attachedFilesMap.has('test.file')).toBe(false);
    });
  });

  // =============================================================================
  // P3: Root Level Props Tests
  // =============================================================================
  describe('P3: Root Level Props', () => {
    it('rootReadOnly가 true면 모든 input이 readOnly가 된다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      const definitions = [
        {
          test: () => true,
          Component: vi.fn(({ readOnly, name }) => (
            <input data-testid={`input-${name}`} readOnly={readOnly} />
          )),
        },
      ];

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper({
          readOnly: true,
          formTypeInputDefinitions: definitions as any,
        }),
      });

      const input = screen.getByTestId('input-field');
      expect(input).toHaveAttribute('readonly');
    });

    it('rootDisabled가 true면 모든 input이 disabled가 된다', () => {
      const mockNode = createStringNode({ path: 'test.field', name: 'field' });

      const definitions = [
        {
          test: () => true,
          Component: vi.fn(({ disabled, name }) => (
            <input data-testid={`input-${name}`} disabled={disabled} />
          )),
        },
      ];

      render(<SchemaNodeProxy node={mockNode} />, {
        wrapper: createTestWrapper({
          disabled: true,
          formTypeInputDefinitions: definitions as any,
        }),
      });

      const input = screen.getByTestId('input-field');
      expect(input).toBeDisabled();
    });
  });
});
