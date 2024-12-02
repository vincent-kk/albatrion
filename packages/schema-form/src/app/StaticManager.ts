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

const staticFormTypeRef: MutableRefObject<FormType> = {
  current: {
    FormGroup: FormGroupRenderer,
    FormLabel: FormLabelRenderer,
    FormInput: FormInputRenderer,
    FormError: FormErrorRenderer,
    formatError: formatError,
  },
};

const staticFormTypeInputDefinitionsRef: MutableRefObject<
  NormalizedFormTypeInputDefinition[]
> = {
  current: normalizeFormTypeInputDefinitions(formTypeDefinitions),
};

export const StaticManager = {
  get FormGroup() {
    return staticFormTypeRef.current.FormGroup;
  },
  get FormLabel() {
    return staticFormTypeRef.current.FormLabel;
  },
  get FormInput() {
    return staticFormTypeRef.current.FormInput;
  },
  get FormError() {
    return staticFormTypeRef.current.FormError;
  },
  get formatError() {
    return staticFormTypeRef.current.formatError;
  },
  get formTypeInputDefinitions() {
    return staticFormTypeInputDefinitionsRef.current;
  },
  appendFormType(formType: Partial<FormType> | undefined) {
    if (!formType) return;
    staticFormTypeRef.current = {
      ...staticFormTypeRef.current,
      ...removeUndefined(formType),
    };
  },
  appendFormTypeInputDefinitions(
    formTypeInputDefinitions: FormTypeInputDefinition[] | undefined,
  ) {
    if (!formTypeInputDefinitions) return;
    staticFormTypeInputDefinitionsRef.current = [
      ...normalizeFormTypeInputDefinitions(formTypeInputDefinitions),
      ...staticFormTypeInputDefinitionsRef.current,
    ];
  },
};
