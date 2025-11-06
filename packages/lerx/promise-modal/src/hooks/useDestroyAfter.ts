import { useEffect, useRef } from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';
import { isString } from '@winglet/common-utils/filter';

import type { Duration } from '@aileron/declare';

import type { ModalNode } from '@/promise-modal/core';
import { useModalManager } from '@/promise-modal/providers';

import { useSubscribeModal } from './useSubscribeModal';

/**
 * Hook that automatically destroys a modal after it becomes hidden.
 *
 * Monitors the modal's visibility state and schedules destruction after a specified
 * duration once the modal is hidden but still alive. Useful for cleanup after
 * closing animations complete.
 *
 * @param modalId - ID of the modal to monitor
 * @param duration - Delay before destruction (ms or duration string like '300ms')
 *
 * @example
 * Basic usage with milliseconds:
 * ```tsx
 * function AnimatedModal({ modalId }) {
 *   // Destroy modal 300ms after it becomes hidden
 *   useDestroyAfter(modalId, 300);
 *
 *   return (
 *     <div className="modal-with-exit-animation">
 *       // Modal content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Using duration string:
 * ```tsx
 * function FadeOutModal({ modalId }) {
 *   // Destroy after CSS animation completes
 *   useDestroyAfter(modalId, '500ms');
 *
 *   const { modal } = useModal(modalId);
 *
 *   return (
 *     <div
 *       className={modal?.visible ? 'fade-in' : 'fade-out'}
 *       style={{ animationDuration: '500ms' }}
 *     >
 *       // Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Conditional destruction based on modal type:
 * ```tsx
 * function SmartModal({ modalId }) {
 *   const { modal } = useModal(modalId);
 *
 *   // Different timings for different modal types
 *   const destroyDelay = useMemo(() => {
 *     switch (modal?.type) {
 *       case 'alert': return '200ms';
 *       case 'confirm': return '300ms';
 *       case 'prompt': return '400ms';
 *       default: return 300;
 *     }
 *   }, [modal?.type]);
 *
 *   useDestroyAfter(modalId, destroyDelay);
 *
 *   return <ModalContent modalId={modalId} />;
 * }
 * ```
 *
 * @example
 * With custom animations and effects:
 * ```tsx
 * function NotificationModal({ modalId }) {
 *   const { modal } = useModal(modalId);
 *   const [particles, setParticles] = useState([]);
 *
 *   // Cleanup after particle animation
 *   useDestroyAfter(modalId, '1000ms');
 *
 *   useEffect(() => {
 *     if (!modal?.visible && modal?.alive) {
 *       // Trigger particle effect on close
 *       setParticles(generateParticles());
 *     }
 *   }, [modal?.visible, modal?.alive]);
 *
 *   return (
 *     <>
 *       <div className={`notification ${!modal?.visible ? 'explode' : ''}`}>
 *         // Content
 *       </div>
 *       {particles.map(particle => (
 *         <Particle key={particle.id} {...particle} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * Coordinated with manual destruction:
 * ```tsx
 * function PersistentModal({ modalId }) {
 *   const { modal } = useModal(modalId);
 *   const [shouldPersist, setShouldPersist] = useState(false);
 *
 *   // Only auto-destroy if not persisting
 *   if (!shouldPersist) {
 *     useDestroyAfter(modalId, '300ms');
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={() => setShouldPersist(true)}>
 *         Keep in Background
 *       </button>
 *       // Modal content
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Only triggers when modal is hidden (visible: false) but still alive
 * - Automatically cancels if modal becomes visible again
 * - Useful for cleanup after exit animations
 * - Works with both millisecond numbers and duration strings
 * - The timer resets if modal visibility changes
 */
export const useDestroyAfter = (
  modalId: ModalNode['id'],
  duration: Duration | number,
) => {
  const { modal, onDestroy } = useModalManager(modalId);
  const tick = useSubscribeModal(modal);

  const reference = useRef({
    modal,
    onDestroy,
    milliseconds: isString(duration)
      ? convertMsFromDuration(duration)
      : duration,
  });

  useEffect(() => {
    const { modal, onDestroy, milliseconds } = reference.current;
    if (!modal || modal.visible || !modal.alive) return;
    const timer = setTimeout(() => {
      onDestroy();
    }, milliseconds);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [tick]);
};
