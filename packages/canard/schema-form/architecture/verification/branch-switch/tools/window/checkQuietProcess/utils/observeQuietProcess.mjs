import { waitForQuietProcess } from '../../waitForQuietProcess.mjs';

/**
 * Observe a synthetic workload against the shared start-delay policy.
 * @param {function(number): object[]} rows Virtual process observations.
 * @returns {Promise<object>} Preserved policy evidence from the virtual clock.
 */
export async function observeQuietProcess(rows) {
  let time = 0;
  return waitForQuietProcess({
    agentPid: 99,
    now: () => time,
    pause: async (ms) => {
      time += ms;
    },
    sample: async (ms) => {
      time += ms;
      return { rows: rows(time) };
    },
  });
}
