import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import {
  find,
  getPathSegments,
} from '@lumy/schema-form/core/schemaNodes/BaseNode/utils';

import { node, targetPath } from './data';
import { find as find_old } from './find_old';

const suite = new Benchmark.Suite();

const findNode_Old = () => {
  const segments = getPathSegments(targetPath);
  return find_old(node, segments);
};

const findNode_New = () => {
  const segments = getPathSegments(targetPath);
  return find(node, segments);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('findNode_Old', function () {
        findNode_Old();
      })
      .add('findNode_New', function () {
        findNode_New();
      })
      .on('cycle', function (event: Benchmark.Event) {
        console.log(String(event.target));
      })
      .on('complete', function (this: Benchmark.Suite) {
        console.log('Fastest is ' + this.filter('fastest').map('name'));
        resolve(getRatio(this));
      })
      .run({ async: true });
  });
};
