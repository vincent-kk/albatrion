import Benchmark from 'benchmark';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

const suite = new Benchmark.Suite();

class Sample {
  __value: number;
  constructor() {
    this.__value = 1 << 256;
  }
  get value() {
    return this.__value;
  }
}

const sample = new Sample();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('direct access', function () {
        sample.__value;
      })
      .add('getter access', function () {
        sample.value;
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
