import React, { useEffect, useRef, useState } from 'react';

import {
  Form,
  VirtualizationBackfill,
  registerPlugin,
} from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const FIELD_COUNT = 300;

const schema = {
  type: 'object',
  properties: Object.fromEntries(
    Array.from({ length: FIELD_COUNT }, (_, index) => [
      `field_${index}`,
      {
        type: 'string',
        title: `Field ${index}`,
        default: `value ${index}`,
      },
    ]),
  ),
};

/**
 * Placeholders are bare divs carrying `data-path` + `data-deferred`; this demo
 * styles them as shimmer skeletons purely via the attribute selector.
 */
const SKELETON_CSS = `
  .virtualized-demo [data-deferred] {
    margin: 6px 0;
    border-radius: 6px;
    background: linear-gradient(90deg, var(--ifm-color-emphasis-200) 25%, var(--ifm-color-emphasis-100) 50%, var(--ifm-color-emphasis-200) 75%);
    background-size: 200% 100%;
    animation: virtualized-demo-shimmer 1.2s ease-in-out infinite;
  }
  @keyframes virtualized-demo-shimmer {
    from { background-position: 200% 0; }
    to { background-position: -200% 0; }
  }
`;

export default function VirtualizedFormDemo() {
  const [values, setValues] = useState<unknown>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(0);
  const [deferred, setDeferred] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const root = scrollRef.current;
      if (!root) return;
      setMounted(root.querySelectorAll('input').length);
      setDeferred(root.querySelectorAll('[data-deferred]').length);
    }, 200);
    return () => clearInterval(id);
  }, []);

  return (
    <DemoWrapper schema={schema} values={values}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1,
          padding: '6px 12px',
          marginBottom: 8,
          borderRadius: 6,
          background: 'var(--ifm-color-emphasis-800)',
          color: 'var(--ifm-color-emphasis-0)',
          fontFamily: 'var(--ifm-font-family-monospace)',
          fontSize: 13,
        }}
      >
        mounted inputs <strong>{mounted}</strong> / {FIELD_COUNT} · skeleton
        placeholders <strong>{deferred}</strong>
      </div>
      <div
        ref={scrollRef}
        className="virtualized-demo"
        style={{
          height: 420,
          overflow: 'auto',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 6,
          padding: '0 12px',
        }}
      >
        <style>{SKELETON_CSS}</style>
        <Form
          jsonSchema={schema as any}
          onChange={setValues}
          virtualization={{ backfill: VirtualizationBackfill.None }}
        />
      </div>
    </DemoWrapper>
  );
}
