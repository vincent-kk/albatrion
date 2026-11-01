/** Wait against an injected page clock; the timer and clock are supplied by the browser boundary. */
export async function waitForStageClosingDeadline(
  deadline: number,
  now: () => number,
  pause: (milliseconds: number) => Promise<void>,
) {
  while (now() < deadline) await pause(Math.max(1, deadline - now()));
}
