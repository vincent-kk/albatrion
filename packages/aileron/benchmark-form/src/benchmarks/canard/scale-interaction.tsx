import { createRoot } from 'react-dom/client';

import type { JsonSchema, Form as SchemaForm } from '@canard/schema-form';

import {
  FLAT_CASES,
  NESTED_CASES,
  type ScaleCase,
} from '../../fixtures/scale-schemas';
import { drainTicks, setupJsdom } from '../../utils/setup-env';

setupJsdom();

const CHANGES_PER_OP = 10;

interface ReactPropsBag {
  onChange?: (event: unknown) => void;
}

/**
 * Fire N onChange events on the first N <input> elements found inside
 * `container`. Reuses React's synthetic-event shortcut (the
 * `__reactProps$*` private key on the DOM node) so the path is the same
 * one schema-form sees from real user typing — but without paying the
 * full JSDOM event dispatch cost.
 */
async function fireChanges(container: HTMLElement, count: number) {
  const inputs = container.querySelectorAll('input');
  const target = Math.min(inputs.length, count);
  for (let i = 0; i < target; i++) {
    const input = inputs[i] as HTMLInputElement;
    const propsKey = Object.getOwnPropertyNames(input).find((k) =>
      k.startsWith('__reactProps$'),
    );
    if (!propsKey) continue;
    const props = (input as unknown as Record<string, ReactPropsBag>)[propsKey];
    input.value = `v_${i}`;
    if (props.onChange) {
      props.onChange({
        target: input,
        currentTarget: input,
        type: 'change',
        bubbles: true,
        cancelable: true,
        preventDefault: () => {},
        stopPropagation: () => {},
      });
    }
  }
  await drainTicks();
}

/**
 * 1 op = mount + N onChange + drain + unmount.
 *
 * Combined cost. To isolate per-change latency, subtract the matching
 * Scale Render entry's mean time.
 */
function makeScaleInteractionRunner(schema: JsonSchema) {
  return async function run(SchemaFormModule: { Form: typeof SchemaForm }) {
    const { Form } = SchemaFormModule;
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    try {
      root.render(
        <Form jsonSchema={schema} onValidate={() => {}} onChange={() => {}} />,
      );
      await drainTicks();
      await fireChanges(container, CHANGES_PER_OP);
    } finally {
      root.unmount();
      container.remove();
    }
  };
}

export interface ScaleRunner {
  category: string;
  run: (mod: { Form: typeof SchemaForm }) => Promise<void>;
}

function toRunners(prefix: string, cases: ScaleCase[]): ScaleRunner[] {
  return cases.map(({ label, schema }) => ({
    category: `${prefix} ${label}`,
    run: makeScaleInteractionRunner(schema),
  }));
}

export const SCALE_INTERACTION_RUNNERS: ScaleRunner[] = [
  ...toRunners('Scale Interact Flat', FLAT_CASES),
  ...toRunners('Scale Interact Nested', NESTED_CASES),
];
