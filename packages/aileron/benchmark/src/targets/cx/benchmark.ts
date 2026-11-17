import Benchmark from 'benchmark';
import clsx from 'clsx';
import clsxLite from 'clsx/lite';

import { cx, cxLite } from '@winglet/style-utils/util';

import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { simpleTestCases, testCases } from './data';

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite

      .add('clsx (complex cases)', function () {
        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];
          if (Array.isArray(testCase)) {
            clsx(...testCase);
          } else {
            clsx(testCase);
          }
        }
      })
      .add('cx (complex cases)', function () {
        for (let i = 0; i < testCases.length; i++) {
          const testCase = testCases[i];
          if (Array.isArray(testCase)) {
            cx(...testCase);
          } else {
            cx(testCase);
          }
        }
      })

      .add('clsxLite (simple cases)', function () {
        for (let i = 0; i < simpleTestCases.length; i++) {
          const testCase = simpleTestCases[i];
          if (Array.isArray(testCase)) {
            clsxLite(...testCase);
          } else {
            clsxLite(testCase);
          }
        }
      })
      .add('cxLite (simple cases)', function () {
        for (let i = 0; i < simpleTestCases.length; i++) {
          const testCase = simpleTestCases[i];
          if (Array.isArray(testCase)) {
            cxLite(...testCase);
          } else {
            cxLite(testCase);
          }
        }
      })

      .add('clsx (single call)', function () {
        clsx('btn', 'btn-primary', {
          'btn-large': true,
          'btn-disabled': false,
        });
      })
      .add('cx (single call)', function () {
        cx('btn', 'btn-primary', { 'btn-large': true, 'btn-disabled': false });
      })
      .add('clsxLite (single call)', function () {
        clsxLite('btn', 'btn-primary', 'btn-large');
      })
      .add('cxLite (single call)', function () {
        cxLite('btn', 'btn-primary', 'btn-large');
      })
      .on('cycle', function (event: Benchmark.Event) {
        console.log(String(event.target));
      })
      .on('complete', function (this: Benchmark.Suite) {
        console.log('Fastest is ' + this.filter('fastest').map('name'));


        console.log('\n=== Performance Analysis ===');

        const results = Array.from(this as any);


        const clsxComplex: any = results.find(
          (r: any) => r.name === 'clsx (complex cases)',
        );
        const cxComplex: any = results.find(
          (r: any) => r.name === 'cx (complex cases)',
        );
        if (clsxComplex && cxComplex) {
          const ratioValue = cxComplex.hz / clsxComplex.hz;
          const ratio = ratioValue.toFixed(2);
          console.log(
            `Complex cases: cx is ${ratio}x ${ratioValue > 1 ? 'faster' : 'slower'} than clsx`,
          );
        }


        const clsxLiteSimple: any = results.find(
          (r: any) => r.name === 'clsxLite (simple cases)',
        );
        const cxLiteSimple: any = results.find(
          (r: any) => r.name === 'cxLite (simple cases)',
        );
        if (clsxLiteSimple && cxLiteSimple) {
          const ratioValue = cxLiteSimple.hz / clsxLiteSimple.hz;
          const ratio = ratioValue.toFixed(2);
          console.log(
            `Simple cases: cxLite is ${ratio}x ${ratioValue > 1 ? 'faster' : 'slower'} than clsxLite`,
          );
        }


        const clsxSingle: any = results.find(
          (r: any) => r.name === 'clsx (single call)',
        );
        const cxSingle: any = results.find(
          (r: any) => r.name === 'cx (single call)',
        );
        if (clsxSingle && cxSingle) {
          const ratioValue = cxSingle.hz / clsxSingle.hz;
          const ratio = ratioValue.toFixed(2);
          console.log(
            `Single call: cx is ${ratio}x ${ratioValue > 1 ? 'faster' : 'slower'} than clsx`,
          );
        }

        const clsxLiteSingle: any = results.find(
          (r: any) => r.name === 'clsxLite (single call)',
        );
        const cxLiteSingle: any = results.find(
          (r: any) => r.name === 'cxLite (single call)',
        );
        if (clsxLiteSingle && cxLiteSingle) {
          const ratioValue = cxLiteSingle.hz / clsxLiteSingle.hz;
          const ratio = ratioValue.toFixed(2);
          console.log(
            `Single call (Lite): cxLite is ${ratio}x ${ratioValue > 1 ? 'faster' : 'slower'} than clsxLite`,
          );
        }

        resolve(getRatio(this));
      })
      .run({ async: true });
  });
};
