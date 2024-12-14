import type { FooterComponentProps } from '@/promise-modal/types';

export const FallbackFooter = ({
  confirmLabel,
  hideConfirm = false,
  cancelLabel,
  hideCancel = false,
  disable,
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
          disabled={disable}
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
