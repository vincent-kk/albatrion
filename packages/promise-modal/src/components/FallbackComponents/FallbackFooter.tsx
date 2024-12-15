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
        <button
          onClick={() => {
            onConfirm();
          }}
          disabled={disabled}
        >
          {confirmLabel || '확인'}
        </button>
      )}

      {!hideCancel && typeof onCancel === 'function' && (
        <button
          onClick={() => {
            onCancel();
          }}
        >
          {cancelLabel || '취소'}
        </button>
      )}
    </div>
  );
};
