import Benchmark from 'benchmark';

import { getJSONPath } from '@winglet/json/path-common';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { value } from './data';
import { getJSONPaths as getJSONPaths_Old } from './getJSONPaths_old';

const runGetJSONPaths_Old = () => {
  getJSONPaths_Old(value, '');
};

const runGetJSONPaths = () => {
  getJSONPath(value, '');
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getJSONPaths', runGetJSONPaths)
      .add('getJSONPaths_Old', runGetJSONPaths_Old)
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
