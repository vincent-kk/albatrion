import { type PropsWithChildren, useEffect, useMemo, useRef } from 'react';

import { useMemorize } from '@winglet/react-utils/hook';

import type { Fn } from '@aileron/declare';

import type { FormProps } from '@/schema-form/components/Form';
import {
  NodeEventType,
  type SchemaNode,
  ValidationMode,
  contextNodeFactory,
  nodeFromJsonSchema,
} from '@/schema-form/core';
import { transformErrors } from '@/schema-form/helpers/error';
import type {
  AllowedValue,
  JsonSchema,
  JsonSchemaError,
} from '@/schema-form/types';

import { useExternalFormContext } from '../ExternalFormContext';
import { useWorkspaceContext } from '../WorkspaceContext';
import { RootNodeContext } from './RootNodeContext';

const DEFAULT_VALIDATION_MODE =
  ValidationMode.OnChange | ValidationMode.OnRequest;

interface RootNodeContextProviderProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  /** JSON Schema to use within this SchemaForm */
  jsonSchema: FormProps<Schema, Value>['jsonSchema'];
  /** Default value for this SchemaForm */
  defaultValue?: FormProps<Schema, Value>['defaultValue'];
  /** Initial validation errors, defaults to undefined */
  errors?: FormProps<Schema, Value>['errors'];
  /** Function called when the value of this SchemaForm changes */
  onChange: NonNullable<FormProps<Schema, Value>['onChange']>;
  /** Function called when this SchemaForm is validated */
  onValidate: NonNullable<FormProps<Schema, Value>['onValidate']>;
  /** Function called when the state of this SchemaForm changes */
  onStateChange: NonNullable<FormProps<Schema, Value>['onStateChange']>;
  /** Function called when the root node of this SchemaForm is ready */
  onReady: Fn<[rootNode: SchemaNode]>;
  /**
   * Execute Validation Mode (default: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: Disable validation
   *  - `ValidationMode.OnChange`: Validate when value changes
   *  - `ValidationMode.OnRequest`: Validate on request
   */
  validationMode?: ValidationMode;
  /** ValidatorFactory declared externally, creates internally if not provided */
  validatorFactory?: FormProps<Schema, Value>['validatorFactory'];
}

export const RootNodeContextProvider = <
  Value extends AllowedValue,
  Schema extends JsonSchema,
>({
  jsonSchema,
  defaultValue,
  errors,
  onChange,
  onValidate,
  onStateChange,
  onReady,
  validationMode: inputValidationMode,
  validatorFactory: inputValidatorFactory,
  children,
}: PropsWithChildren<RootNodeContextProviderProps<Schema, Value>>) => {
  const {
    validationMode: externalValidationMode,
    validatorFactory: externalValidatorFactory,
  } = useExternalFormContext();
  const { context } = useWorkspaceContext();

  const contextNode = useMemorize(() => contextNodeFactory(context));
  useEffect(() => {
    contextNode.setValue(context);
  }, [contextNode, context]);

  const rootNode = useMemo(
    () =>
      nodeFromJsonSchema({
        jsonSchema,
        defaultValue,
        onChange,
        validationMode:
          inputValidationMode ??
          externalValidationMode ??
          DEFAULT_VALIDATION_MODE,
        validatorFactory: inputValidatorFactory || externalValidatorFactory,
        context: contextNode,
      }),
    [
      jsonSchema,
      defaultValue,
      onChange,
      inputValidationMode,
      externalValidationMode,
      inputValidatorFactory,
      externalValidatorFactory,
      contextNode,
    ],
  );
  useEffect(() => {
    if (!rootNode) return;
    const unsubscribe = rootNode.subscribe(({ type, payload }) => {
      if (type & NodeEventType.UpdateGlobalError)
        onValidate(payload?.[NodeEventType.UpdateGlobalError] || []);
      if (type & NodeEventType.UpdateGlobalState)
        onStateChange(payload?.[NodeEventType.UpdateGlobalState] || {});
    });
    onReady(rootNode);
    return unsubscribe;
  }, [rootNode, onValidate, onStateChange, onReady]);

  const lastErrorDictionary = useRef<
    Record<JsonSchemaError['dataPath'], JsonSchemaError[]>
  >({});

  useEffect(() => {
    if (!rootNode || !errors) return;

    const transformedErrors = transformErrors(errors, true);
    const currentErrorDictionary: Record<string, JsonSchemaError[]> = {};

    for (const error of transformedErrors) {
      if (!currentErrorDictionary[error.dataPath])
        currentErrorDictionary[error.dataPath] = [];
      currentErrorDictionary[error.dataPath].push(error);
    }

    rootNode.setExternalErrors(transformedErrors);

    const paths = new Set([
      ...Object.keys(lastErrorDictionary.current),
      ...Object.keys(currentErrorDictionary),
    ]);
    for (const path of paths)
      rootNode.find(path)?.setExternalErrors(currentErrorDictionary[path]);

    lastErrorDictionary.current = currentErrorDictionary;
  }, [rootNode, errors]);

  return (
    <RootNodeContext.Provider value={rootNode}>
      {children}
    </RootNodeContext.Provider>
  );
};
