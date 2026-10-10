/**
 * Hand-written schemas imitating documented generator output. Each entry names the generator + version imitated
 * and the union pointer inside the root. Entries marked (추론) imitate output from memory and were not regenerated.
 */

/** pydantic 2.9 `model_json_schema()`: `Pet = Annotated[Union[Cat, Dog], Field(discriminator='kind')]`, `kind: Literal['cat']`. */
export const pydanticDiscriminated = {
  id: 'pydantic-2.9 discriminated Literal',
  dialect: '2020',
  pointer: '/properties/pet/oneOf',
  root: {
    $defs: {
      Cat: { properties: { kind: { const: 'cat', title: 'Kind', type: 'string' }, meow: { title: 'Meow', type: 'string' } }, required: ['kind', 'meow'], title: 'Cat', type: 'object' },
      Dog: { properties: { kind: { const: 'dog', title: 'Kind', type: 'string' }, bark: { title: 'Bark', type: 'boolean' } }, required: ['kind', 'bark'], title: 'Dog', type: 'object' },
    },
    properties: { pet: { discriminator: { mapping: { cat: '#/$defs/Cat', dog: '#/$defs/Dog' }, propertyName: 'kind' }, oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }], title: 'Pet' } },
    required: ['pet'], title: 'Owner', type: 'object',
  },
  samples: [{ kind: 'cat', meow: 'm' }, { kind: 'dog', bark: true }, { kind: 'bird' }, { meow: 'm' }, { kind: 'cat', meow: 'm', bark: true }],
};

/** pydantic 2.9: `Optional[Union[Cat, Dog]]` without discriminator → flat anyOf with a null branch. */
export const pydanticOptionalUnion = {
  id: 'pydantic-2.9 Optional[Union[Cat,Dog]]',
  dialect: '2020',
  pointer: '/properties/pet/anyOf',
  root: { $defs: pydanticDiscriminated.root.$defs, properties: { pet: { anyOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }, { type: 'null' }], default: null, title: 'Pet' } }, title: 'Owner', type: 'object' },
  samples: [{ kind: 'cat', meow: 'm' }, null, { kind: 'bird' }],
};

/** pydantic 2.9: `Optional[Annotated[Union[Cat, Dog], Field(discriminator='kind')]]` → anyOf[ {discriminator, oneOf}, null ]. */
export const pydanticOptionalDiscriminated = {
  id: 'pydantic-2.9 Optional[discriminated]',
  dialect: '2020',
  pointer: '/properties/pet/anyOf/0/oneOf',
  root: { $defs: pydanticDiscriminated.root.$defs, properties: { pet: { anyOf: [{ discriminator: { mapping: { cat: '#/$defs/Cat', dog: '#/$defs/Dog' }, propertyName: 'kind' }, oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }] }, { type: 'null' }], default: null, title: 'Pet' } }, title: 'Owner', type: 'object' },
  samples: [{ kind: 'cat', meow: 'm' }, null],
};

/** pydantic ≤2.8 (추론): single Literal emitted as `const` + `enum` together. */
export const pydanticConstEnum = {
  id: 'pydantic-2.x const+enum (추론)',
  dialect: '2020',
  pointer: '/properties/pet/oneOf',
  root: {
    $defs: {
      Cat: { properties: { kind: { const: 'cat', enum: ['cat'], type: 'string' }, meow: { type: 'string' } }, required: ['kind'], type: 'object' },
      Dog: { properties: { kind: { const: 'dog', enum: ['dog'], type: 'string' }, bark: { type: 'boolean' } }, required: ['kind'], type: 'object' },
    },
    properties: { pet: { discriminator: { propertyName: 'kind' }, oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }] } }, type: 'object',
  },
  samples: [{ kind: 'cat' }, { kind: 'dog' }],
};

/** OpenAPI 3.0 (swagger.io "Inheritance and Polymorphism" example): discriminator + mapping, allOf inheritance, no const. */
export const openapi30MappingOnly = {
  id: 'OpenAPI-3.0 petstore mapping-only',
  dialect: '07',
  pointer: '/properties/pet/oneOf',
  root: {
    definitions: {
      Pet: { type: 'object', required: ['petType'], properties: { petType: { type: 'string' }, name: { type: 'string' } } },
      Cat: { allOf: [{ $ref: '#/definitions/Pet' }, { type: 'object', required: ['huntingSkill'], properties: { huntingSkill: { type: 'string', enum: ['clueless', 'lazy', 'adventurous', 'aggressive'] } } }] },
      Dog: { allOf: [{ $ref: '#/definitions/Pet' }, { type: 'object', required: ['packSize'], properties: { packSize: { type: 'integer', minimum: 0 } } }] },
    },
    type: 'object',
    properties: { pet: { oneOf: [{ $ref: '#/definitions/Cat' }, { $ref: '#/definitions/Dog' }], discriminator: { propertyName: 'petType', mapping: { Cat: '#/definitions/Cat', Dog: '#/definitions/Dog' } } } },
  },
  samples: [{ petType: 'Cat', huntingSkill: 'lazy' }, { petType: 'Dog', packSize: 3 }, { petType: 'Cat', packSize: 3 }, { petType: 'Cat', huntingSkill: 'lazy', packSize: 3 }],
};

/** OpenAPI 3.0 with `nullable: true` on a branch (springdoc/NSwag style, 추론). */
export const openapi30Nullable = {
  id: 'OpenAPI-3.0 nullable branch',
  dialect: '07',
  pointer: '/properties/pet/oneOf',
  root: {
    definitions: {
      Cat: { type: 'object', nullable: true, required: ['petType'], properties: { petType: { type: 'string', enum: ['Cat'] }, meow: { type: 'string' } } },
      Dog: { type: 'object', required: ['petType'], properties: { petType: { type: 'string', enum: ['Dog'] }, bark: { type: 'boolean' } } },
    },
    type: 'object',
    properties: { pet: { oneOf: [{ $ref: '#/definitions/Cat' }, { $ref: '#/definitions/Dog' }] } },
  },
  samples: [{ petType: 'Cat' }, null, { petType: 'Dog' }],
};

/** OpenAPI 3.1 / TypeSpec-style (추론): two-level inheritance — `Persian extends Cat extends Pet`; the tag sits in Cat, reached only through allOf-of-allOf. */
export const openapi31TwoLevel = {
  id: 'OpenAPI-3.1 two-level allOf inheritance (TypeSpec style, 추론)',
  dialect: '2020',
  pointer: '/properties/pet/oneOf',
  root: {
    components: { schemas: {
      Pet: { type: 'object', required: ['petType'], properties: { petType: { type: 'string' }, name: { type: 'string' } } },
      Cat: { allOf: [{ $ref: '#/components/schemas/Pet' }, { type: 'object', properties: { petType: { type: 'string', enum: ['Cat'] } } }] },
      Persian: { allOf: [{ $ref: '#/components/schemas/Cat' }, { type: 'object', properties: { furLength: { type: 'integer' } } }] },
      Dog: { allOf: [{ $ref: '#/components/schemas/Pet' }, { type: 'object', properties: { petType: { type: 'string', enum: ['Dog'] }, packSize: { type: 'integer' } } }] },
    } },
    type: 'object',
    properties: { pet: { oneOf: [{ $ref: '#/components/schemas/Persian' }, { $ref: '#/components/schemas/Dog' }], discriminator: { propertyName: 'petType' } } },
  },
  samples: [{ petType: 'Cat', furLength: 3 }, { petType: 'Dog', packSize: 2 }],
};

/** OpenAPI 3.1 branch with `type: ['object','null']` instead of a null branch. */
export const openapi31NullableType = {
  id: 'OpenAPI-3.1 type:[object,null] branch',
  dialect: '2020',
  pointer: '/properties/pet/oneOf',
  root: {
    $defs: {
      Cat: { type: ['object', 'null'], required: ['kind'], properties: { kind: { const: 'cat' }, meow: { type: 'string' } } },
      Dog: { type: 'object', required: ['kind'], properties: { kind: { const: 'dog' }, bark: { type: 'boolean' } } },
    },
    type: 'object',
    properties: { pet: { oneOf: [{ $ref: '#/$defs/Cat' }, { $ref: '#/$defs/Dog' }] } },
  },
  samples: [{ kind: 'cat' }, null, { kind: 'dog' }],
};

/** zod 3.23 + zod-to-json-schema 3.23: `z.discriminatedUnion('kind', [...])` → anyOf, `additionalProperties:false`, draft-07. */
export const zodDiscriminated = {
  id: 'zod-to-json-schema-3.23 discriminatedUnion',
  dialect: '07',
  pointer: '/properties/pet/anyOf',
  root: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: { pet: { anyOf: [
      { type: 'object', properties: { kind: { type: 'string', const: 'cat' }, meow: { type: 'string' } }, required: ['kind', 'meow'], additionalProperties: false },
      { type: 'object', properties: { kind: { type: 'string', const: 'dog' }, bark: { type: 'boolean' } }, required: ['kind', 'bark'], additionalProperties: false },
    ] } },
    required: ['pet'], additionalProperties: false,
  },
  samples: [{ kind: 'cat', meow: 'm' }, { kind: 'cat', meow: 'm', bark: true }],
};

/** zod discriminatedUnion with `z.enum(['cat','lion'])` as the tag of one member → multi-element enum (allowed by zod ≥3.20). */
export const zodMultiEnumTag = {
  id: 'zod-to-json-schema-3.23 discriminatedUnion with z.enum tag',
  dialect: '07',
  pointer: '/properties/pet/anyOf',
  root: {
    type: 'object',
    properties: { pet: { anyOf: [
      { type: 'object', properties: { kind: { type: 'string', enum: ['cat', 'lion'] }, meow: { type: 'string' } }, required: ['kind'], additionalProperties: false },
      { type: 'object', properties: { kind: { type: 'string', const: 'dog' }, bark: { type: 'boolean' } }, required: ['kind'], additionalProperties: false },
    ] } },
  },
  samples: [{ kind: 'lion' }, { kind: 'dog' }, { kind: 'cat' }],
};

/** TypeBox 0.32: `Type.Union([Type.Object({kind: Type.Literal('cat'), …}), …])` → anyOf with `{const, type}`. */
export const typeboxUnion = {
  id: 'TypeBox-0.32 Union of Object+Literal',
  dialect: '2020',
  pointer: '/properties/pet/anyOf',
  root: {
    type: 'object',
    properties: { pet: { anyOf: [
      { type: 'object', properties: { kind: { const: 'cat', type: 'string' }, meow: { type: 'string' } }, required: ['kind', 'meow'] },
      { type: 'object', properties: { kind: { const: 'dog', type: 'string' }, bark: { type: 'boolean' } }, required: ['kind', 'bark'] },
    ] } },
    required: ['pet'],
  },
  samples: [{ kind: 'cat', meow: 'm' }, { kind: 'dog', bark: true }],
};

/** typescript-json-schema 0.64: tagged union with two literal props per member; default emits `const` (with `--constAsEnum`: `enum:[x]`). Key order = declaration order. */
export const tsjsTwoTags = {
  id: 'typescript-json-schema-0.64 two literal keys per member',
  dialect: '07',
  pointer: '/properties/shape/anyOf',
  root: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties: { shape: { anyOf: [
      { type: 'object', properties: { apiVersion: { type: 'number', const: 1 }, kind: { type: 'string', const: 'circle' }, r: { type: 'number' } }, required: ['apiVersion', 'kind', 'r'] },
      { type: 'object', properties: { apiVersion: { type: 'number', const: 1 }, kind: { type: 'string', const: 'square' }, s: { type: 'number' } }, required: ['apiVersion', 'kind', 's'] },
    ] } },
  },
  samples: [{ apiVersion: 1, kind: 'circle', r: 1 }, { apiVersion: 1, kind: 'square', s: 1 }],
};

/** Hand-authored anyOf where two members share a tag value (overlapping) — the §B.4 fall-through. */
export const overlappingAnyOf = {
  id: 'hand anyOf overlapping tag values',
  dialect: '2020',
  pointer: '/properties/pet/anyOf',
  root: {
    type: 'object',
    properties: { pet: { anyOf: [
      { type: 'object', properties: { kind: { const: 'cat' }, meow: { type: 'string' } }, required: ['kind'], additionalProperties: false },
      { type: 'object', properties: { kind: { const: 'cat' }, meow: { type: 'string' }, lives: { type: 'integer' } }, required: ['kind', 'lives'] },
      { type: 'object', properties: { kind: { const: 'dog' }, bark: { type: 'boolean' } }, required: ['kind'] },
    ] } },
  },
  samples: [{ kind: 'cat', meow: 'm', lives: 9 }, { kind: 'cat', lives: 9 }],
};

/** pydantic 2.9 recursive model: `class Node: kind: Literal['node']; children: list[Leaf | Node]` — union of self-referencing $refs. */
export const pydanticRecursive = {
  id: 'pydantic-2.9 recursive tree union',
  dialect: '2020',
  pointer: '/anyOf',
  root: {
    $defs: {
      Leaf: { properties: { kind: { const: 'leaf', type: 'string' }, value: { type: 'integer' } }, required: ['kind', 'value'], type: 'object' },
      Node: { properties: { kind: { const: 'node', type: 'string' }, children: { items: { anyOf: [{ $ref: '#/$defs/Leaf' }, { $ref: '#/$defs/Node' }] }, type: 'array' } }, required: ['kind', 'children'], type: 'object' },
    },
    anyOf: [{ $ref: '#/$defs/Leaf' }, { $ref: '#/$defs/Node' }],
  },
  samples: [{ kind: 'node', children: [{ kind: 'leaf', value: 1 }] }],
};

export const corpus = [
  pydanticDiscriminated, pydanticOptionalUnion, pydanticOptionalDiscriminated, pydanticConstEnum,
  openapi30MappingOnly, openapi30Nullable, openapi31TwoLevel, openapi31NullableType,
  zodDiscriminated, zodMultiEnumTag, typeboxUnion, tsjsTwoTags, overlappingAnyOf, pydanticRecursive,
];
