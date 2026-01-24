import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import storybookPlugin from "eslint-plugin-storybook";
import importPlugin from "eslint-plugin-import";
// import {
//   requireTypeImportExtensions,
//   requireImportExtensions,
// } from "./custom/custom-eslint-rules.mjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ESLint 설정을 생성하는 함수
 * @param {string} [tsconfigPath] - 사용할 tsconfig.json의 경로 (기본값: root tsconfig)
 * @returns {Array} ESLint 설정 배열
 */
export function createESLintConfig(
  tsconfigPath = path.resolve(__dirname, "./tsconfig.json"),
) {
  return [
    eslint.configs.recommended,
    {
      files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
      languageOptions: {
        parser: tseslintParser,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "module",
        },
      },
      plugins: {
        "@typescript-eslint": tseslint,
        "react-hooks": reactHooksPlugin,
        "react-refresh": reactRefreshPlugin,
        storybook: storybookPlugin,
        import: importPlugin,
        // custom: {
        //   rules: {
        //     "require-type-import-extensions": requireTypeImportExtensions,
        //     "require-import-extensions": requireImportExtensions,
        //   },
        // },
      },
      settings: {
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
            project: tsconfigPath,
          },
          node: {
            extensions: [".js", ".jsx", ".ts", ".tsx"],
            moduleDirectory: ["node_modules", "src"],
          },
        },
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },
      },
      rules: {
        "react-refresh/only-export-components": "warn",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-require-imports": "off",
        "no-fallthrough": "off",
        "no-constant-condition": "off",
        "react-hooks/exhaustive-deps": "warn",
        "no-unused-vars": "off", // 기본 규칙 비활성화
        "@typescript-eslint/no-unused-vars": [
          "warn",
          {
            varsIgnorePattern: "^_",
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
            args: "after-used",
            vars: "all",
            caughtErrors: "all",
            destructuredArrayIgnorePattern: "^_",
          },
        ],
        "no-redeclare": "off",
        // 기본 import/extensions 규칙 비활성화하고 커스텀 규칙 사용
        "import/extensions": "off",
        "import/no-unresolved": "error",
        "consistent-type-imports": "off",
        // TypeScript의 consistent-type-imports와 함께 사용하여 import type도 검사
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            disallowTypeAnnotations: false,
            fixStyle: "separate-type-imports",
          },
        ],
        // 커스텀 규칙: import type에 확장자 강제
        // "custom/require-type-import-extensions": "error",
        // 커스텀 규칙: 모든 import에 확장자 강제 (디렉터리 import 제외)
        // "custom/require-import-extensions": "error",
        "no-undef": "off", // TypeScript에서는 타입 체크가 이미 수행됨
        // Disallow ES private fields (#) - use 'private __name__' convention instead
        "no-restricted-syntax": [
          "error",
          {
            selector: "PropertyDefinition[key.type='PrivateIdentifier']",
            message:
              "ES private fields (#) are not allowed. Use 'private __fieldName__' convention instead for ECMA 2022 compatibility.",
          },
          {
            selector: "MethodDefinition[key.type='PrivateIdentifier']",
            message:
              "ES private methods (#) are not allowed. Use 'private __methodName__()' convention instead for ECMA 2022 compatibility.",
          },
        ],
      },
    },
  ];
}

// 기본 export는 root tsconfig를 사용하는 설정
export default createESLintConfig();
