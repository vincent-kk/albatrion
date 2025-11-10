import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  type ChildComponentProps,
  Form,
  type FormTypeInputProps,
  type JsonSchema,
} from "@canard/schema-form";

export default function DynamicObjectFormTypeTest() {
  const schema = {
    type: "object",
    FormTypeInput: CustomObjectFormType,
    terminal: false,
    properties: {
      name: { type: "string", default: "John Smith" },
      age: { type: "number", default: 30 },
      address: {
        type: "string",
        default: "123 Main St, San Francisco, CA 94102",
      },
      phone: { type: "string", default: "+1 (555) 123-4567" },
      email: { type: "string", default: "john.smith@example.com" },
      website: { type: "string", default: "https://johnsmith.dev" },
      company: { type: "string", default: "Tech Solutions Inc." },
      position: { type: "string", default: "Senior Software Engineer" },
      department: { type: "string", default: "Engineering" },
      team: { type: "string", default: "Frontend Team" },
    },
  } satisfies JsonSchema;

  const [value, setValue] = useState<Value>({});

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        color: "#000",
      }}
    >
      <h1 style={{ marginBottom: "24px", color: "#fff" }}>
        Dynamic Object FormType Test
      </h1>
      <p style={{ marginBottom: "24px", color: "#ccc" }}>
        ChildNodeComponents를 동적으로 제어하는 테스트입니다. 레이아웃 모드를
        변경하면 표시되는 필드가 동적으로 변경됩니다.
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
      >
        <div
          style={{
            backgroundColor: "#AAA",
            color: "#000",
            padding: "16px",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ marginBottom: "16px", color: "#000" }}>Form</h2>
          <Form jsonSchema={schema} onChange={setValue} />
        </div>

        <div>
          <h2 style={{ marginBottom: "16px", color: "#000" }}>Current Value</h2>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              overflow: "auto",
              maxHeight: "600px",
            }}
          >
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

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
  basic: ["name", "age"],
  contact: ["phone", "email", "website", "address"],
  work: ["company", "position", "department", "team"],
  grid: [
    "name",
    "age",
    "phone",
    "email",
    "website",
    "address",
    "company",
    "position",
    "department",
    "team",
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
      {} as Record<keyof Value, (typeof ChildNodeComponents)[number]>,
    );
  }, [ChildNodeComponents]);

  const [layoutMode, setLayoutMode] = useState<
    "basic" | "work" | "contact" | "grid"
  >("basic");

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
  }, [defaultValue, layoutMode]);

  // 각 필드별 컴포넌트를 메모이제이션하여 안정적으로 유지
  const fieldComponents = useMemo(() => {
    const components: Partial<Record<keyof Value, ReactNode>> = {};
    Object.keys(ChildNodeMap).forEach((field) => {
      const Component = ChildNodeMap[field as keyof Value] as ComponentType<
        ChildComponentProps<Value[keyof Value]>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 레이아웃 컨트롤 */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <label
          style={{ fontWeight: "bold", marginBottom: "8px", display: "block" }}
        >
          레이아웃 모드 선택:
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setLayoutMode("basic")}
            style={{
              padding: "8px 16px",
              backgroundColor: layoutMode === "basic" ? "#007bff" : "#fff",
              color: layoutMode === "basic" ? "#fff" : "#000",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            기본 정보
          </button>
          <button
            onClick={() => setLayoutMode("work")}
            style={{
              padding: "8px 16px",
              backgroundColor: layoutMode === "work" ? "#007bff" : "#fff",
              color: layoutMode === "work" ? "#fff" : "#000",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            회사 정보
          </button>
          <button
            onClick={() => setLayoutMode("contact")}
            style={{
              padding: "8px 16px",
              backgroundColor: layoutMode === "contact" ? "#007bff" : "#fff",
              color: layoutMode === "contact" ? "#fff" : "#000",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            연락처 정보
          </button>
          <button
            onClick={() => setLayoutMode("grid")}
            style={{
              padding: "8px 16px",
              backgroundColor: layoutMode === "grid" ? "#007bff" : "#fff",
              color: layoutMode === "grid" ? "#fff" : "#000",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            그리드 뷰
          </button>
        </div>
      </div>

      {/* 레이아웃별 필드 렌더링 */}
      {layoutMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <h3 style={{ marginBottom: "12px", color: "#000" }}>기본 정보</h3>
            {renderFields(fieldGroups.basic)}
          </div>
          <div>
            <h3 style={{ marginBottom: "12px", color: "#000" }}>연락처</h3>
            {renderFields(fieldGroups.contact)}
          </div>
          <div>
            <h3 style={{ marginBottom: "12px", color: "#000" }}>회사 정보</h3>
            {renderFields(fieldGroups.work)}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h3 style={{ marginBottom: "8px", color: "#000" }}>
            {layoutMode === "basic" && "기본 정보"}
            {layoutMode === "work" && "회사 정보"}
            {layoutMode === "contact" && "연락처 정보"}
          </h3>
          {renderFields(fieldGroups[layoutMode])}
        </div>
      )}
    </div>
  );
};
