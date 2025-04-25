import { describe, expect, it } from 'vitest';

import { serializeWithFullSortedKeys } from '../serializeWithFullSortedKeys';

describe('serializeWithFullSortedKeys', () => {
  it('should stringify the object', () => {
    expect(serializeWithFullSortedKeys({ a: 1, b: 2 })).toEqual('a:1|b:2');
  });
  it('should stringify the nested object', () => {
    expect(serializeWithFullSortedKeys({ a: 1, b: { c: 3 } })).toEqual(
      'a:1|b.c:3',
    );
  });
  it('should stringify the object with undefined', () => {
    expect(serializeWithFullSortedKeys({ a: 1, b: undefined })).toEqual(
      'a:1|b:undefined',
    );
  });
  it('should stringify the array', () => {
    expect(serializeWithFullSortedKeys([1, 2, 3])).toEqual('0:1|1:2|2:3');
  });
  it('should stringify the object with array', () => {
    expect(
      serializeWithFullSortedKeys({
        string: 'default value',
        number: 10,
        boolean: true,
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
        null: null,
      }),
    ).toEqual(
      'boolean:true|null:null|number:10|string:default value|object.a:1|object.b:2|array.0:1|array.1:2|array.2:3',
    );
  });
  it('should stringify the object with array', () => {
    expect(serializeWithFullSortedKeys(bigObject)).toEqual(
      'type:object|required.0:user|required.1:settings|properties.user.type:object|properties.user.required.0:name|properties.user.properties.profile.type:object|properties.user.properties.profile.required.0:type|properties.user.properties.profile.properties.type.default:adult|properties.user.properties.profile.properties.type.type:string|properties.user.properties.profile.properties.type.enum.0:adult|properties.user.properties.profile.properties.type.enum.1:child|properties.user.properties.profile.properties.type.enum.2:none|properties.user.properties.profile.properties.preferences.type:object|properties.user.properties.profile.properties.preferences.required.0:theme|properties.user.properties.profile.properties.preferences.required.1:notifications|properties.user.properties.profile.properties.preferences.properties.theme.default:light|properties.user.properties.profile.properties.preferences.properties.theme.type:string|properties.user.properties.profile.properties.preferences.properties.theme.enum.0:light|properties.user.properties.profile.properties.preferences.properties.theme.enum.1:dark|properties.user.properties.profile.properties.preferences.properties.notifications.type:object|properties.user.properties.profile.properties.preferences.properties.notifications.required.0:email|properties.user.properties.profile.properties.preferences.properties.notifications.required.1:sms|properties.user.properties.profile.properties.preferences.properties.notifications.properties.sms.default:false|properties.user.properties.profile.properties.preferences.properties.notifications.properties.sms.type:boolean|properties.user.properties.profile.properties.preferences.properties.notifications.properties.email.default:true|properties.user.properties.profile.properties.preferences.properties.notifications.properties.email.type:boolean|properties.user.properties.profile.properties.gender.type:string|properties.user.properties.profile.properties.gender.renderOptions.visible:@.age >= 18|properties.user.properties.profile.properties.gender.enum.0:male|properties.user.properties.profile.properties.gender.enum.1:female|properties.user.properties.profile.properties.gender.enum.2:other|properties.user.properties.profile.properties.age.default:18|properties.user.properties.profile.properties.age.minimum:0|properties.user.properties.profile.properties.age.type:integer|properties.user.properties.profile.oneOf.1.properties.type.enum.0:none|properties.user.properties.profile.oneOf.0.required.0:age|properties.user.properties.profile.oneOf.0.required.1:gender|properties.user.properties.profile.oneOf.0.required.2:preferences|properties.user.properties.profile.oneOf.0.properties.type.enum.0:adult|properties.user.properties.profile.oneOf.0.properties.type.enum.1:child|properties.user.properties.name.default:Anonymous|properties.user.properties.name.maxLength:50|properties.user.properties.name.type:string|properties.user.properties.email.format:email|properties.user.properties.email.type:string|properties.settings.type:object|properties.settings.required.0:privacy|properties.settings.required.1:language|properties.settings.properties.security.type:object|properties.settings.properties.security.required.0:2FA|properties.settings.properties.security.properties.backupCodes.maxItems:10|properties.settings.properties.security.properties.backupCodes.minItems:5|properties.settings.properties.security.properties.backupCodes.type:array|properties.settings.properties.security.properties.backupCodes.items.pattern:^[A-Z0-9]{8}$|properties.settings.properties.security.properties.backupCodes.items.type:string|properties.settings.properties.security.properties.2FA.default:true|properties.settings.properties.security.properties.2FA.type:boolean|properties.settings.properties.privacy.default:public|properties.settings.properties.privacy.type:string|properties.settings.properties.privacy.oneOf.2.const:custom|properties.settings.properties.privacy.oneOf.2.title:Custom|properties.settings.properties.privacy.oneOf.1.const:private|properties.settings.properties.privacy.oneOf.1.title:Private|properties.settings.properties.privacy.oneOf.0.const:public|properties.settings.properties.privacy.oneOf.0.title:Public|properties.settings.properties.language.default:en|properties.settings.properties.language.type:string|properties.settings.properties.language.enum.0:en|properties.settings.properties.language.enum.1:kr|properties.settings.properties.language.enum.2:jp',
    );
  });
});

const bigObject = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          maxLength: 50,
          default: 'Anonymous',
        },
        email: {
          type: 'string',
          format: 'email',
        },
        profile: {
          type: 'object',
          oneOf: [
            {
              properties: { type: { enum: ['adult', 'child'] } },
              required: ['age', 'gender', 'preferences'],
            },
            {
              properties: { type: { enum: ['none'] } },
              required: [],
            },
          ],
          properties: {
            type: {
              type: 'string',
              enum: ['adult', 'child', 'none'],
              default: 'adult',
            },
            age: {
              type: 'integer',
              minimum: 0,
              default: 18,
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              renderOptions: {
                visible: '@.age >= 18',
              },
            },
            preferences: {
              type: 'object',
              properties: {
                theme: {
                  type: 'string',
                  enum: ['light', 'dark'],
                  default: 'light',
                },
                notifications: {
                  type: 'object',
                  properties: {
                    email: {
                      type: 'boolean',
                      default: true,
                    },
                    sms: {
                      type: 'boolean',
                      default: false,
                    },
                  },
                  required: ['email', 'sms'],
                },
              },
              required: ['theme', 'notifications'],
            },
          },
          required: ['type'],
        },
      },
      required: ['name'],
    },
    settings: {
      type: 'object',
      properties: {
        privacy: {
          type: 'string',
          oneOf: [
            { const: 'public', title: 'Public' },
            { const: 'private', title: 'Private' },
            { const: 'custom', title: 'Custom' },
          ],
          default: 'public',
        },
        language: {
          type: 'string',
          enum: ['en', 'kr', 'jp'],
          default: 'en',
        },
        security: {
          type: 'object',
          properties: {
            '2FA': {
              type: 'boolean',
              default: true,
            },
            backupCodes: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[A-Z0-9]{8}$',
              },
              minItems: 5,
              maxItems: 10,
            },
          },
          required: ['2FA'],
        },
      },
      required: ['privacy', 'language'],
    },
  },
  required: ['user', 'settings'],
};
