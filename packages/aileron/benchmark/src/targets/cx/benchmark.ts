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
      // clsx vs cx: 복잡한 테스트 케이스들
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
      // clsxLite vs cxLite: 단순한 테스트 케이스들 (Lite 버전은 복잡한 처리 지원 안 함)
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
      // 단일 호출 성능 비교
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

        // 카테고리별 결과 분석
        console.log('\n=== Performance Analysis ===');

        const results = Array.from(this as any);

        // 복잡한 케이스 비교 (clsx vs cx)
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

        // 단순한 케이스 비교 (clsxLite vs cxLite)
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

        // 단일 호출 비교
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
