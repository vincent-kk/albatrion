# @lumy-pack/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![Json Schema Form](https://img.shields.io/badge/JsonSchemaForm-form-red.svg)]()

---

## Overview

`@lumy-pack/schema-form` is a React-based component library that renders forms based on a provided [JSON Schema](https://json-schema.org/).

It utilizes JSON Schema for validation, leveraging [ajv@8](https://ajv.js.org/) for this purpose.

By defining various `FormTypeInput` components, it offers the flexibility to accommodate complex requirements with ease.

---

## How to use

```bash
yarn add @lumy-pack/schema-form
```

```tsx
import { Form } from '@lumy-pack/schema-form';

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
  };

  const defaultValues = {
    name: 'Woody',
    age: 30,
  };

  const [value, setValue] = useState<{
    name: string;
    age: number;
  }>(defaultValues);

  return (
    <Form
      jsonSchema={jsonSchema}
      defaultValues={defaultValues}
      onChange={setValue}
    />
  );
};
```

_Under Preparation_

---

## Contribution Guidelines

_Under Preparation_

---

## License

This repository is licensed under the MIT License. Please refer to the [`LICENSE`](./LICENSE) file for details.

---

## Contact

For inquiries or suggestions related to the project, please create an issue.
