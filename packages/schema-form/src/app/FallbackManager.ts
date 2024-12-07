import type { ComponentType, MutableRefObject } from 'react';

import { remainOnlyReactComponent } from '@lumy-pack/common-react';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@lumy-form/components/FallbackComponents';
import { formatError } from '@lumy-form/components/utils/formatError';
import { formTypeDefinitions } from '@lumy-form/formTypeDefinitions';
import {
  type NormalizedFormTypeInputDefinition,
  normalizeFormTypeInputDefinitions,
} from '@lumy-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@lumy-form/types';

interface FormType {
  FormGroup: ComponentType<FormTypeRendererProps>;
  FormLabel: ComponentType<FormTypeRendererProps>;
  FormInput: ComponentType<FormTypeRendererProps>;
  FormError: ComponentType<FormTypeRendererProps>;
  formatError: FormatError;
}

const fallbackFormTypeRef: MutableRefObject<FormType> = {
  current: {
    FormGroup: FormGroupRenderer,
    FormLabel: FormLabelRenderer,
    FormInput: FormInputRenderer,
    FormError: FormErrorRenderer,
    formatError: formatError,
  },
};

const fallbackFormTypeInputDefinitionsRef: MutableRefObject<
  NormalizedFormTypeInputDefinition[]
> = {
  current: normalizeFormTypeInputDefinitions(formTypeDefinitions),
};

export const FallbackManager = {
  get FormGroup() {
    return fallbackFormTypeRef.current.FormGroup;
  },
  get FormLabel() {
    return fallbackFormTypeRef.current.FormLabel;
  },
  get FormInput() {
    return fallbackFormTypeRef.current.FormInput;
  },
  get FormError() {
    return fallbackFormTypeRef.current.FormError;
  },
  get formatError() {
    return fallbackFormTypeRef.current.formatError;
  },
  get formTypeInputDefinitions() {
    return fallbackFormTypeInputDefinitionsRef.current;
  },
  appendFormType(formType: Partial<FormType> | undefined) {
    if (!formType) return;
    const { formatError, ...FromTypes } = formType;
    fallbackFormTypeRef.current = {
      ...fallbackFormTypeRef.current,
      ...remainOnlyReactComponent(FromTypes),
      ...(formatError ? { formatError } : {}),
    };
  },
  appendFormTypeInputDefinitions(
    formTypeInputDefinitions: FormTypeInputDefinition[] | undefined,
  ) {
    if (!formTypeInputDefinitions) return;
    fallbackFormTypeInputDefinitionsRef.current = [
      ...normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
      ...fallbackFormTypeInputDefinitionsRef.current,
    ];
  },
};
