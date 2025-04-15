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
