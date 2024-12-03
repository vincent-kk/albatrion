import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import {
  falseFunction,
  isFunction,
  isString,
  trueFunction,
} from '@lumy-pack/common';

import {
  MethodType,
  type SchemaNode,
  isSchemaNode,
} from '@lumy/schema-form/core';
import { getFallbackValue } from '@lumy/schema-form/helpers/fallbackValue';
import { useSchemaNodeContext } from '@lumy/schema-form/providers';
import { JSONPath } from '@lumy/schema-form/types';

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
    let checkVisible: CheckRenderOption | undefined = undefined;
    if (isHidden) {
      checkVisible = falseFunction;
    } else if (typeof visible === 'string') {
      const functionBody = `return !!(${visible
        .replace(JSON_PATH_REGEX, (path) => {
          if (!dependencyPaths.includes(path)) {
            dependencyPaths.push(path);
          }
          return `dependencies[${dependencyPaths.indexOf(path)}]`;
        })
        .trim()
        .replace(/;$/, '')})`;
      checkVisible = new Function(
        'dependencies',
        functionBody,
      ) as CheckRenderOption;
    }

    const disabled = jsonSchema?.renderOptions?.disabled;
    const isDisabled = disabled === true || jsonSchema?.disabled === true;
    let checkDisabled: CheckRenderOption | undefined = undefined;
    if (isDisabled) {
      checkDisabled = trueFunction;
    } else if (typeof disabled === 'string') {
      const functionBody = `return !!(${disabled
        .replace(JSON_PATH_REGEX, (path) => {
          if (!dependencyPaths.includes(path)) {
            dependencyPaths.push(path);
          }
          return `dependencies[${dependencyPaths.indexOf(path)}]`;
        })
        .trim()
        .replace(/;$/, '')})`;
      checkDisabled = new Function(
        'dependencies',
        functionBody,
      ) as CheckRenderOption;
    }

    const readOnly = jsonSchema?.renderOptions?.readOnly;
    const isReadOnly = readOnly === true || jsonSchema?.readOnly === true;
    let checkReadOnly: CheckRenderOption | undefined = undefined;
    if (isReadOnly) {
      checkReadOnly = trueFunction;
    } else if (typeof readOnly === 'string') {
      const functionBody = `return !!(${readOnly
        .replace(JSON_PATH_REGEX, (path) => {
          if (!dependencyPaths.includes(path)) {
            dependencyPaths.push(path);
          }
          return `dependencies[${dependencyPaths.indexOf(path)}]`;
        })
        .trim()
        .replace(/;$/, '')})`;
      checkReadOnly = new Function(
        'dependencies',
        functionBody,
      ) as CheckRenderOption;
    }

    const watch = jsonSchema?.options?.watch;
    let getWatchValues: GetWatchValues | undefined = undefined;
    if (watch && (isString(watch) || Array.isArray(watch))) {
      const watchValueIndexes = (Array.isArray(watch) ? watch : [watch]).map(
        (path) => {
          if (!dependencyPaths.includes(path)) {
            dependencyPaths.push(path);
          }
          return dependencyPaths.indexOf(path);
        },
      );
      const functionBody = `return [${watchValueIndexes.join(',')}].map((index) => dependencies[index])`;
      getWatchValues = new Function(
        'dependencies',
        functionBody,
      ) as GetWatchValues;
    }

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
    if (!visible) node.value = getFallbackValue(node.jsonSchema);
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

type CheckRenderOption = Fn<[dependencies: any[]], boolean>;
type GetWatchValues = Fn<[dependencies: any[]], any[]>;

const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
