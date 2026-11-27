import {
  ErrorVisibility,
  FieldNodeState,
  type FormHandle,
  type FormProps,
  type FormProviderProps,
  type useChildFieldErrors,
} from '@/schema-form';
// @ts-expect-error Removed policy enum has no alias.
import { ShowError } from '@/schema-form';

declare const handle: FormHandle;
declare const result: ReturnType<typeof useChildFieldErrors>;
const form: Pick<FormProps, 'errorVisibility'> = {
  errorVisibility: ErrorVisibility.AfterEditOrTouch,
};
const provider: Pick<FormProviderProps, 'errorVisibility'> = form;
handle.revealErrors();
handle.resetErrorVisibility();
result.errorVisible satisfies boolean;
result.childErrorVisibleList satisfies boolean[];
FieldNodeState.ErrorVisibility satisfies number;
// @ts-expect-error Boolean policy values are rejected.
form.errorVisibility = true;
// @ts-expect-error Numeric masks are rejected.
provider.errorVisibility = 4;
// @ts-expect-error Arbitrary strings are rejected.
form.errorVisibility = 'always';
// @ts-expect-error Removed Form prop has no compatibility acceptance.
const oldForm: Partial<FormProps> = { showError: true };
// @ts-expect-error Removed Provider prop has no compatibility acceptance.
const oldProvider: Partial<FormProviderProps> = { showError: false };
// @ts-expect-error Removed handle method has no alias.
handle.showError();
// @ts-expect-error Reveal has no boolean argument.
handle.revealErrors(false);
// @ts-expect-error Reset has no boolean argument.
handle.resetErrorVisibility(false);
// @ts-expect-error Removed state member has no alias.
FieldNodeState.ErrorVisible;
// @ts-expect-error Design-only intermediate name is not public.
FieldNodeState.ErrorVisibilityOverride;
// @ts-expect-error Removed aggregate key has no alias.
result.showError;
// @ts-expect-error Removed child list key has no alias.
result.showErrors;
void [provider, oldForm, oldProvider, ShowError];
