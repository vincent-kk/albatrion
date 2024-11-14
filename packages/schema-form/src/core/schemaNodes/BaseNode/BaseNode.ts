import { filterErrors, getErrorsHash } from '@lumy/schema-form/helpers/error';
import { isTruthy } from '@lumy/schema-form/helpers/filter';
import {
  AllowedValue,
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
  ShowError,
} from '@lumy/schema-form/types';
import Ajv, { type ValidateFunction } from 'ajv';

import {
  type ConstructorProps,
  type Listener,
  type MethodPayload,
  MethodType,
  type SchemaNode,
} from '../type';
import {
  find,
  getDataWithSchema,
  getJsonPaths,
  transformErrors,
} from './utils';

type NodeState = {
  [ShowError.Touched]?: boolean;
  [ShowError.Dirty]?: boolean;
  [key: string]: any;
};

export abstract class BaseNode<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  private name: string;
  private path: string;
  private key?: string;
  private _errors: JsonSchemaError[] = [];
  private _errorHash?: number;
  private _errorDataPaths: string[] = [];
  private _receivedErrors: JsonSchemaError[] = [];
  private _receivedErrorHash?: number;
  private _state: NodeState = {};

  readonly defaultValue: Value | undefined;
  readonly depth: number;
  readonly isArrayItem: boolean;
  readonly isRoot: boolean;
  readonly rootNode: BaseNode;
  readonly parentNode: BaseNode | null;
  readonly jsonSchema: Schema;

  protected _listeners: Listener[] = [];
  protected _validate?: Function;

  abstract type: SchemaNode['type'];
  abstract children: () => { node: SchemaNode }[];
  abstract getValue: () => any;
  abstract setValue?: (value: any) => void;
  abstract parseValue: (value: any) => any;

  setName(name: string, actor: BaseNode) {
    // 부모만 이름을 바꿔줄 수 있음
    if (actor === this.parentNode) {
      this.name = name;
      this.updatePath();
    }
  }

  updatePath() {
    const newPath = this.parentNode?.getPath()
      ? `${this.parentNode.getPath()}${JSONPath.Child}${this.getName()}`
      : JSONPath.Root;
    if (this.path !== newPath) {
      this.path = newPath;
      this.publish(MethodType.PathChange, newPath);
    }
  }

  getName() {
    return this.name;
  }
  getPath() {
    return this.path;
  }
  getKey() {
    return this.key;
  }

  getErrors(): JsonSchemaError[] | null {
    const errors = [...this._receivedErrors, ...this._errors];
    return errors.length > 0 ? errors : null;
  }

  setErrors(errors: JsonSchemaError[]) {
    const errorHash = getErrorsHash(errors);
    if (this._errorHash === errorHash) return;

    this._errorHash = errorHash;
    this._errors = errors;

    this.publish(
      MethodType.Validate,
      this.filterErrorsWithSchema([...this._receivedErrors, ...this._errors]),
    );
  }

  clearErrors = () => {
    this.setErrors([]);
  };

  setReceivedErrors(errors: JsonSchemaError[]) {
    // NOTE: 이미 동일한 에러가 있으면 중복 발생 방지
    const errorHash = getErrorsHash(errors);
    if (this._receivedErrorHash === errorHash) return;

    this._receivedErrorHash = errorHash;
    // 하위 노드에서 데이터 입력시 해당 항목을 찾아 삭제하기 위한 key 가 필요.
    // 참고: removeFromReceivedErrors
    this._receivedErrors = filterErrors(errors).map((error, index) => {
      error.key = index;
      return error;
    });

    this.publish(
      MethodType.Validate,
      this.filterErrorsWithSchema([...this._receivedErrors, ...this._errors]),
    );
  }

  clearReceivedErrors() {
    if (this._receivedErrors && this._receivedErrors.length > 0) {
      if (!this.isRoot) {
        this.rootNode.removeFromReceivedErrors(this._receivedErrors);
      }
      this.setReceivedErrors([]);
    }
  }

  removeFromReceivedErrors(errors: JsonSchemaError[]) {
    const errorKeysForDelete = new Set(
      errors.map(({ key }) => key).filter((key) => typeof key === 'number'),
    );
    const nextErrors = this._receivedErrors.filter(
      ({ key }) => typeof key === 'number' && errorKeysForDelete.has(key),
    );
    if (this._receivedErrors.length !== nextErrors.length) {
      this.setReceivedErrors(nextErrors);
    }
  }

  getState = () => this._state;

  setState(state: ((prev: NodeState) => NodeState) | NodeState) {
    const nextState = typeof state === 'function' ? state(this._state) : state;

    if (!nextState || typeof nextState !== 'object') return;

    let hasChanges = false;
    const newState: NodeState = {};

    // NOTE: nextState의 모든 키를 기준으로 순회
    for (const [key, newValue] of Object.entries(nextState)) {
      if (newValue !== undefined) {
        newState[key] = newValue;
        if (this._state[key] !== newValue) {
          hasChanges = true;
        }
      } else if (key in this._state) {
        hasChanges = true;
      }
    }

    // NOTE: 기존 state에서 nextState에 없는 키들을 유지
    for (const [key, value] of Object.entries(this._state)) {
      if (!(key in nextState)) {
        newState[key] = value;
      }
    }

    if (hasChanges) {
      this._state = newState;
      this.publish(MethodType.StateChange, this._state);
    }
  }

  findNode(path: string) {
    return find(this, path) as SchemaNode | null;
  }

  subscribe(callback: Listener) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }
  publish<T extends MethodType>(type: T, payload: MethodPayload[T]) {
    this._listeners.forEach((listener) => listener(type, payload));
  }

  filterErrorsWithSchema(errors: JsonSchemaError[]) {
    if (!this.isRoot) {
      return errors;
    }
    const visibleJsonPaths = new Set(
      getJsonPaths(getDataWithSchema(this.getValue(), this.jsonSchema)),
    );
    return errors.filter(({ dataPath }) => visibleJsonPaths.has(dataPath));
  }

  #validate: ValidateFunction | null = null;

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
      await this.validate(getDataWithSchema(this.getValue(), this.jsonSchema)),
    );
    // NOTE: 2. 얻어진 error들을 dataPath 별로 분류
    const errorsByDataPath = transformErrors(errors).reduce(
      (accum, error) => {
        if (!accum[error.dataPath]) {
          accum[error.dataPath] = [];
        }
        accum[error.dataPath].push(error);
        return accum;
      },
      {} as Record<JsonSchemaError['dataPath'], JsonSchemaError[]>,
    );

    // NOTE: 3. 전체 error를 set, 하위 노드에도 dataPath로 node를 찾아서 error set
    this.setErrors(errors);
    Object.entries(errorsByDataPath).forEach(([dataPath, errors]) => {
      const node = this.findNode(dataPath);
      node?.setErrors(errors);
    });

    // NOTE: 4. 기존 error에는 포함되어 있으나, 신규 error 목록에 포함되지 않는 error를 가진 node는 clearError
    const _errorDataPaths = Object.keys(errorsByDataPath);
    this._errorDataPaths
      .filter((dataPath) => !_errorDataPaths.includes(dataPath))
      .forEach((dataPath) => {
        const node = this.findNode(dataPath);
        node?.clearErrors();
      });
    this._errorDataPaths = _errorDataPaths;
  }

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
    this.name = name || '';

    this.path = this.parentNode?.getPath()
      ? `${this.parentNode.getPath()}${JSONPath.Child}${this.getName()}`
      : JSONPath.Root;

    this.key = this.parentNode?.getPath()
      ? `${this.parentNode.getPath()}${JSONPath.Child}${
          typeof key === 'undefined' ? this.getName() : key
        }`
      : JSONPath.Root;

    this.depth = this.path.split(JSONPath.Child).filter(isTruthy).length - 1;

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
            schema: jsonSchema, // AnySchema 타입에 맞는 스키마 객체 필요
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
      }, 0);
    }
  }
}
