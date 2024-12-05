import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { falseFunction, isFunction, trueFunction } from '@lumy-pack/common';

import {
  MethodType,
  type SchemaNode,
  isSchemaNode,
} from '@lumy/schema-form/core';
import {
  checkComputedOptionFactory,
  getWatchValuesFactory,
} from '@lumy/schema-form/helpers/dynamicFunction';
import { getFallbackValue } from '@lumy/schema-form/helpers/fallbackValue';
import { useSchemaNodeContext } from '@lumy/schema-form/providers';

import { useSchemaNodeTracker } from './useSchemaNodeTracker';

export const usePrepareSchemaValues = (
  input?: SchemaNode | string,
): {
  node: SchemaNode | null;
  visible: boolean;
  disabled: boolean;
  readOnly: boolean;
  watchValues: any[];
} => {
  const { rootNode } = useSchemaNodeContext();

  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else if (typeof input === 'string') return rootNode.findNode(input);
    else return null;
  }, [input, rootNode]);

  useSchemaNodeTracker(node, [
    MethodType.Change,
    MethodType.StateChange,
    MethodType.Validate,
  ]);

  const {
    dependencyPaths,
    checkVisible,
    checkDisabled,
    checkReadOnly,
    getWatchValues,
  } = useMemo(() => {
    const dependencyPaths: string[] = [];
    const jsonSchema = node?.jsonSchema;

    const visible = jsonSchema?.renderOptions?.visible;
    const isHidden = visible === false || jsonSchema?.visible === false;
    const checkVisible = isHidden
      ? falseFunction
      : checkComputedOptionFactory(dependencyPaths, visible);

    const disabled = jsonSchema?.renderOptions?.disabled;
    const isDisabled = disabled === true || jsonSchema?.disabled === true;
    const checkDisabled = isDisabled
      ? trueFunction
      : checkComputedOptionFactory(dependencyPaths, disabled);

    const readOnly = jsonSchema?.renderOptions?.readOnly;
    const isReadOnly = readOnly === true || jsonSchema?.readOnly === true;
    const checkReadOnly = isReadOnly
      ? trueFunction
      : checkComputedOptionFactory(dependencyPaths, readOnly);

    const getWatchValues = getWatchValuesFactory(
      dependencyPaths,
      jsonSchema?.options?.watch,
    );

    return {
      dependencyPaths,
      checkVisible,
      checkDisabled,
      checkReadOnly,
      getWatchValues,
    };
  }, [node]);

  const [dependencies, setDependencies] = useState<any[]>(() => {
    if (!node || dependencyPaths.length === 0) return [];
    return dependencyPaths.map((path) => node.findNode(path)?.value);
  });

  const visible = useMemo(() => {
    if (checkVisible) return checkVisible(dependencies);
    return true;
  }, [dependencies, checkVisible]);

  const disabled = useMemo(() => {
    if (checkDisabled) return checkDisabled(dependencies);
    return false;
  }, [dependencies, checkDisabled]);

  const readOnly = useMemo(() => {
    if (checkReadOnly) return checkReadOnly(dependencies);
    return false;
  }, [dependencies, checkReadOnly]);

  const watchValues = useMemo(() => {
    if (getWatchValues) return getWatchValues(dependencies);
    return [];
  }, [dependencies, getWatchValues]);

  useEffect(() => {
    if (!node) return;
    if (!visible && node.value !== getFallbackValue(node.jsonSchema)) {
      node.value = getFallbackValue(node.jsonSchema);
    }
  }, [node, visible]);

  useLayoutEffect(() => {
    if (!node || dependencyPaths.length === 0) return void 0;
    const unsubscribes = dependencyPaths
      .map((path, index) => {
        const targetNode = node.findNode(path);
        if (!targetNode) return undefined;
        return targetNode.subscribe(({ type, payload }) => {
          if (type === MethodType.Change) {
            setDependencies((prevDependencies) => {
              prevDependencies[index] = payload;
              return [...prevDependencies];
            });
          }
        });
      })
      .filter(isFunction);
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.());
    };
  }, [dependencyPaths, node]);

  return { node, visible, disabled, readOnly, watchValues };
};
