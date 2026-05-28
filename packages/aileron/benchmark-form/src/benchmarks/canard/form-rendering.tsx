import { createRoot } from 'react-dom/client';

import type { Form as SchemaForm } from '@canard/schema-form';

import { sampleSchemas } from '../../fixtures/schemas';
import { drainTicks, setupJsdom } from '../../utils/setup-env';

setupJsdom();

/**
 * v2 Form Rendering — single fresh-root mount/unmount per op.
 *
 * Differences from the legacy `runFormRenderingBenchmark`:
 *  - 1 op = 1 fresh `<Form>` mount (legacy reused one root for 4 schemas
 *    → measured mount + 3 reconciles)
 *  - Single complex schema (index 2). Other schemas measured by separate
 *    suite entries if needed (avoid muddling per-schema cost into one hz).
 *  - Cleanup uses `unmount()` + element removal so memory does not leak
 *    across iterations and JIT does not get a warmer cache mid-suite.
 *  - `drainTicks()` (setTimeout(0)) is the only async wait — no 16ms /
 *    100ms wall-clock injection.
 */
export async function runFormRenderingV2(SchemaFormModule: {
  Form: typeof SchemaForm;
}) {
  const { Form } = SchemaFormModule;
  const schema = sampleSchemas[2];

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
}
