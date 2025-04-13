import { describe, expect, it } from 'vitest';

import { NodeEventType } from '../../../type';
import { EventCascade } from './EventCascade';

describe('EventCascade', () => {
  it('should batch events and emit merged event', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 2,
          current: 1,
        },
      },
    });
  });

  it('should merge multiple events of same type', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 3,
          current: 2,
        },
      },
    });
  });

  it('should handle events with options', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
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

  it('should handle empty events', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
        type: NodeEventType.Focus,
        payload: {},
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.Focus,
      payload: {},
      options: {},
    });
  });

  it('should handle multiple event types', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
        type:
          NodeEventType.UpdateValue |
          NodeEventType.Focus |
          NodeEventType.Select,
        payload: {
          [NodeEventType.UpdateValue]: {
            previous: 2,
            current: 1,
          },
        },
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.Focus,
    });
    eventWindow.push({
      type: NodeEventType.Select,
    });
  });

  it('should handle events with different payloads for same type', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.UpdateValue,
      payload: {
        [NodeEventType.UpdateValue]: {
          previous: 3,
          current: 2,
        },
      },
    });
  });

  it('should merge options for same event type', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
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
    eventWindow.push({
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

  it('should handle options for different event types', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
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
    eventWindow.push({
      type: NodeEventType.UpdatePath,
      payload: {
        [NodeEventType.UpdatePath]: 'new.path',
      },
      options: {
        [NodeEventType.UpdatePath]: {
          previous: 'old.path',
          current: 'new.path',
        },
      },
    });
  });

  it('should handle events with additional options', () => {
    const eventWindow = new EventCascade((event) => {
      expect(event).toEqual({
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

    eventWindow.push({
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
    eventWindow.push({
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
