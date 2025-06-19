import Benchmark from 'benchmark';

// import { compressCss as compressCssRef } from '@winglet/style-utils/src/utils';
import { type Ratio, getRatio } from '@/benchmark/helpers/getRatio';

import { compressCss } from './compressCss';
import { compressCss as compressCss_1 } from './compressCss_1';
import { compressCss as compressCss_Old } from './compressCss_old';
import { largeCss, smallCss } from './data';
import { compressCss as ultraFastMinifyCSS } from './ultraFastMinifyCSS';

const suite = new Benchmark.Suite();

export const run = () => {
  return new Promise<Ratio>((resolve) => {
    suite
      .add('compressCss (small cases)', function () {
        compressCss(smallCss);
      })
      .add('compressCss_1 (small cases)', function () {
        compressCss_1(smallCss);
      })
      .add('ultraFastMinifyCSS (small cases)', function () {
        ultraFastMinifyCSS(smallCss);
      })
      .add('compressCss_Old (small cases)', function () {
        compressCss_Old(smallCss);
      })
      .add('compressCss (large cases)', function () {
        compressCss(largeCss);
      })
      .add('compressCss_1 (large cases)', function () {
        compressCss_1(largeCss);
      })
      .add('ultraFastMinifyCSS (large cases)', function () {
        ultraFastMinifyCSS(largeCss);
      })
      .add('compressCss_Old (large cases)', function () {
        compressCss_Old(largeCss);
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
