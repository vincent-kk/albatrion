import { describe, expect, it } from 'vitest';

import { NodeEventType } from '../../../type';
import { EventQueue } from './EventQueue';

describe('EventQueue', () => {
  it('should handle single event', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
        },
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
  });

  it('should merge multiple events of same type', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 3,
            current: 2,
          },
        },
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 3,
          current: 2,
        },
      },
    });
  });

  it('should handle events with options', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
        },
        options: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
        },
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
  });

  it('should handle empty events', () => {
    const eventWindow = new EventQueue((event) => {
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
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change | NodeEventType.Focus | NodeEventType.Select,
        payload: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
        },
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
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
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 3,
            current: 2,
          },
        },
        options: {},
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 3,
          current: 2,
        },
      },
    });
  });

  it('should merge options for same event type', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 3,
            current: 2,
          },
        },
        options: {
          [NodeEventType.Change]: {
            previous: 3,
            current: 2,
            difference: 1,
          },
        },
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 3,
          current: 2,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 3,
          current: 2,
          difference: 1,
        },
      },
    });
  });

  it('should handle options for different event types', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change | NodeEventType.PathChange,
        payload: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
          [NodeEventType.PathChange]: 'new.path',
        },
        options: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
          [NodeEventType.PathChange]: {
            previous: 'old.path',
            current: 'new.path',
          },
        },
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.PathChange,
      payload: {
        [NodeEventType.PathChange]: 'new.path',
      },
      options: {
        [NodeEventType.PathChange]: {
          previous: 'old.path',
          current: 'new.path',
        },
      },
    });
  });

  it('should handle events with additional options', () => {
    const eventWindow = new EventQueue((event) => {
      expect(event).toEqual({
        type: NodeEventType.Change,
        payload: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
          },
        },
        options: {
          [NodeEventType.Change]: {
            previous: 2,
            current: 1,
            difference: 1,
          },
        },
      });
    });

    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
    });
    eventWindow.push({
      type: NodeEventType.Change,
      payload: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
        },
      },
      options: {
        [NodeEventType.Change]: {
          previous: 2,
          current: 1,
          difference: 1,
        },
      },
    });
  });
});
