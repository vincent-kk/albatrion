import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';
import { getJsonPaths } from '@lumy/schema-form/core/schemaNodes/BaseNode/utils';

import { value } from './data';
import { getJsonPaths as getJsonPaths_Old } from './getJsonPaths_old';

const runGetJsonPaths_Old = () => {
  getJsonPaths_Old(value, '');
};

const runGetJsonPaths = () => {
  getJsonPaths(value, '');
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getJsonPaths_Old', runGetJsonPaths_Old)
      .add('getJsonPaths', runGetJsonPaths)
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
