/**
 * JSON에서 허용되는 원시 타입들
 * @see https://datatracker.ietf.org/doc/html/rfc7386
 */
export type JsonPrimitive = string | number | boolean | null;

export type JsonArray = Array<any>;

export type JsonObject = Record<string, any>;

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export type JsonRoot = JsonArray | JsonObject;
