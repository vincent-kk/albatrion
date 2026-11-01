import { compactCpuObservation } from './compactCpuObservation.mjs';

/** Preserve precheck disposition and wait accounting while limiting each observation to ten names. */
export function compactQuietCheck(check) {
  return {
    name: check.name,
    pid: check.pid,
    worker: check.worker,
    approved: check.approved,
    excludedAgentPid: check.excludedAgentPid,
    waitCount: check.waitCount,
    waitedMs: check.waitedMs,
    ordinaryWaitedMs: check.ordinaryWaitedMs,
    delays: check.delays,
    policy: check.policy,
    ...compactCpuObservation(check),
    attempts: (check.attempts ?? []).map(compactCpuObservation),
  };
}
