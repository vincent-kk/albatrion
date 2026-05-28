import { createRoot } from 'react-dom/client';

import type { JsonSchema, Form as SchemaForm } from '@canard/schema-form';

import {
  ARRAY_CASES,
  FLAT_CASES,
  NESTED_CASES,
  ONEOF_HEAVY_CASES,
  type ScaleCase,
} from '../../fixtures/scale-schemas';
import { drainTicks, setupJsdom } from '../../utils/setup-env';

setupJsdom();

/**
 * Per-op fresh-root mount of a single scale case. Mirrors the v2
 * form-rendering pattern: 1 op = setup + mount + drainTicks + unmount.
 */
function makeScaleRenderingRunner(schema: JsonSchema) {
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
    run: makeScaleRenderingRunner(schema),
  }));
}

export const SCALE_RENDERING_RUNNERS: ScaleRunner[] = [
  ...toRunners('Scale Render Flat', FLAT_CASES),
  ...toRunners('Scale Render Nested', NESTED_CASES),
  ...toRunners('Scale Render Array', ARRAY_CASES),
  ...toRunners('Scale Render OneOf', ONEOF_HEAVY_CASES),
];
