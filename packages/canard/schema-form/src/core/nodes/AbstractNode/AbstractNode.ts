import {
  BITMASK_NONE,
  JSONPath,
  equals,
  isTruthy,
} from '@winglet/common-utils';

import type { Fn, SetStateFn } from '@aileron/declare';

import {
  type Ajv,
  type ErrorObject,
  type ValidateFunction,
  ajvHelper,
} from '@/schema-form/helpers/ajv';
import { transformErrors } from '@/schema-form/helpers/error';
import { getFallbackValue } from '@/schema-form/helpers/fallbackValue';
import type {
  AllowedValue,
  JsonSchemaError,
  JsonSchemaWithVirtual,
} from '@/schema-form/types';

import {
  type NodeEvent,
  NodeEventType,
  type NodeListener,
  type NodeStateFlags,
  type SchemaNode,
  type SchemaNodeConstructorProps,
  SetValueOption,
  ValidationMode,
} from '../type';
import {
  EventCascade,
  computeFactory,
  find,
  getFallbackValidator,
  getJsonPaths,
  getNodeType,
  getPathSegments,
} from './utils';

const OMITTED_KEYS = new Set(['key']);

export abstract class AbstractNode<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
  Value extends AllowedValue = any,
> {
  /** Node의 타입 */
  readonly type: Exclude<Schema['type'], 'integer'>;
  /** Node의 깊이 */
  readonly depth: number;
  /** 루트 Node인지 여부 */
  readonly isRoot: boolean;
  /** 루트 Node */
  readonly rootNode: SchemaNode;
  /** 부모 Node */
  readonly parentNode: SchemaNode | null;
  /** 배열 아이템인지 여부 */
  readonly isArrayItem: boolean;
  /** Node의 JSON Schema */
  readonly jsonSchema: Schema;

  /** Node의 이름 */
  #name: string;
  /** Node의 이름 */
  get name() {
    return this.#name;
  }
  /**
   * Node의 이름 설정, 부모만 이름을 바꿔줄 수 있음
   * @param name 설정할 이름
   * @param actor 이름을 설정하는 Node
   */
  setName(this: AbstractNode, name: string, actor: SchemaNode) {
    if (actor === this.parentNode || actor === this) {
      this.#name = name;
      this.updatePath();
    }
  }

  /** Node의 경로 */
  #path: string;
  /** Node의 경로 */
  get path() {
    return this.#path;
  }
  /**
   * Node의 경로 업데이트, 부모 Node의 경로를 참고해서 자신의 경로를 업데이트
   * @returns 경로가 변경되었는지 여부
   */
  updatePath(this: AbstractNode) {
    const previous = this.#path;
    const current = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;
    if (previous === current) return false;
    this.#path = current;
    this.publish({
      type: NodeEventType.UpdatePath,
      payload: {
        [NodeEventType.UpdatePath]: current,
      },
      options: {
        [NodeEventType.UpdatePath]: {
          previous,
          current,
        },
      },
    });
    return true;
  }

  /** Node의 키 */
  #key?: string;
  /** Node의 키 */
  get key() {
    return this.#key;
  }

  /** 자신의 Error와 하위 Node의 Error를 합친 에러 */
  #mergedErrors: JsonSchemaError[] = [];

  /** 자신의 Error */
  #errors: JsonSchemaError[] = [];
  /** 자신의 Error의 dataPath 목록 */
  #errorDataPaths: string[] = [];
  /** 자신의 Error와 하위 Node의 Error를 합친 에러 */
  get errors() {
    return this.#mergedErrors;
  }
  /**
   * 자신의 Error를 전달받아서 하위 Node에서 전달받은 Error와 합친 후 전달
   * @param errors 전달받은 Error List
   */
  setErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    if (equals(this.#errors, errors)) return;
    this.#errors = errors;
    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];
    this.publish({
      type: NodeEventType.UpdateError,
      payload: {
        [NodeEventType.UpdateError]: this.#filterErrorsWithSchema(
          this.#mergedErrors,
        ),
      },
    });
  }

  /**
   * 자신의 Error 초기화, 하위 Node의 Error는 초기화 하지 않음
   */
  clearErrors(this: AbstractNode) {
    this.setErrors([]);
  }

  /** 하위 Node에서 전달받은 Error */
  #receivedErrors: JsonSchemaError[] = [];
  /**
   * 하위 Node에서 전달받은 Error를 자신의 Error와 합친 후 저장
   * @param errors 전달받은 Error List
   */
  setReceivedErrors(this: AbstractNode, errors: JsonSchemaError[] = []) {
    // NOTE: 이미 동일한 에러가 있으면 중복 발생 방지
    if (equals(this.#receivedErrors, errors, OMITTED_KEYS)) return;

    // 하위 Node에서 데이터 입력시 해당 항목을 찾아 삭제하기 위한 key 가 필요.
    // 참고: removeFromReceivedErrors
    this.#receivedErrors = new Array<JsonSchemaError>(errors.length);
    for (let index = 0; index < errors.length; index++)
      this.#receivedErrors[index] = { ...errors[index], key: index };
    this.#mergedErrors = [...this.#receivedErrors, ...this.#errors];

    this.publish({
      type: NodeEventType.UpdateError,
      payload: {
        [NodeEventType.UpdateError]: this.#filterErrorsWithSchema(
          this.#mergedErrors,
        ),
      },
    });
  }

  /**
   * 하위 Node에서 전달받은 Error 초기화, 자신의 Error는 초기화 하지 않음
   */
  clearReceivedErrors(this: AbstractNode) {
    if (!this.#receivedErrors.length) return;
    if (!this.isRoot)
      this.rootNode.removeFromReceivedErrors(this.#receivedErrors);
    this.setReceivedErrors([]);
  }

  /**
   * 하위 Node에서 전달받은 Error 중 삭제할 Error 찾아서 삭제
   * @param errors 삭제할 Error List
   */
  removeFromReceivedErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    const deleteKeys: Array<number> = [];
    for (const error of errors)
      if (typeof error.key === 'number') deleteKeys.push(error.key);
    const nextErrors: JsonSchemaError[] = [];
    for (const error of this.#receivedErrors)
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    if (this.#receivedErrors.length !== nextErrors.length)
      this.setReceivedErrors(nextErrors);
  }

  /**
   * Node의 기본값
   *  - set: `setDefaultValue`, 상속 받은 Node에서만 update 가능
   *  - get: `defaultValue`, 모든 상황에서 읽을 수 있음
   */
  #defaultValue: Value | undefined;
  get defaultValue() {
    return this.#defaultValue;
  }
  /**
   * Node의 기본값을 변경, 상속받은 Node에서만 수행 가능
   * `constructor`에서 사용하기 위한 용도
   * @param value input value for update defaultValue
   */
  protected setDefaultValue(this: AbstractNode, value: Value | undefined) {
    this.#defaultValue = value;
  }

  /**
   *
   * Node의 기본값을 변경한 후, Refresh event 발행. 상속받은 Node에서만 수행 가능
   * `constructor` 외부에서 사용하기 위한 용도
   * @param value input value for update defaultValue
   */
  protected refresh(this: AbstractNode, value: Value | undefined) {
    this.#defaultValue = value;
    this.publish({
      type: NodeEventType.Refresh,
    });
  }

  /** Node의 값 */
  abstract get value(): Value | undefined;
  abstract set value(input: Value | undefined);

  /**
   * Node의 값 설정, 상속 받은 Node에서 재정의 가능
   * @param input 설정할 값이나 값을 반환하는 함수
   * @param options 설정 옵션
   *   - replace(boolean): 기존 값 덮어쓰기, (default: false, 기존 값과 병합)
   */
  protected abstract applyValue(
    this: AbstractNode,
    input: Value | undefined,
    option: SetValueOption,
  ): void;

  /**
   * applyValue로 실제 데이터 반영 전에, input에 대한 전처리 과정 수행
   * @param input 설정할 값이나 값을 반환하는 함수
   * @param option 설정 옵션, 각각을 비트 연산자로 조합 가능
   *   - `Overwrite`(default): `Replace` | `Propagate` | `Refresh`
   *   - `Merge`: `Propagate` | `Refresh`
   *   - `Replace`: Replace the current value
   *   - `Propagate`: Propagate the update to child nodes
   *   - `Refresh`: Trigger a refresh to update the FormTypeInput
   *   - `Normal`: Only update the value
   */
  setValue(
    this: AbstractNode,
    input: Value | undefined | ((prev: Value | undefined) => Value | undefined),
    option: SetValueOption = SetValueOption.Overwrite,
  ): void {
    const inputValue = typeof input === 'function' ? input(this.value) : input;
    this.applyValue(inputValue, option);
  }

  #handleChange: SetStateFn<Value> | undefined;
  /**
   * Node의 값이 변경될 때 호출되는 함수
   * @param input 변경된 값이나 값을 반환하는 함수
   */
  protected onChange(this: AbstractNode, input: Value | undefined): void {
    if (typeof this.#handleChange !== 'function') return;
    if (this.isRoot) setTimeout(() => this.#handleChange?.(this.value));
    else this.#handleChange(input);
  }

  /** Node의 하위 Node 목록, 하위 Node를 가지지 않는 Node는 빈 배열 반환 */
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
    validationMode,
    ajv,
  }: SchemaNodeConstructorProps<Schema, Value>) {
    this.type = getNodeType(jsonSchema);
    this.jsonSchema = jsonSchema;
    this.#defaultValue =
      defaultValue ?? (getFallbackValue(jsonSchema) as Value);
    this.parentNode = parentNode || null;

    // NOTE: AbstractNode 자체를 사용하는 경우는 없으므로, this는 SchemaNode
    this.rootNode = (this.parentNode?.rootNode || this) as SchemaNode;
    this.isRoot = !this.parentNode;
    this.isArrayItem = this.parentNode?.jsonSchema?.type === 'array';
    this.#name = name || '';

    this.#handleChange = onChange;

    this.#path = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;

    this.#key = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${key ?? this.#name}`
      : JSONPath.Root;

    this.depth = this.#path.split(JSONPath.Child).filter(isTruthy).length - 1;

    if (this.parentNode) {
      const unsubscribe = this.parentNode.subscribe(({ type }) => {
        if (type & NodeEventType.UpdatePath) this.updatePath();
      });
      this.saveUnsubscribe(unsubscribe);
    }

    this.#compute = computeFactory(this.jsonSchema, this.rootNode.jsonSchema);

    // NOTE: 루트 Node에서만 validator 준비
    if (this.isRoot) this.#prepareValidator(ajv, validationMode);
  }

  /**
   * Node Tree에서 주어진 경로에 해당하는 Node를 찾습니다.
   * @param path 찾고자 하는 Node의 경로(예: '.foo[0].bar'), 없으면 자기 자신 반환
   * @returns 찾은 Node, 찾지 못한 경우 null
   */
  find(this: AbstractNode, path?: string) {
    const pathSegments = path ? getPathSegments(path) : [];
    // @ts-expect-error: find must be used in SchemaNode
    return find(this, pathSegments);
  }

  /** Node의 이벤트 리스너 목록 */
  #listeners: Set<NodeListener> = new Set();

  /** push 된 event를 모아서 한번에 발행 */
  #eventCascade = new EventCascade((event: NodeEvent) => {
    for (const listener of this.#listeners) listener(event);
  });

  /** 다른 node에 대한 unsubscribe 목록 */
  #unsubscribes: Array<Fn> = [];

  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.#unsubscribes.push(unsubscribe);
  }

  #clearUnsubscribes(this: AbstractNode) {
    for (let index = 0; index < this.#unsubscribes.length; index++)
      this.#unsubscribes[index]();
    this.#unsubscribes = [];
  }

  cleanUp(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.#clearUnsubscribes();
    this.#listeners.clear();
  }

  /**
   * Node의 이벤트 리스너 등록
   * @param listener 이벤트 리스너
   * @returns 이벤트 리스너 제거 함수
   */
  subscribe(this: AbstractNode, listener: NodeListener) {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  }

  /**
   * Node의 listener에 대해 이벤트 발행
   * @param event 발행할 이벤트
   *    - type: 이벤트 타입(NodeEventType 참고)
   *    - payload: 이벤트에 대한 데이터(MethodPayload 참고)
   *    - options: 이벤트에 대한 옵션(MethodOptions 참고)
   */
  publish(this: AbstractNode, event: NodeEvent) {
    this.#eventCascade.push(event);
  }

  #prepared: boolean = false;
  prepare(this: AbstractNode, actor?: SchemaNode) {
    if (this.#prepared || (actor !== this.parentNode && !this.isRoot))
      return false;
    this.#prepared = true;
    this.#prepareUpdateDependencies();
    this.publish({ type: NodeEventType.Activated });
    return true;
  }

  #compute: ReturnType<typeof computeFactory>;
  #dependencies: any[] = [];

  #visible: boolean = true;
  get visible() {
    return this.#visible;
  }

  #readOnly: boolean = false;
  get readOnly() {
    return this.#readOnly;
  }

  #disabled: boolean = false;
  get disabled() {
    return this.#disabled;
  }

  #oneOfIndex: number | undefined;
  protected get oneOfIndex() {
    return this.#oneOfIndex;
  }

  #watchValues: ReadonlyArray<any> = [];
  get watchValues() {
    return this.#watchValues;
  }

  #updateComputedProperties(this: AbstractNode) {
    this.#visible = this.#compute.visible?.(this.#dependencies) ?? true;
    this.#readOnly = this.#compute.readOnly?.(this.#dependencies) ?? false;
    this.#disabled = this.#compute.disabled?.(this.#dependencies) ?? false;
    this.#watchValues = this.#compute.watchValues?.(this.#dependencies) || [];
    this.#oneOfIndex = this.#compute.oneOfIndex?.(this.#dependencies);
    if (!this.#visible) this.value = undefined;
  }

  #prepareUpdateDependencies(this: AbstractNode) {
    const dependencyPaths = this.#compute.dependencyPaths;
    if (dependencyPaths.length > 0) {
      this.#dependencies = new Array(dependencyPaths.length);
      for (let index = 0; index < dependencyPaths.length; index++) {
        const dependencyPath = dependencyPaths[index];
        const targetNode = this.find(dependencyPath);
        if (!targetNode) continue;
        this.#dependencies[index] = targetNode.value;
        const unsubscribe = targetNode.subscribe(({ type, payload }) => {
          if (type & NodeEventType.UpdateValue) {
            if (
              this.#dependencies[index] !== payload?.[NodeEventType.UpdateValue]
            ) {
              this.#dependencies[index] = payload?.[NodeEventType.UpdateValue];
              this.#updateComputedProperties();
              this.publish({
                type: NodeEventType.UpdateComputedProperties,
              });
            }
          }
        });
        this.saveUnsubscribe(unsubscribe);
      }
    }
    this.#updateComputedProperties();
    this.publish({
      type: NodeEventType.UpdateComputedProperties,
    });
  }

  /** Node의 상태 */
  #state: NodeStateFlags = {};
  /** Node의 상태 */
  get state() {
    return this.#state;
  }
  /**
   * Node의 상태 설정, 명시적으로 undefined를 전달하지 않으면 기존 상태를 유지
   * @param input 설정할 상태
   */
  setState(
    this: AbstractNode,
    input: ((prev: NodeStateFlags) => NodeStateFlags) | NodeStateFlags,
  ) {
    const inputState = typeof input === 'function' ? input(this.#state) : input;
    if (!inputState || typeof inputState !== 'object') return;

    let hasChanges = false;
    const state: NodeStateFlags = {};

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
        type: NodeEventType.UpdateState,
        payload: {
          [NodeEventType.UpdateState]: this.#state,
        },
      });
    }
  }

  /**
   * 현재 값을 기준으로 유효성 검증 수행, `ValidationMode.OnRequest` 인 경우에만 동작
   */
  validate(this: AbstractNode) {
    this.rootNode.publish({
      type: NodeEventType.RequestValidate,
    });
  }

  /**
   * 주어진 에러 목록에서 자기 자신이 노출할 에러만 필터링
   * @param errors 필터링할 에러 목록
   * @returns 필터링된 에러 목록
   */
  #filterErrorsWithSchema(this: AbstractNode, errors: JsonSchemaError[]) {
    if (!this.isRoot) return errors;
    const visibleJsonPaths = getJsonPaths(this.value);
    const filtered = [];
    for (const error of errors)
      if (visibleJsonPaths.includes(error.dataPath)) filtered.push(error);
    return filtered;
  }

  /** Node의 Ajv 검증 함수 */
  #validator: ValidateFunction | null = null;
  /** Node의 JsonSchema를 이용해서 검증 수행, rootNode에서만 사용 가능 */
  async #validate(
    this: AbstractNode,
    value: Value | undefined,
  ): Promise<JsonSchemaError[]> {
    if (!this.isRoot || !this.#validator) return [];
    try {
      await this.#validator(value);
    } catch (thrown: any) {
      return transformErrors(thrown?.errors as ErrorObject[]);
    }
    return [];
  }

  /**
   * 자기 자신의 값이 변경될 때 검증 수행, rootNode에서만 동작
   */
  async #handleValidation(this: AbstractNode) {
    if (!this.isRoot) return;

    // NOTE: 현재 Form 내의 value와 schema를 이용해서 validation 수행
    //    - getDataWithSchema: 현재 JsonSchema를 기반으로 Value의 데이터를 변환하여 반환
    //    - filterErrors: errors에서 oneOf 관련 error 필터링
    const errors = await this.#validate(this.value);

    // 얻어진 errors를 dataPath 별로 분류
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

    // 전체 error를 setting,
    this.setErrors(errors);

    // 하위 Node에도 dataPath로 node를 찾아서 error setting
    for (const [dataPath, errors] of errorsByDataPath.entries()) {
      this.find(dataPath)?.setErrors(errors);
    }

    // 기존 error에는 포함되어 있으나, 신규 error 목록에 포함되지 않는 error를 가진 node는 clearError
    const errorDataPaths = Array.from(errorsByDataPath.keys());
    for (const dataPath of this.#errorDataPaths)
      if (!errorDataPaths.includes(dataPath))
        this.find(dataPath)?.clearErrors();

    // error를 가진 dataPath 목록 업데이트
    this.#errorDataPaths = errorDataPaths;
  }

  /**
   * Ajv를 이용해서 validator 준비, rootNode에서만 사용 가능
   * @param ajv Ajv 인스턴스, 없는 경우 신규 생성
   */
  #prepareValidator(
    this: AbstractNode,
    ajv?: Ajv,
    validationMode?: ValidationMode,
  ) {
    if (!validationMode) return;
    try {
      this.#validator = ajvHelper.compile({
        jsonSchema: this.jsonSchema,
        ajv,
      });
    } catch (error: any) {
      this.#validator = getFallbackValidator(error, this.jsonSchema);
    }
    const triggers =
      (validationMode & ValidationMode.OnChange
        ? NodeEventType.UpdateValue
        : BITMASK_NONE) |
      (validationMode & ValidationMode.OnRequest
        ? NodeEventType.RequestValidate
        : BITMASK_NONE);
    this.subscribe(({ type }) => {
      if (type & triggers) this.#handleValidation();
    });
  }
}
