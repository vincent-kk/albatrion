import { useLayoutEffect, useRef, useState } from 'react';

import type { FormTypeInputProps } from '../../../src';

/**
 * Keep the IME draft local; publish only the completed text through the binding.
 * @param props - The node binding; format selects the caret-preserving formatter.
 * @returns A controlled text input with composition-aware publication.
 */
export function CompositionInput({ value, onChange, path, jsonSchema }: FormTypeInputProps) {
  const [draft, setDraft] = useState(String(value ?? ''));
  const composing = useRef(false);
  useLayoutEffect(() => {
    if (!composing.current) setDraft(String(value ?? ''));
  }, [value]);
  return <input id={path} value={draft}
    onInput={(event) => {
      if (composing.current) setDraft(event.currentTarget.value);
    }}
    onCompositionStart={() => { composing.current = true; }}
    onCompositionEnd={(event) => {
      composing.current = false;
      setDraft(event.currentTarget.value);
      onChange(event.currentTarget.value);
    }}
    onChange={(event) => {
      const input = event.currentTarget;
      if (composing.current) { setDraft(input.value); return; }
      const caret = input.selectionStart;
      const next = jsonSchema.format === 'caret' ? input.value.toUpperCase() : input.value;
      setDraft(next);
      onChange(next);
      if (jsonSchema.format === 'caret') queueMicrotask(() => input.setSelectionRange(caret, caret));
    }} />;
}
