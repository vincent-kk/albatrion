import type { ComponentType, MutableRefObject } from 'react';

import { removeUndefined } from '@lumy-pack/common';

import {
  FormErrorRenderer,
  FormGroupRenderer,
  FormInputRenderer,
  FormLabelRenderer,
} from '@lumy/schema-form/components/FallbackComponents';
import { formatError } from '@lumy/schema-form/components/utils/formatError';
import { formTypeDefinitions } from '@lumy/schema-form/formTypeDefinitions';
import {
  type NormalizedFormTypeInputDefinition,
  normalizeFormTypeInputDefinitions,
} from '@lumy/schema-form/helpers/formTypeInputDefinition';
import type {
  FormTypeInputDefinition,
  FormTypeRendererProps,
  FormatError,
} from '@lumy/schema-form/types';

interface FormType {
  FormGroup: ComponentType<FormTypeRendererProps>;
  FormLabel: ComponentType<FormTypeRendererProps>;
  FormInput: ComponentType<FormTypeRendererProps>;
  FormError: ComponentType<FormTypeRendererProps>;
  formatError: FormatError;
}

const baseFormTypeRef: MutableRefObject<FormType> = {
  current: {
    FormGroup: FormGroupRenderer,
    FormLabel: FormLabelRenderer,
    FormInput: FormInputRenderer,
    FormError: FormErrorRenderer,
    formatError: formatError,
  },
};

const baseFormTypeInputDefinitionsRef: MutableRefObject<
  NormalizedFormTypeInputDefinition[]
> = {
  current: normalizeFormTypeInputDefinitions(formTypeDefinitions),
};

export const BaseFormTypeManager = {
  get FormGroup() {
    return baseFormTypeRef.current.FormGroup;
  },
  get FormLabel() {
    return baseFormTypeRef.current.FormLabel;
  },
  get FormInput() {
    return baseFormTypeRef.current.FormInput;
  },
  get FormError() {
    return baseFormTypeRef.current.FormError;
  },
  get formatError() {
    return baseFormTypeRef.current.formatError;
  },
  get formTypeInputDefinitions() {
    return baseFormTypeInputDefinitionsRef.current;
  },
  appendFormType(formType: Partial<FormType> | undefined) {
    if (!formType) return;
    baseFormTypeRef.current = {
      ...baseFormTypeRef.current,
      ...removeUndefined(formType),
    };
  },
  appendFormTypeInputDefinitions(
    formTypeInputDefinitions: FormTypeInputDefinition[] | undefined,
  ) {
    if (!formTypeInputDefinitions) return;
    baseFormTypeInputDefinitionsRef.current = [
      ...normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
      ...baseFormTypeInputDefinitionsRef.current,
    ];
  },
};
