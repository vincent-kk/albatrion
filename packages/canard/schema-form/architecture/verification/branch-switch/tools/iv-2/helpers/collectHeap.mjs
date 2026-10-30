/** Force collection with the existing heap device's Node/Bun protocol. */
export function collectHeap() {
  const bun = Reflect.get(globalThis, 'Bun');
  const nodeGc = Reflect.get(globalThis, 'gc');
  if (bun?.gc) bun.gc(true);
  else {
    if (!nodeGc) throw new Error('A GC-enabled heap process is required');
    nodeGc();
    nodeGc();
  }
}
