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
 * - 파일은 onFileAttach(File | File[])로 저장
 * - 스키마 값은 onChange로 파일 메타데이터만 저장
 */
const FileFormTypeInput = ({
  onFileAttach,
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
        onFileAttach(undefined);
        onChange(undefined);
        return;
      }
      if (multiple) {
        onFileAttach(fileList);
        const metaList = fileList.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
        }));
        onChange(metaList);
      } else {
        const file = fileList[0];
        onFileAttach(file);
        onChange({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      }
    },
    [multiple, onChange, onFileAttach],
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
            const map = formHandle.current?.getAttachedFilesMap();
            console.dir({
              files: Array.from(map?.values() ?? []),
              keys: Array.from(map?.keys() ?? []),
            });
          }}
        >
          handleFileAttach
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
            const map = formHandle.current?.getAttachedFilesMap();
            console.dir({
              files: Array.from(map?.values() ?? []),
              keys: Array.from(map?.keys() ?? []),
            });
          }}
        >
          handleFileAttach size
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
    const map = ref.current?.getAttachedFilesMap();
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
        '&if': "./category === 'movie'",
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
        '&if': "./category === 'game'",
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
    const map = ref.current?.getAttachedFilesMap();
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
            const size = ref.current?.getAttachedFilesMap().size ?? 0;
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

/**
 * Comprehensive test story for AttachedFilesMap
 * - Test single file stored as File[]
 * - Test multiple files stored as File[]
 * - Real-time visualization of file map state
 * - Easy testing with buttons and mock files
 */
export const ComprehensiveFilesMapTest = () => {
  const schema = {
    type: 'object',
    properties: {
      title: { type: 'string', default: 'Test Form' },
      singleFile: {
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
      multipleFiles: {
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

  const ref = useRef<FormHandle<typeof schema, any>>(null);
  const [value, setValue] = useState<Record<string, unknown>>({});
  const [mapInfo, setMapInfo] = useState<
    Array<{
      path: string;
      isArray: boolean;
      length: number;
      fileNames: string[];
    }>
  >([]);

  const refreshMapInfo = useCallback(() => {
    const map = ref.current?.getAttachedFilesMap();
    if (!map) {
      setMapInfo([]);
      return;
    }

    const info = Array.from(map.entries()).map(([path, files]) => ({
      path,
      isArray: Array.isArray(files),
      length: files.length,
      fileNames: files.map((f) => f.name),
    }));
    setMapInfo(info);
  }, []);

  const createMockFile = (name: string, _size: number = 1024) => {
    return new File(['mock content'], name, {
      type: 'text/plain',
      lastModified: Date.now(),
    });
  };

  const simulateSingleFileUpload = () => {
    const file = createMockFile('single-test.txt', 2048);
    const singleFileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"]:not([multiple])',
    );
    if (singleFileInput) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      singleFileInput.files = dataTransfer.files;
      singleFileInput.dispatchEvent(new Event('change', { bubbles: true }));
      setTimeout(refreshMapInfo, 100);
    }
  };

  const simulateMultipleFilesUpload = () => {
    const files = [
      createMockFile('multi-1.txt', 1024),
      createMockFile('multi-2.txt', 2048),
      createMockFile('multi-3.txt', 3072),
    ];
    const multipleFileInput = document.querySelector<HTMLInputElement>(
      'input[type="file"][multiple]',
    );
    if (multipleFileInput) {
      const dataTransfer = new DataTransfer();
      files.forEach((f) => dataTransfer.items.add(f));
      multipleFileInput.files = dataTransfer.files;
      multipleFileInput.dispatchEvent(new Event('change', { bubbles: true }));
      setTimeout(refreshMapInfo, 100);
    }
  };

  const clearAllFiles = () => {
    ref.current?.setValue({});
    setTimeout(refreshMapInfo, 100);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={simulateSingleFileUpload}>
          📄 Add Single File (mock)
        </button>
        <button onClick={simulateMultipleFilesUpload}>
          📁 Add Multiple Files (mock)
        </button>
        <button onClick={clearAllFiles}>🗑️ Clear All</button>
        <button onClick={refreshMapInfo}>🔄 Refresh Map Info</button>
      </div>

      {/* Real-time File Map Visualization */}
      <div
        style={{
          marginBottom: 16,
          padding: 16,
          border: '2px solid #4CAF50',
          borderRadius: 8,
          backgroundColor: '#f1f8f4',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', color: '#2E7D32' }}>
          📊 AttachedFilesMap State
        </h3>
        {mapInfo.length === 0 ? (
          <p style={{ margin: 0, color: '#666' }}>Map is empty</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {mapInfo.map((info, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  backgroundColor: 'white',
                  borderRadius: 4,
                  border: '1px solid #ddd',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <strong>Path:</strong>{' '}
                  <code style={{ color: '#d32f2f' }}>{info.path}</code>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Type:</strong>{' '}
                  <code style={{ color: info.isArray ? '#4CAF50' : '#ff9800' }}>
                    {info.isArray ? 'File[]' : 'Not Array (!)'}
                  </code>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <strong>Length:</strong>{' '}
                  <span
                    style={{
                      color: info.length === 1 ? '#2196F3' : '#9C27B0',
                      fontWeight: 'bold',
                    }}
                  >
                    {info.length} file{info.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <strong>Files:</strong>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                    {info.fileNames.map((name, i) => (
                      <li key={i}>
                        <code>{name}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        <div
          style={{
            marginTop: 12,
            padding: 8,
            backgroundColor: '#fff3cd',
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          <strong>✅ Expected Behavior:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
            <li>Single file should be stored as File[] with length 1</li>
            <li>Multiple files should be stored as File[] with length &gt; 1</li>
            <li>All values should show "Type: File[]" (not "Not Array")</li>
          </ul>
        </div>
      </div>

      <StoryLayout jsonSchema={schema} value={value}>
        <Form ref={ref} jsonSchema={schema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};
