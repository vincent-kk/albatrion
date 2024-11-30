import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@lumy/benchmark/helpers/getRatio';

import { data1, data2 } from './data';
import { merge as localMerge } from './deepMerge';
import { merge as esToolsMerge } from './es-tools';

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('localMerge', function () {
        localMerge(data1, data2);
      })
      .add('es-toolkit', function () {
        esToolsMerge(data1, data2);
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
