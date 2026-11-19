import type { FieldInputProps, ChildFieldProps, OverridableFieldInputProps } from '../index';

/** Compile-time proof of binding ownership and required keyed identity. */
const checkIdentifierProps = (props: FieldInputProps) => {
  const absent: undefined = props.id;
  props.getInputId('range-start');
  props.getInputId(0);
  // @ts-expect-error A keyed control requires a key.
  props.getInputId();
  // @ts-expect-error The removed id prop cannot carry a string.
  props.id = 'legacy';
  return absent;
};
/** Compile-time proof that child presentation cannot override binding ids. */
const checkOverrides = (child: ChildFieldProps, override: OverridableFieldInputProps) => {
  // @ts-expect-error Binding identity is not a presentation override.
  child.inputId = 'replacement';
  // @ts-expect-error Binding title is not a presentation override.
  override.labelId = 'replacement';
  return [child, override];
};
void checkIdentifierProps;
void checkOverrides;
