import { useContext, useLayoutEffect, useMemo, useState } from 'react';

import { isString } from 'es-toolkit';
import { isArray } from 'es-toolkit/compat';

import { falseFunction } from '@lumy/schema-form/app/constant';
import {
  MethodType,
  type SchemaNode,
  isSchemaNode,
} from '@lumy/schema-form/core';
import { isFunction } from '@lumy/schema-form/helpers/filter';
import { SchemaNodeContext } from '@lumy/schema-form/providers';
import { JSONPath } from '@lumy/schema-form/types';

import { useSchemaNodeTracker } from './useSchemaNodeTracker';

export function usePrepareSchemaValues(input?: SchemaNode | string): {
  node: SchemaNode | null;
  show: boolean;
  watchValues: any[];
} {
  const { rootNode } = useContext(SchemaNodeContext);

  const node = useMemo(() => {
    if (isSchemaNode(input)) return input;
    else if (typeof input === 'string') return rootNode.findNode(input);
    else return null;
  }, [input, rootNode]);

  const { dependencyPaths, checkShow, getWatchValues } = useMemo(() => {
    const uiShow = node?.jsonSchema?.ui?.show;
    const watch = node?.jsonSchema?.options?.watch;
    const dependencyPaths: string[] = [];

    let checkShow: CheckShow | undefined = undefined;
    if (uiShow) {
      checkShow = falseFunction;
    } else if (typeof uiShow === 'string') {
      const functionBody = `return !!(${uiShow
        .replace(JSON_PATH_REGEX, (path) => {
          if (!dependencyPaths.includes(path)) {
            dependencyPaths.push(path);
          }
          return `dependencies[${dependencyPaths.indexOf(path)}]`;
        })
        .trim()
        .replace(/;$/, '')})`;
      checkShow = new Function('dependencies', functionBody) as CheckShow;
    }

    let getWatchValues: GetWatchValues | undefined = undefined;
    if (!watch && (isString(watch) || isArray(watch))) {
      const watchValueIndexes = (isArray(watch) ? watch : [watch]).map(
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

    return { dependencyPaths, checkShow, getWatchValues };
  }, [node]);

  const [dependencies, setDependencies] = useState<any[]>(() => {
    if (!node || dependencyPaths.length === 0) return [];
    return dependencyPaths.map((path) => node.findNode(path)?.value);
  });

  const show = useMemo(() => {
    if (checkShow) return checkShow(dependencies);
    return true;
  }, [dependencies, checkShow]);

  const watchValues = useMemo(() => {
    if (getWatchValues) return getWatchValues(dependencies);
    return [];
  }, [dependencies, getWatchValues]);

  useLayoutEffect(() => {
    if (!node || dependencyPaths.length === 0) return void 0;
    const unsubscribes = dependencyPaths
      .map((path, index) => {
        const targetNode = node.findNode(path);
        if (!targetNode) return undefined;
        return targetNode.subscribe((type, payload) => {
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

  useSchemaNodeTracker(node);

  return { node, show, watchValues };
}

type CheckShow = Fn<[dependencies: any[]], boolean>;
type GetWatchValues = Fn<[dependencies: any[]], any[]>;

const JSON_PATH_REGEX = new RegExp(
  `[\\${JSONPath.Root}\\${JSONPath.Current}]\\${JSONPath.Child}([a-zA-Z0-9]+(\\${JSONPath.Child}[a-zA-Z0-9]+)*)`,
  'g',
);
