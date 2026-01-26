import { describe, expect, it, vi } from 'vitest';

import { NodeEventType } from '../../../type';
import { EventCascadeManager } from '../EventCascadeManager';

const createEventCascadeManager = (path = '/test') =>
  new EventCascadeManager(() => ({ path, dependencies: [] }));

describe('EventCascadeManager', () => {
  describe('publish (batched events)', () => {
    it('should batch events and emit merged event', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(NodeEventType.UpdateValue, {
        previous: 2,
        current: 1,
      });

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {},
      });
    });

    it('should merge multiple events of same type', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(NodeEventType.UpdateValue, {
        previous: 2,
        current: 1,
      });
      manager.publish(NodeEventType.UpdateValue, {
        previous: 3,
        current: 2,
      });

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 3,
            current: 2,
          },
        },
        options: {},
      });
    });

    it('should handle events with options', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(
        NodeEventType.UpdateValue,
        {
          previous: 2,
          current: 1,
        },
        {
          previous: 2,
          current: 1,
        },
      );

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
      });
    });

    it('should handle empty events', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(NodeEventType.RequestFocus);

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.RequestFocus,
        payload: {},
        options: {},
      });
    });

    it('should handle multiple event types', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(NodeEventType.UpdateValue, {
        previous: 2,
        current: 1,
      });
      manager.publish(NodeEventType.RequestFocus);
      manager.publish(NodeEventType.RequestSelect);

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type:
          NodeEventType.UpdateValue |
          NodeEventType.RequestFocus |
          NodeEventType.RequestSelect,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {},
      });
    });

    it('should merge options for same event type', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(
        NodeEventType.UpdateValue,
        {
          previous: 2,
          current: 1,
        },
        {
          previous: 2,
          current: 1,
        },
      );
      manager.publish(
        NodeEventType.UpdateValue,
        {
          previous: 3,
          current: 2,
        },
        {
          previous: 3,
          current: 2,
        },
      );

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 3,
            current: 2,
          },
        },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: 3,
            current: 2,
          },
        },
      });
    });

    it('should handle options for different event types', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.publish(
        NodeEventType.UpdateValue,
        {
          previous: 2,
          current: 1,
        },
        {
          previous: 2,
          current: 1,
        },
      );
      manager.publish(NodeEventType.UpdatePath, 'new.path', {
        previous: 'old.path',
        current: 'new.path',
      });

      await Promise.resolve();

      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue | NodeEventType.UpdatePath,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
          [NodeEventType.UpdatePath]: 'new.path',
        },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
          [NodeEventType.UpdatePath]: {
            previous: 'old.path',
            current: 'new.path',
          },
        },
      });
    });
  });

  describe('dispatch (immediate events)', () => {
    it('should dispatch event immediately without batching', () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.dispatch(NodeEventType.UpdateValue, {
        previous: 2,
        current: 1,
      });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {
          [NodeEventType.UpdateValue]: undefined,
        },
      });
    });

    it('should dispatch with options immediately', () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();
      manager.subscribe(handler);

      manager.dispatch(
        NodeEventType.UpdateValue,
        {
          previous: 2,
          current: 1,
        },
        {
          previous: 2,
          current: 1,
        },
      );

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({
        type: NodeEventType.UpdateValue,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
      });
    });
  });

  describe('subscribe', () => {
    it('should register listener and return unsubscribe function', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();

      const unsubscribe = manager.subscribe(handler);
      manager.publish(NodeEventType.RequestFocus);

      await Promise.resolve();
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();
      manager.publish(NodeEventType.RequestFocus);

      await Promise.resolve();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should support multiple listeners', async () => {
      const manager = createEventCascadeManager();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      manager.subscribe(handler1);
      manager.subscribe(handler2);
      manager.publish(NodeEventType.RequestFocus);

      await Promise.resolve();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveUnsubscribe and cleanUp', () => {
    it('should save unsubscribe functions and call them on cleanUp', () => {
      const manager = createEventCascadeManager();
      const unsubscribe1 = vi.fn();
      const unsubscribe2 = vi.fn();

      manager.saveUnsubscribe(unsubscribe1);
      manager.saveUnsubscribe(unsubscribe2);

      expect(unsubscribe1).not.toHaveBeenCalled();
      expect(unsubscribe2).not.toHaveBeenCalled();

      manager.cleanUp();

      expect(unsubscribe1).toHaveBeenCalledTimes(1);
      expect(unsubscribe2).toHaveBeenCalledTimes(1);
    });

    it('should clear listeners on cleanUp', async () => {
      const manager = createEventCascadeManager();
      const handler = vi.fn();

      manager.subscribe(handler);
      manager.cleanUp();
      manager.publish(NodeEventType.RequestFocus);

      await Promise.resolve();

      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow multiple cleanUp calls', () => {
      const manager = createEventCascadeManager();
      const unsubscribe = vi.fn();

      manager.saveUnsubscribe(unsubscribe);
      manager.cleanUp();
      manager.cleanUp();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
