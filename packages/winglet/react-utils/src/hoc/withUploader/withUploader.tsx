import {
  type ChangeEvent,
  type ComponentType,
  type NamedExoticComponent,
  type MouseEvent,
  Fragment,
  memo,
  useMemo,
  useRef,
} from 'react';

import { isFunction } from '@winglet/common-utils/filter';

import type { Fn } from '@aileron/declare';

import { useCommittedReference } from '../../hooks/utils/useCommittedReference';
import { openFilePicker } from './utils/openFilePicker';

interface BaseProps {
  /** React handlers and wrappers forwarding their native click are accepted. */
  onClick?(event?: MouseEvent | globalThis.MouseEvent): void;
}

interface UploaderProps {
  acceptFormat?: string[];
  onChange?: Fn<[file: File]>;
}

/**
 * Transforms any clickable component into a file upload trigger with comprehensive file handling.
 *
 * This Higher-Order Component (HOC) enhances existing components by adding sophisticated file
 * upload capabilities. When the wrapped component is clicked, it opens a native file selection
 * dialog and provides callbacks for handling the selected files. The HOC maintains all original
 * component functionality while seamlessly integrating file upload behavior.
 *
 * ### Use Cases
 * - **Custom Upload Buttons**: Transform buttons, divs, or any clickable element into file uploaders
 * - **Drag-and-Drop Alternative**: Provide click-to-upload fallback for drag-and-drop interfaces
 * - **Form Integration**: Add file upload to form controls with custom styling
 * - **Image/Document Pickers**: Create specialized file selectors for different content types
 *
 * ### Key Features
 * - Preserves all original component props and behavior
 * - Supports file type filtering through accept formats
 * - Automatically clears input after file selection to allow repeated uploads
 * - Maintains component onClick functionality while adding upload trigger
 * - Uses hidden file input for clean UI integration
 * - Memory-optimized with React.memo for performance
 *
 * ### File Handling Details
 * - Only handles single file selection (uses first file from FileList)
 * - Clears input value after each selection to enable re-selecting the same file
 * - Calls original onClick handler before triggering file dialog
 * - Provides selected File object directly to onChange callback
 *
 * @example
 * ```typescript
 * // Basic button upload
 * const UploadButton = withUploader(Button);
 * const handleFileUpload = (file: File) => {
 *   console.log('Selected file:', file.name, file.size);
 *   // Process file...
 * };
 *
 * <UploadButton onChange={handleFileUpload}>
 *   Choose File
 * </UploadButton>
 *
 * // Image upload with format restriction
 * const ImageUploader = withUploader(({ children, ...props }) => (
 *   <div className="upload-zone" {...props}>
 *     {children}
 *   </div>
 * ));
 *
 * <ImageUploader
 *   acceptFormat={['.jpg', '.jpeg', '.png', '.gif']}
 *   onChange={(file) => setSelectedImage(file)}
 * >
 *   <img src={placeholderIcon} alt="Upload" />
 *   <span>Click to upload image</span>
 * </ImageUploader>
 *
 * // Document upload with multiple formats
 * const DocumentPicker = withUploader(Card);
 * <DocumentPicker
 *   acceptFormat={['.pdf', '.doc', '.docx', '.txt']}
 *   onChange={handleDocumentUpload}
 *   onClick={(e) => {
 *     console.log('Upload initiated');
 *     // Original click handler still works
 *   }}
 * >
 *   <Icon name="document" />
 *   <Text>Upload Document</Text>
 * </DocumentPicker>
 *
 * // Integration with existing form controls
 * const FileInputField = withUploader(FormField);
 * <FileInputField
 *   label="Profile Picture"
 *   acceptFormat={['.jpg', '.png']}
 *   onChange={(file) => {
 *     setFormData(prev => ({ ...prev, avatar: file }));
 *   }}
 * />
 * ```
 *
 * @typeParam Props - The type definition for the base component's props, must extend BaseProps with onClick
 * @param Component - The React component to enhance with file upload functionality
 * @returns A memoized component that combines the original component with file upload capabilities
 */
export const withUploader = <Props extends BaseProps>(
  Component: ComponentType<Props>,
): NamedExoticComponent<Omit<Props, 'onChange' | 'acceptFormat'> & {
  acceptFormat?: string[];
  onChange?: (file: File) => void;
}> =>
  memo(
    ({ onClick, onChange, acceptFormat, ...props }: Omit<Props, keyof UploaderProps> & UploaderProps & BaseProps) => {
      const inputRef = useRef<HTMLInputElement>(null);
      const accept = useMemo(() => acceptFormat?.join(','), [acceptFormat]);

      const callbacks = { onClick, onChange };
      const callbacksRef = useRef(callbacks);
      const previous = callbacksRef.current;
      useCommittedReference(
        callbacksRef,
        previous.onClick === onClick && previous.onChange === onChange
          ? previous
          : callbacks,
      );
      const { handleFileChange, handleClick } = useMemo(
        () => ({
          handleFileChange: ({ target }: ChangeEvent<HTMLInputElement>) => {
            const file = target?.files?.[0];
            if (file) callbacksRef.current.onChange?.(file);
            target.value = '';
          },
          handleClick: (e?: MouseEvent | globalThis.MouseEvent) => {
            const onClick = callbacksRef.current.onClick;
            if (isFunction(onClick)) onClick(e);
            const input = inputRef.current;
            if (input) openFilePicker(input);
          },
        }),
        [callbacksRef],
      );

      return (
        <Fragment>
          <input
            type="file"
            accept={accept}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            ref={inputRef}
          />
          <Component {...(props as Props)} onClick={handleClick} />
        </Fragment>
      );
    },
  );
