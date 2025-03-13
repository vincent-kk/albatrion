import { describe, expect, it } from 'vitest';

import { serialize } from '../serialize';

describe('serialize', () => {
  it('should serialize the object', () => {
    expect(serialize({ a: 1, b: 2 })).toEqual('#a:1|b:2|');
  });
  it('should serialize the nested object', () => {
    expect(serialize({ a: 1, b: { c: 3 } })).toEqual('#a:1|b:#c:3||');
  });
  it('should serialize the object with undefined', () => {
    expect(serialize({ a: 1, b: undefined })).toEqual('#a:1|b:undefined|');
  });
  it('should serialize the array', () => {
    expect(serialize([1, 2, 3])).toEqual('@1,2,3,');
  });
  it('should serialize the object with array', () => {
    expect(
      serialize({
        string: 'default value',
        number: 10,
        boolean: true,
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
        null: null,
      }),
    ).toEqual(
      '#array:@1,2,3,|boolean:true|null:null|number:10|object:#a:1|b:2||string:default value|',
    );
  });
  it('should serialize the large object with array', () => {
    expect(serialize(bigObject)).toEqual(
      '#properties:#settings:#properties:#language:#default:en|enum:@en,kr,jp,|type:string||privacy:#default:public|oneOf:@#const:public|title:Public|,#const:private|title:Private|,#const:custom|title:Custom|,|type:string||security:#properties:#2FA:#default:true|type:boolean||backupCodes:#items:#pattern:^[A-Z0-9]{8}$|type:string||maxItems:10|minItems:5|type:array|||required:@2FA,|type:object|||required:@privacy,language,|type:object||user:#properties:#email:#format:email|type:string||name:#default:Anonymous|maxLength:50|type:string||profile:#oneOf:@#properties:#type:#enum:@adult,child,|||required:@age,gender,preferences,|,#properties:#type:#enum:@none,|||required:@|,|properties:#age:#default:18|minimum:0|type:integer||gender:#enum:@male,female,other,|renderOptions:#visible:@.age >= 18||type:string||preferences:#properties:#notifications:#properties:#email:#default:true|type:boolean||sms:#default:false|type:boolean|||required:@email,sms,|type:object||theme:#default:light|enum:@light,dark,|type:string|||required:@theme,notifications,|type:object||type:#default:adult|enum:@adult,child,none,|type:string|||required:@type,|type:object|||required:@name,|type:object|||required:@user,settings,|type:object|',
    );
  });
  it('should serialize the large object with omit', () => {
    expect(
      serialize(bigObject, [
        'oneOf',
        'settings',
        'required',
        'minLength',
        'maxLength',
        'minItems',
        'maxItems',
        'pattern',
        'enum',
        'default',
        'minimum',
        'maximum',
        'visible',
        'disabled',
        'readonly',
      ]),
    ).toEqual(
      '#properties:#user:#properties:#email:#format:email|type:string||name:#type:string||profile:#properties:#age:#type:integer||gender:#renderOptions:#|type:string||preferences:#properties:#notifications:#properties:#email:#type:boolean||sms:#type:boolean|||type:object||theme:#type:string|||type:object||type:#type:string|||type:object|||type:object|||type:object|',
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
