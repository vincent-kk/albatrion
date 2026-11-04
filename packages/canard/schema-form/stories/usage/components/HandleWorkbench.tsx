import { useRef, useState } from 'react';

import { Form, ValidationMode, type FormHandle, type JSONSchema } from '../../../src';

import { toDisplayJSON } from '../../components/panels/toDisplayJSON';
import { ajvValidatorPlugin } from '../../components/validator';
import { MultipleFileInput, SingleFileInput } from '../../features/input-components/utils/FileInput';
import type { HandleCall, HandleWorkbenchProps } from './types';
import { getHandleActions } from './utils/getHandleActions';

/** Native file consumers mapped to the input types in the shared upload scenario. */
const fileDefinitions = [
  { test: { inputType: 'input-components.file' }, Component: SingleFileInput },
  { test: { inputType: 'input-components.files' }, Component: MultipleFileInput },
];

/**
 * Render a shared-data form and record imperative method calls made by its buttons.
 * @param props - Scenario data and the group of public handle methods to demonstrate.
 * @returns A Form, method buttons and a Call log table containing immutable snapshots.
 */
export function HandleWorkbench({ scenario, example }: HandleWorkbenchProps) {
  const handle = useRef<FormHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const [calls, setCalls] = useState<HandleCall[]>([]);
  const [pending, setPending] = useState(false);
  const actions = getHandleActions(example);
  return <section ref={root}>
    <Form ref={handle} jsonSchema={scenario.schema as JSONSchema} defaultValue={scenario.initialValue}
      validatorFactory={ajvValidatorPlugin} validationMode={ValidationMode.OnRequest} showError={false}
      fieldInputDefinitions={example === 'AttachedFiles' ? fileDefinitions : undefined}
      onSubmit={(value) => { setCalls((records) => [...records, { method: 'onSubmit', args: toDisplayJSON([value]), result: toDisplayJSON(value), kind: 'sync' }]); }} />
    <div>{actions.map((action) => <button key={action.label} type="button" disabled={pending} onClick={async () => {
      if (!handle.current || !root.current) return;
      setPending(true);
      let kind: HandleCall['kind'] = 'sync';
      let result: unknown;
      try {
        const returned = action.run(handle.current, root.current);
        if (returned instanceof Promise) { kind = action.method === 'validate' || action.method === 'submit' ? 'async' : 'sync'; result = await returned; }
        else result = returned;
      } catch (error) {
        kind = 'throw';
        result = error instanceof Error ? { name: error.name, message: error.message, ...('code' in error && { code: error.code }) } : error;
      }
      const record: HandleCall = { method: action.method, args: toDisplayJSON(action.args), result: toDisplayJSON(result), kind };
      setCalls((records) => [...records, record]);
      setPending(false);
    }}>{action.label}</button>)}</div>
    <table aria-label="Call log"><thead><tr><th>#</th><th>Method</th><th>Arguments</th><th>Result</th><th>Completion</th></tr></thead><tbody>
      {calls.map((call, index) => <tr key={index}><td>{index + 1}</td><td>{call.method}</td><td><pre>{call.args}</pre></td><td><pre>{call.result}</pre></td><td>{call.kind}</td></tr>)}
    </tbody></table>
  </section>;
}
