import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { data } from './data';
import { stringifyObject } from './stringifyObject';
import { stringifyObject as stringifyObject2 } from './stringifyObject2';

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('stringifyObject with 1 depth sorted keys', function () {
        stringifyObject(data);
      })
      .add('stringifyObject with all sorted keys', function () {
        stringifyObject2(data);
      })
      .add('JSON.stringify', function () {
        JSON.stringify(data);
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
