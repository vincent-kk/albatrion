import Benchmark from 'benchmark';

import { getJSONPath } from '@winglet/json/path-common';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { value } from './data';
import { getJsonPaths as getJsonPaths_Old } from './getJsonPaths_old';

const runGetJsonPaths_Old = () => {
  getJsonPaths_Old(value, '');
};

const runGetJsonPaths = () => {
  getJSONPath(value, '');
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
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
