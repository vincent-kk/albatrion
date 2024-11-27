import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import {
  find,
  getPathSegments,
} from '@lumy/schema-form/core/nodes/BaseNode/utils/find';

import { node, targetPath } from './data';
import { find as find_new } from './find';
import { find as find_old } from './find_old';
import { find as find_oldest } from './find_oldest';

const suite = new Benchmark.Suite();

const findNode_Oldest = () => {
  return find_oldest(node, targetPath);
};

const findNode_Old = () => {
  const segments = getPathSegments(targetPath);
  return find_old(node, segments);
};

const findNode_Ref = () => {
  const segments = getPathSegments(targetPath);
  return find(node, segments);
};
const findNode_New = () => {
  const segments = getPathSegments(targetPath);
  return find_new(node, segments);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('findNode_Ref', findNode_Ref)
      .add('findNode_New', findNode_New)
      .add('findNode_Old', findNode_Old)
      .add('findNode_Oldest', findNode_Oldest)
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
