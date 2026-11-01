import { REGISTERED_STAGE_CLOSING_RULES as rules } from './registeredStageClosingRules';

/** Williams rows balance every ordered predecessor pair; odd designs include reversed rows. */
export function stageClosingOrder(id: string, index: number) {
  const lanes = rules.probeRows.includes(id)
    ? ['L', 'B', 'S', 'F', 'probe']
    : ['L', 'B', 'S', 'F'];
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
