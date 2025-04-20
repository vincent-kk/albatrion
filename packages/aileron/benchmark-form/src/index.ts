import Benchmark from 'benchmark';

import { Form as WorkspaceForm } from '@canard/schema-form';

import { runFormRenderingBenchmark } from './benchmarks/form-rendering';
import { runGenieFormRenderingBenchmark } from './benchmarks/react-genie-form-rendering';
import { generateReport } from './reporters/report-generator';
import { getSchemaFormVersions } from './utils/version-parser';

async function runBenchmarks() {
  const suite = new Benchmark.Suite();

  // 버전별 벤치마크 실행
  const installedVersions = await getSchemaFormVersions();
  const versions = process.argv.includes('--all-versions')
    ? installedVersions
    : ['latest'];

  console.log('Fallowing versions will be test:', versions.join(', '));

  suite.add(`@react-genie-form/next - Form Rendering`, {
    defer: true,
    fn: async (deferred: any) => {
      await runGenieFormRenderingBenchmark();
      deferred.resolve();
    },
  });

  for (const version of versions) {
    // 버전에 따른 SchemaForm 모듈 동적 임포트
    const SchemaFormModule =
      version === 'latest'
        ? { Form: WorkspaceForm }
        : await import(`@canard/schema-form_${version}`);

    // 폼 렌더링 벤치마크
    suite.add(`@canard/schema-form@${version} - Form Rendering`, {
      defer: true,
      fn: async (deferred: any) => {
        await runFormRenderingBenchmark(SchemaFormModule);
        deferred.resolve();
      },
    });
  }

  // 결과 수집 및 보고서 생성
  suite.on('complete', function (this: Benchmark.Suite) {
    console.log('Benchmark completed!');
    generateReport(this);
  });

  // 벤치마크 실행
  suite.run({ async: true });
}

runBenchmarks().catch(console.error);
