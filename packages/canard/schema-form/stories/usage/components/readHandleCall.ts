import { expect, waitFor, within } from 'storybook/test';

/**
 * Wait for a named method's call record and parse only the workbench's own readout.
 * @param canvas - Current play canvas; queries stay inside its Call log table.
 * @param method - Public member or onSubmit callback expected in the next row.
 * @param occurrence - Zero-based occurrence for methods invoked more than once.
 * @returns Parsed argument/result snapshots and the recorded completion kind.
 */
export async function readHandleCall(canvas: HTMLElement, method: string, occurrence = 0) {
  const table = within(canvas).getByRole('table', { name: 'Call log' });
  const rows = () => [...table.querySelectorAll('tbody tr')].filter((row) => row.children[1].textContent === method);
  await waitFor(() => expect(rows().length).toBeGreaterThan(occurrence));
  const cells = rows()[occurrence].children;
  return { args: JSON.parse(cells[2].textContent!), result: JSON.parse(cells[3].textContent!), kind: cells[4].textContent };
}
