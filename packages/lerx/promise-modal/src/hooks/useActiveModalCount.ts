import { useMemo } from 'react';

import type { Fn } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { useModalManagerContext } from '@/promise-modal/providers/ModalManagerContext/useModalManagerContext';

const defaultValidate = (modal?: ModalNode) => modal?.visible;

/**
 * Hook that counts the number of active modals based on a validation function.
 *
 * Provides a reactive count of modals that match specific criteria. By default,
 * counts visible modals, but can be customized with any validation logic.
 * Useful for managing overlays, z-index stacking, or conditional UI based on modal count.
 *
 * @param validate - Function to determine if a modal should be counted (default: checks visibility)
 * @param refreshKey - Optional key to force recalculation when changed
 * @returns Number of modals that pass the validation
 *
 * @example
 * Basic usage - count visible modals:
 * ```tsx
 * function ModalOverlay() {
 *   const activeCount = useActiveModalCount();
 *
 *   if (activeCount === 0) return null;
 *
 *   return (
 *     <div
 *       className="modal-backdrop"
 *       style={{
 *         opacity: Math.min(activeCount * 0.3, 0.8),
 *         zIndex: 1000 + activeCount
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Count modals by type:
 * ```tsx
 * function ModalStats() {
 *   const alertCount = useActiveModalCount(
 *     (modal) => modal?.type === 'alert' && modal.visible
 *   );
 *
 *   const confirmCount = useActiveModalCount(
 *     (modal) => modal?.type === 'confirm' && modal.visible
 *   );
 *
 *   const promptCount = useActiveModalCount(
 *     (modal) => modal?.type === 'prompt' && modal.visible
 *   );
 *
 *   return (
 *     <div className="modal-stats">
 *       <p>Alerts: {alertCount}</p>
 *       <p>Confirms: {confirmCount}</p>
 *       <p>Prompts: {promptCount}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Prevent interactions when modals are active:
 * ```tsx
 * function App() {
 *   const hasActiveModals = useActiveModalCount() > 0;
 *
 *   return (
 *     <div className={hasActiveModals ? 'app-disabled' : 'app'}>
 *       <nav className={hasActiveModals ? 'pointer-events-none' : ''}>
 *         <button disabled={hasActiveModals}>Navigate</button>
 *       </nav>
 *       <main inert={hasActiveModals}>
 *         // Main content
 *       </main>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Count alive modals (including hidden ones):
 * ```tsx
 * function ModalMemoryMonitor() {
 *   const aliveCount = useActiveModalCount(
 *     (modal) => modal?.alive === true
 *   );
 *
 *   const hiddenCount = useActiveModalCount(
 *     (modal) => modal?.alive && !modal.visible
 *   );
 *
 *   return (
 *     <div className="debug-panel">
 *       <p>Total alive modals: {aliveCount}</p>
 *       <p>Hidden (animating out): {hiddenCount}</p>
 *       <button
 *         onClick={cleanupHiddenModals}
 *         disabled={hiddenCount === 0}
 *       >
 *         Cleanup Hidden Modals
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Dynamic refresh with dependencies:
 * ```tsx
 * function FilteredModalCount({ filter }) {
 *   const [refreshKey, setRefreshKey] = useState(0);
 *
 *   // Count modals matching dynamic filter
 *   const count = useActiveModalCount(
 *     (modal) => {
 *       if (!modal?.visible) return false;
 *       if (filter.type && modal.type !== filter.type) return false;
 *       if (filter.group && modal.group !== filter.group) return false;
 *       return true;
 *     },
 *     refreshKey // Force recalculation when key changes
 *   );
 *
 *   // Refresh count when filter changes
 *   useEffect(() => {
 *     setRefreshKey(prev => prev + 1);
 *   }, [filter]);
 *
 *   return <div>Matching modals: {count}</div>;
 * }
 * ```
 *
 * @example
 * Limit modal stacking:
 * ```tsx
 * function LimitedModalProvider({ children, maxModals = 3 }) {
 *   const activeCount = useActiveModalCount();
 *
 *   const openModal = useCallback((modalConfig) => {
 *     if (activeCount >= maxModals) {
 *       alert({
 *         title: 'Too Many Modals',
 *         content: `Maximum of ${maxModals} modals can be open at once.`,
 *         subtype: 'warning',
 *       });
 *       return Promise.reject(new Error('Modal limit exceeded'));
 *     }
 *
 *     return originalOpenModal(modalConfig);
 *   }, [activeCount, maxModals]);
 *
 *   return (
 *     <ModalContext.Provider value={{ openModal }}>
 *       {children}
 *     </ModalContext.Provider>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Recalculates whenever modal list changes or refreshKey updates
 * - Default validation counts visible modals only
 * - Custom validation can check any modal properties
 * - Efficient memoization prevents unnecessary recalculations
 * - Use refreshKey to force updates based on external dependencies
 */
export const useActiveModalCount = (
  validate: Fn<[node?: ModalNode], boolean | undefined> = defaultValidate,
  refreshKey: string | number = 0,
) => {
  const { modalIds, getModalNode } = useModalManagerContext();
  return useMemo(() => {
    let count = 0;
    for (let i = 0, l = modalIds.length; i < l; i++) {
      const id = modalIds[i];
      if (validate(getModalNode(id))) count++;
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getModalNode, modalIds, refreshKey]);
};
