export const ifThenElseSchema = {
  type: "object",

  properties: {
    category: {
      type: "string",
      enum: ["game", "movie"],
      default: "game",
    },
    title: { type: "string" },
    openingDate: {
      type: "string",
      format: "date",
      computed: {
        visible: '../title === "wow"',
      },
    },
    releaseDate: {
      type: "string",
      format: "date",
      computed: {
        visible: '../title === "wow"',
      },
      default: "2025-01-01",
    },
    numOfPlayers: { type: "number" },
    price: {
      type: "number",
      minimum: 50,
      default: 100,
    },
  },
  if: {
    properties: {
      category: {
        enum: ["movie"],
      },
    },
  },
  then: {
    required: ["title", "openingDate", "price"],
  },
  else: {
    if: {
      properties: {
        category: {
          enum: ["game"],
        },
      },
    },
    then: {
      required: ["title", "releaseDate", "numOfPlayers"],
    },
    else: {
      required: ["title"],
    },
  },
} as any;
