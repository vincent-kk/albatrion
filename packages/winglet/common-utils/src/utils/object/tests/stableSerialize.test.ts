import { describe, expect, it } from 'vitest';

import { stableSerialize } from '../stableSerialize';

describe('stableSerialize', () => {
  it('should stableSerialize the object', () => {
    expect(stableSerialize({ a: 1, b: 2 })).toEqual('%a:1|b:2|');
  });
  it('should stableSerialize the nested object', () => {
    expect(stableSerialize({ a: 1, b: { c: 3 } })).toEqual('%a:1|b:%c:3||');
  });
  it('should stableSerialize the object with undefined', () => {
    expect(stableSerialize({ a: 1, b: undefined })).toEqual(
      '%a:1|b:undefined|',
    );
  });
  it('should stableSerialize the array', () => {
    expect(stableSerialize([1, 2, 3])).toEqual('#1,2,3,');
  });
  it('should stableSerialize the object with array', () => {
    expect(
      stableSerialize({
        string: 'default value',
        number: 10,
        boolean: true,
        array: [1, 2, 3],
        object: { a: 1, b: 2 },
        null: null,
      }),
    ).toEqual(
      '%array:#1,2,3,|boolean:true|null:null|number:10|object:%a:1|b:2||string:default value|',
    );
  });
  it('should stableSerialize the large object with array', () => {
    expect(stableSerialize(bigObject)).toEqual(
      '%properties:%settings:%properties:%language:%default:en|enum:#en,kr,jp,|type:string||privacy:%default:public|oneOf:#%const:public|title:Public|,%const:private|title:Private|,%const:custom|title:Custom|,|type:string||security:%properties:%2FA:%default:true|type:boolean||backupCodes:%items:%pattern:^[A-Z0-9]{8}$|type:string||maxItems:10|minItems:5|type:array|||required:#2FA,|type:object|||required:#privacy,language,|type:object||user:%properties:%email:%format:email|type:string||name:%default:Anonymous|maxLength:50|type:string||profile:%oneOf:#%properties:%type:%enum:#adult,child,|||required:#age,gender,preferences,|,%properties:%type:%enum:#none,|||required:#|,|properties:%age:%default:18|minimum:0|type:integer||gender:%enum:#male,female,other,|renderOptions:%visible:@.age >= 18||type:string||preferences:%properties:%notifications:%properties:%email:%default:true|type:boolean||sms:%default:false|type:boolean|||required:#email,sms,|type:object||theme:%default:light|enum:#light,dark,|type:string|||required:#theme,notifications,|type:object||type:%default:adult|enum:#adult,child,none,|type:string|||required:#type,|type:object|||required:#name,|type:object|||required:#user,settings,|type:object|',
    );
  });
  it('should stableSerialize the large object with omit', () => {
    expect(
      stableSerialize(bigObject, [
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
      '%properties:%user:%properties:%email:%format:email|type:string||name:%type:string||profile:%properties:%age:%type:integer||gender:%renderOptions:%|type:string||preferences:%properties:%notifications:%properties:%email:%type:boolean||sms:%type:boolean|||type:object||theme:%type:string|||type:object||type:%type:string|||type:object|||type:object|||type:object|',
    );
  });

  it('should stableSerialize the object with circular reference', () => {
    // 1. 직접 자기 자신을 참조하는 객체
    interface DirectCircular {
      self?: DirectCircular;
    }
    const directCircular: DirectCircular = {};
    directCircular.self = directCircular;

    // 2. 두 객체가 서로 참조하는 경우
    interface ObjWithChild {
      child?: ObjWithParent;
    }
    interface ObjWithParent {
      parent?: ObjWithChild;
    }
    const objA: ObjWithChild = {};
    const objB: ObjWithParent = {};
    objA.child = objB;
    objB.parent = objA;

    // 3. 세 객체 이상의 순환 참조 체인
    interface LinkedObj {
      next?: LinkedObj;
    }
    const obj1: LinkedObj = {};
    const obj2: LinkedObj = {};
    const obj3: LinkedObj = {};
    obj1.next = obj2;
    obj2.next = obj3;
    obj3.next = obj1;

    // 4. 배열을 포함한 순환 참조
    interface ObjWithArray {
      array: any[];
    }
    const arrayCircular: any[] = [];
    const nestedObj: ObjWithArray = { array: arrayCircular };
    arrayCircular.push(nestedObj);

    // 5. 복잡한 중첩 구조의 순환 참조
    interface ComplexData {
      items: any[];
      parent?: Complex;
    }
    interface Complex {
      name: string;
      data: ComplexData;
    }
    const complex: Complex = {
      name: '복잡한 객체',
      data: {
        items: [],
      },
    };
    complex.data.parent = complex;
    complex.data.items.push({
      ref: complex,
    });

    // 6. Map과 Set을 이용한 순환 참조
    const map = new Map<string, Set<any>>();
    const set = new Set<Map<string, any>>();
    map.set('set', set);
    set.add(map);

    // 테스트 코드

    expect(stableSerialize(directCircular)).toEqual('%self:1@|');
    expect(stableSerialize(objA)).toEqual('%child:%parent:1@||');
    expect(stableSerialize(obj1)).toEqual('%next:%next:%next:1@|||');
    expect(stableSerialize(arrayCircular)).toEqual('#%array:1@|,');
    expect(stableSerialize(complex)).toEqual(
      '%data:%items:#%ref:1@|,|parent:1@||name:복잡한 객체|',
    );
    expect(stableSerialize(map)).toEqual('1@');
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
