import { createRef } from 'react';

import { createRoot } from 'react-dom/client';

import type {
  ArrayNode,
  FormHandle,
  Form as SchemaForm,
} from '@canard/schema-form';

import { buildArraySchema } from '../../fixtures/scale-schemas';
import { drainTicks, drainUntilReady, setupJsdom } from '../../utils/setup-env';

setupJsdom();

/**
 * Array-node stress benches — 1 op = fresh mount + array ops + unmount.
 *
 * A persistent-node design (mount once, `clear()` + re-push every op) was
 * tried and rejected: `drainTicks(0)` does not reliably flush the unmount
 * of 100 array children between ops, so state leaked across iterations and
 * the `push` lane variance exploded to ±160%. Mounting fresh per op keeps
 * each measurement independent — the mount baseline (~1.86ms) is a constant
 * offset that can be subtracted using the `Form Rendering` entry.
 *
 * Run with a high sweep count (`--repeat=15 --min-samples=10`) for a
 * stable mean — single-sweep std is ±20%+ for these micro operations.
 */

const EMPTY_ARRAY_SCHEMA = buildArraySchema(0);

const SAMPLE_ITEMS = Array.from({ length: 1000 }, (_, i) => ({
  id: `s-${i}`,
  name: `item-${i}`,
  active: i % 2 === 0,
}));

type Form = typeof SchemaForm;

async function mountWithArrayNode(SchemaFormModule: { Form: Form }) {
  const { Form } = SchemaFormModule;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = createRef<FormHandle<typeof EMPTY_ARRAY_SCHEMA>>();

  root.render(
    <Form
      ref={ref}
      jsonSchema={EMPTY_ARRAY_SCHEMA}
      onValidate={() => {}}
      onChange={() => {}}
    />,
  );

  // The imperative handle's `findNode` only resolves once `rootNode` is
  // committed (≥2 ticks). Poll until it does — throwing (not returning a
  // null node) if it never resolves, so a broken setup fails loudly
  // instead of silently measuring an empty mount.
  await drainUntilReady(() => ref.current?.findNode('/items') != null);

  const node = ref.current!.findNode('/items') as ArrayNode;
  const teardown = () => {
    root.unmount();
    container.remove();
  };
  return { node, teardown };
}

const PUSH_COUNT = 100;
const APPLY_COUNT = 200;
const REMOVE_COUNT = 100;

async function runPushStress(mod: { Form: Form }) {
  const { node, teardown } = await mountWithArrayNode(mod);
  try {
    for (let i = 0; i < PUSH_COUNT; i++) node.push(SAMPLE_ITEMS[i]);
    await drainTicks();
  } finally {
    teardown();
  }
}

async function runApplyValue(mod: { Form: Form }) {
  const { node, teardown } = await mountWithArrayNode(mod);
  try {
    node.setValue(SAMPLE_ITEMS.slice(0, APPLY_COUNT));
    await drainTicks();
  } finally {
    teardown();
  }
}

async function runSplice(mod: { Form: Form }) {
  const { node, teardown } = await mountWithArrayNode(mod);
  try {
    for (let i = 0; i < REMOVE_COUNT; i++) node.push(SAMPLE_ITEMS[i]);
    await drainTicks();
    for (let i = REMOVE_COUNT - 1; i >= 0; i--) node.remove(i);
    await drainTicks();
  } finally {
    teardown();
  }
}

export interface ScaleRunner {
  category: string;
  run: (mod: { Form: Form }) => Promise<void>;
}

export const ARRAY_STRESS_RUNNERS: ScaleRunner[] = [
  { category: `Array Stress push x${PUSH_COUNT}`, run: runPushStress },
  { category: `Array Stress applyValue ${APPLY_COUNT}`, run: runApplyValue },
  {
    category: `Array Stress push+remove x${REMOVE_COUNT}`,
    run: runSplice,
  },
];
