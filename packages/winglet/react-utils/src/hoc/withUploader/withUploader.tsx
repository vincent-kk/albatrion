import {
  type ChangeEvent,
  type ComponentType,
  Fragment,
  memo,
  useMemo,
  useRef,
} from 'react';

import { isFunction } from '@winglet/common-utils';

import type { Fn } from '@aileron/declare';

import { useHandle } from '@/react-utils/hooks/useHandle';

interface BaseProps {
  onClick?: Fn<[e?: MouseEvent]>;
}

interface UploaderProps {
  acceptFormat?: string[];
  onChange?: Fn<[file: File]>;
}

/**
 * 컴포넌트에 파일 업로드 기능을 추가하는 HOC입니다.
 * 클릭 이벤트가 발생하면 파일 선택 대화상자가 열리고, 파일이 선택되면 onChange 콜백이 호출됩니다.
 * @typeParam Props - 컴포넌트 기본 프로퍼티 타입
 * @param Component - 업로더를 추가할 컴포넌트
 * @returns 파일 업로드 기능이 추가된 컴포넌트
 * @example
 * const FileUploadButton = withUploader(Button);
 * <FileUploadButton acceptFormat={[".jpg", ".png"]} onChange={handleFileChange}>
 *   Upload Image
 * </FileUploadButton>
 */
export const withUploader = <Props extends BaseProps>(
  Component: ComponentType<Props>,
) =>
  memo(
    ({ onClick, onChange, acceptFormat, ...props }: Props & UploaderProps) => {
      const inputRef = useRef<HTMLInputElement>(null);
      const accept = useMemo(() => acceptFormat?.join(','), [acceptFormat]);

      const handleFileChange = useHandle(
        ({ target }: ChangeEvent<HTMLInputElement>) => {
          const file = target?.files?.[0];
          if (file) onChange?.(file);
          target.value = '';
        },
      );

      const handleClick = useHandle((e: MouseEvent) => {
        if (isFunction(onClick)) onClick(e);
        inputRef.current?.click();
      });

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
