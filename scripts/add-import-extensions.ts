#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";

interface ProcessOptions {
  targetDir: string;
  extensions: string[];
  dryRun?: boolean;
  aliasConfig?: {
    "@": string; // Filesystem target of the @/ alias.
    "~": string; // Filesystem target of the ~/ alias.
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
      throw new Error(`Cannot access directory: ${targetDir}`);
    }

    console.log(`🚀 Starting processing: ${targetDir}`);
    console.log(`📁 Recursively scanning all files in the directory...`);

    const allFiles = await this.getAllFiles(targetDir);
    const targetFiles = allFiles.filter((file) =>
      this.supportedExtensions.some((ext) => file.endsWith(ext)),
    );

    console.log(`📄 Total files: ${allFiles.length}`);
    console.log(`🎯 Target files: ${targetFiles.length}`);
    console.log(
      `📝 Supported extensions: ${this.supportedExtensions.join(", ")}`,
    );
    console.log("");

    let processedCount = 0;
    let modifiedCount = 0;

    for (const filePath of targetFiles) {
      const wasModified = await this.processFile(filePath);
      processedCount++;
      if (wasModified) modifiedCount++;


      if (processedCount % 10 === 0 || processedCount === targetFiles.length) {
        console.log(
          `⏳ Progress: ${processedCount}/${targetFiles.length} (${Math.round((processedCount / targetFiles.length) * 100)}%)`,
        );
      }
    }

    console.log("");
    console.log(`✅ Processing complete!`);
    console.log(`📊 Processed files: ${processedCount}`);
    console.log(`🔧 Modified files: ${modifiedCount}`);
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);


        if (
          entry.name.startsWith(".") &&
          !entry.name.match(/\.(ts|tsx|js|jsx|mjs|cjs)$/)
        ) {
          continue;
        }


        if (entry.isDirectory() && entry.name === "node_modules") {
          continue;
        }

        if (entry.isDirectory()) {

          const subFiles = await this.getAllFiles(fullPath);
          files.push(...subFiles);
        } else {

          if (isIncludedFile(fullPath)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️  Failed to read directory: ${dir} - ${error}`);
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
            `🔍 [DRY RUN] File to be changed: ${path.relative(this.options.targetDir, filePath)}`,
          );
        } else {
          await fs.writeFile(filePath, updatedContent, "utf-8");
          console.log(
            `✏️  Updated: ${path.relative(this.options.targetDir, filePath)}`,
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(
        `❌ Error processing file ${path.relative(this.options.targetDir, filePath)}:`,
        error,
      );
      return false;
    }
  }

  private updateImportPaths(content: string, currentFilePath: string): string {
    const currentDir = path.dirname(currentFilePath);

    let updatedContent = content;
    let matchCount = 0;


    const fromRegex =
      /((?:import|export)[\s\S]*?\s+from\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      fromRegex,
      (match, prefix, importPath, suffix, ending) => {
        matchCount++;
        console.log(
          `🔍 Matched statement ${matchCount} (from): ${match.replace(/\s+/g, " ").trim()}`,
        );
        console.log(`   Path: ${importPath}`);

        const newPath = this.resolveImportPath(importPath, currentDir);
        const result = `${prefix}${newPath}${suffix}${ending}`;

        if (newPath !== importPath) {
          console.log(`   Changed: ${importPath} → ${newPath}`);
        } else {
          console.log(`   Unchanged: ${importPath}`);
        }

        return result;
      },
    );


    const sideEffectRegex = /(import\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      sideEffectRegex,
      (match, prefix, importPath, suffix, ending) => {

        if (match.includes("from")) {
          return match;
        }

        matchCount++;
        console.log(
          `🔍 Matched statement ${matchCount} (side-effect): ${match.trim()}`,
        );
        console.log(`   Path: ${importPath}`);

        const newPath = this.resolveImportPath(importPath, currentDir);
        const result = `${prefix}${newPath}${suffix}${ending}`;

        if (newPath !== importPath) {
          console.log(`   Changed: ${importPath} → ${newPath}`);
        } else {
          console.log(`   Unchanged: ${importPath}`);
        }

        return result;
      },
    );


    const malformedRegex =
      /(import\s+\{[^}]*\}\s+['"`])([^'"`]+)(['"`])(\s*;?\s*)/gm;

    updatedContent = updatedContent.replace(
      malformedRegex,
      (match, prefix, importPath, suffix, ending) => {

        if (match.includes("from")) {
          return match;
        }

        matchCount++;
        console.log(
          `🔍 Matched statement ${matchCount} (malformed - missing from keyword): ${match.trim()}`,
        );
        console.log(`   Path: ${importPath}`);
        console.log(
          `   ⚠️  The 'from' keyword appears to be missing. A correction is recommended.`,
        );

        const newPath = this.resolveImportPath(importPath, currentDir);


        const correctedPrefix = prefix.replace(
          /(import\s+\{[^}]*\}\s+)(['"`])/,
          "$1from $2",
        );
        const result = `${correctedPrefix}${newPath}${suffix}${ending}`;

        console.log(
          `   Corrected: ${match.trim()} → ${result.replace(/\s+/g, " ").trim()}`,
        );

        return result;
      },
    );

    if (matchCount === 0) {
      console.log(
        `⚠️  No matching import/export statements: ${path.relative(this.options.targetDir, currentFilePath)}`,
      );


      const lines = content.split("\n");
      const importExportLines = lines.filter((line) =>
        line.trim().match(/^\s*(?:import|export)/),
      );

      if (importExportLines.length > 0) {
        console.log(`   Import/export lines found in the file:`);
        importExportLines.forEach((line, index) => {
          console.log(`     ${index + 1}: ${line.trim()}`);
        });
      }
    }

    return updatedContent;
  }

  private resolveImportPath(importPath: string, currentDir: string): string {
    console.log(`🔍 Starting path processing: ${importPath}`);


    if (this.supportedExtensions.some((ext) => importPath.endsWith(ext))) {
      console.log(`   ✅ Extension already present: ${importPath}`);
      return importPath;
    }


    if (importPath.startsWith("@/") || importPath.startsWith("~/")) {
      console.log(`   🎯 Processing absolute path alias: ${importPath}`);
      return this.resolveAliasPath(importPath, currentDir);
    }


    if (!importPath.startsWith(".")) {
      console.log(`   📦 External package: ${importPath}`);
      return importPath;
    }


    console.log(`   📁 Processing relative path: ${importPath}`);
    return this.resolveRelativePath(importPath, currentDir);
  }

  private resolveAliasPath(importPath: string, currentDir: string): string {
    const projectRoot = this.findProjectRoot(currentDir);
    console.log(`   Project root: ${projectRoot}`);


    const packageName = this.detectPackageName(projectRoot);
    console.log(`   Detected package name: ${packageName}`);


    if (importPath.startsWith(`@/${packageName}/`)) {
      const aliasPath = importPath.replace(`@/${packageName}/`, "");
      console.log(`   Package-internal path: ${aliasPath}`);
      return this.resolvePackageInternalPath(
        aliasPath,
        projectRoot,
        importPath,
      );
    }


    const aliasPath = importPath.replace(/^[@~]\//, "");
    console.log(`   General alias path: ${aliasPath}`);


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



      if (packageJSON.name) {
        const name = packageJSON.name.split("/").pop() || packageJSON.name;
        console.log(`   Name detected in package.json: ${name}`);
        return name;
      }


      const dirName = path.basename(projectRoot);
      console.log(`   Using directory name: ${dirName}`);
      return dirName;
    } catch (error) {
      console.log(
        `   Failed to read package.json, using directory name: ${path.basename(projectRoot)}`,
      );
      return path.basename(projectRoot);
    }
  }

  private resolvePackageInternalPath(
    aliasPath: string,
    projectRoot: string,
    originalImportPath: string,
  ): string {
    console.log(`   Processing package-internal path: ${aliasPath}`);


    const possibleBasePaths = [
      path.join(projectRoot, "src"), // src/utils
      path.join(projectRoot, "lib"), // lib/utils
      path.join(projectRoot, "dist"), // dist/utils
      projectRoot,
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
      console.log(`   Trying base path: ${basePath}`);
      const fullPath = path.join(basePath, aliasPath);
      console.log(`   Full path: ${fullPath}`);


      for (const ext of this.defaultExtensions) {
        const exactFilePath = fullPath + ext;
        try {
          const stats = require("fs").statSync(exactFilePath);
          if (stats.isFile()) {
            console.log(`   ✅ Exact file found: ${exactFilePath}`);
            return originalImportPath + ext;
          }
        } catch (error) {

        }
      }


      try {
        const stats = require("fs").statSync(fullPath);
        if (stats.isDirectory()) {
          console.log(`   📁 Directory found: ${fullPath}`);


          const indexFiles = ["index.ts", "index.tsx", "index.js", "index.jsx"];
          for (const indexFile of indexFiles) {
            const indexPath = path.join(fullPath, indexFile);
            try {
              require("fs").statSync(indexPath);
              console.log(`   ✅ Index file found: ${indexPath}`);
              return originalImportPath;
            } catch (error) {

            }
          }


          console.log(`   ⚠️  Directory without an index file: ${fullPath}`);

          try {
            const dirContents = require("fs").readdirSync(fullPath);
            console.log(`   Directory contents: ${dirContents.join(", ")}`);
          } catch (error) {
            console.log(`   Failed to read directory: ${error.message}`);
          }
          return originalImportPath;
        }
      } catch (error) {
        console.log(
          `   ❌ Failed to access path: ${fullPath} - ${error.message}`,
        );
      }
    }

    console.warn(`   ⚠️  Cannot find extension: ${originalImportPath}`);
    console.log(`   All attempted paths:`);
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
    console.log(`   Resolved absolute path: ${absolutePath}`);


    try {
      const stats = require("fs").statSync(absolutePath);
      if (stats.isDirectory()) {
        console.log(`   ✅ Directory: ${absolutePath}`);
        return importPath;
      }
    } catch (error) {

    }


    for (const ext of this.defaultExtensions) {
      const pathWithExt = absolutePath + ext;
      try {
        require("fs").statSync(pathWithExt);
        console.log(`   ✅ File found: ${pathWithExt}`);
        return importPath + ext;
      } catch (error) {

      }
    }

    console.warn(`   ⚠️  Cannot find extension: ${importPath}`);
    return importPath;
  }

  private findProjectRoot(startDir: string): string {
    let currentDir = startDir;

    while (currentDir !== path.dirname(currentDir)) {

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

        }
      }

      currentDir = path.dirname(currentDir);
    }


    return startDir;
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("🔧 Automatic import extension tool");
    console.log("");
    console.log("Usage: tsx script.ts <directory_path> [--dry-run]");
    console.log("");
    console.log("Examples:");
    console.log(
      "  tsx script.ts ./src              # Process all files in the src directory",
    );
    console.log("  tsx script.ts ./src --dry-run    # Preview changes only");
    console.log(
      "  tsx script.ts .                  # Process all files in the current directory",
    );
    console.log("");
    console.log(
      "📁 Recursively scans every subdirectory of the specified directory",
    );
    console.log(
      "   and processes import/export statements in all TypeScript/JavaScript files.",
    );
    console.log("");
    console.log("🎯 Supported files: .ts, .tsx, .js, .jsx, .mjs, .cjs");
    console.log(
      "📦 Supported paths: relative paths (./, ../), absolute path aliases (@/, ~/)",
    );
    console.log("⚠️  The node_modules directory is automatically excluded.");
    process.exit(1);
  }

  const targetDir = path.resolve(args[0]);
  const dryRun = args.includes("--dry-run");

  console.log("🔧 Automatic import extension tool");
  console.log("=====================================");
  console.log(`📂 Target directory: ${targetDir}`);

  if (dryRun) {
    console.log("🔍 DRY RUN mode: files will not be changed.");
  } else {
    console.log("⚠️  Files will be changed. A backup is recommended.");
  }
  console.log("");

  const processor = new ImportExtensionProcessor({
    targetDir,
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    dryRun,
    aliasConfig: {
      "@": "src",
      "~": "src",
    },
  });

  try {
    await processor.processDirectory();
  } catch (error) {
    console.error("❌ Error during processing:", error);
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

export { ImportExtensionProcessor };
