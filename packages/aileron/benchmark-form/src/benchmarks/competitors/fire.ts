interface ReactPropsBag {
  onChange?: (event: unknown) => void;
}

/**
 * Fire a synthetic React onChange on a real <input>, mirroring how
 * scale-interaction.tsx drives schema-form: set the DOM value, then invoke
 * the React-attached onChange via the `__reactProps$*` private key. This is
 * the same path every library sees from user typing, minus the JSDOM event
 * dispatch cost — and it is IDENTICAL across libraries, so the keystroke
 * comparison stays fair (no library pays a different event tax).
 */
export function fireReactChange(input: HTMLInputElement, value: string): void {
  const key = Object.getOwnPropertyNames(input).find((k) =>
    k.startsWith('__reactProps$'),
  );
  if (!key) throw new Error('input has no React props (not React-mounted?)');
  const props = (input as unknown as Record<string, ReactPropsBag>)[key];
  input.value = value;
  props.onChange?.({
    target: input,
    currentTarget: input,
    type: 'change',
    bubbles: true,
    cancelable: true,
    preventDefault: () => {},
    stopPropagation: () => {},
  });
}
