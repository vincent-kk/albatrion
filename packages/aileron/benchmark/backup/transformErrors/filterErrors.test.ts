import { describe, expect, it } from 'vitest';

import { filterErrors } from './filterErrors';

describe('filterErrors', () => {
  it('should return empty array if errors is empty', () => {
    expect(
      filterErrors([], {
        type: 'object',
      }),
    ).toEqual([]);
  });
  it('should return empty array if errors is empty', () => {
    expect(
      filterErrors(
        [
          {
            instancePath: '/name',
            schemaPath: '#/properties/name/maxLength',
            keyword: 'maxLength',
            params: {
              limit: 3,
            },
            message: 'must NOT have more than 3 characters',
            dataPath: '.name',
          },
          {
            instancePath: '/message',
            schemaPath: '#/properties/message/minLength',
            keyword: 'minLength',
            params: {
              limit: 3,
            },
            message: 'must NOT have fewer than 3 characters',
            dataPath: '.message',
          },
        ],
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              maxLength: 3,
              default: 'exceed max length',
            },
            message: {
              type: 'string',
              minLength: 3,
              default: '1',
            },
          },
        },
      ),
    ).toEqual([
      {
        instancePath: '/name',
        schemaPath: '#/properties/name/maxLength',
        keyword: 'maxLength',
        params: {
          limit: 3,
        },
        message: 'must NOT have more than 3 characters',
        dataPath: '.name',
      },
      {
        instancePath: '/message',
        schemaPath: '#/properties/message/minLength',
        keyword: 'minLength',
        params: {
          limit: 3,
        },
        message: 'must NOT have fewer than 3 characters',
        dataPath: '.message',
      },
    ]);
  });
  it('should filter errors', () => {
    expect(
      filterErrors(
        [
          {
            instancePath: '',
            schemaPath: '#/oneOf/0/required',
            keyword: 'required',
            params: {
              missingProperty: 'title',
            },
            message: "must have required property 'title'",
            dataPath: '.title',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/0/required',
            keyword: 'required',
            params: {
              missingProperty: 'openingDate',
            },
            message: "must have required property 'openingDate'",
            dataPath: '.openingDate',
          },
          {
            instancePath: '/category',
            schemaPath: '#/oneOf/0/properties/category/enum',
            keyword: 'enum',
            params: {
              allowedValues: ['movie'],
            },
            message: 'must be equal to one of the allowed values',
            dataPath: '.category',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/1/required',
            keyword: 'required',
            params: {
              missingProperty: 'title',
            },
            message: "must have required property 'title'",
            dataPath: '.title',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/1/required',
            keyword: 'required',
            params: {
              missingProperty: 'releaseDate',
            },
            message: "must have required property 'releaseDate'",
            dataPath: '.releaseDate',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/1/required',
            keyword: 'required',
            params: {
              missingProperty: 'numOfPlayers',
            },
            message: "must have required property 'numOfPlayers'",
            dataPath: '.numOfPlayers',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf',
            keyword: 'oneOf',
            params: {
              passingSchemas: null,
            },
            message: 'must match exactly one schema in oneOf',
            dataPath: '',
          },
        ],
        {
          type: 'object',
          oneOf: [
            {
              properties: {
                category: {
                  enum: ['movie'],
                },
              },
              required: ['title', 'openingDate'],
            },
            {
              properties: {
                category: {
                  enum: ['game'],
                },
              },
              required: ['title', 'releaseDate', 'numOfPlayers'],
            },
          ],
          properties: {
            category: {
              type: 'string',
              enum: ['game', 'movie'],
              default: 'game',
            },
            title: {
              type: 'string',
              computed: {
                visible: '("movie"===@.category)||("game"===@.category)',
              },
            },
            openingDate: {
              type: 'string',
              format: 'date',
              computed: {
                visible: '(@.title === "wow")&&("movie"===@.category)',
              },
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              computed: {
                visible: '(@.title === "wow")&&("game"===@.category)',
              },
            },
            numOfPlayers: {
              type: 'number',
              computed: {
                visible: '"game"===@.category',
              },
            },
          },
        },
      ),
    ).toEqual([]);
  });
  it('should filter errors, numOfPlayers', () => {
    expect(
      filterErrors(
        [
          {
            instancePath: '',
            schemaPath: '#/oneOf/0/required',
            keyword: 'required',
            params: {
              missingProperty: 'title',
            },
            message: "must have required property 'title'",
            dataPath: '.title',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/0/required',
            keyword: 'required',
            params: {
              missingProperty: 'openingDate',
            },
            message: "must have required property 'openingDate'",
            dataPath: '.openingDate',
          },
          {
            instancePath: '/category',
            schemaPath: '#/oneOf/0/properties/category/enum',
            keyword: 'enum',
            params: {
              allowedValues: ['movie'],
            },
            message: 'must be equal to one of the allowed values',
            dataPath: '.category',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/1/required',
            keyword: 'required',
            params: {
              missingProperty: 'title',
            },
            message: "must have required property 'title'",
            dataPath: '.title',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf/1/required',
            keyword: 'required',
            params: {
              missingProperty: 'releaseDate',
            },
            message: "must have required property 'releaseDate'",
            dataPath: '.releaseDate',
          },
          {
            instancePath: '',
            schemaPath: '#/oneOf',
            keyword: 'oneOf',
            params: {
              passingSchemas: null,
            },
            message: 'must match exactly one schema in oneOf',
            dataPath: '',
          },
          {
            instancePath: '/numOfPlayers',
            schemaPath: '#/properties/numOfPlayers/minimum',
            keyword: 'minimum',
            params: {
              comparison: '>=',
              limit: 5,
            },
            message: 'must be >= 5',
            dataPath: '.numOfPlayers',
          },
        ],
        {
          type: 'object',
          oneOf: [
            {
              properties: {
                category: {
                  enum: ['movie'],
                },
              },
              required: ['title', 'openingDate'],
            },
            {
              properties: {
                category: {
                  enum: ['game'],
                },
              },
              required: ['title', 'releaseDate', 'numOfPlayers'],
            },
          ],
          properties: {
            category: {
              type: 'string',
              enum: ['game', 'movie'],
              default: 'game',
            },
            title: {
              type: 'string',
              computed: {
                visible: '("movie"===@.category)||("game"===@.category)',
              },
            },
            openingDate: {
              type: 'string',
              format: 'date',
              computed: {
                visible: '(@.title === "wow")&&("movie"===@.category)',
              },
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              computed: {
                visible: '(@.title === "wow")&&("game"===@.category)',
              },
            },
            numOfPlayers: {
              type: 'number',
              minimum: 5,
              computed: {
                visible: '"game"===@.category',
              },
            },
          },
        },
      ),
    ).toEqual([
      {
        instancePath: '/numOfPlayers',
        schemaPath: '#/properties/numOfPlayers/minimum',
        keyword: 'minimum',
        params: {
          comparison: '>=',
          limit: 5,
        },
        message: 'must be >= 5',
        dataPath: '.numOfPlayers',
      },
    ]);
  });
});
