import type { FieldInputProps } from '../../index';

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
void checkIdentifierProps;
