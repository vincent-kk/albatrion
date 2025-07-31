import { useEffect } from 'react';

import { useVersion } from '@winglet/react-utils/hook';

import type { ModalNode } from '@/promise-modal/core';

/**
 * Hook that subscribes to modal state changes and triggers re-renders.
 *
 * Listens to any changes in the modal node (visibility, alive state, content, etc.)
 * and returns a version number that increments on each change. This allows components
 * to react to modal state changes without directly accessing the modal state.
 *
 * @param modal - The modal node to subscribe to
 * @returns Version number that increments on each modal state change
 *
 * @example
 * Basic usage to react to modal changes:
 * ```tsx
 * function ModalContent({ modalId }) {
 *   const { modal } = useModal(modalId);
 *   const version = useSubscribeModal(modal);
 *
 *   // Component re-renders whenever modal state changes
 *   return (
 *     <div>
 *       <p>Modal is {modal?.visible ? 'visible' : 'hidden'}</p>
 *       <p>Update count: {version}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Triggering side effects on modal state changes:
 * ```tsx
 * function ModalLogger({ modalId }) {
 *   const { modal } = useModal(modalId);
 *   const version = useSubscribeModal(modal);
 *
 *   useEffect(() => {
 *     if (version === 0) return; // Skip initial render
 *
 *     console.log('Modal state changed:', {
 *       visible: modal?.visible,
 *       alive: modal?.alive,
 *       type: modal?.type,
 *     });
 *   }, [version, modal]);
 *
 *   return null;
 * }
 * ```
 *
 * @example
 * Conditional rendering based on modal state:
 * ```tsx
 * function ModalAnimation({ modalId, children }) {
 *   const { modal } = useModal(modalId);
 *   const version = useSubscribeModal(modal);
 *   const [shouldRender, setShouldRender] = useState(false);
 *
 *   useEffect(() => {
 *     if (modal?.visible) {
 *       setShouldRender(true);
 *     } else if (!modal?.alive) {
 *       // Delay unmount for exit animation
 *       setTimeout(() => setShouldRender(false), 300);
 *     }
 *   }, [version, modal]);
 *
 *   if (!shouldRender) return null;
 *
 *   return (
 *     <div className={modal?.visible ? 'fade-in' : 'fade-out'}>
 *       {children}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Tracking specific modal properties:
 * ```tsx
 * function ModalProgressTracker({ modalId }) {
 *   const { modal } = useModal(modalId);
 *   const version = useSubscribeModal(modal);
 *   const [history, setHistory] = useState([]);
 *
 *   useEffect(() => {
 *     if (!modal) return;
 *
 *     setHistory(prev => [...prev, {
 *       timestamp: Date.now(),
 *       visible: modal.visible,
 *       value: modal.value,
 *     }]);
 *   }, [version]); // Only depend on version, not modal
 *
 *   return (
 *     <div>
 *       <h4>Modal State History</h4>
 *       {history.map((entry, i) => (
 *         <div key={i}>
 *           {new Date(entry.timestamp).toLocaleTimeString()}:
 *           {entry.visible ? 'Shown' : 'Hidden'}
 *           (value: {JSON.stringify(entry.value)})
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Returns 0 on initial render, increments on each change
 * - Automatically unsubscribes when component unmounts or modal changes
 * - More efficient than directly depending on modal object in useEffect
 * - Use this when you need to react to any modal state change
 */
export const useSubscribeModal = (modal?: ModalNode) => {
  const [version, update] = useVersion();
  useEffect(() => {
    if (!modal) return;
    const unsubscribe = modal.subscribe(update);
    return unsubscribe;
  }, [modal, update]);
  return version;
};
