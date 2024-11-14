import { filterErrors, getErrorsHash } from '@lumy/schema-form/helpers/error';
import { isTruthy } from '@lumy/schema-form/helpers/filter';
import {
  AllowedValue,
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
} from '@lumy/schema-form/types';
import Ajv, { type ValidateFunction } from 'ajv';

import {
  type ConstructorProps,
  type Listener,
  type MethodPayload,
  MethodType,
  type NodeState,
  type SchemaNode,
} from '../type';
import {
  find,
  getDataWithSchema,
  getJsonPaths,
  transformErrors,
} from './utils';

export abstract class BaseNode<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  readonly depth: number;
  readonly isRoot: boolean;
  readonly rootNode: BaseNode;
  readonly parentNode: BaseNode | null;
  readonly isArrayItem: boolean;
  readonly defaultValue: Value | undefined;
  readonly jsonSchema: Schema;

  #name: string;
  #path: string;
  #key?: string;

  #errors: JsonSchemaError[] = [];
  #errorHash?: number;
  #errorDataPaths: string[] = [];

  #receivedErrors: JsonSchemaError[] = [];
  #receivedErrorHash?: number;

  #mergedErrors: JsonSchemaError[] = [];

  #state: NodeState = {};
  #listeners: Listener[] = [];

  #validate: ValidateFunction | null = null;

  abstract type: SchemaNode['type'];
  abstract get value(): Value;
  abstract set value(value: Value);
  abstract children(): { node: SchemaNode }[];
  abstract parseValue(value: any): Value;

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    parentNode,
    ajv,
  }: ConstructorProps<Value, Schema>) {
    this.jsonSchema = jsonSchema;
    this.defaultValue = defaultValue;
    this.parentNode = parentNode || null;

    // NOTE: BaseNode 자체를 사용하는 경우는 없으므로, this는 SchemaNode
    this.rootNode = (this.parentNode?.rootNode || this) as SchemaNode;
    this.isRoot = !this.parentNode;
    this.isArrayItem = this.parentNode?.jsonSchema?.type === 'array';
    this.#name = name || '';

    this.#path = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;

    this.#key = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${
          key === undefined ? this.#name : key
        }`
      : JSONPath.Root;

    this.depth = this.#path.split(JSONPath.Child).filter(isTruthy).length - 1;

    if (this.parentNode) {
      this.parentNode.subscribe((type) => {
        if (type === MethodType.PathChange) {
          this.updatePath();
        }
      });
    }

    if (this.isRoot) {
      const ajvInstance = ajv || new Ajv({ allErrors: true });
      try {
        this.#validate = ajvInstance.compile({ ...jsonSchema, $async: true });
      } catch (err: any) {
        this.#validate = Object.assign(
          (_: any): _ is unknown => {
            throw {
              errors: [
                { keyword: '__jsonSchema', parent: {}, message: err.message },
              ],
            };
          },
          {
            errors: null,
            schema: jsonSchema,
            schemaEnv: {} as any,
          },
        );
      }

      this.subscribe((type) => {
        if (type === MethodType.Change) {
          this.validateOnChange();
        }
      });

      // validate for initial value
      setTimeout(() => {
        this.validateOnChange();
      });
    }
  }

  setName(name: string, actor: BaseNode) {
    // 부모만 이름을 바꿔줄 수 있음
    if (actor === this.parentNode) {
      this.#name = name;
      this.updatePath();
    }
  }

  updatePath() {
    const path = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;
    if (this.#path !== path) {
      this.#path = path;
      this.publish(MethodType.PathChange, path);
    }
  }

  get name() {
    return this.#name;
  }
  get path() {
    return this.#path;
  }
  get key() {
    return this.#key;
  }

  get errors() {
    return this.#mergedErrors.length > 0 ? this.#mergedErrors : null;
  }
  setErrors(errors: JsonSchemaError[]) {
    const errorHash = getErrorsHash(errors);
    if (this.#errorHash === errorHash) return;

    this.#errorHash = errorHash;
    this.#errors = errors;

    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];

    this.publish(
      MethodType.Validate,
      this.filterErrorsWithSchema(this.#mergedErrors),
    );
  }
  clearErrors() {
    this.setErrors([]);
  }
  setReceivedErrors(errors: JsonSchemaError[]) {
    // NOTE: 이미 동일한 에러가 있으면 중복 발생 방지
    const errorHash = getErrorsHash(errors);
    if (this.#receivedErrorHash === errorHash) return;

    this.#receivedErrorHash = errorHash;
    // 하위 노드에서 데이터 입력시 해당 항목을 찾아 삭제하기 위한 key 가 필요.
    // 참고: removeFromReceivedErrors
    this.#receivedErrors = filterErrors(errors).map((error, index) => {
      error.key = index;
      return error;
    });

    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];

    this.publish(
      MethodType.Validate,
      this.filterErrorsWithSchema(this.#mergedErrors),
    );
  }
  clearReceivedErrors() {
    if (this.#receivedErrors && this.#receivedErrors.length > 0) {
      if (!this.isRoot) {
        this.rootNode.removeFromReceivedErrors(this.#receivedErrors);
      }
      this.setReceivedErrors([]);
    }
  }
  removeFromReceivedErrors(errors: JsonSchemaError[]) {
    const errorKeysForDelete = new Set(
      errors.map(({ key }) => key).filter((key) => typeof key === 'number'),
    );
    const nextErrors = this.#receivedErrors.filter(
      ({ key }) => typeof key === 'number' && errorKeysForDelete.has(key),
    );
    if (this.#receivedErrors.length !== nextErrors.length) {
      this.setReceivedErrors(nextErrors);
    }
  }

  get state() {
    return this.#state;
  }
  setState(state: ((prev: NodeState) => NodeState) | NodeState) {
    const nextState = typeof state === 'function' ? state(this.#state) : state;

    if (!nextState || typeof nextState !== 'object') return;

    let hasChanges = false;
    const newState: NodeState = {};

    // NOTE: nextState의 모든 키를 기준으로 순회
    for (const [key, newValue] of Object.entries(nextState)) {
      if (newValue !== undefined) {
        newState[key] = newValue;
        if (this.#state[key] !== newValue) {
          hasChanges = true;
        }
      } else if (key in this.#state) {
        hasChanges = true;
      }
    }
    // NOTE: 기존 state에서 nextState에 없는 키들을 유지
    for (const [key, value] of Object.entries(this.#state)) {
      if (!(key in nextState)) {
        newState[key] = value;
      }
    }

    if (hasChanges) {
      this.#state = newState;
      this.publish(MethodType.StateChange, this.#state);
    }
  }

  findNode(path: string) {
    return find(this, path) as SchemaNode | null;
  }

  subscribe(callback: Listener) {
    this.#listeners.push(callback);
    return () => {
      this.#listeners = this.#listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  publish<T extends MethodType>(type: T, payload: MethodPayload[T]) {
    this.#listeners.forEach((listener) => listener(type, payload));
  }

  filterErrorsWithSchema(errors: JsonSchemaError[]) {
    if (!this.isRoot) {
      return errors;
    }
    const visibleJsonPaths = new Set(
      getJsonPaths(getDataWithSchema(this.value, this.jsonSchema)),
    );
    return errors.filter(({ dataPath }) => visibleJsonPaths.has(dataPath));
  }

  async validate(value: Value) {
    if (!this.isRoot || !this.#validate) return [];
    try {
      await this.#validate(value);
    } catch (err: any) {
      return err.errors as JsonSchemaError[];
    }
    return [];
  }

  async validateOnChange() {
    // NOTE: 루트 노드가 아니면 검증 수행 안함
    if (!this.isRoot) return;

    // NOTE: 1. 현재 Form 내의 value와 schema를 이용해서 validation 수행
    const errors = filterErrors(
      await this.validate(getDataWithSchema(this.value, this.jsonSchema)),
    );
    // NOTE: 2. 얻어진 error들을 dataPath 별로 분류
    const errorsByDataPath = transformErrors(errors).reduce(
      (accumulator, error) => {
        if (!accumulator[error.dataPath]) {
          accumulator[error.dataPath] = [];
        }
        accumulator[error.dataPath].push(error);
        return accumulator;
      },
      {} as Record<JsonSchemaError['dataPath'], JsonSchemaError[]>,
    );

    // NOTE: 3. 전체 error를 set, 하위 노드에도 dataPath로 node를 찾아서 error set
    this.setErrors(errors);
    Object.entries(errorsByDataPath).forEach(([dataPath, errors]) => {
      this.findNode(dataPath)?.setErrors(errors);
    });

    // NOTE: 4. 기존 error에는 포함되어 있으나, 신규 error 목록에 포함되지 않는 error를 가진 node는 clearError
    const errorDataPaths = Object.keys(errorsByDataPath);
    const errorDataPathsSet = new Set(errorDataPaths);
    this.#errorDataPaths
      .filter((dataPath) => !errorDataPathsSet.has(dataPath))
      .forEach((dataPath) => {
        this.findNode(dataPath)?.clearErrors();
      });
    this.#errorDataPaths = errorDataPaths;
  }
}
