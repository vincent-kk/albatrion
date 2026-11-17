import { useEffect, useRef, useState } from 'react';

import type { ScenarioFormProps } from '../types';
import { registerScenarioHandle } from '../utils/registerScenarioHandle';

/**
 * Render an injected form and register its handle for a shared screen scenario.
 * @param props - Scenario data, compatible form component, and adapter factory.
 * @returns A scoped form wrapper; React owns registration cleanup on unmount.
 */
export function ScenarioForm<Schema, Value, Handle extends object>({
  scenario,
  Form,
  createAdapter,
}: ScenarioFormProps<Schema, Value, Handle>) {
  const root = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState<Handle | null>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !handle) return;
    return registerScenarioHandle(element, handle, createAdapter(handle, element));
  }, [handle, createAdapter]);
  return (
    <div ref={root} data-scenario-name={scenario.name}>
      <Form
        jsonSchema={scenario.schema}
        defaultValue={scenario.initialValue}
        ref={setHandle}
      />
    </div>
  );
}
