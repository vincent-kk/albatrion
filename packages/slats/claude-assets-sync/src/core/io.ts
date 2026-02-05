import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

/**
 * Read and parse JSON file
 * @param path - File path
 * @returns Parsed JSON or null if file doesn't exist or parsing fails
 */
export function readJsonFile<T>(path: string): T | null {
  if (!existsSync(path)) {
    return null;
  }
  try {
    const content = readFileSync(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Write JSON file with pretty formatting
 * @param path - File path
 * @param data - Data to serialize
 */
export function writeJsonFile<T>(path: string, data: T): void {
  ensureDirectory(dirname(path));
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Ensure directory exists (creates recursively if needed)
 * @param path - Directory path
 */
export function ensureDirectory(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/**
 * Check if file or directory exists
 * @param path - File or directory path
 * @returns true if exists
 */
export function fileExists(path: string): boolean {
  return existsSync(path);
}

/**
 * Remove directory recursively
 * @param path - Directory path
 */
export function removeDirectory(path: string): void {
  if (existsSync(path)) {
    rmSync(path, { recursive: true, force: true });
  }
}

/**
 * List files in directory
 * @param path - Directory path
 * @returns Array of file names
 */
export function listDirectory(path: string): string[] {
  if (!existsSync(path)) {
    return [];
  }
  return readdirSync(path);
}

/**
 * Write text file with directory creation
 * @param path - File path
 * @param content - File content
 */
export function writeTextFile(path: string, content: string): void {
  ensureDirectory(dirname(path));
  writeFileSync(path, content, 'utf-8');
}
