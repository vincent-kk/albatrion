import styles from './StatsTable.module.css';

interface StatsTableProps {
  results: BenchmarkResult[];
}

export function StatsTable({ results }: StatsTableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.header}>테스트</th>
          <th className={styles.header}>Ops/sec</th>
          <th className={styles.header}>평균 시간 (ms)</th>
          <th className={styles.header}>표준 편차</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.name} className={styles.row}>
            <td className={styles.cell}>{result.name}</td>
            <td className={styles.cell}>{result.hz.toFixed(2)}</td>
            <td className={styles.cell}>
              {(result.stats.mean * 1000).toFixed(3)}
            </td>
            <td className={styles.cell}>
              ±{(result.stats.deviation * 100).toFixed(2)}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
