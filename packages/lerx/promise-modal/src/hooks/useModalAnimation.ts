import { useLayoutEffect, useRef } from 'react';

import type { Fn } from '@aileron/declare';

interface ModalAnimationHandler {
  onVisible?: Fn;
  onHidden?: Fn;
}

/**
 * Hook that triggers animation callbacks based on modal visibility changes.
 *
 * Uses requestAnimationFrame to ensure callbacks are executed at the optimal time
 * for animations. Callbacks are triggered on the next frame after visibility changes,
 * allowing for smooth CSS transitions and JavaScript animations.
 *
 * @param visible - Current visibility state of the modal
 * @param handler - Object containing onVisible and onHidden callbacks
 *
 * @example
 * Basic fade animation:
 * ```tsx
 * function FadeModal({ visible }) {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *
 *   useModalAnimation(visible, {
 *     onVisible: () => {
 *       if (modalRef.current) {
 *         modalRef.current.style.opacity = '0';
 *         modalRef.current.style.transform = 'scale(0.9)';
 *
 *         requestAnimationFrame(() => {
 *           modalRef.current.style.opacity = '1';
 *           modalRef.current.style.transform = 'scale(1)';
 *         });
 *       }
 *     },
 *     onHidden: () => {
 *       if (modalRef.current) {
 *         modalRef.current.style.opacity = '0';
 *         modalRef.current.style.transform = 'scale(0.9)';
 *       }
 *     },
 *   });
 *
 *   return (
 *     <div
 *       ref={modalRef}
 *       style={{
 *         transition: 'all 300ms ease',
 *         opacity: 0,
 *       }}
 *     >
 *       Modal Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Slide animation with dynamic direction:
 * ```tsx
 * function SlideModal({ visible, direction = 'bottom' }) {
 *   const modalRef = useRef<HTMLDivElement>(null);
 *
 *   const getTransform = (hidden: boolean) => {
 *     if (!hidden) return 'translate(0, 0)';
 *
 *     switch (direction) {
 *       case 'top': return 'translate(0, -100%)';
 *       case 'bottom': return 'translate(0, 100%)';
 *       case 'left': return 'translate(-100%, 0)';
 *       case 'right': return 'translate(100%, 0)';
 *     }
 *   };
 *
 *   useModalAnimation(visible, {
 *     onVisible: () => {
 *       if (modalRef.current) {
 *         modalRef.current.style.transform = getTransform(false);
 *       }
 *     },
 *     onHidden: () => {
 *       if (modalRef.current) {
 *         modalRef.current.style.transform = getTransform(true);
 *       }
 *     },
 *   });
 *
 *   return (
 *     <div
 *       ref={modalRef}
 *       style={{
 *         transition: 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
 *         transform: getTransform(true),
 *       }}
 *     >
 *       // Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Complex animation sequence:
 * ```tsx
 * function SequenceModal({ visible }) {
 *   const overlayRef = useRef<HTMLDivElement>(null);
 *   const contentRef = useRef<HTMLDivElement>(null);
 *
 *   useModalAnimation(visible, {
 *     onVisible: () => {
 *       // Animate overlay first
 *       if (overlayRef.current) {
 *         overlayRef.current.style.opacity = '0';
 *         requestAnimationFrame(() => {
 *           overlayRef.current.style.opacity = '1';
 *         });
 *       }
 *
 *       // Then animate content with delay
 *       setTimeout(() => {
 *         if (contentRef.current) {
 *           contentRef.current.style.transform = 'scale(0.8)';
 *           contentRef.current.style.opacity = '0';
 *
 *           requestAnimationFrame(() => {
 *             contentRef.current.style.transform = 'scale(1)';
 *             contentRef.current.style.opacity = '1';
 *           });
 *         }
 *       }, 150);
 *     },
 *     onHidden: () => {
 *       // Reverse animation
 *       if (contentRef.current) {
 *         contentRef.current.style.transform = 'scale(0.8)';
 *         contentRef.current.style.opacity = '0';
 *       }
 *
 *       setTimeout(() => {
 *         if (overlayRef.current) {
 *           overlayRef.current.style.opacity = '0';
 *         }
 *       }, 150);
 *     },
 *   });
 *
 *   return (
 *     <>
 *       <div
 *         ref={overlayRef}
 *         className="modal-overlay"
 *         style={{ transition: 'opacity 300ms' }}
 *       />
 *       <div
 *         ref={contentRef}
 *         className="modal-content"
 *         style={{ transition: 'all 300ms ease' }}
 *       >
 *         // Content
 *       </div>
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * With class-based animations:
 * ```tsx
 * function ClassAnimatedModal({ visible }) {
 *   const [animationClass, setAnimationClass] = useState('');
 *
 *   useModalAnimation(visible, {
 *     onVisible: () => setAnimationClass('modal-enter'),
 *     onHidden: () => setAnimationClass('modal-exit'),
 *   });
 *
 *   return (
 *     <div className={`modal ${animationClass}`}>
 *       // Content
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Integrating with animation libraries:
 * ```tsx
 * function SpringModal({ visible }) {
 *   const springRef = useRef<SpringRef>(null);
 *
 *   useModalAnimation(visible, {
 *     onVisible: () => {
 *       springRef.current?.start({
 *         from: { opacity: 0, scale: 0.8 },
 *         to: { opacity: 1, scale: 1 },
 *       });
 *     },
 *     onHidden: () => {
 *       springRef.current?.start({
 *         to: { opacity: 0, scale: 0.8 },
 *       });
 *     },
 *   });
 *
 *   return (
 *     <animated.div ref={springRef}>
 *       // Content
 *     </animated.div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Uses useLayoutEffect to ensure DOM updates before animations
 * - Callbacks are wrapped in requestAnimationFrame for optimal timing
 * - Handler reference is kept fresh without causing re-renders
 * - Automatically cancels pending animation frames on cleanup
 * - Perfect for coordinating CSS transitions and JS animations
 */
export const useModalAnimation = (
  visible: boolean,
  handler: ModalAnimationHandler,
) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useLayoutEffect(() => {
    if (!handlerRef.current) return;
    let frame: ReturnType<typeof requestAnimationFrame>;
    if (visible)
      frame = requestAnimationFrame(() => handlerRef.current.onVisible?.());
    else frame = requestAnimationFrame(() => handlerRef.current.onHidden?.());
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [visible]);
};
