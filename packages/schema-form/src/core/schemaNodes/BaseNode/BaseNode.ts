import {
  type Ajv,
  type ErrorObject,
  type ValidateFunction,
  ajvHelper,
} from '@lumy/schema-form/helpers/ajv';
import { filterErrors, getErrorsHash } from '@lumy/schema-form/helpers/error';
import { isTruthy } from '@lumy/schema-form/helpers/filter';
import {
  type AllowedValue,
  JSONPath,
  type JsonSchema,
  type JsonSchemaError,
  type SetStateOptions,
} from '@lumy/schema-form/types';

import {
  type Listener,
  type MethodEvent,
  MethodType,
  type NodeState,
  type SchemaNode,
  type SchemaNodeConstructorProps,
} from '../type';
import {
  find,
  getDataWithSchema,
  getFallbackValidator,
  getJsonPaths,
  getPathSegments,
  transformErrors,
} from './utils';

export abstract class BaseNode<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = any,
> {
  /** 노드의 깊이 */
  readonly depth: number;
  /** 루트 노드인지 여부 */
  readonly isRoot: boolean;
  /** 루트 노드 */
  readonly rootNode: SchemaNode;
  /** 부모 노드 */
  readonly parentNode: SchemaNode | null;
  /** 배열 아이템인지 여부 */
  readonly isArrayItem: boolean;
  /** 노드의 JSON Schema */
  readonly jsonSchema: Schema;
  /** 노드의 타입 */
  readonly type: Schema['type'];

  /** 노드의 이름 */
  #name: string;
  /** 노드의 이름 */
  get name() {
    return this.#name;
  }
  /** 노드의 이름 설정, 부모만 이름을 바꿔줄 수 있음 */
  setName(name: string, actor: SchemaNode | BaseNode) {
    if (actor === this.parentNode || actor === this) {
      this.#name = name;
      this.updatePath();
    }
  }

  /** 노드의 경로 */
  #path: string;
  /** 노드의 경로 */
  get path() {
    return this.#path;
  }
  /** 노드의 경로 업데이트, 부모 노드의 경로를 참고해서 자신의 경로를 업데이트 */
  updatePath() {
    const previous = this.#path;
    const current = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;
    if (previous !== current) {
      this.#path = current;
      this.publish({
        type: MethodType.PathChange,
        options: {
          previous,
          current,
        },
      });
    }
  }

  /** 노드의 키 */
  #key?: string;
  /** 노드의 키 */
  get key() {
    return this.#key;
  }

  /** 자신의 Error와 하위 노드의 Error를 합친 에러 */
  #mergedErrors: JsonSchemaError[] = [];

  /** 자신의 Error */
  #errors: JsonSchemaError[] = [];
  /** 자신의 Error의 해시값 */
  #errorHash?: number;
  /** 자신의 Error의 dataPath 목록 */
  #errorDataPaths: string[] = [];
  /** 자신의 Error와 하위 노드의 Error를 합친 에러 */
  get errors() {
    return this.#mergedErrors.length > 0 ? this.#mergedErrors : null;
  }
  /** 자신의 Error를 전달받아서 하위 노드에서 전달받은 Error와 합친 후 전달 */
  setErrors(errors: JsonSchemaError[]) {
    const errorHash = getErrorsHash(errors);
    if (this.#errorHash === errorHash) return;

    this.#errorHash = errorHash;
    this.#errors = errors;

    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];

    this.publish({
      type: MethodType.Validate,
      payload: this.#filterErrorsWithSchema(this.#mergedErrors),
    });
  }

  /** 자신의 Error 초기화, 하위 노드의 Error는 초기화 하지 않음 */
  clearErrors() {
    this.setErrors([]);
  }

  /** 하위 노드에서 전달받은 Error */
  #receivedErrors: JsonSchemaError[] = [];
  /** 하위 노드에서 전달받은 Error의 해시값 */
  #receivedErrorHash?: number;
  /** 하위 노드에서 전달받은 Error를 자신의 Error와 합친 후 저장 */
  setReceivedErrors(errors: JsonSchemaError[] = []) {
    // NOTE: 이미 동일한 에러가 있으면 중복 발생 방지
    const errorHash = getErrorsHash(errors);
    if (this.#receivedErrorHash === errorHash) return;

    this.#receivedErrorHash = errorHash;
    // 하위 노드에서 데이터 입력시 해당 항목을 찾아 삭제하기 위한 key 가 필요.
    // 참고: removeFromReceivedErrors
    this.#receivedErrors = filterErrors(errors, this.jsonSchema).map(
      (error, index) => {
        error.key = index;
        return error;
      },
    );

    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];

    this.publish({
      type: MethodType.Validate,
      payload: this.#filterErrorsWithSchema(this.#mergedErrors),
    });
  }

  /** 하위 노드에서 전달받은 Error 초기화, 자신의 Error는 초기화 하지 않음 */
  clearReceivedErrors() {
    if (this.#receivedErrors && this.#receivedErrors.length > 0) {
      if (!this.isRoot) {
        this.rootNode.removeFromReceivedErrors(this.#receivedErrors);
      }
      this.setReceivedErrors([]);
    }
  }

  /** 하위 노드에서 전달받은 Error 중 삭제할 Error 찾아서 삭제 */
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

  /** 노드의 기본값 */
  #defaultValue: Value | undefined;
  /** 노드의 기본값 */
  get defaultValue() {
    return this.#defaultValue;
  }
  /** 노드의 기본값 설정, 상속 받은 노드에서 재정의 가능 */
  protected setDefaultValue(value: Value | undefined) {
    this.#defaultValue = value;
  }

  /** 노드의 상태 */
  #state: NodeState = {};
  /** 노드의 상태 */
  get state() {
    return this.#state;
  }
  /** 노드의 상태 설정, 명시적으로 undefined를 전달하지 않으면 기존 상태를 유지 */
  setState(input: ((prev: NodeState) => NodeState) | NodeState) {
    const inputState = typeof input === 'function' ? input(this.#state) : input;
    if (!inputState || typeof inputState !== 'object') return;

    let hasChanges = false;
    const state: NodeState = {};

    // NOTE: nextState의 모든 키를 기준으로 순회
    for (const [key, value] of Object.entries(inputState)) {
      if (value !== undefined) {
        state[key] = value;
        if (this.#state[key] !== value) hasChanges = true;
      } else if (key in this.#state) hasChanges = true;
    }

    // NOTE: 기존 state에서 nextState에 없는 키들을 유지
    for (const [key, value] of Object.entries(this.#state)) {
      if (!(key in inputState)) state[key] = value;
    }

    if (hasChanges) {
      this.#state = state;
      this.publish({
        type: MethodType.StateChange,
        payload: this.#state,
      });
    }
  }

  /** 노드의 값 */
  abstract get value(): Value | undefined;
  abstract set value(input: Value | undefined);
  /** value를 설정하는 메소드 구현 필요 */
  protected abstract applyValue(
    input: Value | undefined,
    options?: SetStateOptions,
  ): void;
  /** applyValue로 실제 데이터 반영 전에, input에 대한 전처리 과정 수행 */
  setValue(
    input: Value | undefined | ((prev: Value | undefined) => Value | undefined),
    options?: SetStateOptions,
  ): void {
    const inputValue = typeof input === 'function' ? input(this.value) : input;
    this.applyValue(inputValue, options);
  }
  /** 노드의 값 파싱 */
  abstract parseValue(input: any): Value | undefined;

  #handleChange: SetStateFn<Value | undefined> | undefined;
  onChange(
    input: Value | undefined | ((prev: Value | undefined) => Value | undefined),
  ): void {
    if (typeof this.#handleChange !== 'function') return;
    const inputValue = typeof input === 'function' ? input(this.value) : input;
    this.#handleChange(
      this.isRoot ? getDataWithSchema(inputValue, this.jsonSchema) : inputValue,
    );
  }

  /** 노드의 하위 노드 목록, 하위 노드를 가지지 않는 노드는 빈 배열 반환 */
  get children(): { node: SchemaNode }[] {
    return [];
  }

  constructor({
    key,
    name,
    jsonSchema,
    defaultValue,
    onChange,
    parentNode,
    ajv,
  }: SchemaNodeConstructorProps<Schema, Value>) {
    this.type = jsonSchema.type;
    this.jsonSchema = jsonSchema;
    this.#defaultValue = defaultValue;
    this.parentNode = parentNode || null;

    // NOTE: BaseNode 자체를 사용하는 경우는 없으므로, this는 SchemaNode
    this.rootNode = (this.parentNode?.rootNode || this) as SchemaNode;
    this.isRoot = !this.parentNode;
    this.isArrayItem = this.parentNode?.jsonSchema?.type === 'array';
    this.#name = name || '';

    this.#handleChange = onChange;

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
      this.parentNode.subscribe(({ type }) => {
        if (type === MethodType.PathChange) {
          this.updatePath();
        }
      });
    }

    // NOTE: 루트 노드에서만 validator 준비
    if (this.isRoot) this.#prepareValidator(ajv);
  }

  /** 노드 트리 내에서 특정 경로를 가진 노드 찾기 */
  findNode(path?: string) {
    const pathSegments = path ? getPathSegments(path) : [];
    return find(this, pathSegments);
  }

  /** 노드의 이벤트 리스너 목록 */
  #listeners: Listener[] = [];

  /** 노드의 이벤트 리스너 등록 */
  subscribe(callback: Listener) {
    this.#listeners.push(callback);
    return () => {
      this.#listeners = this.#listeners.filter(
        (listener) => listener !== callback,
      );
    };
  }

  /** 노드의 이벤트 발생 */
  publish(event: MethodEvent) {
    this.#listeners.forEach((listener) => listener(event));
  }

  /** 노드의 검증 결과 필터링 */
  #filterErrorsWithSchema(errors: JsonSchemaError[]) {
    if (!this.isRoot) {
      return errors;
    }
    const visibleJsonPaths = new Set(
      getJsonPaths(getDataWithSchema(this.value, this.jsonSchema)),
    );
    return errors.filter(({ dataPath }) => visibleJsonPaths.has(dataPath));
  }

  /** 노드의 Ajv 검증 함수 */
  #validator: ValidateFunction | null = null;
  /** 노드의 JsonSchema를 이용해서 검증 수행, rootNode에서만 사용 가능 */
  async #validate(value: Value | undefined): Promise<JsonSchemaError[]> {
    if (!this.isRoot || !this.#validator) return [];
    try {
      await this.#validator(value);
    } catch (thrown: any) {
      return transformErrors(thrown.errors as ErrorObject[]);
    }
    return [];
  }

  /** 노드의 값이 변경될 때 검증 수행, rootNode에서만 사용 가능 */
  async #validateOnChange() {
    // NOTE: 루트 노드가 아니면 검증 수행 안함
    if (!this.isRoot) return;

    // NOTE: 1. 현재 Form 내의 value와 schema를 이용해서 validation 수행
    const errors = filterErrors(
      await this.#validate(getDataWithSchema(this.value, this.jsonSchema)),
      this.jsonSchema,
    );

    // NOTE: 2. 얻어진 error들을 dataPath 별로 분류
    const errorsByDataPath = new Map<
      JsonSchemaError['dataPath'],
      JsonSchemaError[]
    >();
    for (const error of errors) {
      if (!errorsByDataPath.has(error.dataPath)) {
        errorsByDataPath.set(error.dataPath, []);
      }
      errorsByDataPath.get(error.dataPath)?.push(error);
    }

    // NOTE: 3. 전체 error를 set, 하위 노드에도 dataPath로 node를 찾아서 error set
    this.setErrors(errors);

    for (const [dataPath, errors] of errorsByDataPath.entries()) {
      this.findNode(dataPath)?.setErrors(errors);
    }

    // NOTE: 4. 기존 error에는 포함되어 있으나, 신규 error 목록에 포함되지 않는 error를 가진 node는 clearError
    const errorDataPaths = Array.from(errorsByDataPath.keys());
    const errorDataPathsSet = new Set(errorDataPaths);
    this.#errorDataPaths
      .filter((dataPath) => !errorDataPathsSet.has(dataPath))
      .forEach((dataPath) => {
        this.findNode(dataPath)?.clearErrors();
      });
    this.#errorDataPaths = errorDataPaths;
  }

  #prepareValidator(ajv?: Ajv) {
    try {
      this.#validator = ajvHelper.compile({
        jsonSchema: { ...this.jsonSchema, $async: true },
        ajv,
      });
    } catch (error: any) {
      this.#validator = getFallbackValidator(error, this.jsonSchema);
    }
    this.subscribe(({ type }) => {
      if (type === MethodType.Change) {
        this.#validateOnChange();
      }
    });
  }
}
