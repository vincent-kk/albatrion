import { useModal } from '../../src';

/** Opens nondimmed requests so the page can still unmount their owner. */
export function OwnedModalButtons({
  label,
  onResult,
}: {
  label: string;
  onResult: (result: string) => void;
}) {
  const modal = useModal({ dimmed: false, closeOnBackdropClick: false });
  return (
    <fieldset>
      <legend>{label}</legend>
      <button
        onClick={() =>
          void modal
            .alert({ title: label })
            .then(() => onResult(`${label}: alert completed`))
        }
      >
        Alert
      </button>
      <button
        onClick={() =>
          void modal
            .confirm({ title: label })
            .then((value) => onResult(`${label}: confirm ${value}`))
        }
      >
        Confirm
      </button>
      <button
        onClick={() =>
          void modal
            .prompt<string>({
              title: label,
              defaultValue: '',
              Input: ({ value, onChange }) => (
                <input
                  aria-label={`${label} input`}
                  value={value ?? ''}
                  onChange={(event) => onChange(event.target.value)}
                />
              ),
            })
            .then((value) => onResult(`${label}: prompt ${String(value)}`))
        }
      >
        Prompt
      </button>
    </fieldset>
  );
}
