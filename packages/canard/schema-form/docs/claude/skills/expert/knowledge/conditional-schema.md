
# Conditional Schema Skill

Expert skill for conditional schema features in @canard/schema-form.

## Skill Info

- **Name**: conditional-schema
- **Purpose**: Q&A and implementation guide for oneOf, anyOf, allOf, if-then-else
- **Triggers**: oneOf, anyOf, allOf, if-then-else, conditional fields, dynamic forms related questions


## oneOf (Exclusive Choice)

Only one condition is active, and fields from other branches are removed from form values.

### Basic Usage

```typescript
// Based on stories/17.OneOf.stories.tsx
const schema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['A', 'B'],
      default: 'A',
    },
  },
  oneOf: [
    {
      '&if': "./type === 'A'",  // Alias for computed.if
      properties: {
        fieldA: { type: 'string' },
      },
    },
    {
      '&if': "./type === 'B'",
      properties: {
        fieldB: { type: 'number' },
      },
    },
  ],
};

// type = 'A' → { type: 'A', fieldA: '...' }
// type = 'B' → { type: 'B', fieldB: 123 }
```

### Using computed.if

```typescript
const schema = {
  type: 'object',
  oneOf: [
    {
      computed: {
        if: "./category === 'game'",
      },
      properties: {
        releaseDate: { type: 'string', format: 'date' },
        numOfPlayers: { type: 'number' },
      },
    },
    {
      computed: {
        if: "./category === 'movie'",
      },
      properties: {
        openingDate: { type: 'string', format: 'date' },
        director: { type: 'string' },
      },
    },
  ],
  properties: {
    category: {
      type: 'string',
      enum: ['game', 'movie'],
      default: 'game',
    },
    title: { type: 'string' },
  },
};
```

### Conditions Using const Fields

```typescript
const schema = {
  type: 'object',
  properties: {
    country: {
      type: 'string',
      enum: ['KR', 'US', 'JP'],
    },
  },
  oneOf: [
    {
      computed: { if: "./country === 'KR'" },
      properties: {
        phone: {
          type: 'string',
          pattern: '^010-[0-9]{4}-[0-9]{4}$',
        },
      },
    },
    {
      computed: { if: "./country === 'US'" },
      properties: {
        phone: {
          type: 'string',
          pattern: '^\\+1-[0-9]{3}-[0-9]{4}$',
        },
      },
    },
  ],
};
```

### Nested oneOf

```typescript
const schema = {
  type: 'object',
  properties: {
    mainType: { type: 'string', enum: ['personal', 'business'] },
  },
  oneOf: [
    {
      '&if': "./mainType === 'personal'",
      properties: {
        subType: { type: 'string', enum: ['student', 'employee'] },
      },
      oneOf: [
        {
          '&if': "./subType === 'student'",
          properties: {
            school: { type: 'string' },
          },
        },
        {
          '&if': "./subType === 'employee'",
          properties: {
            company: { type: 'string' },
          },
        },
      ],
    },
    {
      '&if': "./mainType === 'business'",
      properties: {
        companyName: { type: 'string' },
        registrationNumber: { type: 'string' },
      },
    },
  ],
};
```


## allOf (Schema Merging)

All schemas are merged and applied. Always applied without conditions.

### Basic Usage

```typescript
const schema = {
  type: 'object',
  allOf: [
    {
      properties: {
        id: { type: 'string' },
        createdAt: { type: 'string', format: 'date' },
      },
      required: ['id'],
    },
    {
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
      },
      required: ['firstName', 'lastName'],
    },
  ],
};

// Result schema:
// {
//   properties: { id, createdAt, firstName, lastName },
//   required: ['id', 'firstName', 'lastName']
// }
```

### Combining anyOf and allOf

```typescript
const schema = {
  type: 'object',
  properties: {
    entityType: {
      type: 'string',
      enum: ['person', 'organization'],
      default: 'person',
    },
    data: {
      type: 'object',
      // allOf: Common fields (always applied)
      allOf: [
        {
          properties: {
            id: { type: 'string' },
            createdAt: { type: 'string', format: 'date' },
          },
          required: ['id'],
        },
      ],
      // anyOf: Conditional fields
      anyOf: [
        {
          computed: { if: "/entityType === 'person'" },
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
          },
          required: ['firstName', 'lastName'],
        },
        {
          computed: { if: "/entityType === 'organization'" },
          properties: {
            organizationName: { type: 'string' },
            taxId: { type: 'string' },
          },
          required: ['organizationName'],
        },
      ],
    },
  },
};
```


## Combining oneOf + anyOf

```typescript
const schema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['electronics', 'clothing', 'food'],
      default: 'electronics',
    },
    enableDiscount: { type: 'boolean', default: false },
    enableWarranty: { type: 'boolean', default: false },
  },
  // oneOf: Category-specific fields (exclusive)
  oneOf: [
    {
      computed: { if: "./category === 'electronics'" },
      properties: {
        model: { type: 'string' },
        voltage: { type: 'number' },
      },
    },
    {
      computed: { if: "./category === 'clothing'" },
      properties: {
        size: { type: 'string', enum: ['S', 'M', 'L', 'XL'] },
        color: { type: 'string' },
      },
    },
    {
      computed: { if: "./category === 'food'" },
      properties: {
        expiryDate: { type: 'string', format: 'date' },
        weight: { type: 'number' },
      },
    },
  ],
  // anyOf: Optional features (non-exclusive)
  anyOf: [
    {
      computed: { if: './enableDiscount === true' },
      properties: {
        discountPercent: { type: 'number', minimum: 0, maximum: 100 },
      },
    },
    {
      computed: { if: './enableWarranty === true' },
      properties: {
        warrantyMonths: { type: 'number', minimum: 1 },
      },
    },
  ],
};
```


## References

- Full specification: `docs/ko/SPECIFICATION.md`
- Related stories: `stories/17.OneOf.stories.tsx`, `stories/31.AnyOf.stories.tsx`, `stories/06.IfThenElse.stories.tsx`
- Test code: `src/core/__tests__/ObjectNode.oneOf.test.ts`, `src/core/__tests__/ObjectNode.anyOf.test.ts`
