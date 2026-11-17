import { useRef, useState } from "react";
import {
  Form,
  SetValueOption,
  type FormHandle,
  type JSONSchema,
} from "@canard/schema-form";
import StoryLayout from "../components/StoryLayout";
const schema = {
  type: "object",
  properties: {
    mode: {
      type: "string",
      enum: ["A", "B"],
      default: "A",
    },
  },
  oneOf: [
    {
      controls: { active: "./mode === 'A'" },
      properties: {
        branch: {
          type: "object",
          properties: {
            value: { type: "string" },
            A_value: { type: "string" },
            A_value2: { type: "number" },
            A_value3: { type: "boolean" },
          },
          options: { terminal: false },
          presentation: {
            FieldInput: ({ value, ChildFields, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: "valueA",
                        A_value: "valueA",
                        A_value2: 100,
                        A_value3: true,
                        B_value: "valueB",
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                  <div>
                    {ChildFields.map((ChildField) => (
                      <ChildField key={ChildField.key} />
                    ))}
                  </div>
                </div>
              );
            },
          },
        },
        terminal: {
          type: "object",
          properties: {
            value: { type: "string" },
            A_value: { type: "string" },
            A_value2: { type: "number" },
            A_value3: { type: "boolean" },
          },
          presentation: {
            FieldInput: ({ value, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: "valueA",
                        A_value: "valueA",
                        A_value2: 100,
                        A_value3: true,
                        B_value: "valueB",
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                </div>
              );
            },
          },
        },
      },
    },
    {
      controls: { active: "./mode === 'B'" },
      properties: {
        branch: {
          type: "object",
          properties: {
            value: { type: "string" },
            B_value: { type: "string" },
            B_value2: { type: "number" },
            B_value3: { type: "boolean" },
          },
          options: { terminal: false },
          additionalProperties: false,
          presentation: {
            FieldInput: ({ value, ChildFields, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: "valueA",
                        A_value: "valueA",
                        A_value2: 100,
                        A_value3: true,
                        B_value: "valueB",
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                  <div>
                    {ChildFields.map((ChildField) => (
                      <ChildField key={ChildField.key} />
                    ))}
                  </div>
                </div>
              );
            },
          },
        },
        terminal: {
          type: "object",
          properties: {
            value: { type: "string" },
            B_value: { type: "string" },
            B_value2: { type: "number" },
            B_value3: { type: "boolean" },
          },
          additionalProperties: false,
          presentation: {
            FieldInput: ({ value, onChange }) => {
              return (
                <div>
                  <pre>{JSON.stringify(value, null, 2)}</pre>
                  <button
                    onClick={() =>
                      onChange({
                        value: "valueA",
                        A_value: "valueA",
                        A_value2: 100,
                        A_value3: true,
                        B_value: "valueB",
                        B_value2: 100,
                        B_value3: true,
                      })
                    }
                  >
                    set
                  </button>
                </div>
              );
            },
          },
        },
      },
    },
  ],
} satisfies JSONSchema;

const CanardForm = () => {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const formHandle =
    useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);
  const revision = useRef(0);

  return (
    <StoryLayout jsonSchema={schema} value={value}>
      <button
        onClick={() =>
          formHandle.current?.setValue({ mode: "A" }, SetValueOption.Merge)
        }
      >
        Set Mode A
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({ mode: "B" }, SetValueOption.Merge)
        }
      >
        Set Mode B
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            mode: "A",
            branch: {
              value: "valueA",
              A_value: "valueA",
              A_value2: 100,
              A_value3: true,
              B_value: "valueB",
              B_value2: 100,
              B_value3: true,
            },
            terminal: {
              value: "valueA",
              A_value: "valueA",
              A_value2: 100,
              A_value3: true,
              B_value: "valueB",
              B_value2: 100,
              B_value3: true,
            },
          })
        }
      >
        Set Mode A (Overwrite)
      </button>
      <button
        onClick={() =>
          formHandle.current?.setValue({
            mode: "B",
            branch: {
              value: "valueB",
              A_value: "valueA",
              A_value2: 100,
              A_value3: true,
              B_value: "valueB",
              B_value2: 100,
              B_value3: true,
            },
            terminal: {
              value: "valueA",
              A_value: "valueA",
              A_value2: 100,
              A_value3: true,
              B_value: "valueB",
              B_value2: 100,
              B_value3: true,
            },
          })
        }
      >
        Set Mode B (Overwrite)
      </button>
      <Form
        jsonSchema={schema}
        onChange={(input) => {
          console.log("onChange", revision.current++, input);
          setValue(input as Record<string, unknown>);
        }}
        ref={formHandle}
      />
    </StoryLayout>
  );
};

export default CanardForm;
