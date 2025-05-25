import type { FooterComponentProps } from '@/promise-modal/types';

export const FallbackFooter = ({
  confirmLabel,
  hideConfirm = false,
  cancelLabel,
  hideCancel = false,
  disabled,
  onConfirm,
  onCancel,
}: FooterComponentProps) => {
  return (
    <div>
      {!hideConfirm && (
        <button onClick={onConfirm} disabled={disabled}>
          {confirmLabel || 'Confirm'}
        </button>
      )}

      {!hideCancel && typeof onCancel === 'function' && (
        <button onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
      )}
    </div>
  );
};
