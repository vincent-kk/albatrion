import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/winglet/react-utils/vite.config.ts",
  "./packages/winglet/json-schema/vite.config.ts",
  "./packages/winglet/common-utils/vite.config.ts",
  "./packages/canard/schema-form-antd-plugin/vite.config.ts",
  "./packages/canard/schema-form/vite.config.ts",
  "./packages/aileron/benchmark/vite.config.ts",
]);
