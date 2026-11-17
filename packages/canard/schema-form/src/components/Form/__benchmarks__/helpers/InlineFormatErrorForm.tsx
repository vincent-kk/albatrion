import type { Ref } from 'react';

import { Form } from '../../Form';
import type { FormHandle, FormProps } from '../../components/FormCore';

/** Render the default Form with a fresh formatter whenever its benchmark parent renders. */
export function InlineFormatErrorForm(
  props: FormProps & { ref: Ref<FormHandle> },
) {
  return <Form {...props} formatError={(error) => error.message} />;
}
