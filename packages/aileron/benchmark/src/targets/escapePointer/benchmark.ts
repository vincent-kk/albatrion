import Benchmark from 'benchmark';
import { escapePathComponent } from 'fast-json-patch';

import { escapePath } from '@winglet/json';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

const path = '~1/2/3/4/5/6/7/8/9/10';

const escapePointerRun = () => {
  escapePath(path);
};

const escapePathComponentRun = () => {
  escapePathComponent(path);
};

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('escapePointer', escapePointerRun)
      .add('escapePathComponent', escapePathComponentRun)
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
