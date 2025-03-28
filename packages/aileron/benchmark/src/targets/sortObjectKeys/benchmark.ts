import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { createKeys, createLargeObject } from './data';
import { sortObjectKeys } from './sortObjectKeys';
import { sortObjectKeys as sortObjectKeys_Old } from './sortObjectKeys_old';
import { sortObjectKeys as sortObjectKeys_Oldest } from './sortObjectKeys_oldest';

const SIZE = 1000;

const runSortObjectKeys_Old = () => {
  sortObjectKeys_Old(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys_Oldest = () => {
  sortObjectKeys_Oldest(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys = () => {
  sortObjectKeys(createLargeObject(SIZE), createKeys(SIZE));
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('runSortObjectKeys_Oldest', runSortObjectKeys_Oldest)
      .add('runSortObjectKeys_Old', runSortObjectKeys_Old)
      .add('runSortObjectKeys', runSortObjectKeys)
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
