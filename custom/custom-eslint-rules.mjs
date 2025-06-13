import fs from "fs";
import path from "path";

/**
 * tsconfig.json에서 paths 설정을 읽어와서 TypeScript path mapping을 해석하는 함수
 */
function resolveTsConfigPaths(currentFile) {
  try {
    // 현재 파일에서 시작해서 상위 디렉토리로 올라가며 tsconfig.json 찾기
    let currentDir = path.dirname(currentFile);
    let tsConfigPath = null;

    while (currentDir !== path.dirname(currentDir)) {
      const candidatePath = path.join(currentDir, "tsconfig.json");
      if (fs.existsSync(candidatePath)) {
        tsConfigPath = candidatePath;
        break;
      }
      currentDir = path.dirname(currentDir);
    }

    if (!tsConfigPath) {
      return null;
    }

    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, "utf-8"));
    const compilerOptions = tsConfig.compilerOptions || {};
    const paths = compilerOptions.paths || {};
    const baseUrl = compilerOptions.baseUrl || ".";

    // baseUrl을 절대 경로로 변환
    const resolvedBaseUrl = path.resolve(path.dirname(tsConfigPath), baseUrl);

    return {
      paths,
      baseUrl: resolvedBaseUrl,
      tsConfigDir: path.dirname(tsConfigPath),
    };
  } catch (error) {
    return null;
  }
}

/**
 * TypeScript path mapping을 사용해서 실제 파일 경로를 해석하는 함수
 */
function resolvePathMapping(importPath, pathConfig) {
  if (!pathConfig) {
    return null;
  }

  const { paths, baseUrl } = pathConfig;

  // paths에서 매칭되는 패턴 찾기
  for (const [pattern, mappings] of Object.entries(paths)) {
    let regexPattern = pattern.replace(/\*/g, "(.*)");
    regexPattern = `^${regexPattern}$`;

    const match = importPath.match(new RegExp(regexPattern));
    if (match) {
      // 첫 번째 매핑 경로 사용 (보통 하나만 있음)
      const mapping = mappings[0];
      let resolvedPath = mapping;

      // 와일드카드가 있으면 매치된 부분으로 치환
      if (mapping.includes("*") && match[1]) {
        resolvedPath = mapping.replace(/\*/g, match[1]);
      }

      // baseUrl을 기준으로 절대 경로 생성
      return path.resolve(baseUrl, resolvedPath);
    }
  }

  return null;
}

/**
 * 주어진 경로가 디렉토리이고 index.ts 파일이 있는지 확인하는 함수
 */
function checkIfDirectoryWithIndex(resolvedPath) {
  try {
    if (
      fs.existsSync(resolvedPath) &&
      fs.statSync(resolvedPath).isDirectory()
    ) {
      // index.ts, index.tsx 등 확인
      const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
      for (const indexFile of indexFiles) {
        const indexPath = path.join(resolvedPath, indexFile);
        if (fs.existsSync(indexPath)) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 파일이 실제로 존재하는지 확인하고 존재하는 확장자를 반환하는 함수
 */
function findFileWithExtension(basePath) {
  const extensions = [".ts", ".tsx", ".js", ".jsx"];

  // 확장자가 이미 있는 경우
  if (fs.existsSync(basePath)) {
    return ""; // 확장자가 이미 포함되어 있음
  }

  // 확장자를 추가해서 확인
  for (const ext of extensions) {
    if (fs.existsSync(basePath + ext)) {
      return ext;
    }
  }

  return null;
}

/**
 * 파일이 실제로 존재하는지 확인하는 함수 (기존 호환성을 위해 유지)
 */
function checkFileExists(basePath) {
  return findFileWithExtension(basePath) !== null;
}

// Custom ESLint rule to enforce file extensions on imports (except for directory imports and path mappings)
export const requireImportExtensions = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce file extensions on imports except for directory imports and path mappings",
      category: "Possible Errors",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    function checkIfDirectory(sourcePath, currentFile) {
      try {
        // TypeScript path mapping 처리
        if (sourcePath.startsWith("@/")) {
          const pathConfig = resolveTsConfigPaths(currentFile);
          const resolvedPath = resolvePathMapping(sourcePath, pathConfig);

          if (resolvedPath) {
            // 디렉토리인지 확인
            if (checkIfDirectoryWithIndex(resolvedPath)) {
              return true; // 디렉토리 import이므로 확장자 체크 스킵
            }

            // 파일이 존재하는지 확인 (확장자 없이)
            if (checkFileExists(resolvedPath)) {
              return false; // 파일이므로 확장자 체크 수행
            }
          }

          // 매핑을 찾을 수 없거나 파일이 없으면 확장자 체크 수행
          return false;
        }

        // 상대 경로인 경우에만 처리
        if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
          const currentDir = path.dirname(currentFile);
          const resolvedPath = path.resolve(currentDir, sourcePath);

          // 디렉터리인지 확인
          if (checkIfDirectoryWithIndex(resolvedPath)) {
            return true; // 디렉토리 import이므로 확장자 체크 스킵
          }
        }

        return false; // 확장자 체크 수행
      } catch (error) {
        return false; // 오류 발생시 확장자 체크 수행
      }
    }

    function getCorrectExtension(sourcePath, currentFile) {
      try {
        // TypeScript path mapping 처리
        if (sourcePath.startsWith("@/")) {
          const pathConfig = resolveTsConfigPaths(currentFile);
          const resolvedPath = resolvePathMapping(sourcePath, pathConfig);

          if (resolvedPath) {
            const extension = findFileWithExtension(resolvedPath);
            return extension || ".ts"; // 기본값으로 .ts 사용
          }
        }

        // 상대 경로 처리
        if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
          const currentDir = path.dirname(currentFile);
          const resolvedPath = path.resolve(currentDir, sourcePath);
          const extension = findFileWithExtension(resolvedPath);
          return extension || ".ts"; // 기본값으로 .ts 사용
        }

        return ".ts"; // 기본값
      } catch (error) {
        return ".ts"; // 오류 발생시 기본값
      }
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        const currentFile = context.getFilename();

        // npm 패키지는 제외
        if (
          !source.startsWith("./") &&
          !source.startsWith("../") &&
          !source.startsWith("@/")
        ) {
          return;
        }

        // 디렉터리 import인지 확인
        if (checkIfDirectory(source, currentFile)) {
          return; // 디렉토리 import는 허용
        }

        // 확장자가 있는지 확인
        const hasExtension = /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(source);

        if (!hasExtension) {
          const correctExtension = getCorrectExtension(source, currentFile);

          context.report({
            node: node.source,
            message: `Missing file extension for "${source}"`,
            fix(fixer) {
              // 실제 파일 확장자를 사용하여 auto-fix
              return fixer.replaceText(
                node.source,
                `"${source}${correctExtension}"`,
              );
            },
          });
        }
      },
    };
  },
};

// Custom ESLint rule to enforce file extensions on import type statements
export const requireTypeImportExtensions = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce file extensions on import type statements",
      category: "Possible Errors",
    },
    fixable: "code",
    schema: [],
  },
  create(context) {
    function shouldCheckTypeImport(source, currentFile) {
      try {
        // TypeScript path mapping 처리
        if (source.startsWith("@/")) {
          const pathConfig = resolveTsConfigPaths(currentFile);
          const resolvedPath = resolvePathMapping(source, pathConfig);

          if (resolvedPath) {
            // 디렉토리인지 확인
            if (checkIfDirectoryWithIndex(resolvedPath)) {
              return false; // 디렉토리 import는 확장자 체크 스킵
            }

            // 파일이 존재하는지 확인
            if (checkFileExists(resolvedPath)) {
              return true; // 파일이므로 확장자 체크 수행
            }
          }

          return true; // 매핑을 찾을 수 없으면 확장자 체크 수행
        }

        // 상대 경로만 처리
        if (source.startsWith("./") || source.startsWith("../")) {
          const currentDir = path.dirname(currentFile);
          const resolvedPath = path.resolve(currentDir, source);

          // 디렉토리인지 확인
          if (checkIfDirectoryWithIndex(resolvedPath)) {
            return false; // 디렉토리 import는 확장자 체크 스킵
          }

          return true; // 파일이므로 확장자 체크 수행
        }

        return false; // 다른 경우는 확장자 체크 안함
      } catch (error) {
        return true; // 오류 발생시 확장자 체크 수행
      }
    }

    function getCorrectExtension(sourcePath, currentFile) {
      try {
        // TypeScript path mapping 처리
        if (sourcePath.startsWith("@/")) {
          const pathConfig = resolveTsConfigPaths(currentFile);
          const resolvedPath = resolvePathMapping(sourcePath, pathConfig);

          if (resolvedPath) {
            const extension = findFileWithExtension(resolvedPath);
            return extension || ".ts"; // 기본값으로 .ts 사용
          }
        }

        // 상대 경로 처리
        if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
          const currentDir = path.dirname(currentFile);
          const resolvedPath = path.resolve(currentDir, sourcePath);
          const extension = findFileWithExtension(resolvedPath);
          return extension || ".ts"; // 기본값으로 .ts 사용
        }

        return ".ts"; // 기본값
      } catch (error) {
        return ".ts"; // 오류 발생시 기본값
      }
    }

    return {
      ImportDeclaration(node) {
        // Check if this is an import type statement
        if (
          node.importKind === "type" ||
          (node.specifiers &&
            node.specifiers.some((spec) => spec.importKind === "type"))
        ) {
          const source = node.source.value;
          const currentFile = context.getFilename();

          // TypeScript path mapping과 상대 경로만 체크
          if (!shouldCheckTypeImport(source, currentFile)) {
            return;
          }

          // Check if the import already has a file extension
          const hasExtension = /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(source);

          if (!hasExtension) {
            const correctExtension = getCorrectExtension(source, currentFile);

            context.report({
              node: node.source,
              message: `Missing file extension for "${source}" in import type statement`,
              fix(fixer) {
                // 실제 파일 확장자를 사용하여 auto-fix
                return fixer.replaceText(
                  node.source,
                  `"${source}${correctExtension}"`,
                );
              },
            });
          }
        }
      },
    };
  },
};
