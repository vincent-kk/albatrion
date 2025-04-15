import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { falseFunction, map, trueFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import {
  NodeEventType,
  type SchemaNode,
  isSchemaNode,
} from '@/schema-form/core';
import {
  checkComputedOptionFactory,
  getWatchValuesFactory,
} from '@/schema-form/helpers/dynamicFunction';
import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import { useRootNodeContext } from '@/schema-form/providers';

import { useSchemaNodeTracker } from './useSchemaNodeTracker';

export const useComputeSchemaNode = (
  input?: SchemaNode | string,
): {
  node: SchemaNode | null;
  visible: boolean;
  readOnly: boolean;
  disabled: boolean;
  watchValues: any[];
} => {
  const {
    rootNode,
    readOnly: rootReadOnly,
    disabled: rootDisabled,
  } = useRootNodeContext();

  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else if (typeof input === 'string') return rootNode.findNode(input);
    else return null;
  }, [input, rootNode]);

  useSchemaNodeTracker(
    node,
    NodeEventType.UpdateValue |
      NodeEventType.UpdateState |
      NodeEventType.UpdateError,
  );

  const {
    dependencyPaths,
    checkVisible,
    checkReadOnly,
    checkDisabled,
    getWatchValues,
  } = useMemo(() => {
    const dependencyPaths: string[] = [];
    const jsonSchema = node?.jsonSchema;

    const visible = jsonSchema?.renderOptions?.visible;
    const isHidden = jsonSchema?.visible === false || visible === false;
    const checkVisible = isHidden
      ? falseFunction
      : checkComputedOptionFactory(dependencyPaths, visible);

    const readOnly = jsonSchema?.renderOptions?.readOnly;
    const isReadOnly =
      rootReadOnly === true ||
      rootNode.jsonSchema.readOnly === true ||
      jsonSchema?.readOnly === true ||
      readOnly === true;
    const checkReadOnly = isReadOnly
      ? trueFunction
      : checkComputedOptionFactory(dependencyPaths, readOnly);

    const disabled = jsonSchema?.renderOptions?.disabled;
    const isDisabled =
      rootDisabled === true ||
      rootNode.jsonSchema.disabled === true ||
      jsonSchema?.disabled === true ||
      disabled === true;
    const checkDisabled = isDisabled
      ? trueFunction
      : checkComputedOptionFactory(dependencyPaths, disabled);

    const getWatchValues = getWatchValuesFactory(
      dependencyPaths,
      jsonSchema?.options?.watch,
    );

    return {
      dependencyPaths,
      checkVisible,
      checkReadOnly,
      checkDisabled,
      getWatchValues,
    };
  }, [rootNode, node, rootReadOnly, rootDisabled]);

  const [dependencies, setDependencies] = useState<unknown[]>(() => {
    if (!node || dependencyPaths.length === 0) return [];
    return map(dependencyPaths, (path) => node.findNode(path)?.value);
  });

  const visible = useMemo(() => {
    if (checkVisible) return checkVisible(dependencies);
    return true;
  }, [dependencies, checkVisible]);

  const readOnly = useMemo(() => {
    if (checkReadOnly) return checkReadOnly(dependencies);
    return false;
  }, [dependencies, checkReadOnly]);

  const disabled = useMemo(() => {
    if (checkDisabled) return checkDisabled(dependencies);
    return false;
  }, [dependencies, checkDisabled]);

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
    if (!node || dependencyPaths.length === 0) return;
    const unsubscribes: Fn[] = [];
    for (let i = 0; i < dependencyPaths.length; i++) {
      const targetNode = node.findNode(dependencyPaths[i]);
      if (!targetNode) continue;
      unsubscribes.push(
        targetNode.subscribe(({ type, payload }) => {
          if (type & NodeEventType.UpdateValue)
            setDependencies((prevDependencies) => {
              prevDependencies[i] = payload?.[NodeEventType.UpdateValue];
              return [...prevDependencies];
            });
        }),
      );
    }
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [dependencyPaths, node]);

  return { node, visible, readOnly, disabled, watchValues };
};
