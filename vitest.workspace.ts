import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/winglet/common-utils/vite.config.ts",
  "./packages/winglet/data-loader/vite.config.ts",
  "./packages/winglet/json/vite.config.ts",
  "./packages/winglet/json-schema/vite.config.ts",
  "./packages/winglet/react-utils/vite.config.ts",
  "./packages/winglet/style-utils/vite.config.ts",
  "./packages/slats/claude-assets-sync/vite.config.ts",
  "./packages/lerx/promise-modal/vite.config.ts",
  "./packages/canard/schema-form-antd5-plugin/vite.config.ts",
  "./packages/canard/schema-form-antd6-plugin/vite.config.ts",
  "./packages/canard/schema-form-ajv6-plugin/vite.config.ts",
  "./packages/canard/schema-form-ajv7-plugin/vite.config.ts",
  "./packages/canard/schema-form-ajv8-plugin/vite.config.ts",
  "./packages/canard/schema-form/vite.config.ts",
]);
