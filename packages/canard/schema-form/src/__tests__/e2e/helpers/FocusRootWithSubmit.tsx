import type { FieldInputProps } from '@/schema-form';

/** Native submission is available even while the late fields remain deferred. */
export const FocusRootWithSubmit = ({ ChildFields }: FieldInputProps) => (
  <>
    {ChildFields.map((Child) => (
      <Child key={Child.key} />
    ))}
    <button type="submit">submit</button>
  </>
);
