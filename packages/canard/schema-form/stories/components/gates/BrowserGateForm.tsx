import { StrictMode, useLayoutEffect, useMemo, useRef } from 'react';

import { Form, VirtualizationBackfill, type FormHandle, type FormTypeInputProps, type JSONSchema } from '../../../src';

import { CompositionInput } from './CompositionInput';
import type { BrowserGateElement, BrowserGateObservations } from './types';

/** Instrument actual input commits; render counts do not identify remounts. */
function TrackedInput(props: FormTypeInputProps) {
  const observations = props.context as unknown as BrowserGateObservations;
  const { path, ChildNodeComponents, jsonSchema } = props;
  useLayoutEffect(() => {
    observations.mounts[path] = (observations.mounts[path] ?? 0) + 1;
  }, [observations, path]);
  observations.inputs[path] = props;
  if (jsonSchema.format === 'children') return <div data-container={path}>
    {ChildNodeComponents.map((Child) => <Child key={Child.key} />)}
  </div>;
  return <input id={path} defaultValue={typeof props.value === 'string' ? props.value : JSON.stringify(props.value ?? '')}
    onChange={(event) => props.onChange(event.currentTarget.value)} />;
}

/** Measure repeated reads of the actual detected list against a frozen empty list. */
function MeasuredChildren(props: FormTypeInputProps) {
  const observations = props.context as unknown as BrowserGateObservations;
  useLayoutEffect(() => {
    const plain = Object.freeze([]);
    const reads = 100_000;
    let checksum = 0;
    const plainStart = performance.now();
    for (let index = 0; index < reads; index++) checksum += plain.length;
    const plainMs = performance.now() - plainStart;
    const detectedStart = performance.now();
    for (let index = 0; index < reads; index++) checksum += props.ChildNodeComponents.length;
    observations.childReads.push({ detectedMs: performance.now() - detectedStart, plainMs, reads });
    if (checksum !== 0) throw new Error('Terminal child list must be empty');
  }, [observations, props.ChildNodeComponents]);
  return <span>{props.ChildNodeComponents.length}</span>;
}

/**
 * Render one public Form fixture and expose its handle on the story root for play.
 * @param props - Gate mode selects the browser contract being exercised.
 * @returns A StrictMode fixture for remount tests and a plain fixture otherwise.
 */
export function BrowserGateForm({ mode }: { mode: 'ime' | 'number' | 'remount' | 'cost' }) {
  const root = useRef<BrowserGateElement>(null);
  const handle = useRef<FormHandle>(null);
  const observations = useMemo<BrowserGateObservations>(() => ({ mounts: {}, changes: [], warnings: [], childReads: [], inputs: {} }), []);
  const schema = useMemo<JSONSchema>(() => {
    if (mode === 'ime') return { type: 'object', properties: {
      plain: { type: 'string', presentation: { FormTypeInput: CompositionInput } },
      formatter: { type: 'string', format: 'caret', presentation: { FormTypeInput: CompositionInput } },
      refresh: { type: 'string', presentation: { FormTypeInput: CompositionInput } },
    } };
    if (mode === 'number') return { type: 'number' };
    if (mode === 'cost') return { type: 'string', presentation: { FormTypeInput: MeasuredChildren } };
    return { type: 'object', format: 'children', properties: {
      terminal: { type: 'string', presentation: { FormTypeInput: TrackedInput } },
      branch: { type: 'object', format: 'children', properties: {
        leaf: { type: 'string', presentation: { FormTypeInput: TrackedInput } },
      } },
      whole: { type: 'object', presentation: { FormTypeInput: TrackedInput }, properties: { leaf: { type: 'string' } } },
      empty: { type: 'array', format: 'children', items: { type: 'string' } },
      collapsed: { type: 'object', presentation: { FormTypeInput: TrackedInput }, properties: { leaf: { type: 'string' } } },
      virtual: { type: 'array', items: { type: 'string', presentation: { FormTypeInput: TrackedInput } } },
    } };
  }, [mode]);
  useLayoutEffect(() => {
    const element = root.current!;
    element.gate = { handle: handle.current!, observations };
    return () => { delete element.gate; };
  }, [observations]);
  const form = <Form ref={handle} jsonSchema={schema} context={observations}
    formTypeInputDefinitions={mode === 'remount' ? [
      { test: { type: 'object', format: 'children' }, Component: TrackedInput },
      { test: { type: 'array', format: 'children' }, Component: TrackedInput },
    ] : undefined}
    defaultValue={mode === 'number' ? 7 : mode === 'remount' ? {
      terminal: 'initial', branch: { leaf: 'initial' }, whole: { leaf: 'initial' }, empty: [],
      collapsed: { leaf: 'initial' }, virtual: Array.from({ length: 20 }, (_, index) => `row-${index}`),
    } : mode === 'ime' ? { plain: '', formatter: '', refresh: '' } : ''}
    virtualization={mode === 'remount' ? { threshold: 10, eagerCount: 1, backfill: VirtualizationBackfill.None } : false}
    onChange={(value) => { observations.changes.push(value); }}
    onError={({ code }) => { observations.warnings.push(code); }} />;
  return <div ref={root} data-browser-gate={mode} style={mode === 'remount' ? { maxHeight: 200, overflow: 'auto' } : undefined}>
    {mode === 'remount' ? <StrictMode>{form}</StrictMode> : form}
  </div>;
}
