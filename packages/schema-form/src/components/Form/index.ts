import { Form as FormBase } from './Form';
import { FormGroup } from './FormGroup';
import { FormInput } from './FormInput';
import { FormRender } from './FormRender';

export type { FormChildrenProps, FormProps, FormHandle } from './Form/type';

export const Form = Object.assign(FormBase, {
  Input: FormInput,
  Group: FormGroup,
  Render: FormRender,
});
