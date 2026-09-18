import fs from 'fs/promises';
import path from 'path';

export async function getSchemaFormVersions(): Promise<string[]> {
  try {
    // package.json 읽기
    const packageJSONPath = path.resolve(process.cwd(), 'package.json');
    const packageJSONContent = await fs.readFile(packageJSONPath, 'utf-8');
    const packageJSON = JSON.parse(packageJSONContent);

    // 의존성에서 schema-form 버전 추출
    const versions = new Set<string>();
    const versionRegex = /^@canard\/schema-form_(\d+\.\d+\.\d+)$/;

    // dependencies에서 버전 추출
    Object.keys(packageJSON.dependencies || {}).forEach((dep) => {
      const match = dep.match(versionRegex);
      if (match) {
        versions.add(match[1]);
      }
    });

    // 버전 정렬 (semver 순서로)
    const remoteVersions = Array.from(versions).sort((a, b) => {
      const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
      const [bMajor, bMinor, bPatch] = b.split('.').map(Number);

      if (aMajor !== bMajor) return aMajor - bMajor;
      if (aMinor !== bMinor) return aMinor - bMinor;
      return aPatch - bPatch;
    });

    return [...remoteVersions, 'latest'];
  } catch (error) {
    console.error('Error occurred while parsing versions:', error);
    return [];
  }
}
