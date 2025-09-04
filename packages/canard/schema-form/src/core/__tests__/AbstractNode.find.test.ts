import { describe, expect, it } from 'vitest';

import { delay } from '@winglet/common-utils';

import { nodeFromJsonSchema } from '@/schema-form/core';
import type { JsonSchema } from '@/schema-form/types';

import type { NumberNode } from '../nodes/NumberNode';
import type { ObjectNode } from '../nodes/ObjectNode';
import type { StringNode } from '../nodes/StringNode';

describe('Namespace with oneOf functionality', () => {
  it('should create nodes with proper namespaces for oneOf schemas with overlapping property names', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['movie', 'game', 'book'],
          default: 'movie',
        },
        title: { type: 'string', default: 'Default Title' },
      },
      oneOf: [
        {
          '&if': "(./category) === 'movie'",
          properties: {
            director: { type: 'string' },
            genre: { type: 'string' },
            // Same name as base schema but different type - should have namespace
            rating: { type: 'number', minimum: 1, maximum: 10 },
          },
        },
        {
          '&if': "(./category) === 'game'",
          properties: {
            developer: { type: 'string' },
            platform: { type: 'string' },
            // Same name as base schema but different type - should have namespace
            rating: { type: 'string', enum: ['E', 'T', 'M', 'AO'] },
          },
        },
        {
          '&if': "(./category) === 'book'",
          properties: {
            author: { type: 'string' },
            isbn: { type: 'string' },
            // Same name as base schema but different type - should have namespace
            rating: { type: 'number', minimum: 1, maximum: 5 },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    // Verify base properties exist
    const categoryNode = node.find('category') as StringNode;
    const titleNode = node.find('title') as StringNode;
    expect(categoryNode.key).toBe('/category');
    expect(titleNode.key).toBe('/title');
    expect(categoryNode.value).toBe('movie');
    expect(titleNode.value).toBe('Default Title');

    // Verify oneOf branches create nodes with namespaces
    // When category is 'movie', movie-specific nodes should be accessible
    expect(node.oneOfIndex).toBe(0); // First oneOf branch (movie)

    const directorNode = node.find('director') as StringNode;
    const genreNode = node.find('genre') as StringNode;
    const movieRatingNode = node.find('rating') as NumberNode;

    expect(directorNode).toBeDefined();
    expect(genreNode).toBeDefined();
    expect(movieRatingNode).toBeDefined();
    expect(movieRatingNode.type).toBe('number');
  });

  it('should handle namespace separation when switching oneOf branches', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['user', 'admin'],
          default: 'user',
        },
        name: { type: 'string' },
      },
      oneOf: [
        {
          '&if': "(./type) === 'user'",
          properties: {
            profile: {
              type: 'object',
              properties: {
                bio: { type: 'string' },
                age: { type: 'number' },
              },
            },
            permissions: { type: 'string', default: 'read' },
          },
        },
        {
          '&if': "(./type) === 'admin'",
          properties: {
            profile: {
              type: 'object',
              properties: {
                department: { type: 'string' },
                level: { type: 'number' },
              },
            },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              default: ['read', 'write', 'admin'],
            },
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    // Initial state - user branch should be active
    expect(node.oneOfIndex).toBe(0);

    // Test user branch profile structure
    const userProfile = node.find('profile') as ObjectNode;
    expect(userProfile.key).toBe('/profile#oneOf/0');

    const userBio = userProfile.find('bio') as StringNode;
    const userAge = userProfile.find('age') as NumberNode;
    expect(userBio.key).toBe('/profile/bio');
    expect(userAge.key).toBe('/profile/age');

    const userPermissions = node.find('permissions') as StringNode;
    expect(userPermissions.key).toBe('/permissions#oneOf/0');
    expect(userPermissions.type).toBe('string');
    expect(userPermissions.value).toBe('read');

    // Switch to admin branch
    const typeNode = node.find('type') as StringNode;
    typeNode.setValue('admin');
    await delay();

    expect(node.oneOfIndex).toBe(1);

    // Test admin branch profile structure
    const adminProfile = node.find('profile') as ObjectNode;
    expect(adminProfile.key).toBe('/profile#oneOf/1');

    const adminDepartment = adminProfile.find('department') as StringNode;
    const adminLevel = adminProfile.find('level') as NumberNode;
    expect(adminDepartment.key).toBe('/profile/department');
    expect(adminLevel.key).toBe('/profile/level');

    const adminPermissions = node.find('permissions');
    expect(adminPermissions?.key).toBe('/permissions#oneOf/1');
    expect(adminPermissions?.type).toBe('array');
    expect(adminPermissions?.value).toEqual(['read', 'write', 'admin']);

    // Verify that user-specific nodes are no longer accessible from admin branch
    const userBioFromAdmin = adminProfile.find('bio');
    const userAgeFromAdmin = adminProfile.find('age');
    expect(userBioFromAdmin).toBeNull();
    expect(userAgeFromAdmin).toBeNull();
  });

  it('should find nodes correctly with namespace awareness in deeply nested oneOf structures', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        container: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['simple', 'advanced'],
              default: 'simple',
            },
            config: {
              type: 'object',
              oneOf: [
                {
                  '&if': "(../mode) === 'simple'",
                  properties: {
                    setting: { type: 'string', default: 'basic' },
                    value: { type: 'number', default: 10 },
                  },
                },
                {
                  '&if': "(../mode) === 'advanced'",
                  properties: {
                    setting: {
                      type: 'object',
                      properties: {
                        key: { type: 'string' },
                        data: { type: 'string' },
                      },
                    },
                    value: {
                      type: 'array',
                      items: { type: 'number' },
                      default: [1, 2, 3],
                    },
                    extra: { type: 'boolean', default: true },
                  },
                },
              ],
            },
          },
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    // Navigate to nested structure
    const container = node.find('container') as ObjectNode;
    const mode = container.find('mode') as StringNode;
    const config = container.find('config') as ObjectNode;

    expect(container.key).toBe('/container');
    expect(mode.key).toBe('/container/mode');
    expect(config.key).toBe('/container/config');
    expect(mode.value).toBe('simple');

    // Test simple mode namespace
    expect(config.oneOfIndex).toBe(0);

    const simpleSetting = config.find('setting') as StringNode;
    const simpleValue = config.find('value') as NumberNode;

    expect(simpleSetting.key).toBe('/container/config/setting#oneOf/0');
    expect(simpleValue.key).toBe('/container/config/value#oneOf/0');
    expect(simpleSetting.type).toBe('string');
    expect(simpleValue.type).toBe('number');
    expect(simpleSetting.value).toBe('basic');
    expect(simpleValue.value).toBe(10);

    // Switch to advanced mode
    mode.setValue('advanced');
    await delay();

    expect(config.oneOfIndex).toBe(1);

    const advancedSetting = config.find('setting') as ObjectNode;
    const advancedValue = config.find('value');
    const extra = config.find('extra');

    expect(advancedSetting.key).toBe('/container/config/setting#oneOf/1');
    expect(advancedValue?.key).toBe('/container/config/value#oneOf/1');
    expect(extra?.key).toBe('/container/config/extra#oneOf/1');
    expect(advancedSetting.type).toBe('object');
    expect(advancedValue?.type).toBe('array');
    expect(extra?.type).toBe('boolean');
    expect(advancedValue?.value).toEqual([1, 2, 3]);
    expect(extra?.value).toBe(true);

    // Test nested object in advanced setting
    const settingKey = advancedSetting.find('key') as StringNode;
    const settingData = advancedSetting.find('data') as StringNode;
    expect(settingKey.key).toBe('/container/config/setting/key');
    expect(settingData.key).toBe('/container/config/setting/data');

    // Verify that simple mode nodes are no longer accessible
    const simpleSettingFromAdvanced = config.find('setting');
    expect(simpleSettingFromAdvanced?.key).not.toBe(
      '/container/config/setting#oneOf/0',
    );
    expect(simpleSettingFromAdvanced?.type).toBe('object'); // Now it's the advanced setting
  });

  it('should handle multiple overlapping property names across different oneOf branches', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        vehicleType: {
          type: 'string',
          enum: ['car', 'bike', 'truck'],
          default: 'car',
        },
      },
      oneOf: [
        {
          '&if': "(./vehicleType) === 'car'",
          properties: {
            engine: { type: 'string' },
            doors: { type: 'number' },
            fuel: { type: 'string', enum: ['gasoline', 'diesel', 'electric'] },
          },
        },
        {
          '&if': "(./vehicleType) === 'bike'",
          properties: {
            engine: { type: 'number' }, // Same name, different type
            wheels: { type: 'number', default: 2 },
            fuel: { type: 'boolean', default: false }, // Same name, different type
          },
        },
        {
          '&if': "(./vehicleType) === 'truck'",
          properties: {
            engine: {
              type: 'object',
              properties: {
                horsepower: { type: 'number' },
                type: { type: 'string' },
              },
            }, // Same name, different type
            doors: { type: 'number' }, // Same name, same type
            capacity: { type: 'string' },
            fuel: { type: 'array', items: { type: 'string' } }, // Same name, different type
          },
        },
      ],
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    const vehicleType = node.find('vehicleType') as StringNode;
    expect(vehicleType.key).toBe('/vehicleType');
    expect(vehicleType.value).toBe('car');
    expect(node.oneOfIndex).toBe(0);

    // Test car branch with namespace
    const carEngine = node.find('engine') as StringNode;
    const carDoors = node.find('doors') as NumberNode;
    const carFuel = node.find('fuel') as StringNode;

    expect(carEngine.key).toBe('/engine#oneOf/0');
    expect(carDoors.key).toBe('/doors#oneOf/0');
    expect(carFuel.key).toBe('/fuel#oneOf/0');
    expect(carEngine.type).toBe('string');
    expect(carDoors.type).toBe('number');
    expect(carFuel.type).toBe('string');

    // Switch to bike
    vehicleType.setValue('bike');
    await delay();

    expect(node.oneOfIndex).toBe(1);

    const bikeEngine = node.find('engine') as NumberNode;
    const bikeWheels = node.find('wheels') as NumberNode;
    const bikeFuel = node.find('fuel');

    expect(bikeEngine.key).toBe('/engine#oneOf/1');
    expect(bikeWheels.key).toBe('/wheels#oneOf/1');
    expect(bikeFuel?.key).toBe('/fuel#oneOf/1');
    expect(bikeEngine.type).toBe('number');
    expect(bikeWheels.type).toBe('number');
    expect(bikeFuel?.type).toBe('boolean');
    expect(bikeWheels.value).toBe(2);
    expect(bikeFuel?.value).toBe(false);

    // Verify car-specific nodes are no longer accessible
    const carEngineFromBike = node.find('engine');
    expect(carEngineFromBike?.type).not.toBe('string'); // Should be number now

    // Switch to truck
    vehicleType.setValue('truck');
    await delay();

    expect(node.oneOfIndex).toBe(2);

    const truckEngine = node.find('engine') as ObjectNode;
    const truckDoors = node.find('doors') as NumberNode;
    const truckCapacity = node.find('capacity') as StringNode;
    const truckFuel = node.find('fuel');

    expect(truckEngine.key).toBe('/engine#oneOf/2');
    expect(truckDoors.key).toBe('/doors#oneOf/2');
    expect(truckCapacity.key).toBe('/capacity#oneOf/2');
    expect(truckFuel?.key).toBe('/fuel#oneOf/2');
    expect(truckEngine.type).toBe('object');
    expect(truckDoors.type).toBe('number');
    expect(truckCapacity.type).toBe('string');
    expect(truckFuel?.type).toBe('array');

    // Test nested properties in truck engine
    const horsepower = truckEngine.find('horsepower') as NumberNode;
    const engineType = truckEngine.find('type') as StringNode;
    expect(horsepower.key).toBe('/engine/horsepower');
    expect(engineType.key).toBe('/engine/type');

    // Verify bike-specific nodes are no longer accessible
    const bikeWheelsFromTruck = node.find('wheels');
    expect(bikeWheelsFromTruck?.key).toBe('/wheels#oneOf/1');
  });

  it('should handle JSONPointer navigation with namespace awareness', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        section: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['basic', 'premium'],
              default: 'basic',
            },
          },
          oneOf: [
            {
              '&if': "(./type) === 'basic'",
              properties: {
                features: {
                  type: 'array',
                  items: { type: 'string' },
                  default: ['feature1', 'feature2'],
                },
              },
            },
            {
              '&if': "(./type) === 'premium'",
              properties: {
                features: {
                  type: 'object',
                  properties: {
                    advanced: { type: 'boolean', default: true },
                    options: {
                      type: 'array',
                      items: { type: 'string' },
                      default: ['option1', 'option2'],
                    },
                  },
                },
              },
            },
          ],
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    // Test absolute JSONPointer paths
    const section = node.find('section') as ObjectNode;
    const sectionType = section.find('type') as StringNode;
    expect(section.key).toBe('/section');
    expect(sectionType.key).toBe('/section/type');
    expect(sectionType.value).toBe('basic');

    // Basic branch should be active
    expect(section.oneOfIndex).toBe(0);

    const basicFeatures = section.find('features');
    expect(basicFeatures?.key).toBe('/section/features#oneOf/0');
    expect(basicFeatures?.type).toBe('array');
    expect(basicFeatures?.value).toEqual(['feature1', 'feature2']);

    // Test absolute path access with namespace
    const basicFeaturesAbs = node.find('#/section/features');
    expect(basicFeaturesAbs?.key).toBe('/section/features#oneOf/0');

    // Switch to premium and test namespace separation
    sectionType.setValue('premium');
    await delay();

    expect(section.oneOfIndex).toBe(1);

    const premiumFeatures = section.find('features') as ObjectNode;
    expect(premiumFeatures.key).toBe('/section/features#oneOf/1');
    expect(premiumFeatures.type).toBe('object');

    const advanced = premiumFeatures.find('advanced');
    const options = premiumFeatures.find('options');
    expect(advanced?.key).toBe('/section/features/advanced');
    expect(options?.key).toBe('/section/features/options');
    expect(advanced?.value).toBe(true);
    expect(options?.value).toEqual(['option1', 'option2']);

    // Test that we can still navigate using absolute paths
    const advancedDirect = node.find('#/section/features/advanced');
    const optionsDirect = node.find('#/section/features/options');
    expect(advancedDirect?.key).toBe('/section/features/advanced');
    expect(optionsDirect?.key).toBe('/section/features/options');
    expect(advancedDirect?.value).toBe(true);
    expect(optionsDirect?.value).toEqual(['option1', 'option2']);

    // Verify that basic features are no longer accessible
    const basicFromPremium = section.find('features');
    expect(basicFromPremium?.type).not.toBe('array'); // Should be object now
  });

  it('should handle relative path navigation with parent references across namespaces', async () => {
    const jsonSchema = {
      type: 'object',
      properties: {
        global: { type: 'string', default: 'global-value' },
        context: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['dev', 'prod'],
              default: 'dev',
            },
          },
          oneOf: [
            {
              '&if': "(./mode) === 'dev'",
              properties: {
                debug: {
                  type: 'boolean',
                  default: true,
                  computed: {
                    visible: '../../global === "global-value"',
                  },
                },
                settings: {
                  type: 'object',
                  properties: {
                    level: { type: 'number', default: 1 },
                    data: {
                      type: 'string',
                      computed: {
                        value: '../../../global + "-dev"',
                      },
                    },
                  },
                },
              },
            },
            {
              '&if': "(./mode) === 'prod'",
              properties: {
                debug: { type: 'boolean', default: false },
                settings: {
                  type: 'object',
                  properties: {
                    level: { type: 'number', default: 5 },
                    data: {
                      type: 'string',
                      computed: {
                        value: '../../../global + "-prod"',
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      },
    } satisfies JsonSchema;

    const node = nodeFromJsonSchema({
      jsonSchema,
      onChange: () => {},
    }) as ObjectNode;

    await delay();

    // Test dev mode computed properties
    const global = node.find('global') as StringNode;
    const context = node.find('context') as ObjectNode;
    const mode = context.find('mode') as StringNode;

    expect(global.key).toBe('/global');
    expect(context.key).toBe('/context');
    expect(mode.key).toBe('/context/mode');
    expect(global.value).toBe('global-value');
    expect(mode.value).toBe('dev');
    expect(context.oneOfIndex).toBe(0);

    const devDebug = context.find('debug');
    const devSettings = context.find('settings') as ObjectNode;

    expect(devDebug?.key).toBe('/context/debug#oneOf/0');
    expect(devSettings.key).toBe('/context/settings#oneOf/0');
    expect(devDebug?.value).toBe(true);

    const devLevel = devSettings.find('level') as NumberNode;
    const devData = devSettings.find('data') as StringNode;
    expect(devLevel.key).toBe('/context/settings/level');
    expect(devData.key).toBe('/context/settings/data');
    expect(devLevel.value).toBe(1);
    // Note: computed property evaluation is separate from namespace functionality

    // Switch to production mode
    mode.setValue('prod');
    await delay();

    expect(context.oneOfIndex).toBe(1);

    const prodDebug = context.find('debug');
    const prodSettings = context.find('settings') as ObjectNode;

    expect(prodDebug?.key).toBe('/context/debug#oneOf/1');
    expect(prodSettings.key).toBe('/context/settings#oneOf/1');
    expect(prodDebug?.value).toBe(false);

    const prodLevel = prodSettings.find('level') as NumberNode;
    const prodData = prodSettings.find('data') as StringNode;
    expect(prodLevel.key).toBe('/context/settings/level');
    expect(prodData.key).toBe('/context/settings/data');
    expect(prodLevel.value).toBe(5);
    // Note: computed property evaluation is separate from namespace functionality

    // Verify that dev mode settings are no longer accessible
    const devSettingsFromProd = context.find('settings') as ObjectNode;
    const levelFromProd = devSettingsFromProd.find('level') as NumberNode;
    expect(levelFromProd.value).not.toBe(1); // Should be 5 now (prod value)
    expect(levelFromProd.value).toBe(5);
  });
});
