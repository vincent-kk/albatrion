import { describe, expect, it } from 'vitest';

import { serializeObject } from '../serializeObject';

describe('serializeObject', () => {
  it('should stringify the object', () => {
    expect(serializeObject({ a: 1, b: 2 })).toEqual('b:2|a:1');
  });
  it('should stringify the nested object', () => {
    expect(serializeObject({ a: 1, b: { c: 3 } })).toEqual('b:{"c":3}|a:1');
  });
  it('should stringify the object with undefined', () => {
    expect(serializeObject({ a: 1, b: undefined })).toEqual('b:undefined|a:1');
  });
  it('should stringify the array', () => {
    expect(serializeObject([1, 2, 3])).toEqual('2:3|1:2|0:1');
  });
  it('should stringify the object with array', () => {
    expect(
      serializeObject({
        string: 'default value',
        number: 10,
        boolean: true,
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
        null: null,
      }),
    ).toEqual(
      'string:default value|object:{"a":1,"b":2}|number:10|null:null|boolean:true|array:[1,2,3]',
    );
  });
  it('should stringify the object with array', () => {
    expect(serializeObject(bigObject)).toEqual(
      'type:object|required:["user","settings"]|properties:{"user":{"type":"object","properties":{"name":{"type":"string","maxLength":50,"default":"Anonymous"},"email":{"type":"string","format":"email"},"profile":{"type":"object","oneOf":[{"properties":{"type":{"enum":["adult","child"]}},"required":["age","gender","preferences"]},{"properties":{"type":{"enum":["none"]}},"required":[]}],"properties":{"type":{"type":"string","enum":["adult","child","none"],"default":"adult"},"age":{"type":"integer","minimum":0,"default":18},"gender":{"type":"string","enum":["male","female","other"],"renderOptions":{"visible":"@.age >= 18"}},"preferences":{"type":"object","properties":{"theme":{"type":"string","enum":["light","dark"],"default":"light"},"notifications":{"type":"object","properties":{"email":{"type":"boolean","default":true},"sms":{"type":"boolean","default":false}},"required":["email","sms"]}},"required":["theme","notifications"]}},"required":["type"]}},"required":["name"]},"settings":{"type":"object","properties":{"privacy":{"type":"string","oneOf":[{"const":"public","title":"Public"},{"const":"private","title":"Private"},{"const":"custom","title":"Custom"}],"default":"public"},"language":{"type":"string","enum":["en","kr","jp"],"default":"en"},"security":{"type":"object","properties":{"2FA":{"type":"boolean","default":true},"backupCodes":{"type":"array","items":{"type":"string","pattern":"^[A-Z0-9]{8}$"},"minItems":5,"maxItems":10}},"required":["2FA"]}},"required":["privacy","language"]}}',
    );
  });
  it('should serializeObject the large object with omit', () => {
    expect(
      serializeObject(bigObject, [
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
      'type:object|properties:{"user":{"type":"object","properties":{"name":{"type":"string","maxLength":50,"default":"Anonymous"},"email":{"type":"string","format":"email"},"profile":{"type":"object","oneOf":[{"properties":{"type":{"enum":["adult","child"]}},"required":["age","gender","preferences"]},{"properties":{"type":{"enum":["none"]}},"required":[]}],"properties":{"type":{"type":"string","enum":["adult","child","none"],"default":"adult"},"age":{"type":"integer","minimum":0,"default":18},"gender":{"type":"string","enum":["male","female","other"],"renderOptions":{"visible":"@.age >= 18"}},"preferences":{"type":"object","properties":{"theme":{"type":"string","enum":["light","dark"],"default":"light"},"notifications":{"type":"object","properties":{"email":{"type":"boolean","default":true},"sms":{"type":"boolean","default":false}},"required":["email","sms"]}},"required":["theme","notifications"]}},"required":["type"]}},"required":["name"]},"settings":{"type":"object","properties":{"privacy":{"type":"string","oneOf":[{"const":"public","title":"Public"},{"const":"private","title":"Private"},{"const":"custom","title":"Custom"}],"default":"public"},"language":{"type":"string","enum":["en","kr","jp"],"default":"en"},"security":{"type":"object","properties":{"2FA":{"type":"boolean","default":true},"backupCodes":{"type":"array","items":{"type":"string","pattern":"^[A-Z0-9]{8}$"},"minItems":5,"maxItems":10}},"required":["2FA"]}},"required":["privacy","language"]}}',
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
