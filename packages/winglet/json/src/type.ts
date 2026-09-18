/**
 * JSON에서 허용되는 원시 타입들
 * @see https://datatracker.ietf.org/doc/html/rfc7396
 */
export type JSONPrimitive = string | number | boolean | null;

export type JSONArray = Array<any>;

export type JSONObject = Record<string, any>;

export type JSONValue = JSONPrimitive | JSONArray | JSONObject;

export type JSONRoot = JSONArray | JSONObject;
