import React, { useCallback, useRef, useState } from 'react';

import {
  Form,
  type FormHandle,
  type FormTypeInputProps,
  type JsonSchema,
  type JsonSchemaError,
} from '../src';
import StoryLayout from './components/StoryLayout';

export default {
  title: 'Form/26. UploadFileUsecase',
};

/**
 * 파일 업로드용 FormTypeInput
 * - 파일은 onFileChange(File | File[])로 저장
 * - 스키마 값은 onChange로 파일 메타데이터만 저장
 */
const FileFormTypeInput = ({
  onFileChange,
  onChange,
  readOnly,
  disabled,
  value,
  jsonSchema,
}: FormTypeInputProps<any>) => {
  const multiple: boolean = jsonSchema?.FormTypeInputProps?.multiple ?? false;
  const accept: string | undefined = jsonSchema?.FormTypeInputProps?.accept;

  const handleChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const fileList = Array.from(e.target.files || []);
      if (fileList.length === 0) {
        onFileChange(undefined);
        onChange(undefined);
        return;
      }
      if (multiple) {
        onFileChange(fileList);
        const metaList = fileList.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
        }));
        onChange(metaList);
      } else {
        const file = fileList[0];
        onFileChange(file);
        onChange({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      }
    },
    [multiple, onChange, onFileChange],
  );

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={readOnly || disabled}
        onChange={handleChange}
      />
      <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};

export const SingleFile = () => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', default: 'single' },
      attachment: {
        type: 'object',
        FormTypeInput: FileFormTypeInput,
        FormTypeInputProps: { accept: '*/*', multiple: false },
        properties: {
          name: { type: 'string' },
          size: { type: 'number' },
          type: { type: 'string' },
          lastModified: { type: 'number' },
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => {
            const map = formHandle.current?.getFileMap();
            console.dir({
              files: Array.from(map?.values() ?? []),
              keys: Array.from(map?.keys() ?? []),
            });
          }}
        >
          getFileMap
        </button>
      </div>
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          onChange={setValue}
          onValidate={(e) => setErrors(e || [])}
        />
      </StoryLayout>
    </div>
  );
};

export const MultipleFiles = () => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', default: 'multiple' },
      attachments: {
        type: 'array',
        FormTypeInput: FileFormTypeInput,
        FormTypeInputProps: { accept: '*/*', multiple: true },
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            size: { type: 'number' },
            type: { type: 'string' },
            lastModified: { type: 'number' },
          },
        },
      },
    },
  } satisfies JsonSchema;

  const formHandle = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => {
            const map = formHandle.current?.getFileMap();
            console.dir({
              files: Array.from(map?.values() ?? []),
              keys: Array.from(map?.keys() ?? []),
            });
          }}
        >
          getFileMap size
        </button>
      </div>
      <StoryLayout jsonSchema={schema} value={value} errors={errors}>
        <Form
          ref={formHandle}
          jsonSchema={schema}
          onChange={setValue}
          onValidate={(e) => setErrors(e || [])}
        />
      </StoryLayout>
    </div>
  );
};

export const IfThenElseFileCleanup = () => {
  const schema = {
    type: 'object',
    properties: {
      category: { type: 'string', enum: ['movie', 'game'], default: 'movie' },
      poster: {
        type: 'object',
        FormTypeInput: FileFormTypeInput,
        FormTypeInputProps: { accept: 'image/*', multiple: false },
        properties: {
          name: { type: 'string' },
          size: { type: 'number' },
          type: { type: 'string' },
          lastModified: { type: 'number' },
        },
      },
    },
    if: {
      properties: { category: { const: 'movie' } },
    },
    then: {
      required: ['poster'],
    },
  } satisfies JsonSchema;

  const ref = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [keys, setKeys] = useState<string[]>([]);

  const refreshKeys = useCallback(() => {
    const map = ref.current?.getFileMap();
    setKeys(map ? Array.from(map.keys()) : []);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => {
            ref.current?.setValue({ category: 'movie' });
          }}
        >
          set category=movie
        </button>

        <button
          onClick={() => {
            ref.current?.setValue({ category: 'game' });
            // poster 필드가 사라지므로 fileMap에서 제거되어야 함
          }}
        >
          set category=game (cleanup)
        </button>
        <button
          onClick={() => {
            refreshKeys();
          }}
        >
          check fileMap
        </button>
        <span>fileMap keys: {keys.join(', ') || '-'}</span>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={ref} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const OneOfFileCleanup = () => {
  const schema = {
    type: 'object',
    oneOf: [
      {
        '&if': "./category==='movie'",
        properties: {
          trailer: {
            type: 'object',
            FormTypeInput: FileFormTypeInput,
            FormTypeInputProps: { accept: '*/*', multiple: false },
            properties: {
              name: { type: 'string' },
              size: { type: 'number' },
              type: { type: 'string' },
              lastModified: { type: 'number' },
            },
          },
        },
      },
      {
        '&if': "./category==='game'",
        properties: {
          manual: { type: 'string', default: 'text-only, no file input' },
        },
      },
    ],
    properties: {
      category: { type: 'string', enum: ['movie', 'game'], default: 'movie' },
      title: { type: 'string' },
    },
  } satisfies JsonSchema;

  const ref = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [keys, setKeys] = useState<string[]>([]);

  const refreshKeys = useCallback(() => {
    const map = ref.current?.getFileMap();
    setKeys(map ? Array.from(map.keys()) : []);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => {
            ref.current?.setValue({ category: 'movie' });
          }}
        >
          set category=movie
        </button>
        <button
          onClick={() => {
            ref.current?.setValue({ category: 'game' });
          }}
        >
          set category=game (cleanup)
        </button>
        <button
          onClick={() => {
            refreshKeys();
          }}
        >
          check fileMap
        </button>
        <span>fileMap keys: {keys.join(', ') || '-'}</span>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={ref} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export const UnmountFormCleanup = () => {
  const schema = {
    type: 'object',
    properties: {
      attachment: {
        type: 'object',
        FormTypeInput: FileFormTypeInput,
        FormTypeInputProps: { accept: '*/*', multiple: false },
        properties: {
          name: { type: 'string' },
          size: { type: 'number' },
          type: { type: 'string' },
          lastModified: { type: 'number' },
        },
      },
    },
  } satisfies JsonSchema;

  const [show, setShow] = useState(true);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const ref = useRef<FormHandle<typeof schema, any>>(null);
  const [lastSize, setLastSize] = useState<number>(0);

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={() => {
            setShow((s) => !s);
          }}
        >
          toggle form (capture map size then unmount)
        </button>
        <button
          onClick={() => {
            const size = ref.current?.getFileMap().size ?? 0;
            setLastSize(size);
          }}
        >
          check fileMap size
        </button>
        <span>last captured size: {lastSize}</span>
      </div>
      {show ? (
        <StoryLayout jsonSchema={schema} value={value}>
          <Form ref={ref} jsonSchema={schema} onChange={setValue} />
        </StoryLayout>
      ) : (
        <div>Form unmounted</div>
      )}
    </div>
  );
};
