/** Keep only the ten busiest process names and CPU percentages in window-end evidence. */
export function compactProcessRows(sample) {
  return sample.rows
    .slice(0, 10)
    .map(({ name, cpuPercent }) => ({ name, cpuPercent }));
}
