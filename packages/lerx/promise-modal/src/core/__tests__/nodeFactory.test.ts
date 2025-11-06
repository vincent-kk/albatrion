import { describe, expect, it } from 'vitest';

import type { ManagedModal } from '../../types';
import { AlertNode } from '../node/ModalNode/AlertNode';
import { ConfirmNode } from '../node/ModalNode/ConfirmNode';
import { PromptNode } from '../node/ModalNode/PromptNode';
import { nodeFactory } from '../node/nodeFactory';

describe('nodeFactory', () => {
  describe('alert node creation', () => {
    it('alert 타입 모달에 대해 AlertNode를 생성해야 함', () => {
      const modal: ManagedModal<void, null> = {
        id: 1,
        initiator: 'test',
        type: 'alert',
        title: 'Test Alert',
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(AlertNode);
      expect(node.type).toBe('alert');
      expect(node.id).toBe(1);
      expect(node.title).toBe('Test Alert');
    });

    it('AlertNode가 모든 alert 속성을 포함해야 함', () => {
      const modal: ManagedModal<void, null> = {
        id: 2,
        initiator: 'test',
        type: 'alert',
        title: 'Alert',
        subtitle: 'Subtitle',
        content: 'Content',
        subtype: 'error',
        footer: false,
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(AlertNode);
      expect(node.title).toBe('Alert');
      expect(node.subtitle).toBe('Subtitle');
      expect(node.content).toBe('Content');
      expect((node as AlertNode).subtype).toBe('error');
      expect((node as AlertNode).footer).toBe(false);
    });
  });

  describe('confirm node creation', () => {
    it('confirm 타입 모달에 대해 ConfirmNode를 생성해야 함', () => {
      const modal: ManagedModal<boolean, null> = {
        id: 3,
        initiator: 'test',
        type: 'confirm',
        title: 'Test Confirm',
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(ConfirmNode);
      expect(node.type).toBe('confirm');
      expect(node.id).toBe(3);
      expect(node.title).toBe('Test Confirm');
    });

    it('ConfirmNode가 모든 confirm 속성을 포함해야 함', () => {
      const modal: ManagedModal<boolean, null> = {
        id: 4,
        initiator: 'test',
        type: 'confirm',
        title: 'Confirm',
        content: 'Are you sure?',
        subtype: 'warning',
        footer: {
          confirm: 'Yes',
          cancel: 'No',
        },
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(ConfirmNode);
      expect(node.content).toBe('Are you sure?');
      expect((node as ConfirmNode).subtype).toBe('warning');
      expect((node as ConfirmNode).footer).toEqual({
        confirm: 'Yes',
        cancel: 'No',
      });
    });
  });

  describe('prompt node creation', () => {
    const mockInput = () => null;

    it('prompt 타입 모달에 대해 PromptNode를 생성해야 함', () => {
      const modal: ManagedModal<string, null> = {
        id: 5,
        initiator: 'test',
        type: 'prompt',
        title: 'Test Prompt',
        Input: mockInput,
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(PromptNode);
      expect(node.type).toBe('prompt');
      expect(node.id).toBe(5);
      expect(node.title).toBe('Test Prompt');
    });

    it('PromptNode가 모든 prompt 속성을 포함해야 함', () => {
      const modal: ManagedModal<string, null> = {
        id: 6,
        initiator: 'test',
        type: 'prompt',
        title: 'Prompt',
        content: 'Enter value:',
        Input: mockInput,
        defaultValue: 'default',
        disabled: (value) => !value,
        returnOnCancel: true,
        footer: {
          confirm: 'Submit',
          cancel: 'Cancel',
        },
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(PromptNode);
      expect(node.content).toBe('Enter value:');
      expect((node as PromptNode<string, null>).Input).toBe(mockInput);
      expect((node as PromptNode<string, null>).defaultValue).toBe('default');
      expect((node as PromptNode<string, null>).returnOnCancel).toBe(true);
    });

    it('PromptNode가 복잡한 타입을 지원해야 함', () => {
      interface UserData {
        name: string;
        age: number;
      }

      const defaultValue: UserData = { name: 'John', age: 30 };

      const modal: ManagedModal<UserData, null> = {
        id: 7,
        initiator: 'test',
        type: 'prompt',
        title: 'User Data',
        Input: mockInput,
        defaultValue,
      };

      const node = nodeFactory(modal);

      expect(node).toBeInstanceOf(PromptNode);
      expect((node as PromptNode<UserData, null>).defaultValue).toEqual(
        defaultValue,
      );
    });
  });

  describe('common properties', () => {
    const mockInput = () => null;

    it('모든 노드 타입이 공통 속성을 포함해야 함', () => {
      const commonProps = {
        id: 10,
        initiator: 'common-test',
        title: 'Common Title',
        subtitle: 'Common Subtitle',
        group: 'test-group',
        dimmed: false,
        duration: 500,
        manualDestroy: true,
        closeOnBackdropClick: false,
        background: { data: { color: 'blue' } },
      };

      const alertModal: ManagedModal<void, any> = {
        ...commonProps,
        type: 'alert',
      };

      const confirmModal: ManagedModal<boolean, any> = {
        ...commonProps,
        type: 'confirm',
      };

      const promptModal: ManagedModal<string, any> = {
        ...commonProps,
        type: 'prompt',
        Input: mockInput,
      };

      const alertNode = nodeFactory(alertModal);
      const confirmNode = nodeFactory(confirmModal);
      const promptNode = nodeFactory(promptModal);

      [alertNode, confirmNode, promptNode].forEach((node) => {
        expect(node.id).toBe(10);
        expect(node.initiator).toBe('common-test');
        expect(node.title).toBe('Common Title');
        expect(node.subtitle).toBe('Common Subtitle');
        expect(node.group).toBe('test-group');
        expect(node.dimmed).toBe(false);
        expect(node.duration).toBe(500);
        expect(node.manualDestroy).toBe(true);
        expect(node.closeOnBackdropClick).toBe(false);
        expect(node.background).toEqual({ data: { color: 'blue' } });
      });
    });
  });

  describe('type narrowing', () => {
    const mockInput = () => null;

    it('타입 가드로 올바른 노드 타입을 식별할 수 있어야 함', () => {
      const alertModal: ManagedModal = {
        id: 11,
        initiator: 'test',
        type: 'alert',
        title: 'Alert',
      };

      const confirmModal: ManagedModal = {
        id: 12,
        initiator: 'test',
        type: 'confirm',
        title: 'Confirm',
      };

      const promptModal: ManagedModal = {
        id: 13,
        initiator: 'test',
        type: 'prompt',
        title: 'Prompt',
        Input: mockInput,
      };

      const alertNode = nodeFactory(alertModal);
      const confirmNode = nodeFactory(confirmModal);
      const promptNode = nodeFactory(promptModal);

      // 타입 가드를 통한 식별
      if (alertNode.type === 'alert') {
        expect(alertNode).toBeInstanceOf(AlertNode);
      }

      if (confirmNode.type === 'confirm') {
        expect(confirmNode).toBeInstanceOf(ConfirmNode);
      }

      if (promptNode.type === 'prompt') {
        expect(promptNode).toBeInstanceOf(PromptNode);
      }
    });
  });

  describe('초기 상태', () => {
    const mockInput = () => null;

    it('생성된 모든 노드가 올바른 초기 상태를 가져야 함', () => {
      const alertNode = nodeFactory({
        id: 20,
        initiator: 'test',
        type: 'alert',
        title: 'Alert',
      });

      const confirmNode = nodeFactory({
        id: 21,
        initiator: 'test',
        type: 'confirm',
        title: 'Confirm',
      });

      const promptNode = nodeFactory({
        id: 22,
        initiator: 'test',
        type: 'prompt',
        title: 'Prompt',
        Input: mockInput,
      });

      [alertNode, confirmNode, promptNode].forEach((node) => {
        expect(node.alive).toBe(true);
        expect(node.visible).toBe(true); // AbstractNode 초기 상태는 visible=true
      });
    });
  });

  describe('custom components', () => {
    const mockInput = () => null;
    const mockForeground = ({ children }: any) => children;
    const mockBackground = () => null;

    it('커스텀 컴포넌트를 전달할 수 있어야 함', () => {
      const modal: ManagedModal = {
        id: 30,
        initiator: 'test',
        type: 'alert',
        title: 'Custom Components',
        ForegroundComponent: mockForeground as any,
        BackgroundComponent: mockBackground as any,
      };

      const node = nodeFactory(modal);

      expect(node.ForegroundComponent).toBe(mockForeground);
      expect(node.BackgroundComponent).toBe(mockBackground);
    });
  });
});
