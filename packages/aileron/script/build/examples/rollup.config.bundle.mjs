// 번들 빌드 예제 - rollup.config.bundle.mjs
import { getBundleBuildOptions } from '../rollup.bundle.mjs';

const { bundleBuildOptions, clearDir } = getBundleBuildOptions(import.meta.url);

// 빌드 전 디렉토리 정리
clearDir('dist');

export default [
  // ESM 번들 (모던 환경용)
  await bundleBuildOptions({
    entry: 'src/index.ts',
    format: 'esm',
    outFile: 'dist/bundle.mjs',
    sourcemap: true,
    minify: true,
    optimizeImports: true,
  }),

  // CommonJS 번들 (Node.js용)
  await bundleBuildOptions({
    entry: 'src/index.ts',
    format: 'cjs',
    outFile: 'dist/bundle.cjs',
    sourcemap: true,
    minify: true,
    optimizeImports: true,
  }),

  // UMD 번들 (브라우저 + Node.js 호환)
  await bundleBuildOptions({
    entry: 'src/index.ts',
    format: 'umd',
    outFile: 'dist/bundle.umd.js',
    name: 'MyLibrary', // 전역 변수명
    sourcemap: true,
    minify: {
      terser: {
        compress: {
          drop_console: false, // 개발용으로 콘솔 로그 유지
          drop_debugger: true,
          pure_funcs: ['console.debug'], // debug만 제거
        },
        mangle: {
          reserved: ['React', 'ReactDOM'], // React 관련 변수명 보호
        },
      },
    },
    optimizeImports: true,
  }),

  // IIFE 번들 (브라우저 직접 로드용)
  await bundleBuildOptions({
    entry: 'src/index.ts',
    format: 'iife',
    outFile: 'dist/bundle.iife.js',
    name: 'MyLibrary',
    sourcemap: false, // 프로덕션용으로 소스맵 제거
    minify: true,
    optimizeImports: true,
    // 커스텀 플러그인 추가 예제
    plugins: {
      afterBuild: [
        // 빌드 완료 후 추가 작업을 위한 플러그인들
      ],
    },
  }),
];
