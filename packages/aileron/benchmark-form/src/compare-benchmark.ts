import Benchmark, { type Deferred } from 'benchmark';

import { Form as WorkspaceForm } from '@canard/schema-form';

import { runComputedPropertiesBenchmark } from './benchmarks/canard/computed-performance';
import { runFormRenderingBenchmark } from './benchmarks/canard/form-rendering';
import { runIfThenElseBenchmark } from './benchmarks/canard/ifthenelse-performance';
import { runInteractionBenchmark } from './benchmarks/canard/interaction-performance';
import { runMemoryBenchmark } from './benchmarks/canard/memory-performance';
import { runGenieComputedPropertiesBenchmark } from './benchmarks/genie/computed-performance';
import { runGenieFormRenderingBenchmark } from './benchmarks/genie/form-rendering';
import { runGenieIfThenElseBenchmark } from './benchmarks/genie/ifthenelse-performance';
import { runGenieInteractionBenchmark } from './benchmarks/genie/interaction-performance';
import { runGenieMemoryBenchmark } from './benchmarks/genie/memory-performance';
import { generateReport } from './reporters/report-generator';
import { getSchemaFormVersions } from './utils/version-parser';

async function runBenchmarks() {
  const suite = new Benchmark.Suite();

  // 버전별 벤치마크 실행
  const installedVersions = await getSchemaFormVersions();
  const versions = process.argv.includes('--all-versions')
    ? installedVersions.filter((version) => version >= '0.3.0')
    : ['latest'];

  console.log(
    '🚀 @canard/schema-form vs @react-genie-form/next 종합 성능 비교',
  );
  // @react-genie-form/next 종합 테스트
  console.log('\n📊 @react-genie-form/next 테스트 시작...');

  // 1. Genie Form - 폼 렌더링 성능
  suite.add(`@react-genie-form/next - Form Rendering`, {
    defer: true,
    fn: async (deferred: Deferred) => {
      await runGenieFormRenderingBenchmark();
      deferred.resolve();
    },
  });

  // 2. Genie Form - 상호작용 성능
  suite.add(`@react-genie-form/next - User Interaction`, {
    defer: true,
    fn: async (deferred: Deferred) => {
      const result = await runGenieInteractionBenchmark();
      console.log(`📱 Genie interaction metrics:`, {
        avgTime: result.avgInteractionTime.toFixed(3) + 'ms',
        changeEvents: result.changeCount,
        batchingEfficiency:
          (result.changeCount / result.avgInteractionTime).toFixed(2) +
          ' events/ms',
      });
      deferred.resolve();
    },
  });

  // 3. Genie Form - if-then-else 조건부 로직
  suite.add(`@react-genie-form/next - IfThenElse Logic`, {
    defer: true,
    fn: async (deferred: Deferred) => {
      const result = await runGenieIfThenElseBenchmark();
      console.log(`🔀 Genie ifThenElse metrics:`, {
        avgSwitchTime: result.avgSwitchingTime.toFixed(3) + 'ms',
        eventMultiplier: result.eventMultiplier.toFixed(1) + 'x',
      });
      deferred.resolve();
    },
  });

  // 4. Genie Form - computed properties 성능
  suite.add(`@react-genie-form/next - Computed Properties`, {
    defer: true,
    fn: async (deferred: Deferred) => {
      const result = await runGenieComputedPropertiesBenchmark();
      console.log(`🧮 Genie computed properties metrics:`, {
        avgComputeTime: result.avgComputationTime.toFixed(3) + 'ms',
        dependencyTracking: result.dependencyTrackingEfficiency.toFixed(2),
        avgVisibilityChanges:
          result.avgVisibilityChanges.toFixed(1) + ' fields',
      });
      deferred.resolve();
    },
  });

  // 5. Genie Form - 메모리 사용량 분석
  suite.add(`@react-genie-form/next - Memory Usage`, {
    defer: true,
    fn: async (deferred: Deferred) => {
      const result = await runGenieMemoryBenchmark();
      console.log(`💾 Genie memory metrics:`, {
        memoryPerForm: result.memoryPerInstance.heapUsed.toFixed(2) + 'MB',
        totalMemoryIncrease: result.memoryDiff.heapUsed.toFixed(2) + 'MB',
        potentialLeak: result.memoryLeakCheck.potentialLeak
          ? '⚠️ Possible'
          : '✅ Clean',
      });
      deferred.resolve();
    },
  });

  // @canard/schema-form 버전별 종합 테스트
  console.log('\n📊 @canard/schema-form 테스트 시작...');
  console.log(
    'Following @canard/schema-form versions will be tested:',
    versions.join(', '),
  );

  for (const version of versions) {
    const SchemaFormModule =
      version === 'latest'
        ? { Form: WorkspaceForm }
        : await import(`@canard/schema-form_${version}`);

    // 1. 📊 폼 렌더링 성능 (기본)
    suite.add(`@canard/schema-form@${version} - Form Rendering`, {
      defer: true,
      fn: async (deferred: Deferred) => {
        await runFormRenderingBenchmark(SchemaFormModule);
        deferred.resolve();
      },
    });

    // 2. ⚡ 상호작용 성능 (microtask 배칭 효과)
    suite.add(`@canard/schema-form@${version} - User Interaction`, {
      defer: true,
      fn: async (deferred: Deferred) => {
        const result = await runInteractionBenchmark(SchemaFormModule);
        console.log(`📱 Canard interaction metrics for ${version}:`, {
          avgTime: result.avgInteractionTime.toFixed(3) + 'ms',
          changeEvents: result.changeCount,
          batchingEfficiency:
            (result.changeCount / result.avgInteractionTime).toFixed(2) +
            ' events/ms',
        });
        deferred.resolve();
      },
    });

    // 3. 🔀 if-then-else 조건부 로직 (2회 이벤트 발행)
    suite.add(`@canard/schema-form@${version} - IfThenElse Logic`, {
      defer: true,
      fn: async (deferred: Deferred) => {
        const result = await runIfThenElseBenchmark(SchemaFormModule);
        console.log(`🔀 Canard ifThenElse metrics for ${version}:`, {
          avgSwitchTime: result.avgSwitchingTime.toFixed(3) + 'ms',
          eventMultiplier: result.eventMultiplier.toFixed(1) + 'x',
          expectedEvents: '~2x (아키텍처 특성)',
        });
        deferred.resolve();
      },
    });

    // 4. 🧮 computed properties 성능 (동적 가시성)
    suite.add(`@canard/schema-form@${version} - Computed Properties`, {
      defer: true,
      fn: async (deferred: Deferred) => {
        const result = await runComputedPropertiesBenchmark(SchemaFormModule);
        console.log(`🧮 Canard computed properties metrics for ${version}:`, {
          avgComputeTime: result.avgComputationTime.toFixed(3) + 'ms',
          dependencyTracking: result.dependencyTrackingEfficiency.toFixed(2),
          avgVisibilityChanges:
            result.avgVisibilityChanges.toFixed(1) + ' fields',
        });
        deferred.resolve();
      },
    });

    // 5. 💾 메모리 사용량 분석
    suite.add(`@canard/schema-form@${version} - Memory Usage`, {
      defer: true,
      fn: async (deferred: Deferred) => {
        const result = await runMemoryBenchmark(SchemaFormModule);
        console.log(`💾 Canard memory metrics for ${version}:`, {
          memoryPerForm: result.memoryPerInstance.heapUsed.toFixed(2) + 'MB',
          totalMemoryIncrease: result.memoryDiff.heapUsed.toFixed(2) + 'MB',
          potentialLeak: result.memoryLeakCheck.potentialLeak
            ? '⚠️ Possible'
            : '✅ Clean',
        });
        deferred.resolve();
      },
    });
  }

  // 결과 수집 및 보고서 생성
  suite.on('complete', function (this: Benchmark.Suite) {
    console.log('\n🎉 All benchmarks completed!');
    console.log('\n📊 종합 성능 비교 분석:');
    console.log('==================================================');

    // 성능 분석 요약
    const canardTests = this.filter((test: Benchmark) =>
      test.name?.includes('@canard/schema-form'),
    );
    const genieTests = this.filter((test: Benchmark) =>
      test.name?.includes('@react-genie-form'),
    );

    // 카테고리별 비교
    const categories = [
      'Form Rendering',
      'User Interaction',
      'IfThenElse Logic',
      'Computed Properties',
      'Memory Usage',
    ];

    categories.forEach((category) => {
      console.log(`\n🔍 ${category} 비교:`);

      const canardCategoryTests = canardTests.filter((test: Benchmark) =>
        test.name?.includes(category),
      );
      const genieCategoryTests = genieTests.filter((test: Benchmark) =>
        test.name?.includes(category),
      );

      canardCategoryTests.forEach((test: Benchmark) => {
        console.log(
          `  ${test.name}: ${test.hz.toFixed(2)} ops/sec (비동기 아키텍처)`,
        );
      });

      genieCategoryTests.forEach((test: Benchmark) => {
        console.log(
          `  ${test.name}: ${test.hz.toFixed(2)} ops/sec (동기 아키텍처)`,
        );
      });

      if (canardCategoryTests.length > 0 && genieCategoryTests.length > 0) {
        const canardAvg =
          canardCategoryTests.reduce(
            (sum: number, test: Benchmark) => sum + test.hz,
            0,
          ) / canardCategoryTests.length;
        const genieAvg =
          genieCategoryTests.reduce(
            (sum: number, test: Benchmark) => sum + test.hz,
            0,
          ) / genieCategoryTests.length;
        const ratio = canardAvg / genieAvg;

        console.log(
          `  📈 성능 비율: ${ratio.toFixed(2)}x ${ratio > 1 ? '(Canard 더 빠름)' : '(Genie 더 빠름)'}`,
        );
      }
    });

    // 전체 종합 평가
    if (canardTests.length > 0 && genieTests.length > 0) {
      const canardAvg =
        canardTests.reduce((sum: number, test: Benchmark) => sum + test.hz, 0) /
        canardTests.length;
      const genieAvg =
        genieTests.reduce((sum: number, test: Benchmark) => sum + test.hz, 0) /
        genieTests.length;
      const performanceRatio = canardAvg / genieAvg;

      console.log('\n🏆 전체 종합 평가:');
      console.log(
        `  @canard/schema-form 평균: ${canardAvg.toFixed(2)} ops/sec`,
      );
      console.log(
        `  @react-genie-form/next 평균: ${genieAvg.toFixed(2)} ops/sec`,
      );
      console.log(
        `  종합 성능 비율: ${performanceRatio.toFixed(2)}x ${performanceRatio > 1 ? '🚀 Canard 우위' : '🐌 Genie 우위'}`,
      );
      console.log(
        `  버전 일관성: ${canardTests.map((t: Benchmark) => t.hz).every((hz: number) => Math.abs(hz - canardAvg) < canardAvg * 0.15) ? '✅ 안정적' : '⚠️ 버전별 차이 있음'}`,
      );
    }

    console.log('\n🔬 @canard/schema-form 비동기 아키텍처 특화 기능들:');
    console.log('  • EventCascade 배칭: microtask 단위로 이벤트 최적화');
    console.log('  • if-then-else 로직: 2회 이벤트 발행으로 효율적 조건 처리');
    console.log('  • computed properties: 동적 의존성 추적 및 재계산');
    console.log('  • Memory management: AbstractNode 기반 구조적 메모리 관리');

    console.log('\n⚡ @react-genie-form/next 특징:');
    console.log('  • 동기 아키텍처: 즉시 반응형 업데이트');
    console.log('  • 단일 이벤트 발행: 간단하고 예측 가능한 이벤트 모델');
    console.log('  • 전통적인 React 패턴: 표준 React 상태 관리');

    generateReport(this);
  });

  // 벤치마크 실행
  suite.run({ async: true });
}

// 추가 명령어 옵션 처리
const args = process.argv.slice(2);
const testType = args.find((arg) => arg.startsWith('--test='))?.split('=')[1];
const verbose = args.includes('--verbose');

if (testType) {
  console.log(`🎯 Running specific test: ${testType}`);
}

if (verbose) {
  console.log('🔍 Verbose mode enabled - detailed metrics will be shown');
}

runBenchmarks().catch(console.error);
