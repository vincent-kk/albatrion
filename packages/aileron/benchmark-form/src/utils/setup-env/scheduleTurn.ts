/**
 * Schedules a runtime turn without introducing a timer floor.
 * @param callback - Work to run in the next immediate/message turn
 * @returns Nothing; message ports close before callback delivery
 */
export function scheduleTurn(callback: () => void): void {
  if (typeof globalThis.setImmediate === 'function') {
    globalThis.setImmediate(callback);
    return;
  }
  const channel = new MessageChannel();
  channel.port1.onmessage = () => {
    channel.port1.close();
    channel.port2.close();
    callback();
  };
  channel.port2.postMessage(undefined);
}
