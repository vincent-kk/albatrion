import fs from 'fs/promises';
import path from 'path';

export async function getSchemaFormVersions(): Promise<string[]> {
  try {

    const packageJSONPath = path.resolve(process.cwd(), 'package.json');
    const packageJSONContent = await fs.readFile(packageJSONPath, 'utf-8');
    const packageJSON = JSON.parse(packageJSONContent);


    const versions = new Set<string>();
    const versionRegex = /^@canard\/schema-form_(\d+\.\d+\.\d+)$/;


    Object.keys(packageJSON.dependencies || {}).forEach((dep) => {
      const match = dep.match(versionRegex);
      if (match) {
        versions.add(match[1]);
      }
    });


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
