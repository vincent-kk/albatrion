import { Form as BaseFrom } from './Form';
import {
  FormError,
  FormGroup,
  FormInput,
  FormLabel,
  FormRender,
} from './components';

export type { FormChildrenProps, FormProps, FormHandle } from './type';

export const Form = Object.assign(BaseFrom, {
  Render: FormRender,
  Group: FormGroup,
  Label: FormLabel,
  Input: FormInput,
  Error: FormError,
});
