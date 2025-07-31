import { useLayoutEffect } from 'react';

import type { Fn } from '@aileron/declare';

/**
 * Executes a cleanup function synchronously when the component unmounts, before browser painting.
 *
 * This hook is the synchronous version of `useOnUnmount`, using `useLayoutEffect` to ensure
 * cleanup runs before the browser reflows or repaints. This prevents visual glitches, layout
 * shifts, and DOM inconsistencies during component removal.
 *
 * ### When to Use Over useOnUnmount
 * - **Prevent Visual Flicker**: Remove DOM nodes before layout recalculation
 * - **Animation Cleanup**: Cancel in-progress animations before next frame
 * - **Global Style Restoration**: Reset document/body styles before paint
 * - **Portal Management**: Remove portal containers before DOM updates
 * - **Synchronous Library APIs**: Clean up libraries that require immediate DOM cleanup
 *
 * ### Performance Warning
 * **This blocks browser painting** - use sparingly and only when synchronous cleanup
 * is essential to prevent visual artifacts. For most cleanup, prefer `useOnUnmount`.
 *
 * ### Critical Limitations (Same as useOnUnmount)
 * - **Stale Closure Warning**: Handler captures values at mount time only
 * - **No State Updates**: Handler won't see later state or prop changes
 * - Use `useReference` for accessing current state in cleanup
 *
 * @example
 * ```typescript
 * // Portal cleanup to prevent layout shift
 * const portalRoot = useRef<HTMLDivElement>();
 *
 * useOnMountLayout(() => {
 *   portalRoot.current = document.createElement('div');
 *   portalRoot.current.className = 'modal-portal';
 *   document.body.appendChild(portalRoot.current);
 * });
 *
 * useOnUnmountLayout(() => {
 *   // Must remove synchronously to prevent layout issues
 *   portalRoot.current?.remove();
 * });
 *
 * // Stop animations before component removal
 * const animatingElementsRef = useReference(animatingElements);
 *
 * useOnUnmountLayout(() => {
 *   animatingElementsRef.current.forEach(element => {
 *     element.style.animation = 'none';
 *     element.style.transition = 'none';
 *     element.getAnimations().forEach(anim => anim.cancel());
 *   });
 * });
 *
 * // Body scroll lock with synchronous restoration
 * const originalBodyStylesRef = useRef<{
 *   overflow: string;
 *   position: string;
 *   touchAction: string;
 * }>();
 *
 * useOnMountLayout(() => {
 *   const body = document.body;
 *   originalBodyStylesRef.current = {
 *     overflow: body.style.overflow,
 *     position: body.style.position,
 *     touchAction: body.style.touchAction,
 *   };
 *
 *   body.style.overflow = 'hidden';
 *   body.style.position = 'fixed';
 *   body.style.touchAction = 'none';
 * });
 *
 * useOnUnmountLayout(() => {
 *   const body = document.body;
 *   const original = originalBodyStylesRef.current;
 *   if (original) {
 *     body.style.overflow = original.overflow;
 *     body.style.position = original.position;
 *     body.style.touchAction = original.touchAction;
 *   }
 * });
 *
 * // Drag-and-drop state cleanup before paint
 * const dragStateRef = useReference(dragState);
 *
 * useOnUnmountLayout(() => {
 *   // Remove all drag-related DOM elements
 *   document.querySelectorAll('.drag-ghost, .drop-indicator')
 *     .forEach(el => el.remove());
 *
 *   // Reset global cursor and selection
 *   document.body.style.cursor = '';
 *   document.body.classList.remove('dragging');
 *   window.getSelection()?.removeAllRanges();
 *
 *   // Clear drag data if still active
 *   if (dragStateRef.current.isActive) {
 *     dragStateRef.current.cleanup();
 *   }
 * });
 *
 * // Synchronous editor cleanup (prevents memory leaks)
 * const editorInstanceRef = useRef<CodeMirror.Editor>();
 *
 * useOnUnmountLayout(() => {
 *   const editor = editorInstanceRef.current;
 *   if (editor) {
 *     // Some editors require synchronous cleanup to prevent errors
 *     editor.toTextArea(); // Restore original textarea
 *     editor.getWrapperElement().remove(); // Remove DOM immediately
 *     editorInstanceRef.current = undefined;
 *   }
 * });
 *
 * // WebGL context cleanup before reflow
 * const canvasRef = useRef<HTMLCanvasElement>();
 * const glContextRef = useRef<WebGLRenderingContext>();
 *
 * useOnUnmountLayout(() => {
 *   const gl = glContextRef.current;
 *   if (gl) {
 *     // Synchronously release WebGL resources
 *     const extension = gl.getExtension('WEBGL_lose_context');
 *     extension?.loseContext();
 *
 *     // Clear canvas immediately
 *     if (canvasRef.current) {
 *       canvasRef.current.width = 1;
 *       canvasRef.current.height = 1;
 *     }
 *   }
 * });
 * ```
 *
 * @param handler - The cleanup function to execute synchronously when the component unmounts
 */
export const useOnUnmountLayout = (handler: Fn) => {
  useLayoutEffect(() => {
    return handler;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
