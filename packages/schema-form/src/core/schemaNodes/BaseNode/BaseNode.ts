import {
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
  ShowError,
} from '@lumy/schema-form/types';
import { filterErrors } from '@lumy/schema-form/utils';
import Ajv, { type ValidateFunction } from 'ajv';

import {
  type ConstructorProps,
  type Listener,
  type MethodPayload,
  MethodType,
  type SchemaNode,
} from '../type';

type NodeState = {
  [ShowError.Touched]?: boolean;
  [ShowError.Dirty]?: boolean;
  [key: string]: any;
};

export abstract class BaseNode {
  readonly defaultValue: any;
  readonly depth: number;
  readonly isArrayItem: boolean;
  readonly isRoot: boolean;
  private name: string;
  readonly rootNode: SchemaNode;
  readonly parentNode: SchemaNode | null;
  private path: string;
  private key?: string;
  readonly schema: Schema;

  abstract type: SchemaNode['type'];
  abstract children: () => { node: SchemaNode }[];
  abstract getValue: () => any;
  abstract setValue?: (value: any) => void;
  abstract parseValue: (value: any) => any;

  // need refactoring
  setName = (name: string, actor: any) => {
    // 부모만 이름을 바꿔줄 수 있음
    if (true || actor === this.parentNode) {
      this.name = name;
      this.updatePath();
    }
  };
  updatePath = () => {
    const newPath = this.parentNode?.getPath()
      ? `${this.parentNode.getPath()}${JSONPath.Child}${this.getName()}`
      : JSONPath.Root;
    if (this.path !== newPath) {
      this.path = newPath;
      this.publish(MethodType.PathChange, newPath);
    }
  };
  getName = () => {
    return this.name;
  };
  getPath = () => {
    return this.path;
  };
  getKey = () => {
    return this.key;
  };
  // TODO: need refactoring

  getErrors = (): JsonSchemaError[] | null => {
    const errors = [...this._receivedErrors, ...this._errors];
    return errors.length > 0 ? errors : null;
  };
  setErrors = (errors: JsonSchemaError[]) => {
    const serialized = JSON.stringify(errors);
    if (this._errorHash !== serialized) {
      this._errorHash = serialized;
      this._errors = errors;

      this.publish(
        MethodType.Validate,
        this.filterErrorsWithSchema([...this._receivedErrors, ...this._errors]),
      );
    }
  };
  clearErrors = () => {
    this.setErrors([]);
  };

  setReceivedErrors = (errors: JsonSchemaError[]) => {
    const serialized = JSON.stringify(errors);
    if (this._receivedErrorHash !== serialized) {
      this._receivedErrorHash = serialized;
      // 하위 노드에서 데이터 입력시 해당 항목을 찾아 삭제하기 위한 key 가 필요.
      // 참고: removeFromReceivedErrors
      this._receivedErrors = filterErrors(errors).map((error, i) => ({
        ...error,
        key: i,
      }));

      this.publish(
        MethodType.Validate,
        this.filterErrorsWithSchema([...this._receivedErrors, ...this._errors]),
      );
    }
  };
  clearReceivedErrors = () => {
    if (this._receivedErrors && this._receivedErrors.length > 0) {
      if (!this.isRoot) {
        this.rootNode.removeFromReceivedErrors(this._receivedErrors);
      }
      this.setReceivedErrors([]);
    }
  };

  removeFromReceivedErrors = (errors: JsonSchemaError[]) => {
    const errorKeysToDelete = errors
      .map(({ key }) => key)
      .filter((key) => typeof key === 'number');
    const nextErrors = this._receivedErrors.filter((e: any) => {
      return !errorKeysToDelete.includes(e.key);
    });
    if (this._receivedErrors.length !== nextErrors.length) {
      this.setReceivedErrors(nextErrors);
    }
  };

  getState = () => this._state;
  setState = (state: ((prev: NodeState) => NodeState) | NodeState) => {
    let nextState;
    if (typeof state === 'function') {
      const draft = state(this._state);
      if (
        Object.keys(draft).length !== Object.keys(this._state).length ||
        Object.entries(draft).find(([k, v]) => this._state[k] !== v)
      ) {
        nextState = draft;
      }
    } else if (state && typeof state === 'object') {
      nextState = Object.entries(state).reduce((accum, [k, v]) => {
        if (accum[k] !== v) {
          if (typeof v === 'undefined') {
            accum = { ...accum };
            delete accum[k];
          } else {
            accum = { ...accum, [k]: v };
          }
        }
        return accum;
      }, this._state);
    }
    if (
      nextState &&
      typeof nextState === 'object' &&
      this._state !== nextState
    ) {
      this._state = nextState;
      this.publish(MethodType.StateChange, this._state);
    }
  };

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
