import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { createLargeObject } from './data';
import { getObjectKeys } from './getObjectKeys';
import { getObjectKeys as getObjectKeys_old } from './getObjectKeys_old';

const suite = new Benchmark.Suite();

const sample = createLargeObject(100);

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('getObjectKeys', function () {
        getObjectKeys(sample);
      })
      .add('getObjectKeys_old', function () {
        getObjectKeys_old(sample);
      })
      .add('Object.keys', function () {
        Object.keys(sample);
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
