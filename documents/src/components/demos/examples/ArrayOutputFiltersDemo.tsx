import React, { useEffect, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type SchemaNode,
  registerPlugin,
  useSchemaNodeTracker,
} from '@canard/schema-form';
import { plugin } from '@canard/schema-form-antd6-plugin';

import DemoWrapper from '../DemoWrapper';

registerPlugin(plugin);

const schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags — omitTrailing',
      description:
        'Three empty rows are offered up front; only what you filled in is emitted',
      minItems: 3,
      items: { type: 'string', placeholder: 'tag' },
      options: { omitTrailing: true },
    },
    notes: {
      type: 'array',
      title: 'Notes — no filter',
      description:
        'Same shape without the option: every offered row reaches the emitted value',
      minItems: 3,
      items: { type: 'string', placeholder: 'note' },
    },
    aliases: {
      type: 'array',
      title: 'Aliases — omitTrailing + omitEmpty: false',
      description:
        'Trailing rows are trimmed, but an all-empty array stays [] instead of disappearing',
      minItems: 3,
      items: { type: 'string', placeholder: 'alias' },
      options: { omitTrailing: true, omitEmpty: false },
    },
  },
};

const TRACKED_PATHS = ['/tags', '/notes', '/aliases'];

const CELL_STYLE = {
  padding: '4px 8px',
  borderTop: '1px solid var(--ifm-color-emphasis-300)',
} as const;

/** `JSON.stringify(undefined)` returns `undefined`, which React renders as nothing. */
const show = (value: unknown) => JSON.stringify(value) ?? 'undefined';

/**
 * One row of the two-channel table, tracking a single array node.
 * @remarks Each array node is tracked on its own: adding an empty row leaves the
 *          filtered root value untouched, so a root-level tracker would miss it.
 */
function ChannelRow({ node }: { node: SchemaNode }) {
  useSchemaNodeTracker(node);
  return (
    <tr>
      <td style={CELL_STYLE}>
        <code>{node.path}</code>
      </td>
      <td style={{ ...CELL_STYLE, textAlign: 'center' }}>
        {node.children?.length ?? 0}
      </td>
      <td style={CELL_STYLE}>
        <code>{show(node.value)}</code>
      </td>
      <td style={CELL_STYLE}>
        <code>{show(node.normalizedValue)}</code>
      </td>
    </tr>
  );
}

export default function ArrayOutputFiltersDemo() {
  const [values, setValues] = useState<unknown>({});
  const formRef = useRef<FormHandle>(null);
  const [nodes, setNodes] = useState<SchemaNode[]>([]);

  useEffect(() => {
    const handle = formRef.current;
    if (!handle) return;
    setNodes(
      TRACKED_PATHS.map((path) => handle.findNode(path)).filter(
        (node): node is SchemaNode => node !== null,
      ),
    );
  }, []);

  return (
    <DemoWrapper schema={schema} values={values}>
      <Form ref={formRef} jsonSchema={schema as any} onChange={setValues} />
      <table
        style={{
          marginTop: 16,
          width: '100%',
          fontSize: 13,
          fontFamily: 'var(--ifm-font-family-monospace)',
        }}
      >
        <thead>
          <tr>
            <th style={{ ...CELL_STYLE, textAlign: 'left' }}>path</th>
            <th style={CELL_STYLE}>rendered rows</th>
            <th style={{ ...CELL_STYLE, textAlign: 'left' }}>
              node.value (raw)
            </th>
            <th style={{ ...CELL_STYLE, textAlign: 'left' }}>
              node.normalizedValue (emitted)
            </th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <ChannelRow key={node.path} node={node} />
          ))}
        </tbody>
      </table>
    </DemoWrapper>
  );
}
