import type { ChildFieldProps, OverridableFieldInputProps } from '../field/fieldInput';

/** Compile-time proof that presentation cannot override binding-owned identity. */
const checkOverrides = (child: ChildFieldProps, override: OverridableFieldInputProps) => {
  // @ts-expect-error Binding identity is not a presentation override.
  child.inputId = 'replacement';
  // @ts-expect-error Binding title is not a presentation override.
  override.labelId = 'replacement';
  return [child, override];
};
void checkOverrides;
