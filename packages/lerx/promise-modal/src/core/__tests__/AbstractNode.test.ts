import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AbstractNode } from '../node/ModalNode/AbstractNode';

// 테스트를 위한 구체 클래스 구현
class TestNode extends AbstractNode<string, null> {
  onClose(): void {
    this.resolve(null);
  }
  onConfirm(): void {
    this.resolve('confirmed');
  }
}

describe('AbstractNode', () => {
  let node: TestNode;

  beforeEach(() => {
    node = new TestNode({
      id: 1,
      initiator: 'test',
      resolve: () => {},
    });
  });

  describe('subscribe and unsubscribe', () => {
    it('리스너가 정상적으로 등록되고 호출되어야 함', () => {
      const mockListener = vi.fn();

      // 리스너 등록
      node.subscribe(mockListener);

      // publish 호출 시 리스너가 실행되는지 확인
      node.publish();
      expect(mockListener).toHaveBeenCalledTimes(1);

      // 두 번째 publish 호출 시에도 리스너가 실행되어야 함
      node.publish();
      expect(mockListener).toHaveBeenCalledTimes(2);
    });

    it('unsubscribe 함수가 정상적으로 동작해야 함', () => {
      const mockListener = vi.fn();

      // 리스너 등록 및 unsubscribe 함수 받기
      const unsubscribe = node.subscribe(mockListener);

      // 초기 상태에서 publish 호출 시 리스너가 실행되어야 함
      node.publish();
      expect(mockListener).toHaveBeenCalledTimes(1);

      // unsubscribe 실행
      unsubscribe();

      // unsubscribe 후 publish 호출 시 리스너가 실행되지 않아야 함
      node.publish();
      expect(mockListener).toHaveBeenCalledTimes(1); // 카운트가 증가하지 않아야 함
    });

    it('여러 리스너를 등록하고 개별적으로 unsubscribe 할 수 있어야 함', () => {
      const mockListener1 = vi.fn();
      const mockListener2 = vi.fn();
      const mockListener3 = vi.fn();

      // 여러 리스너 등록
      const _unsubscribe1 = node.subscribe(mockListener1);
      const unsubscribe2 = node.subscribe(mockListener2);
      const _unsubscribe3 = node.subscribe(mockListener3);

      // 초기 상태에서 모든 리스너가 호출되어야 함
      node.publish();
      expect(mockListener1).toHaveBeenCalledTimes(1);
      expect(mockListener2).toHaveBeenCalledTimes(1);
      expect(mockListener3).toHaveBeenCalledTimes(1);

      // 두 번째 리스너만 unsubscribe
      unsubscribe2();

      // unsubscribe 후 publish 시 나머지 리스너들만 실행되어야 함
      node.publish();
      expect(mockListener1).toHaveBeenCalledTimes(2);
      expect(mockListener2).toHaveBeenCalledTimes(1); // 카운트가 증가하지 않아야 함
      expect(mockListener3).toHaveBeenCalledTimes(2);
    });

    it('존재하지 않는 리스너를 unsubscribe 하려고 할 때 에러가 발생하지 않아야 함', () => {
      const mockListener = vi.fn();
      const unsubscribe = node.subscribe(mockListener);

      // 두 번 unsubscribe 해도 에러가 발생하지 않아야 함
      unsubscribe();
      expect(() => unsubscribe()).not.toThrow();

      // unsubscribe 후 publish가 정상적으로 동작해야 함
      node.publish();
      expect(mockListener).not.toHaveBeenCalled();
    });
  });
});
