import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ElementOf } from '@aileron/declare';

import {
  type ChildNodeComponentProps,
  Form,
  type FormTypeInputProps,
  type JsonSchema,
  registerPlugin,
} from '../src';
import StoryLayout from './components/StoryLayout';
import { plugin as validatorPlugin } from './components/validator';

registerPlugin(validatorPlugin);

export default {
  title: 'Form/32. Dynamic Object FormType',
};

export const DynamicObjectFormType = () => {
  const schema = {
    type: 'object',
    FormTypeInput: CustomObjectFormType,
    terminal: false,
    properties: {
      name: { type: 'string', default: 'John Smith' },
      age: { type: 'number', default: 30 },
      address: {
        type: 'string',
        default: '123 Main St, San Francisco, CA 94102',
      },
      phone: { type: 'string', default: '+1 (555) 123-4567' },
      email: { type: 'string', default: 'john.smith@example.com' },
      website: { type: 'string', default: 'https://johnsmith.dev' },
      company: { type: 'string', default: 'Tech Solutions Inc.' },
      position: { type: 'string', default: 'Senior Software Engineer' },
      department: { type: 'string', default: 'Engineering' },
      team: { type: 'string', default: 'Frontend Team' },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Value>({});

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <Form jsonSchema={schema} onChange={setValue} />
    </StoryLayout>
  );
};

type Value = Partial<{
  name: string;
  age: number;
  address: string;
  phone: string;
  email: string;
  website: string;
  company: string;
  position: string;
  department: string;
  team: string;
}>;

const fieldGroups = {
  basic: ['name', 'age'],
  contact: ['phone', 'email', 'website', 'address'],
  work: ['company', 'position', 'department', 'team'],
  grid: [
    'name',
    'age',
    'phone',
    'email',
    'website',
    'address',
    'company',
    'position',
    'department',
    'team',
  ],
} as const;

const CustomObjectFormType = ({
  onChange,
  defaultValue,
  ChildNodeComponents,
}: FormTypeInputProps<Value | undefined>) => {
  const ChildNodeMap = useMemo(() => {
    return ChildNodeComponents.reduce(
      (acc, component) => {
        acc[component.field as keyof Value] = component;
        return acc;
      },
      {} as Record<keyof Value, ElementOf<typeof ChildNodeComponents>>,
    );
  }, [ChildNodeComponents]);

  const [layoutMode, setLayoutMode] = useState<
    'basic' | 'work' | 'contact' | 'grid'
  >('basic');

  const [formData, setFormData] = useState<Value | undefined>();

  const handleFieldChange = useCallback(
    (field: keyof Value) => (value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  useEffect(() => {
    setFormData(
      defaultValue
        ? Object.fromEntries(
            Object.entries(defaultValue).filter(([key]) =>
              fieldGroups[layoutMode].includes(key as never),
            ),
          )
        : undefined,
    );
  }, [defaultValue, layoutMode, onChange]);

  // 각 필드별 컴포넌트를 메모이제이션하여 안정적으로 유지
  const fieldComponents = useMemo(() => {
    const components: Partial<Record<keyof Value, ReactNode>> = {};
    Object.keys(ChildNodeMap).forEach((field) => {
      const Component = ChildNodeMap[field as keyof Value] as ComponentType<
        ChildNodeComponentProps<Value[keyof Value]>
      >;
      if (Component) {
        components[field as keyof Value] = (
          <Component
            key={field}
            onChange={handleFieldChange(field as keyof Value)}
            defaultValue={defaultValue?.[field as keyof Value]}
          />
        );
      }
    });
    return components;
  }, [ChildNodeMap, handleFieldChange, defaultValue]);

  const renderFields = useCallback(
    (fields: readonly (keyof Value)[]) => {
      return fields.map((field) => fieldComponents[field]).filter(Boolean);
    },
    [fieldComponents],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 레이아웃 컨트롤 */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <label
          style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}
        >
          레이아웃 모드 선택:
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setLayoutMode('basic')}
            style={{
              padding: '8px 16px',
              backgroundColor: layoutMode === 'basic' ? '#007bff' : '#fff',
              color: layoutMode === 'basic' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            기본 정보
          </button>
          <button
            onClick={() => setLayoutMode('work')}
            style={{
              padding: '8px 16px',
              backgroundColor: layoutMode === 'work' ? '#007bff' : '#fff',
              color: layoutMode === 'work' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            회사 정보
          </button>
          <button
            onClick={() => setLayoutMode('contact')}
            style={{
              padding: '8px 16px',
              backgroundColor: layoutMode === 'contact' ? '#007bff' : '#fff',
              color: layoutMode === 'contact' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            연락처 정보
          </button>
          <button
            onClick={() => setLayoutMode('grid')}
            style={{
              padding: '8px 16px',
              backgroundColor: layoutMode === 'grid' ? '#007bff' : '#fff',
              color: layoutMode === 'grid' ? '#fff' : '#000',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            그리드 뷰
          </button>
        </div>
      </div>

      {/* 레이아웃별 필드 렌더링 */}
      {layoutMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>기본 정보</h3>
            {renderFields(fieldGroups.basic)}
          </div>
          <div>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>연락처</h3>
            {renderFields(fieldGroups.contact)}
          </div>
          <div>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>회사 정보</h3>
            {renderFields(fieldGroups.work)}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ marginBottom: '8px', color: '#333' }}>
            {layoutMode === 'basic' && '기본 정보'}
            {layoutMode === 'work' && '회사 정보'}
            {layoutMode === 'contact' && '연락처 정보'}
          </h3>
          {renderFields(fieldGroups[layoutMode])}
        </div>
      )}
    </div>
  );
};
