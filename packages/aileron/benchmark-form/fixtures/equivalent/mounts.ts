import {
  ARRAY_CASES,
  FLAT_CASES,
  NESTED_CASES,
} from '../../src/fixtures/scale-schemas';
import { sampleSchemas } from '../../src/fixtures/schemas';
import type { EquivalentFixture } from './types';

// Shared JSON Schema keywords need no syntax migration; clone to isolate versions.
export const mountFixtures: EquivalentFixture[] = [
  ...sampleSchemas.map((schema, index) => ({
    name: `sample-${index}`,
    legacy: schema,
    workspace:
      index === 3
        ? {
            ...structuredClone(schema),
            properties: {
              ...structuredClone(schema.properties),
              // The workspace core preserves empty arrays; seed the legacy minItems view explicitly.
              users: {
                ...structuredClone(schema.properties!.users),
                default: [
                  {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    username: 'john_doe',
                    email: 'john.doe@example.com',
                    roles: ['user'],
                    settings: {
                      theme: 'light',
                      notifications: { email: true, sms: true, push: true },
                      language: 'en',
                    },
                    profile: {
                      firstName: 'John',
                      lastName: 'Doe',
                      birthDate: '1990-01-01',
                      gender: 'male',
                    },
                    addresses: [],
                    friends: [],
                    createdAt: '2021-01-01',
                    updatedAt: '2021-01-01',
                    preferences: { newsletter: true, targetedAds: true },
                  },
                ],
              },
            },
          }
        : structuredClone(schema),
    interactions: [
      {
        kind: 'set' as const,
        path: [
          '/name',
          '/personalInfo/firstName',
          '/metadata/created',
          '/metadata/version',
        ][index],
        value: index === 3 ? '2.0.0' : 'changed',
      },
    ],
  })),
  ...[...FLAT_CASES, ...NESTED_CASES, ...ARRAY_CASES].map(
    ({ label, schema }) => ({
      name: label,
      legacy: schema,
      workspace: structuredClone(schema),
      interactions: label.startsWith('flat')
        ? Array.from({ length: 10 }, (_, index) => ({
            kind: 'set' as const,
            path: `/field_${String(index).padStart(3, '0')}`,
            value: `changed-${index}`,
          }))
        : label.startsWith('nested')
          ? Array.from({ length: 10 }, (_, index) => ({
              kind: 'set' as const,
              path: `${'/n0'.repeat(label.includes('d5') ? 3 : 1)}/n${Math.floor(index / 4)}/n${index % 4}`,
              value: `changed-${index}`,
            }))
          : [{ kind: 'set' as const, path: '/items/0/name', value: 'changed' }],
    }),
  ),
];
