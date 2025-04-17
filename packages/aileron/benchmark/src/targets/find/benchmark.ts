import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';
import {
  find,
  getPathSegments,
} from '@/schema-form/core/nodes/AbstractNode/utils/find';

import { node, targetPath } from './data';
import { find as find_for } from './find_for';
import { find as find_forOf } from './find_forOF';
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
const findNode_ForOf = () => {
  const segments = getPathSegments(targetPath);
  return find_forOf(node, segments);
};
const findNode_For = () => {
  const segments = getPathSegments(targetPath);
  return find_for(node, segments);
};

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('findNode_Ref', findNode_Ref)
      .add('findNode_ForOf', findNode_ForOf)
      .add('findNode_For', findNode_For)
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
