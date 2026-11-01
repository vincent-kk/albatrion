/** Unresolved sibling work disconnects the preserved React 18 layout effects. */
const pending = new Promise<void>(() => undefined);

/** Suspend the sibling without replacing the previously committed form. */
export const HiddenFormGate = ({ hidden }: { hidden: boolean }) => {
  if (hidden) throw pending;
  return null;
};
