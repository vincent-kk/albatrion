#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

interface ProcessOptions {
  targetDir: string;
  extensions: string[];
  dryRun?: boolean;
  aliasConfig?: {
    "@": string; // '@/' 별칭이 가리키는 실제 경로
    "~": string; // '~/' 별칭이 가리키는 실제 경로
  };
}

const excludeDirectories = ["dist", "node_modules"];

const isIncludedFile = (filePath: string): boolean => {
  const normalizedPath = path.normalize(filePath);
  const pathParts = normalizedPath.split(path.sep);
  return !excludeDirectories.some((dir) => pathParts.includes(dir));
};

class ImportExtensionProcessor {
  private readonly supportedExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
  ];
  private readonly defaultExtensions = [".ts", ".tsx", ".js", ".jsx"];

  constructor(private options: ProcessOptions) {}

  async processDirectory(): Promise<void> {
    const { targetDir } = this.options;

    try {
      await fs.access(targetDir);
    } catch (error) {
      throw new Error(`디렉토리에 접근할 수 없습니다: ${targetDir}`);
    }

    console.log(`🚀 처리 시작: ${targetDir}`);
    console.log(`📁 디렉토리 기반으로 모든 파일을 재귀적으로 탐색합니다...`);

    const allFiles = await this.getAllFiles(targetDir);
    const targetFiles = allFiles.filter((file) =>
      this.supportedExtensions.some((ext) => file.endsWith(ext)),
    );

    console.log(`📄 전체 파일 수: ${allFiles.length}`);
    console.log(`🎯 처리 대상 파일 수: ${targetFiles.length}`);
    console.log(`📝 지원하는 확장자: ${this.supportedExtensions.join(", ")}`);
    console.log("");

    let processedCount = 0;
    let modifiedCount = 0;

    for (const filePath of targetFiles) {
      const wasModified = await this.processFile(filePath);
      processedCount++;
      if (wasModified) modifiedCount++;

      // 진행상황 표시
      if (processedCount % 10 === 0 || processedCount === targetFiles.length) {
        console.log(
          `⏳ 진행상황: ${processedCount}/${targetFiles.length} (${Math.round((processedCount / targetFiles.length) * 100)}%)`,
        );
      }
    }

    console.log("");
    console.log(`✅ 처리 완료!`);
    console.log(`📊 처리된 파일: ${processedCount}개`);
    console.log(`🔧 수정된 파일: ${modifiedCount}개`);
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // 숨김 파일이나 특정 디렉토리는 스킵 (필요시 제거 가능)
        if (
          entry.name.startsWith(".") &&
          !entry.name.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)
        ) {
          continue;
        }

        // node_modules 디렉토리는 스킵
        if (entry.isDirectory() && entry.name === "node_modules") {
          continue;
        }

        if (entry.isDirectory()) {
          // 재귀적으로 하위 디렉토리의 모든 파일 처리
          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {
          // src 하위의 파일인지 확인
          if (isIncludedFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  디렉토리 읽기 실패: ${dir} - ${error}`);
    }

    return files;
  }

  private async processFile(filePath: string): Promise<boolean> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const updatedContent = this.updateImportPaths(content, filePath);

      if (content !== updatedContent) {
        if (this.options.dryRun) {
          console.log(
            `🔍 [DRY RUN] 변경될 파일: ${path.relative(this.options.targetDir, filePath)}`,
          );
        } else {
          await fs.writeFile(filePath, updatedContent, "utf-8");
          console.log(
            `✏️  업데이트됨: ${path.relative(this.options.targetDir, filePath)}`,
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `❌ 파일 처리 중 오류 발생 ${path.relative(this.options.targetDir, filePath)}:`,
        error,
      );
      return false;
    }
  }

  private updateImportPaths(content: string, currentFilePath: string): string {
    const currentDir = path.dirname(currentFilePath);

    let updatedContent = content;
    let matchCount = 0;

    // 1. 일반적인 import/export from 구문 (멀티라인 지원)
    const fromRegex =
      /((?:import|export)[\s\S]*?\s+from\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      fromRegex,
      (match, prefix, importPath, suffix, ending) => {
        matchCount++;
        console.log(
          `🔍 매칭된 구문 ${matchCount} (from): ${match.replace(/\s+/g, " ").trim()}`,
        );
        console.log(`   경로: ${importPath}`);

        const newPath = this.resolveImportPath(importPath, currentDir);
        const result = `${prefix}${newPath}${suffix}${ending}`;

        if (newPath !== importPath) {
          console.log(`   변경됨: ${importPath} → ${newPath}`);
        } else {
          console.log(`   변경 없음: ${importPath}`);
        }

        return result;
      },
    );

    // 2. side effect import 구문 (import 'path')
    const sideEffectRegex = /(import\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      sideEffectRegex,
      (match, prefix, importPath, suffix, ending) => {
        // from이 포함된 구문은 이미 위에서 처리되었으므로 제외
        if (match.includes("from")) {
          return match;
        }

        matchCount++;
        console.log(
          `🔍 매칭된 구문 ${matchCount} (side-effect): ${match.trim()}`,
        );
        console.log(`   경로: ${importPath}`);

        const newPath = this.resolveImportPath(importPath, currentDir);
        const result = `${prefix}${newPath}${suffix}${ending}`;

        if (newPath !== importPath) {
          console.log(`   변경됨: ${importPath} → ${newPath}`);
        } else {
          console.log(`   변경 없음: ${importPath}`);
        }

        return result;
      },
    );

    // 3. 잘못된 구문 감지 및 수정 제안 (import { } 'path' 형태)
    const malformedRegex =
      /(import\s+\{[^}]*\}\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      malformedRegex,
      (match, prefix, importPath, suffix, ending) => {
        // 이미 from이 있는 정상적인 구문은 제외
        if (match.includes("from")) {
          return match;
        }

        matchCount++;
        console.log(
          `🔍 매칭된 구문 ${matchCount} (malformed - from 키워드 누락): ${match.trim()}`,
        );
        console.log(`   경로: ${importPath}`);
        console.log(
          `   ⚠️  'from' 키워드가 누락된 것 같습니다. 수정을 권장합니다.`,
        );

        const newPath = this.resolveImportPath(importPath, currentDir);

        // from 키워드를 추가하여 수정
        const correctedPrefix = prefix.replace(
          /(import\s+\{[^}]*\}\s+)(['"`])/,
          "$1from $2",
        );
        const result = `${correctedPrefix}${newPath}${suffix}${ending}`;

        console.log(
          `   수정됨: ${match.trim()} → ${result.replace(/\s+/g, " ").trim()}`,
        );

        return result;
      },
    );

    if (matchCount === 0) {
      console.log(
        `⚠️  매칭된 import/export 구문이 없습니다: ${path.relative(this.options.targetDir, currentFilePath)}`,
      );

      // 디버깅을 위해 파일 내용의 import/export 라인들을 출력
      const lines = content.split("\n");
      const importExportLines = lines.filter((line) =>
        line.trim().match(/^\s*(?:import|export)/),
      );

      if (importExportLines.length > 0) {
        console.log(`   파일에서 발견된 import/export 라인들:`);
        importExportLines.forEach((line, index) => {
          console.log(`     ${index + 1}: ${line.trim()}`);
        });
      }
    }

    return updatedContent;
  }

  private resolveImportPath(importPath: string, currentDir: string): string {
    console.log(`🔍 경로 처리 시작: ${importPath}`);

    // 이미 확장자가 있는 경우 변경하지 않음
    if (this.supportedExtensions.some((ext) => importPath.endsWith(ext))) {
      console.log(`   ✅ 이미 확장자 존재: ${importPath}`);
      return importPath;
    }

    // 절대 경로 별칭 처리 (@/, ~/ 등)
    if (importPath.startsWith("@/") || importPath.startsWith("~/")) {
      console.log(`   🎯 절대 경로 별칭 처리: ${importPath}`);
      return this.resolveAliasPath(importPath, currentDir);
    }

    // node_modules 패키지나 다른 절대 경로는 변경하지 않음
    if (!importPath.startsWith(".")) {
      console.log(`   📦 외부 패키지: ${importPath}`);
      return importPath;
    }

    // 상대 경로 처리
    console.log(`   📁 상대 경로 처리: ${importPath}`);
    return this.resolveRelativePath(importPath, currentDir);
  }

  private resolveAliasPath(importPath: string, currentDir: string): string {
    const projectRoot = this.findProjectRoot(currentDir);
    console.log(`   프로젝트 루트: ${projectRoot}`);

    // monorepo에서 패키지 이름을 자동 감지
    const packageName = this.detectPackageName(projectRoot);
    console.log(`   감지된 패키지 이름: ${packageName}`);

    // @/{package-name}/ 패턴 처리
    if (importPath.startsWith(`@/${packageName}/`)) {
      const aliasPath = importPath.replace(`@/${packageName}/`, "");
      console.log(`   패키지 내부 경로: ${aliasPath}`);
      return this.resolvePackageInternalPath(
        aliasPath,
        projectRoot,
        importPath,
      );
    }

    // 기존 @/ 또는 ~/ 처리 (fallback)
    const aliasPath = importPath.replace(/^[@~]\//, "");
    console.log(`   일반 별칭 경로: ${aliasPath}`);

    // 가능한 경로들을 시도
    const possibleBasePaths = [
      path.join(projectRoot, "src"),
      path.join(projectRoot, "app"),
      projectRoot,
    ];

    return this.tryResolvePaths(possibleBasePaths, aliasPath, importPath);
  }

  private detectPackageName(projectRoot: string): string | null {
    try {
      const packageJSONPath = path.join(projectRoot, "package.json");
      const packageJSON = JSON.parse(
        require("fs").readFileSync(packageJSONPath, "utf8"),
      );

      // package.json의 name에서 마지막 부분 추출
      // 예: "@albatrion/common-utils" → "common-utils"
      if (packageJSON.name) {
        const name = packageJSON.name.split("/").pop() || packageJSON.name;
        console.log(`   package.json에서 감지된 이름: ${name}`);
        return name;
      }

      // package.json에 name이 없으면 디렉토리 이름 사용
      const dirName = path.basename(projectRoot);
      console.log(`   디렉토리 이름 사용: ${dirName}`);
      return dirName;
    } catch (error) {
      console.log(
        `   package.json 읽기 실패, 디렉토리 이름 사용: ${path.basename(projectRoot)}`,
      );
      return path.basename(projectRoot);
    }
  }

  private resolvePackageInternalPath(
    aliasPath: string,
    projectRoot: string,
    originalImportPath: string,
  ): string {
    console.log(`   패키지 내부 경로 처리: ${aliasPath}`);

    // monorepo 패키지에서 일반적인 경로들
    const possibleBasePaths = [
      path.join(projectRoot, "src"), // src/utils
      path.join(projectRoot, "lib"), // lib/utils
      path.join(projectRoot, "dist"), // dist/utils
      projectRoot, // utils (루트 직접)
    ];

    return this.tryResolvePaths(
      possibleBasePaths,
      aliasPath,
      originalImportPath,
    );
  }

  private tryResolvePaths(
    possibleBasePaths: string[],
    aliasPath: string,
    originalImportPath: string,
  ): string {
    for (const basePath of possibleBasePaths) {
      console.log(`   시도하는 기본 경로: ${basePath}`);
      const fullPath = path.join(basePath, aliasPath);
      console.log(`   전체 경로: ${fullPath}`);

      // 1. 먼저 정확한 파일이 있는지 확인 (확장자 포함)
      for (const ext of this.defaultExtensions) {
        const exactFilePath = fullPath + ext;
        try {
          const stats = require("fs").statSync(exactFilePath);
          if (stats.isFile()) {
            console.log(`   ✅ 정확한 파일 발견: ${exactFilePath}`);
            return originalImportPath + ext;
          }
        } catch (error) {
          // 해당 확장자로 파일이 없음
        }
      }

      // 2. 디렉토리인지 확인하고, index 파일이 있는지 확인
      try {
        const stats = require("fs").statSync(fullPath);
        if (stats.isDirectory()) {
          console.log(`   📁 디렉토리 발견: ${fullPath}`);

          // index 파일들을 확인
          const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
          for (const indexFile of indexFiles) {
            const indexPath = path.join(fullPath, indexFile);
            try {
              require("fs").statSync(indexPath);
              console.log(`   ✅ 인덱스 파일 발견: ${indexPath}`);
              return originalImportPath; // 디렉토리 import는 확장자를 붙이지 않음
            } catch (error) {
              // 해당 인덱스 파일이 없음
            }
          }

          // 인덱스 파일이 없는 디렉토리
          console.log(`   ⚠️  인덱스 파일이 없는 디렉토리: ${fullPath}`);
          // 디렉토리 내용 확인
          try {
            const dirContents = require("fs").readdirSync(fullPath);
            console.log(`   디렉토리 내용: ${dirContents.join(", ")}`);
          } catch (error) {
            console.log(`   디렉토리 읽기 실패: ${error.message}`);
          }
          return originalImportPath; // 그래도 디렉토리이므로 확장자 없이 반환
        }
      } catch (error) {
        console.log(`   ❌ 경로 접근 실패: ${fullPath} - ${error.message}`);
      }
    }

    console.warn(`   ⚠️  확장자를 찾을 수 없습니다: ${originalImportPath}`);
    console.log(`   시도한 모든 경로:`);
    for (const basePath of possibleBasePaths) {
      const fullPath = path.join(basePath, aliasPath);
      console.log(`     - ${fullPath}`);
      for (const ext of this.defaultExtensions) {
        console.log(`       - ${fullPath}${ext}`);
      }
    }

    return originalImportPath;
  }

  private resolveRelativePath(importPath: string, currentDir: string): string {
    const absolutePath = path.resolve(currentDir, importPath);
    console.log(`   절대 경로 변환: ${absolutePath}`);

    // 디렉토리인지 확인
    try {
      const stats = require("fs").statSync(absolutePath);
      if (stats.isDirectory()) {
        console.log(`   ✅ 디렉토리: ${absolutePath}`);
        return importPath; // 디렉토리는 확장자를 붙이지 않음
      }
    } catch (error) {
      // 파일이 존재하지 않는 경우, 확장자를 시도해봄
    }

    // 파일 확장자 찾기
    for (const ext of this.defaultExtensions) {
      const pathWithExt = absolutePath + ext;
      try {
        require("fs").statSync(pathWithExt);
        console.log(`   ✅ 파일 발견: ${pathWithExt}`);
        return importPath + ext;
      } catch (error) {
        // 해당 확장자로 파일이 없음
      }
    }

    console.warn(`   ⚠️  확장자를 찾을 수 없습니다: ${importPath}`);
    return importPath;
  }

  private findProjectRoot(startDir: string): string {
    let currentDir = startDir;

    while (currentDir !== path.dirname(currentDir)) {
      // package.json, tsconfig.json, .git 등이 있는 디렉토리를 프로젝트 루트로 판단
      const indicators = [
        "package.json",
        "tsconfig.json",
        ".git",
        "yarn.lock",
        "pnpm-lock.yaml",
      ];

      for (const indicator of indicators) {
        try {
          require("fs").statSync(path.join(currentDir, indicator));
          return currentDir;
        } catch (error) {
          // 해당 파일/폴더가 없음
        }
      }

      currentDir = path.dirname(currentDir);
    }

    // 프로젝트 루트를 찾지 못한 경우 시작 디렉토리 반환
    return startDir;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("🔧 Import 확장자 자동 추가 도구");
    console.log("");
    console.log("사용법: tsx script.ts <디렉토리_경로> [--dry-run]");
    console.log("");
    console.log("예시:");
    console.log(
      "  tsx script.ts ./src              # src 디렉토리의 모든 파일 처리",
    );
    console.log("  tsx script.ts ./src --dry-run    # 변경사항만 미리보기");
    console.log(
      "  tsx script.ts .                  # 현재 디렉토리의 모든 파일 처리",
    );
    console.log("");
    console.log(
      "📁 지정된 디렉토리의 모든 하위 디렉토리를 재귀적으로 탐색하여",
    );
    console.log(
      "   모든 TypeScript/JavaScript 파일의 import/export 구문을 처리합니다.",
    );
    console.log("");
    console.log("🎯 지원하는 파일: .ts, .tsx, .js, .jsx, .mjs, .cjs");
    console.log("📦 지원하는 경로: 상대경로 (./, ../), 절대경로 별칭 (@/, ~/)");
    console.log("⚠️  node_modules 디렉토리는 자동으로 제외됩니다.");
    process.exit(1);
  }

  const targetDir = path.resolve(args[0]);
  const dryRun = args.includes("--dry-run");

  console.log("🔧 Import 확장자 자동 추가 도구");
  console.log("=====================================");
  console.log(`📂 대상 디렉토리: ${targetDir}`);

  if (dryRun) {
    console.log("🔍 DRY RUN 모드: 실제 파일은 변경되지 않습니다.");
  } else {
    console.log("⚠️  실제 파일을 변경합니다. 백업을 권장합니다.");
  }
  console.log("");

  const processor = new ImportExtensionProcessor({
    targetDir,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    dryRun,
    aliasConfig: {
      "@": "src", // 기본값, 필요시 수정
      "~": "src", // 기본값, 필요시 수정
    },
  });

  try {
    await processor.processDirectory();
  } catch (error) {
    console.error("❌ 처리 중 오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main();
}

export { ImportExtensionProcessor };
