import type { FieldInputProps } from '../../../../src';

/**
 * A single or multiple file input: it attaches the chosen files and stores their names as the node value.
 * @param props - FieldInput props; `multiple` comes from the definition wrapper below.
 * @returns A native file input.
 */
function FileInput({ path, onChange, onFileAttach, multiple }: FieldInputProps & { multiple: boolean }) {
  return <input id={path} type="file" multiple={multiple} onChange={(event) => {
    const files = Array.from(event.target.files ?? []);
    onFileAttach(multiple ? files : files[0]);
    onChange(multiple ? files.map((file) => file.name) : files[0]?.name);
  }} />;
}

/** Single-file input for `presentation.inputType` "input-components.file". */
export const SingleFileInput = (props: FieldInputProps) => <FileInput {...props} multiple={false} />;

/** Multi-file input for `presentation.inputType` "input-components.files". */
export const MultipleFileInput = (props: FieldInputProps) => <FileInput {...props} multiple />;
