import { useEffect, useLayoutEffect, useMemo, useState } from 'react';

import { falseFunction, isFunction, isString } from '@lumy-pack/common';

import {
  MethodType,
  type SchemaNode,
  isSchemaNode,
} from '@lumy/schema-form/core';
import { getFallbackValue } from '@lumy/schema-form/helpers/fallbackValue';
import { useSchemaNodeContext } from '@lumy/schema-form/providers';
import { JSONPath } from '@lumy/schema-form/types';

import { useSchemaNodeTracker } from './useSchemaNodeTracker';

export function usePrepareSchemaValues(input?: SchemaNode | string): {
  node: SchemaNode | null;
  visible: boolean;
  watchValues: any[];
} {
  const { rootNode } = useSchemaNodeContext();

  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else if (typeof input === 'string') return rootNode.findNode(input);
    else return null;
  }, [input, rootNode]);

  useSchemaNodeTracker(node, [MethodType.Change, MethodType.StateChange]);

  const { dependencyPaths, checkVisible, getWatchValues } = useMemo(() => {
    const visible = node?.jsonSchema?.renderOptions?.visible;
    const hidden = node?.jsonSchema?.hidden;
    const watch = node?.jsonSchema?.options?.watch;
    const dependencyPaths: string[] = [];

    let checkVisible: CheckVisible | undefined = undefined;
    if (hidden || visible === false) {
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
      checkVisible = new Function('dependencies', functionBody) as CheckVisible;
    }

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

    return { dependencyPaths, checkVisible, getWatchValues };
  }, [node]);

  const [dependencies, setDependencies] = useState<any[]>(() => {
    if (!node || dependencyPaths.length === 0) return [];
    return dependencyPaths.map((path) => node.findNode(path)?.value);
  });

  const visible = useMemo(() => {
    if (checkVisible) return checkVisible(dependencies);
    return true;
  }, [dependencies, checkVisible]);

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

  return { node, visible, watchValues };
}

type CheckVisible = Fn<[dependencies: any[]], boolean>;
type GetWatchValues = Fn<[dependencies: any[]], any[]>;

const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
