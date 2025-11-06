import type { ComponentType, ReactNode } from 'react';

import { ModalManager } from '@/promise-modal/app/ModalManager';
import type {
  BackgroundComponent,
  ConfirmContentProps,
  ConfirmFooterRender,
  FooterOptions,
  ForegroundComponent,
  ModalBackground,
} from '@/promise-modal/types';

interface ConfirmProps<BackgroundValue> {
  group?: string;
  subtype?: 'info' | 'success' | 'warning' | 'error';
  title?: ReactNode;
  subtitle?: ReactNode;
  content?: ReactNode | ComponentType<ConfirmContentProps>;
  background?: ModalBackground<BackgroundValue>;
  footer?: ConfirmFooterRender | FooterOptions | false;
  dimmed?: boolean;
  manualDestroy?: boolean;
  closeOnBackdropClick?: boolean;
  ForegroundComponent?: ForegroundComponent;
  BackgroundComponent?: BackgroundComponent;
}

/**
 * Displays a promise-based confirmation modal that resolves with a boolean result.
 *
 * Creates a modal dialog with two action buttons (typically "OK/Cancel" or "Yes/No").
 * The promise resolves with `true` when confirmed, `false` when cancelled.
 *
 * @typeParam BackgroundValue - Type of background data passed to BackgroundComponent
 * @param props - Confirmation dialog configuration options
 * @returns Promise that resolves to true if confirmed, false if cancelled
 *
 * @example
 * Basic confirmation:
 * ```tsx
 * const shouldDelete = await confirm({
 *   title: 'Delete Item?',
 *   content: 'This action cannot be undone.',
 * });
 *
 * if (shouldDelete) {
 *   await deleteItem();
 * }
 * ```
 *
 * @example
 * Destructive action with warning:
 * ```tsx
 * const shouldProceed = await confirm({
 *   subtype: 'error',
 *   title: 'Delete Account',
 *   content: 'Are you sure you want to delete your account? All data will be permanently lost.',
 *   footer: {
 *     confirm: 'Delete Account',
 *     cancel: 'Keep Account',
 *     confirmDanger: true,
 *   },
 * });
 * ```
 *
 * @example
 * Custom content with details:
 * ```tsx
 * const ConfirmDetails = ({ onConfirm, onCancel }) => (
 *   <div>
 *     <p>The following items will be affected:</p>
 *     <ul>
 *       <li>15 documents</li>
 *       <li>42 images</li>
 *       <li>3 videos</li>
 *     </ul>
 *     <p>Total size: 1.2 GB</p>
 *   </div>
 * );
 *
 * const confirmed = await confirm({
 *   title: 'Move to Trash?',
 *   content: ConfirmDetails,
 * });
 * ```
 *
 * @example
 * Custom footer with additional actions:
 * ```tsx
 * confirm({
 *   title: 'Save Changes?',
 *   content: 'You have unsaved changes.',
 *   footer: ({ onConfirm, onCancel, context }) => (
 *     <div className="save-dialog-footer">
 *       <button onClick={onCancel}>Don\'t Save</button>
 *       <button onClick={() => {
 *         saveAsDraft();
 *         onCancel();
 *       }}>Save as Draft</button>
 *       <button onClick={onConfirm} className="primary">
 *         Save and Publish
 *       </button>
 *     </div>
 *   ),
 * });
 * ```
 *
 * @example
 * Conditional confirmation flow:
 * ```tsx
 * async function deleteWithConfirmation(item) {
 *   // First confirmation
 *   const confirmDelete = await confirm({
 *     title: `Delete "${item.name}"?`,
 *     content: 'This item will be moved to trash.',
 *   });
 *
 *   if (!confirmDelete) return;
 *
 *   // Check if item has dependencies
 *   if (item.dependencies.length > 0) {
 *     const confirmForce = await confirm({
 *       subtype: 'warning',
 *       title: 'Item has dependencies',
 *       content: `${item.dependencies.length} other items depend on this. Delete anyway?`,
 *       footer: {
 *         confirm: 'Force Delete',
 *         confirmDanger: true,
 *       },
 *     });
 *
 *     if (!confirmForce) return;
 *   }
 *
 *   await deleteItem(item.id);
 * }
 * ```
 *
 * @example
 * With loading state:
 * ```tsx
 * const shouldExport = await confirm({
 *   title: 'Export Data',
 *   content: 'Export may take several minutes for large datasets.',
 *   footer: ({ onConfirm, onCancel }) => {
 *     const [loading, setLoading] = useState(false);
 *
 *     const handleExport = async () => {
 *       setLoading(true);
 *       await startExport();
 *       onConfirm();
 *     };
 *
 *     return (
 *       <>
 *         <button onClick={onCancel}>Cancel</button>
 *         <button
 *           onClick={handleExport}
 *           disabled={loading}
 *         >
 *           {loading ? 'Exporting...' : 'Start Export'}
 *         </button>
 *       </>
 *     );
 *   },
 * });
 * ```
 *
 * @remarks
 * - Returns `true` only when explicitly confirmed via the confirm action
 * - Returns `false` for cancel action or backdrop click (if enabled)
 * - Use `subtype` to indicate severity (error for destructive actions)
 * - The `footer` prop allows complete customization of button layout and behavior
 */
export const confirm = <BackgroundValue = any>({
  group,
  subtype,
  title,
  subtitle,
  content,
  background,
  footer,
  dimmed,
  manualDestroy,
  closeOnBackdropClick,
  ForegroundComponent,
  BackgroundComponent,
}: ConfirmProps<BackgroundValue>) => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      ModalManager.open({
        type: 'confirm',
        group,
        subtype,
        resolver: (result) => resolve(result ?? false),
        title,
        subtitle,
        content,
        background,
        footer,
        dimmed,
        manualDestroy,
        closeOnBackdropClick,
        ForegroundComponent,
        BackgroundComponent,
      });
    } catch (error) {
      reject(error);
    }
  });
};
