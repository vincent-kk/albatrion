import type { JsonSchema } from "@canard/schema-form";

export const complexIfThenElseSchema = {
  type: "object",
  properties: {
    user: {
      type: "object",
      properties: {
        name: {
          type: "string",
          maxLength: 50,
          default: "Anonymous",
        },
        email: {
          type: "string",
          format: "email",
        },
        profile: {
          type: "object",
          if: {
            properties: {
              type: { enum: ["adult", "child"] },
            },
          },
          then: {
            required: ["age", "gender", "preferences"],
          },
          properties: {
            type: {
              type: "string",
              enum: ["adult", "child", "none"],
              default: "adult",
            },
            age: {
              type: "integer",
              minimum: 0,
              default: 18,
            },
            gender: {
              type: "string",
              enum: ["male", "female", "other"],
              default: "male",
              computed: {
                active: "../age >= 18",
              },
            },
            preferences: {
              type: "object",
              properties: {
                theme: {
                  type: "string",
                  enum: ["light", "dark"],
                  default: "light",
                },
                notifications: {
                  type: "object",
                  properties: {
                    email: {
                      type: "boolean",
                      default: true,
                    },
                    sms: {
                      type: "boolean",
                      default: false,
                    },
                  },
                  required: ["email", "sms"],
                },
              },
              required: ["theme", "notifications"],
            },
          },
          required: ["type"],
        },
      },
      required: ["name"],
    },
    settings: {
      type: "object",
      properties: {
        privacy: {
          type: "string",
          oneOf: [
            { const: "public", title: "Public" },
            { const: "private", title: "Private" },
            { const: "custom", title: "Custom" },
          ],
          default: "public",
        },
        language: {
          type: "string",
          enum: ["en", "kr", "jp"],
          default: "en",
        },
        security: {
          type: "object",
          properties: {
            "2FA": {
              type: "boolean",
              default: true,
            },
            backupCodes: {
              type: "array",
              items: {
                type: "string",
                pattern: "^[A-Z0-9]{8}$",
              },
              minItems: 5,
              maxItems: 10,
            },
          },
          required: ["2FA"],
        },
      },
      required: ["privacy", "language"],
    },
  },
  required: ["user", "settings"],
} satisfies JsonSchema;
