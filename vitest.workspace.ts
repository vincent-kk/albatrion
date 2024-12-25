import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/react-utils/vite.config.ts",
  "./packages/common-utils/vite.config.ts",
  "./packages/schema-form-antd-plugin/vite.config.ts",
  "./packages/schema-form/vite.config.ts",
  "./packages/benchmark/vite.config.ts",
]);
