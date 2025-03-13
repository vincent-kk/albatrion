import { describe, expect, it } from 'vitest';

import { stableSerialize } from '../stableSerialize';

describe('stableSerialize', () => {
  it('should stableSerialize the object', () => {
    expect(stableSerialize({ a: 1, b: 2 })).toEqual('%b:2|a:1|');
  });
  it('should stableSerialize the nested object', () => {
    expect(stableSerialize({ a: 1, b: { c: 3 } })).toEqual('%b:%c:3||a:1|');
  });
  it('should stableSerialize the object with undefined', () => {
    expect(stableSerialize({ a: 1, b: undefined })).toEqual(
      '%b:undefined|a:1|',
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
      '%string:default value|object:%b:2|a:1||number:10|null:null|boolean:true|array:#1,2,3,|',
    );
  });
  it('should stableSerialize the large object with array', () => {
    expect(stableSerialize(bigObject)).toEqual(
      '%type:object|required:#user,settings,|properties:%user:%type:object|required:#name,|properties:%profile:%type:object|required:#type,|properties:%type:%type:string|enum:#adult,child,none,|default:adult||preferences:%type:object|required:#theme,notifications,|properties:%theme:%type:string|enum:#light,dark,|default:light||notifications:%type:object|required:#email,sms,|properties:%sms:%type:boolean|default:false||email:%type:boolean|default:true||||||gender:%type:string|renderOptions:%visible:@.age >= 18||enum:#male,female,other,||age:%type:integer|minimum:0|default:18|||oneOf:#%required:#age,gender,preferences,|properties:%type:%enum:#adult,child,|||,%required:#|properties:%type:%enum:#none,|||,||name:%type:string|maxLength:50|default:Anonymous||email:%type:string|format:email||||settings:%type:object|required:#privacy,language,|properties:%security:%type:object|required:#2FA,|properties:%backupCodes:%type:array|minItems:5|maxItems:10|items:%type:string|pattern:^[A-Z0-9]{8}$|||2FA:%type:boolean|default:true||||privacy:%type:string|oneOf:#%title:Public|const:public|,%title:Private|const:private|,%title:Custom|const:custom|,|default:public||language:%type:string|enum:#en,kr,jp,|default:en|||||',
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
      '%type:object|properties:%user:%type:object|properties:%profile:%type:object|properties:%type:%type:string||preferences:%type:object|properties:%theme:%type:string||notifications:%type:object|properties:%sms:%type:boolean||email:%type:boolean||||||gender:%type:string|renderOptions:%||age:%type:integer||||name:%type:string||email:%type:string|format:email|||||',
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

    expect(stableSerialize(directCircular)).toEqual('%self:0@|');
    expect(stableSerialize(objA)).toEqual('%child:%parent:1@||');
    expect(stableSerialize(obj1)).toEqual('%next:%next:%next:3@|||');
    expect(stableSerialize(arrayCircular)).toEqual('#%array:6@|,');
    expect(stableSerialize(complex)).toEqual(
      '%name:복잡한 객체|data:%parent:8@|items:#%ref:8@|,||',
    );
    expect(stableSerialize(map)).toEqual('12@');
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
