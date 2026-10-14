import { describe, expect, it } from 'vitest';

import { makeFieldNodeTree } from '@/schema-form/core/__tests__/makeFieldNodeTree';
import { FieldNodeEventType, FieldNodeState } from '@/schema-form/core/engine';
import { adoptFieldNodeTree } from '@/schema-form/core/surface';
import { FormErrorCode, SchemaFormError } from '@/schema-form/errors';

const PAIR_SCHEMA = {
  type: 'object',
  properties: { first: { type: 'string' }, second: { type: 'string' } },
} as const;

type Tree = ReturnType<typeof makeFieldNodeTree>;

const createTree = (reported: unknown[] = []): Tree => {
  const tree = makeFieldNodeTree(PAIR_SCHEMA, {
    errorReporter: {
      hasConsumer: () => true,
      report: (record) => {
        reported.push(Reflect.get(record, 'error'));
      },
    },
  });
  tree.root.setValue({ first: 'a', second: 'b' });
  return tree;
};

const countReported = (reported: unknown[], error: unknown): number =>
  reported.filter((entry) => entry === error).length;

const expectResting = (...trees: Tree[]): void => {
  for (const { runtime } of trees) {
    for (const key of [
      'entryDepth',
      'batchDepth',
      'visitDepth',
      'onChangeBudget',
    ])
      expect(Reflect.get(runtime, key) ?? 0, key).toBe(0);
    for (const key of [
      'visitBatchEntry',
      'chainErrors',
      'chainOccurrences',
      'enclosingChain',
      'batchWrites',
      'chainRoot',
      'currentListener',
    ])
      expect(Reflect.get(runtime, key), key).toBeUndefined();
    expect(Reflect.get(runtime, 'flushingQueuedEvents') ?? false).toBe(false);
  }
};

const touchFirst = (tree: Tree): void => {
  tree.root.find('/first')?.setState({ [FieldNodeState.Touched]: true });
};

const adoptAndFeed = (previous: Tree, next: Tree): void => {
  adoptFieldNodeTree(previous.root, next.root);
  next.root.find('/first')?.setValue('fed');
};

const expectLaterFailureThrown = (next: Tree): void => {
  const failure = new Error('later listener failed');
  next.root.subscribe(() => {
    throw failure;
  });
  expect(() => next.root.find('/second')?.setValue('later')).toThrow(failure);
  expect(next.root.value).toEqual({ first: 'fed', second: 'later' });
};

describe('adoption during an event delivery', () => {
  it('a standalone setState whose UpdateState listener adopts leaves both runtimes resting', () => {
    const previous = createTree();
    const next = createTree();
    let heard = false;
    previous.root.find('/first')?.subscribe((event) => {
      if (heard || !(event.type & FieldNodeEventType.UpdateState)) return;
      heard = true;
      adoptAndFeed(previous, next);
    });
    previous.root.find('/first')?.setState({ [FieldNodeState.Touched]: true });
    expect(next.root.value).toEqual({ first: 'fed', second: 'b' });
    expectResting(previous, next);
    expectLaterFailureThrown(next);
  });

  it.each([
    [
      'batch()',
      (previous: Tree) =>
        previous.root.batch(() => {
          previous.root.find('/second')?.setValue('c');
        }),
    ],
    [
      'a plain write',
      (previous: Tree) => previous.root.find('/second')?.setValue('c'),
    ],
  ])(
    'a chain-exit listener that adopts after %s delivers the new root and closes both chains',
    (_, write) => {
      const previous = createTree();
      const next = createTree();
      const delivered: unknown[] = [];
      next.root.subscribe((event) => {
        if (event.type & FieldNodeEventType.UpdateValue)
          delivered.push(next.root.value);
      });
      let heard = false;
      previous.root.subscribe((event) => {
        if (heard || !(event.type & FieldNodeEventType.UpdateValue)) return;
        heard = true;
        adoptAndFeed(previous, next);
      });
      write(previous);
      expect(delivered).toEqual([{ first: 'fed', second: 'b' }]);
      expectResting(previous, next);
      expectLaterFailureThrown(next);
    },
  );

  it.each([
    [
      'chain-exit',
      '',
      FieldNodeEventType.UpdateValue,
      (previous: Tree) => previous.root.find('/second')?.setValue('c'),
    ],
    [
      'standalone',
      '/first',
      FieldNodeEventType.UpdateState,
      (previous: Tree) =>
        previous.root
          .find('/first')
          ?.setState({ [FieldNodeState.Touched]: true }),
    ],
  ])(
    'adoption inside a walk started during %s delivery closes both chains',
    (_, listened, type, trigger) => {
      const previous = createTree();
      const next = createTree();
      let heard = false;
      previous.root.find(listened)?.subscribe((event) => {
        if (heard || !(event.type & type)) return;
        heard = true;
        previous.root.visitSubtree((node) => {
          if (node.path !== '') return;
          adoptAndFeed(previous, next);
          return false;
        });
      });
      trigger(previous);
      expect(next.root.value).toEqual({ first: 'fed', second: 'b' });
      expectResting(previous, next);
      expectLaterFailureThrown(next);
    },
  );
});

const CALLBACK_ADOPTIONS: readonly [
  string,
  (previous: Tree, next: Tree) => void,
][] = [
  [
    'onChange',
    (previous, next) => {
      Reflect.set(previous.runtime, 'onChange', () =>
        adoptFieldNodeTree(previous.root, next.root),
      );
      previous.root.find('/second')?.setValue('c');
    },
  ],
  [
    'onChange through a batch, as a form reset does',
    (previous, next) => {
      Reflect.set(previous.runtime, 'onChange', () =>
        previous.root.batch(() => adoptAndFeed(previous, next)),
      );
      previous.root.find('/second')?.setValue('c');
    },
  ],
  [
    'onStateChange at a chain exit',
    (previous, next) => {
      Reflect.set(previous.runtime, 'onStateChange', () =>
        adoptFieldNodeTree(previous.root, next.root),
      );
      previous.root.batch(() => touchFirst(previous));
    },
  ],
  [
    'onStateChange in a standalone delivery',
    (previous, next) => {
      Reflect.set(previous.runtime, 'onStateChange', () =>
        adoptFieldNodeTree(previous.root, next.root),
      );
      touchFirst(previous);
    },
  ],
];

describe('adoption from a form callback or a nested chain', () => {
  it.each(CALLBACK_ADOPTIONS)(
    'adoption from %s leaves both runtimes resting',
    (_, run) => {
      const previous = createTree();
      const next = createTree();
      run(previous, next);
      expectResting(previous, next);
      const failure = new Error('later listener failed');
      next.root.subscribe(() => {
        throw failure;
      });
      expect(() => next.root.find('/second')?.setValue('later')).toThrow(
        failure,
      );
      expectResting(previous, next);
    },
  );

  it('a nested batch that adopts and throws hands the failure to its own caller', () => {
    const previous = createTree();
    const next = createTree();
    const failure = new Error('inner batch failed');
    let handled: unknown;
    expect(() =>
      previous.root.batch(() => {
        try {
          previous.root.batch(() => {
            adoptFieldNodeTree(previous.root, next.root);
            throw failure;
          });
        } catch (error) {
          handled = error;
        }
      }),
    ).not.toThrow();
    expect(handled).toBe(failure);
    expectResting(previous, next);
  });

  it('a standalone onStateChange that adopts and throws is thrown and reported once', () => {
    const reported: unknown[] = [];
    const previous = createTree(reported);
    const next = createTree(reported);
    const failure = new Error('state callback failed');
    Reflect.set(previous.runtime, 'onStateChange', () => {
      adoptFieldNodeTree(previous.root, next.root);
      throw failure;
    });
    expect(() => touchFirst(previous)).toThrow(failure);
    expect(countReported(reported, failure)).toBe(1);
    expectResting(previous, next);
  });

  it('listener failures before and after an adoption are thrown together and each reported once', () => {
    const reported: unknown[] = [];
    const previous = createTree(reported);
    const next = createTree(reported);
    const before = new Error('before adoption');
    const after = new Error('after adoption');
    previous.root.subscribe(() => {
      throw before;
    });
    previous.root.subscribe(() => {
      adoptFieldNodeTree(previous.root, next.root);
      throw after;
    });
    let thrown: unknown;
    try {
      previous.root.find('/second')?.setValue('c');
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaFormError);
    expect(
      Reflect.get(Reflect.get(Object(thrown), 'details'), 'errors'),
    ).toEqual([before, after]);
    expect(countReported(reported, before)).toBe(1);
    expect(countReported(reported, after)).toBe(1);
    expectResting(previous, next);
  });

  it('an adoption inside a nested onChange batch returns the enclosing chain its own errors', () => {
    const reported: unknown[] = [];
    const previous = createTree(reported);
    const next = createTree(reported);
    const failure = new Error('outer listener failed');
    let called = false;
    Reflect.set(previous.runtime, 'onChange', () =>
      previous.root.batch(() => adoptAndFeed(previous, next)),
    );
    previous.root.find('/first')?.subscribe(() => {
      if (called) return;
      called = true;
      const outer = Reflect.get(previous.runtime, 'chainErrors');
      previous.root.find('/second')?.setValue('c');
      expect(Reflect.get(previous.runtime, 'chainErrors')).toBe(outer);
      throw failure;
    });
    expect(() => touchFirst(previous)).toThrow(failure);
    expect(countReported(reported, failure)).toBe(1);
    expectResting(previous, next);
  });

  it('an adoption inside nested onChange calls keeps the 25-call limit', () => {
    const reported: unknown[] = [];
    const previous = createTree(reported);
    const next = createTree(reported);
    let calls = 0;
    let active = previous;
    const change = () => {
      calls += 1;
      if (calls === 5) {
        adoptFieldNodeTree(previous.root, next.root);
        active = next;
        expect(Reflect.get(next.runtime, 'onChangeBudget')).toBe(5);
      }
      active.root.find('/second')?.setValue(String(calls));
    };
    Reflect.set(previous.runtime, 'onChange', change);
    Reflect.set(next.runtime, 'onChange', change);
    let thrown: unknown;
    try {
      previous.root.find('/second')?.setValue('start');
    } catch (error) {
      thrown = error;
    }
    expect(calls).toBe(25);
    expect(Reflect.get(Object(thrown), 'code')).toBe(
      FormErrorCode.FeedbackLimitExceeded,
    );
    expect(countReported(reported, thrown)).toBe(1);
    expectResting(previous, next);
  });
});

describe('two adoptions in a row', () => {
  it('two chain-exit listeners that adopt in turn leave all three runtimes resting', () => {
    const previous = createTree();
    const middle = createTree();
    const last = createTree();
    previous.root.subscribe(() => adoptAndFeed(previous, middle));
    middle.root.subscribe(() => {
      adoptFieldNodeTree(middle.root, last.root);
      last.root.find('/first')?.setValue('last');
    });
    previous.root.find('/second')?.setValue('c');
    expectResting(previous, middle, last);
  });

  it('a standalone delivery that adopts twice leaves all three runtimes resting', () => {
    const previous = createTree();
    const middle = createTree();
    const last = createTree();
    previous.root.find('/first')?.subscribe(() => {
      adoptFieldNodeTree(previous.root, middle.root);
      adoptFieldNodeTree(middle.root, last.root);
    });
    touchFirst(previous);
    expectResting(previous, middle, last);
  });

  it('an onChange that adopts twice lowers the budget on every runtime it passed', () => {
    const previous = createTree();
    const middle = createTree();
    const last = createTree();
    Reflect.set(previous.runtime, 'onChange', () => {
      adoptFieldNodeTree(previous.root, middle.root);
      adoptFieldNodeTree(middle.root, last.root);
    });
    previous.root.find('/second')?.setValue('c');
    expectResting(previous, middle, last);
  });
});

describe('adoption limits', () => {
  it('a listener loop that moves to the new root keeps one 25-wave feedback budget', () => {
    const previous = createTree();
    const next = createTree();
    let calls = 0;
    const writeSecond = (tree: Tree) => {
      calls += 1;
      tree.root.find('/second')?.setValue(String(calls));
    };
    previous.root.subscribe((event) => {
      if (!(event.type & FieldNodeEventType.UpdateValue)) return;
      if (calls === 4) {
        calls += 1;
        adoptFieldNodeTree(previous.root, next.root);
        next.root.find('/second')?.setValue('adopted');
        return;
      }
      writeSecond(previous);
    });
    next.root.subscribe((event) => {
      if (event.type & FieldNodeEventType.UpdateValue) writeSecond(next);
    });
    let thrown: unknown;
    try {
      previous.root.find('/second')?.setValue('start');
    } catch (error) {
      thrown = error;
    }
    expect(Reflect.get(Object(thrown), 'code')).toBe(
      FormErrorCode.FeedbackLimitExceeded,
    );
    expect(calls).toBeLessThanOrEqual(26);
    expectResting(previous, next);
  });
});
