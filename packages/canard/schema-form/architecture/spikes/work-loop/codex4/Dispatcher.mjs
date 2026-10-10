/** Loaded by event-experiments.mjs; one queue item is one immutable commit (B3/B4). */
export class Dispatcher {
  constructor({ cap = 25 } = {}) {
    this.nodes = new Map();
    this.queue = [];
    this.running = false;
    this.cap = cap;
    this.log = [];
    this.errors = [];
    this.waves = 0;
  }

  add(id, value, order) {
    const node = { id, value, order, revision: 0, attached: true, listeners: [] };
    this.nodes.set(id, node);
    return node;
  }

  /** Commit synchronously; defer only its notification when already dispatching. */
  commit(changes, signals = []) {
    const delivery = [];
    for (const [id, value] of Object.entries(changes)) {
      const node = this.nodes.get(id);
      const previous = structuredClone(node.value);
      node.value = structuredClone(value);
      if (JSON.stringify(previous) !== JSON.stringify(value)) delivery.push({ node, payload: { previous, current: structuredClone(value) }, signals: signals.filter((x) => x.id === id).map((x) => x.bit) });
    }
    delivery.sort((a, b) => a.node.order - b.node.order);
    for (const { id, bit } of signals) {
      const existing = delivery.find((d) => d.node.id === id);
      if (existing) { if (!existing.signals.includes(bit)) existing.signals.push(bit); }
      else delivery.push({ node: this.nodes.get(id), signals: [bit] });
    }
    this.queue.push(delivery);
    if (!this.running) this.drain();
  }

  /** B3 has no finite resolution for unbounded listener writes; leave pending evidence. */
  drain() {
    this.running = true;
    this.waves = 0;
    try {
      while (this.queue.length && this.waves < this.cap) {
        this.waves++;
        const delivery = this.queue.shift();
        for (const { node, payload, signals } of delivery) {
          if (!node.attached) { this.log.push({ skip: node.id }); continue; }
          node.revision++;
          const listeners = [...node.listeners];
          for (const listener of listeners) {
            try { listener(payload, node, signals, this); }
            catch (error) { this.errors.push(error.message); }
          }
        }
      }
      this.capped = this.queue.length > 0;
    } finally { this.running = false; }
  }
}
