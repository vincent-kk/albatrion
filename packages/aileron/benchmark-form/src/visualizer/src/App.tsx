import { useEffect, useState } from 'react';

import styles from './App.module.css';
import { Chart } from './components/Chart';
import { ChartControls } from './components/ChartControls/ChartControls';
import { ResultSelector } from './components/ResultSelector';
import { StatsTable } from './components/StatsTable';

export function App() {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [showGenieForm, setShowGenieForm] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [showBar, setShowBar] = useState(true);
  const [showLine, setShowLine] = useState(false);
  const [showTrendline, setShowTrendline] = useState(false);

  useEffect(() => {
    if (!selectedFile) return;

    fetch(`/results/${selectedFile}`)
      .then((res) => res.json())
      .then((data) => setResults(data.results))
      .catch(console.error);
  }, [selectedFile]);

  const operationsPerSecData = results.map((r) => ({
    name: r.name,
    value: r.hz,
  }));

  const meanTimeData = results.map((r) => ({
    name: r.name,
    value: r.stats.mean * 1000, // Convert to milliseconds
  }));

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Schema Form 벤치마크 결과</h1>

      <ResultSelector value={selectedFile} onChange={setSelectedFile} />

      <div className={styles.chartContainer}>
        <ChartControls
          showGenieForm={showGenieForm}
          showBar={showBar}
          showLine={showLine}
          showTrendline={showTrendline}
          onToggleGenieForm={() => setShowGenieForm(!showGenieForm)}
          onToggleBar={() => setShowBar(!showBar)}
          onToggleLine={() => setShowLine(!showLine)}
          onToggleTrendline={() => setShowTrendline(!showTrendline)}
        />
        <Chart
          data={operationsPerSecData}
          width={800}
          height={400}
          title="초당 작업 수행 횟수"
          yAxisLabel="Operations/sec"
          showGenieForm={showGenieForm}
          showBar={showBar}
          showLine={showLine}
          showTrendline={showTrendline}
        />
      </div>

      <div className={styles.chartContainer}>
        <ChartControls
          showGenieForm={showGenieForm}
          showBar={showBar}
          showLine={showLine}
          showTrendline={showTrendline}
          onToggleGenieForm={() => setShowGenieForm(!showGenieForm)}
          onToggleBar={() => setShowBar(!showBar)}
          onToggleLine={() => setShowLine(!showLine)}
          onToggleTrendline={() => setShowTrendline(!showTrendline)}
        />
        <Chart
          data={meanTimeData}
          width={800}
          height={400}
          title="평균 실행 시간"
          yAxisLabel="밀리초 (ms)"
          showGenieForm={showGenieForm}
          showBar={showBar}
          showLine={showLine}
          showTrendline={showTrendline}
        />
      </div>

      <StatsTable results={results} />
    </div>
  );
}
