import type { Suite } from 'benchmark';
import fs from 'fs/promises';
import path from 'path';

interface BenchmarkResult {
  name: string;
  hz: number;
  stats: {
    mean: number;
    deviation: number;
  };
}

export async function generateReport(suite: Suite) {
  const results: BenchmarkResult[] = [];

  // 결과 수집
  suite.forEach((benchmark: any) => {
    results.push({
      name: benchmark.name,
      hz: benchmark.hz,
      stats: {
        mean: benchmark.stats.mean,
        deviation: benchmark.stats.deviation,
      },
    });
  });

  // 차트 데이터 생성
  const chartConfig = {
    type: 'bar',
    data: {
      labels: results.map((r) => r.name),
      datasets: [
        {
          label: 'Operations/sec',
          data: results.map((r) => r.hz),
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  };

  // 결과를 JSON 파일로 저장
  const resultDir = path.join(process.cwd(), 'results');
  await fs.mkdir(resultDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await fs.writeFile(
    path.join(resultDir, `benchmark-${timestamp}.json`),
    JSON.stringify(
      {
        timestamp,
        results,
        chartConfig,
      },
      null,
      2,
    ),
  );

  // 콘솔에 결과 출력
  console.log('\nBenchmark Results:');
  console.log('=================');
  results.forEach((result) => {
    console.log(`\n${result.name}`);
    console.log(`  Ops/sec: ${result.hz.toFixed(2)}`);
    console.log(`  Mean time: ${(result.stats.mean * 1000).toFixed(3)}ms`);
    console.log(`  Deviation: ±${(result.stats.deviation * 100).toFixed(2)}%`);
  });
}
