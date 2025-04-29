import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { createKeys, createLargeObject } from './data';
import { sortObjectKeys } from './sortObjectKeys';
import { sortObjectKeys as sortObjectKeys_in } from './sortObjectKeys_in';
import { sortObjectKeys as sortObjectKeys_Old } from './sortObjectKeys_old';
import { sortObjectKeys as sortObjectKeys_Oldest } from './sortObjectKeys_oldest';
import { sortObjectKeys as sortObjectKeys_Set } from './sortObjectKeys_set';

const SIZE = 100;

const runSortObjectKeys_Old = () => {
  sortObjectKeys_Old(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys_Oldest = () => {
  sortObjectKeys_Oldest(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys = () => {
  sortObjectKeys(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys_Set = () => {
  sortObjectKeys_Set(createLargeObject(SIZE), createKeys(SIZE));
};

const runSortObjectKeys_in = () => {
  sortObjectKeys_in(createLargeObject(SIZE), createKeys(SIZE));
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('runSortObjectKeys_Oldest', runSortObjectKeys_Oldest)
      .add('runSortObjectKeys_Old', runSortObjectKeys_Old)
      .add('runSortObjectKeys', runSortObjectKeys)
      .add('runSortObjectKeys_Set', runSortObjectKeys_Set)
      .add('runSortObjectKeys_in', runSortObjectKeys_in)
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
