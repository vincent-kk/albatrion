import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from '@codesandbox/sandpack-react';

const defaultSchema = `{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name"
    },
    "age": {
      "type": "number",
      "title": "Age"
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    },
    "agree": {
      "type": "boolean",
      "title": "I agree to terms"
    }
  },
  "required": ["name", "email"]
}`;

const appCode = `import { Form, registerPlugin } from "@canard/schema-form";
import { Antd5Plugin } from "@canard/schema-form-antd5-plugin";
import { Ajv8Plugin } from "@canard/schema-form-ajv8-plugin";
import schema from "./schema.json";

registerPlugin(Antd5Plugin);
registerPlugin(Ajv8Plugin);

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <Form
        schema={schema}
        showError
        onSubmit={(value) => {
          alert(JSON.stringify(value, null, 2));
        }}
      />
    </div>
  );
}
`;

interface SchemaFormPlaygroundProps {
  schema?: string;
  code?: string;
}

export default function SchemaFormPlayground({
  schema = defaultSchema,
  code = appCode,
}: SchemaFormPlaygroundProps) {
  return (
    <SandpackProvider
      template="react"
      theme="auto"
      files={{
        '/App.js': { code, active: true },
        '/schema.json': { code: schema },
      }}
      customSetup={{
        dependencies: {
          '@canard/schema-form': '0.10.5',
          '@canard/schema-form-antd5-plugin': '0.10.0',
          '@canard/schema-form-ajv8-plugin': '0.10.0',
          antd: '^5.10.0',
          dayjs: '^1.11.0',
        },
      }}
      options={{
        externalResources: [],
      }}>
      <SandpackLayout>
        <SandpackCodeEditor
          showTabs
          showLineNumbers
          style={{ height: 480 }}
        />
        <SandpackPreview
          showOpenInCodeSandbox={false}
          style={{ height: 480 }}
        />
      </SandpackLayout>
    </SandpackProvider>
  );
}
