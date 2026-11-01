/** Four-lane Williams rows cycle over every closing row; L rebuild is excluded. */
export function stageClosingOrder(id: string, index: number) {
  const lanes = ['L', 'B', 'S', 'F'];
  const n = lanes.length;
  const base = Array.from({ length: n }, (_, i) =>
    i === 0 ? 0 : i % 2 ? (i + 1) / 2 : n - i / 2,
  );
  const rows = Array.from({ length: n }, (_, shift) =>
    base.map((i) => lanes[(i + shift) % n]),
  );
  const design =
    n % 2 ? [...rows, ...rows.map((row) => [...row].reverse())] : rows;
  const order =
    design[((index % design.length) + design.length) % design.length];
  return id === 'rebuild-flat-500'
    ? order.filter((lane) => lane !== 'L')
    : order;
}
