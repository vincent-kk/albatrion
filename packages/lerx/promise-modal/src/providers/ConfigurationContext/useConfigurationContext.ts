import { useContext } from 'react';

import { convertMsFromDuration } from '@winglet/common-utils/convert';

import { ConfigurationContext } from './ConfigurationContext';

/**
 * Hook that provides access to the complete modal configuration context.
 *
 * Returns all configuration including component overrides and options.
 * This is the most comprehensive hook for accessing modal configuration,
 * useful when you need multiple configuration values or custom components.
 *
 * @returns Complete configuration context with components and options
 */
export const useConfigurationContext = () => useContext(ConfigurationContext);

/**
 * Hook that provides only the modal options from configuration.
 *
 * Convenient when you only need access to options like duration, backdrop,
 * and behavior settings without the component definitions.
 *
 * @returns Modal options object with all settings
 *
 * @example
 * Basic usage:
 * ```tsx
 * function ModalBackdrop() {
 *   const options = useConfigurationOptions();
 *
 *   return (
 *     <div
 *       className="modal-backdrop"
 *       style={{
 *         backgroundColor: options.backdrop,
 *         transition: `opacity ${options.duration} ease`
 *       }}
 *       onClick={options.closeOnBackdropClick ? handleClose : undefined}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Conditional behavior based on options:
 * ```tsx
 * function ModalCloseButton({ onClose }) {
 *   const { closeOnBackdropClick, manualDestroy } = useConfigurationOptions();
 *   const [isClosing, setIsClosing] = useState(false);
 *
 *   const handleClick = () => {
 *     if (manualDestroy) {
 *       setIsClosing(true);
 *       // Trigger close animation
 *       setTimeout(onClose, 300);
 *     } else {
 *       onClose();
 *     }
 *   };
 *
 *   // Hide close button if backdrop click is disabled
 *   if (!closeOnBackdropClick) return null;
 *
 *   return (
 *     <button
 *       onClick={handleClick}
 *       className={isClosing ? 'closing' : ''}
 *     >
 *       ×
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * Options-aware animations:
 * ```tsx
 * function AnimatedContent({ visible, children }) {
 *   const options = useConfigurationOptions();
 *   const contentRef = useRef<HTMLDivElement>(null);
 *
 *   useEffect(() => {
 *     if (!contentRef.current) return;
 *
 *     const element = contentRef.current;
 *     element.style.transition = `all ${options.duration} ease`;
 *
 *     if (visible) {
 *       element.style.opacity = '1';
 *       element.style.transform = 'scale(1)';
 *     } else {
 *       element.style.opacity = '0';
 *       element.style.transform = 'scale(0.95)';
 *     }
 *   }, [visible, options.duration]);
 *
 *   return <div ref={contentRef}>{children}</div>;
 * }
 * ```
 */
export const useConfigurationOptions = () => {
  const context = useContext(ConfigurationContext);
  return context.options;
};

/**
 * Hook that provides modal animation duration in multiple formats.
 *
 * Returns both the original duration string and converted milliseconds,
 * useful for JavaScript animations and timing calculations.
 *
 * @returns Object with duration string and milliseconds number
 *
 * @example
 * Basic animation timing:
 * ```tsx
 * function TimedModal() {
 *   const { duration, milliseconds } = useConfigurationDuration();
 *   const [phase, setPhase] = useState<'entering' | 'visible' | 'leaving'>();
 *
 *   useEffect(() => {
 *     if (phase === 'entering') {
 *       const timer = setTimeout(() => setPhase('visible'), milliseconds);
 *       return () => clearTimeout(timer);
 *     }
 *   }, [phase, milliseconds]);
 *
 *   return (
 *     <div
 *       className={`modal-${phase}`}
 *       style={{ animationDuration: duration }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Synchronized animations:
 * ```tsx
 * function ModalWithStaggeredElements({ items }) {
 *   const { duration, milliseconds } = useConfigurationDuration();
 *   const itemDelay = milliseconds / items.length;
 *
 *   return (
 *     <div className="modal">
 *       {items.map((item, index) => (
 *         <div
 *           key={item.id}
 *           className="modal-item"
 *           style={{
 *             animationDuration: duration,
 *             animationDelay: `${index * itemDelay}ms`
 *           }}
 *         >
 *           {item.content}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Progress indicators:
 * ```tsx
 * function ModalProgress({ onComplete }) {
 *   const { milliseconds } = useConfigurationDuration();
 *   const [progress, setProgress] = useState(0);
 *
 *   useEffect(() => {
 *     const startTime = Date.now();
 *     const interval = setInterval(() => {
 *       const elapsed = Date.now() - startTime;
 *       const percent = Math.min((elapsed / milliseconds) * 100, 100);
 *       setProgress(percent);
 *
 *       if (percent >= 100) {
 *         clearInterval(interval);
 *         onComplete();
 *       }
 *     }, 16); // ~60fps
 *
 *     return () => clearInterval(interval);
 *   }, [milliseconds, onComplete]);
 *
 *   return (
 *     <div className="progress-bar">
 *       <div
 *         className="progress-fill"
 *         style={{ width: `${progress}%` }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Supports various duration formats: '300ms', '0.3s', '1s', etc.
 * - Automatically converts to milliseconds for JavaScript timing
 * - Useful for coordinating CSS and JS animations
 */
export const useConfigurationDuration = () => {
  const context = useConfigurationOptions();
  return {
    duration: context.duration,
    milliseconds: convertMsFromDuration(context.duration),
  };
};

/**
 * Hook that provides the modal backdrop color configuration.
 *
 * Convenient accessor for backdrop styling, supporting any valid CSS color format.
 *
 * @returns Backdrop color string
 *
 * @example
 * Basic backdrop:
 * ```tsx
 * function ModalOverlay({ visible }) {
 *   const backdrop = useConfigurationBackdrop();
 *
 *   if (!visible) return null;
 *
 *   return (
 *     <div
 *       className="fixed inset-0"
 *       style={{ backgroundColor: backdrop }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Animated backdrop with opacity:
 * ```tsx
 * function AnimatedBackdrop({ visible }) {
 *   const backdrop = useConfigurationBackdrop();
 *   const [opacity, setOpacity] = useState(0);
 *
 *   // Parse backdrop color and apply custom opacity
 *   const backdropWithOpacity = useMemo(() => {
 *     if (backdrop.startsWith('rgba')) {
 *       return backdrop.replace(/[\d.]+\)$/, `${opacity})`);
 *     }
 *     return `${backdrop}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
 *   }, [backdrop, opacity]);
 *
 *   useEffect(() => {
 *     setOpacity(visible ? 1 : 0);
 *   }, [visible]);
 *
 *   return (
 *     <div
 *       className="backdrop"
 *       style={{
 *         backgroundColor: backdropWithOpacity,
 *         transition: 'opacity 300ms ease'
 *       }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * Theme-aware backdrop:
 * ```tsx
 * function ThemedBackdrop() {
 *   const backdrop = useConfigurationBackdrop();
 *   const { theme } = useTheme();
 *
 *   const adjustedBackdrop = useMemo(() => {
 *     if (theme === 'dark') {
 *       // Make backdrop darker in dark mode
 *       return backdrop.replace('0.5', '0.8');
 *     }
 *     return backdrop;
 *   }, [backdrop, theme]);
 *
 *   return (
 *     <div
 *       className="modal-backdrop"
 *       style={{ backgroundColor: adjustedBackdrop }}
 *     />
 *   );
 * }
 * ```
 *
 * @remarks
 * - Supports all CSS color formats: hex, rgb, rgba, hsl, etc.
 * - Default backdrop is typically semi-transparent black
 * - Can be overridden at provider level or per-modal
 */
export const useConfigurationBackdrop = () => {
  const context = useConfigurationOptions();
  return context.backdrop;
};
