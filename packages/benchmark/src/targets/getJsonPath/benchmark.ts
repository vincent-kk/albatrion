import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import { getJsonPaths as getJsonPaths_Ref } from '@lumy/schema-form/core/nodes/BaseNode/utils';
import { getJsonPaths } from '@lumy/schema-form/core/nodes/BaseNode/utils';

import { value } from './data';
import { getJsonPaths as getJsonPaths_Old } from './getJsonPaths_old';

const runGetJsonPaths_Old = () => {
  getJsonPaths_Old(value, '');
};

const runGetJsonPaths = () => {
  getJsonPaths(value, '');
};

const runGetJsonPaths_Ref = () => {
  getJsonPaths_Ref(value, '');
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getJsonPaths_Ref', runGetJsonPaths_Ref)
      .add('getJsonPaths', runGetJsonPaths)
      .add('getJsonPaths_Old', runGetJsonPaths_Old)
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
