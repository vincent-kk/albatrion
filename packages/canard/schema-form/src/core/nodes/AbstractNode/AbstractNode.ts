import {
  JSONPath,
  equals,
  isEmptyObject,
  isObject,
  isTruthy,
} from '@winglet/common-utils';

import type { Fn, SetStateFn } from '@aileron/declare';

import { BIT_MASK_NONE } from '@/schema-form/app/constants/bitmask';
import {
  type Ajv,
  type ErrorObject,
  type ValidateFunction,
  ajvHelper,
} from '@/schema-form/helpers/ajv';
import { getDefaultValue } from '@/schema-form/helpers/defaultValue';
import { transformErrors } from '@/schema-form/helpers/error';
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
  type UnionSetValueOption,
  ValidationMode,
} from '../type';
import {
  EventCascade,
  afterMicrotask,
  computeFactory,
  find,
  getFallbackValidator,
  getNodeGroup,
  getNodeType,
  getPathSegments,
  getSafeEmptyValue,
} from './utils';

const IGNORE_ERROR_KEYWORDS = new Set(['oneOf']);
const RECURSIVE_ERROR_OMITTED_KEYS = new Set(['key']);
const RESET_NODE_OPTION = SetValueOption.Replace | SetValueOption.Propagate;

export abstract class AbstractNode<
  Schema extends JsonSchemaWithVirtual = JsonSchemaWithVirtual,
  Value extends AllowedValue = any,
> {
  /** Node의 그룹 */
  public readonly group: 'branch' | 'terminal';
  /** Node의 타입 */
  public readonly type: Exclude<Schema['type'], 'integer'>;
  /** Node의 깊이 */
  public readonly depth: number;
  /** 루트 Node인지 여부 */
  public readonly isRoot: boolean;
  /** 루트 Node */
  public readonly rootNode: SchemaNode;
  /** 부모 Node */
  public readonly parentNode: SchemaNode | null;
  /** Node의 JSON Schema */
  public readonly jsonSchema: Schema;
  /** Node의 property key 원본  */
  public readonly propertyKey: string;
  /** Node의 required 여부 */
  public readonly required: boolean;

  /** Node의 이름 */
  #name: string;
  /** Node의 이름 */
  public get name() {
    return this.#name;
  }

  /**
   * Node의 이름을 설정합니다. 부모만 이름을 바꿔줄 수 있습니다.
   * @param name - 설정할 이름
   * @param actor - 이름을 설정하는 Node
   */
  public setName(this: AbstractNode, name: string, actor: SchemaNode) {
    if (actor === this.parentNode || actor === this) {
      this.#name = name;
      this.updatePath();
    }
  }

  #path: string;
  /** Node의 경로 */
  get path() {
    return this.#path;
  }

  /**
   * Node의 경로를 업데이트합니다. 부모 Node의 경로를 참고해서 자신의 경로를 업데이트합니다.
   * @returns 경로가 변경되었는지 여부
   */
  public updatePath(this: AbstractNode) {
    const previous = this.#path;
    const current = this.parentNode?.path
      ? `${this.parentNode.path}${JSONPath.Child}${this.#name}`
      : JSONPath.Root;
    if (previous === current) return false;
    this.#path = current;
    this.publish({
      type: NodeEventType.UpdatePath,
      payload: { [NodeEventType.UpdatePath]: current },
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

  #initialValue: Value | undefined;
  #defaultValue: Value | undefined;
  /**
   * Node의 기본값
   *  - set: `setDefaultValue`, 상속 받은 Node에서만 update 가능
   *  - get: `defaultValue`, 모든 상황에서 읽을 수 있음
   */
  public get defaultValue() {
    return this.#defaultValue;
  }
  /**
   * Node의 기본값을 변경, 상속받은 Node에서만 수행 가능
   * `constructor`에서 사용하기 위한 용도
   * @param value input value for update defaultValue
   */
  protected setDefaultValue(this: AbstractNode, value: Value | undefined) {
    this.#initialValue = this.#defaultValue = value;
  }

  /**
   *
   * Node의 기본값을 변경한 후, Refresh event 발행. 상속받은 Node에서만 수행 가능
   * `constructor` 외부에서 사용하기 위한 용도
   * @param value input value for update defaultValue
   */
  protected refresh(this: AbstractNode, value: Value | undefined) {
    this.#defaultValue = value;
    this.publish({ type: NodeEventType.Refresh });
  }

  /** Node의 값 */
  public abstract get value(): Value | undefined;
  public abstract set value(input: Value | undefined);

  /**
   * Node의 값 설정, 상속 받은 Node에서 재정의 가능
   * @param input 설정할 값이나 값을 반환하는 함수
   * @param options 설정 옵션
   *   - replace(boolean): 기존 값 덮어쓰기, (default: false, 기존 값과 병합)
   */
  protected abstract applyValue(
    this: AbstractNode,
    input: Value | undefined,
    option: UnionSetValueOption,
  ): void;

  /**
   * Node의 값을 설정합니다. applyValue로 실제 데이터 반영 전에, input에 대한 전처리 과정을 수행합니다.
   * @param input - 설정할 값이나 값을 반환하는 함수
   * @param option - 설정 옵션, 각각을 비트 연산자로 조합 가능
   *   - `Overwrite`(default): `Replace` | `Propagate` | `Refresh`
   *   - `Merge`: `Propagate` | `Refresh`
   *   - `Replace`: Replace the current value
   *   - `Propagate`: Propagate the update to child nodes
   *   - `Refresh`: Trigger a refresh to update the FormTypeInput
   *   - `Normal`: Only update the value
   */
  public setValue(
    this: AbstractNode,
    input: Value | undefined | ((prev: Value | undefined) => Value | undefined),
    option: UnionSetValueOption = SetValueOption.Overwrite,
  ): void {
    const inputValue = typeof input === 'function' ? input(this.value) : input;
    this.applyValue(inputValue, option);
  }

  #handleChange: SetStateFn<Value> | undefined;

  /**
   * Node의 값이 변경될 때 호출되는 함수입니다.
   * @param input - 변경된 값
   */
  protected onChange(this: AbstractNode, input: Value | undefined): void {
    this.#handleChange?.(input);
  }

  /** Node의 하위 Node 목록, 하위 Node를 가지지 않는 Node는 빈 배열 반환 */
  public get children(): { node: SchemaNode }[] {
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
    required,
    ajv,
  }: SchemaNodeConstructorProps<Schema, Value>) {
    this.type = getNodeType(jsonSchema);
    this.group = getNodeGroup(jsonSchema);

    this.jsonSchema = jsonSchema;
    this.parentNode = parentNode || null;
    this.required = required ?? false;

    this.rootNode = (this.parentNode?.rootNode || this) as SchemaNode;
    this.isRoot = !this.parentNode;
    this.#name = name || '';
    this.propertyKey = this.#name;

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

    this.setDefaultValue(
      defaultValue !== undefined ? defaultValue : getDefaultValue(jsonSchema),
    );
    if (typeof onChange === 'function')
      this.#handleChange = this.isRoot
        ? afterMicrotask(() =>
            onChange(getSafeEmptyValue(this.value, this.jsonSchema)),
          )
        : onChange;

    // NOTE: Special behavior for root node
    if (this.isRoot) this.#prepareValidator(ajv, validationMode);
  }

  /**
   * Node Tree에서 주어진 경로에 해당하는 Node를 찾습니다.
   * @param path - 찾고자 하는 Node의 경로(예: '.foo[0].bar'), 없으면 자기 자신 반환
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

  /**
   * 이벤트 구독 취소 함수를 저장합니다.
   * @param unsubscribe - 저장할 구독 취소 함수
   */
  protected saveUnsubscribe(this: AbstractNode, unsubscribe: Fn) {
    this.#unsubscribes.push(unsubscribe);
  }

  /**
   * 저장된 모든 이벤트 구독을 취소합니다.
   */
  #clearUnsubscribes(this: AbstractNode) {
    for (let index = 0; index < this.#unsubscribes.length; index++)
      this.#unsubscribes[index]();
    this.#unsubscribes = [];
  }

  public cleanUp(this: AbstractNode, actor?: SchemaNode) {
    if (actor !== this.parentNode && !this.isRoot) return;
    this.#clearUnsubscribes();
    this.#listeners.clear();
  }

  /**
   * Node의 이벤트 리스너 등록
   * @param listener 이벤트 리스너
   * @returns 이벤트 리스너 제거 함수
   */
  public subscribe(this: AbstractNode, listener: NodeListener) {
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
  public publish(this: AbstractNode, event: NodeEvent) {
    this.#eventCascade.push(event);
  }

  #activated: boolean = false;
  public get activated() {
    return this.#activated;
  }

  public activate(this: AbstractNode, actor?: SchemaNode) {
    if (this.#activated || (actor !== this.parentNode && !this.isRoot))
      return false;
    this.#activated = true;
    this.#prepareUpdateDependencies();
    this.publish({ type: NodeEventType.Activated });
    return true;
  }

  #compute: ReturnType<typeof computeFactory>;
  #dependencies: any[] = [];

  #visible: boolean = true;
  public get visible() {
    return this.#visible;
  }

  #readOnly: boolean = false;
  public get readOnly() {
    return this.#readOnly;
  }

  #disabled: boolean = false;
  public get disabled() {
    return this.#disabled;
  }

  #oneOfIndex: number = -1;
  public get oneOfIndex() {
    return this.#oneOfIndex;
  }

  #watchValues: ReadonlyArray<any> = [];
  public get watchValues() {
    return this.#watchValues;
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
              this.updateComputedProperties();
            }
          }
        });
        this.saveUnsubscribe(unsubscribe);
      }
    }
    this.updateComputedProperties();
    this.subscribe(({ type }) => {
      if (type & NodeEventType.UpdateComputedProperties)
        this.#hasPublishedUpdateComputedProperties = false;
    });
  }

  #hasPublishedUpdateComputedProperties = false;
  protected updateComputedProperties(this: AbstractNode) {
    const previousVisible = this.#visible;
    this.#visible = this.#compute.visible?.(this.#dependencies) ?? true;
    this.#readOnly = this.#compute.readOnly?.(this.#dependencies) ?? false;
    this.#disabled = this.#compute.disabled?.(this.#dependencies) ?? false;
    this.#watchValues = this.#compute.watchValues?.(this.#dependencies) || [];
    this.#oneOfIndex = this.#compute.oneOfIndex?.(this.#dependencies) ?? -1;
    if (previousVisible !== this.#visible) this.resetNode(true);
    if (!this.#hasPublishedUpdateComputedProperties) {
      this.publish({ type: NodeEventType.UpdateComputedProperties });
      this.#hasPublishedUpdateComputedProperties = true;
    }
  }
  public resetNode(
    this: AbstractNode,
    preferLatest: boolean,
    input?: Value | undefined,
  ) {
    const defaultValue = preferLatest
      ? input !== undefined
        ? input
        : this.value !== undefined
          ? this.value
          : this.#initialValue
      : this.#initialValue;
    this.#defaultValue = defaultValue;

    const value = this.#visible ? defaultValue : undefined;
    this.setValue(value, RESET_NODE_OPTION);
    this.onChange(value);

    this.setState();
  }

  #state: NodeStateFlags = {};
  /** Node의 상태 플래그 */
  get state() {
    return this.#state;
  }
  /**
   * Node의 상태를 설정합니다. 명시적으로 undefined를 전달하지 않으면 기존 상태를 유지합니다.
   * @param input - 설정할 상태 또는 이전 상태를 기반으로 새 상태를 계산하는 함수
   */
  public setState(
    this: AbstractNode,
    input?: ((prev: NodeStateFlags) => NodeStateFlags) | NodeStateFlags,
  ) {
    // 함수로 받은 경우 이전 상태를 기반으로 새 상태 계산
    const newInput = typeof input === 'function' ? input(this.#state) : input;
    let dirty = false;
    if (newInput === undefined) {
      if (isEmptyObject(this.#state)) return;
      this.#state = Object.create(null);
      dirty = true;
    } else if (isObject(newInput)) {
      for (const [key, value] of Object.entries(newInput)) {
        if (value === undefined) {
          if (key in this.#state) {
            delete this.#state[key];
            dirty = true;
          }
        } else if (this.#state[key] !== value) {
          this.#state[key] = value;
          dirty = true;
        }
      }
    }
    if (!dirty) return;
    this.publish({
      type: NodeEventType.UpdateState,
      payload: { [NodeEventType.UpdateState]: this.#state },
    });
  }

  /**
   * 현재 값을 기준으로 유효성 검증을 수행합니다. `ValidationMode.OnRequest` 인 경우에만 동작합니다.
   */
  public validate(this: AbstractNode) {
    this.rootNode.publish({ type: NodeEventType.RequestValidate });
  }

  /** 외부에서 전달받은 Error */
  #externalErrors: JsonSchemaError[] = [];

  /** [Root Node Only] Form 내부에서 발생한 Error 전체 */
  #globalErrors: JsonSchemaError[] | undefined;

  /** [Root Node Only] Form 내부에서 발생한 Error 전체의 dataPath 목록 */
  #errorDataPaths: string[] | undefined;

  /** [Root Node Only] Form 내부에서 발생한 Error 전체와 외부에서 전달받은 Error를 병합한 결과 */
  #mergedGlobalErrors: JsonSchemaError[] | undefined;

  /** 자신의 Error */
  #localErrors: JsonSchemaError[] = [];

  /** 자신의 Error와 외부에서 전달받은 Error를 병합한 결과 */
  #mergedLocalErrors: JsonSchemaError[] = [];

  /**
   * Form 내부에서 발생한 Error와 외부에서 전달받은 Error를 병합한 결과를 반환합니다.
   * @returns 병합된 내부 Error 목록
   */
  public get globalErrors() {
    return this.isRoot
      ? this.#mergedGlobalErrors
      : this.rootNode.#mergedGlobalErrors;
  }

  /**
   * 자신의 Error와 외부에서 전달받은 Error를 병합한 결과를 반환합니다.
   * @returns 병합된 Error 목록
   */
  public get errors() {
    return this.#mergedLocalErrors;
  }

  /**
   * 자신의 Error를 업데이트한 후 외부에서 전달받은 Error와 병합합니다.
   * @param errors - 설정할 Error 목록
   */
  public setErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    if (equals(this.#localErrors, errors)) return;
    this.#localErrors = errors;
    this.#mergedLocalErrors = [...this.#externalErrors, ...this.#localErrors];
    this.publish({
      type: NodeEventType.UpdateError,
      payload: { [NodeEventType.UpdateError]: this.#mergedLocalErrors },
    });
  }

  #setGlobalErrors(this: AbstractNode, errors: JsonSchemaError[]) {
    if (equals(this.#globalErrors, errors)) return false;
    this.#globalErrors = errors;
    this.#mergedGlobalErrors = [...this.#externalErrors, ...this.#globalErrors];
    this.publish({
      type: NodeEventType.UpdateGlobalError,
      payload: { [NodeEventType.UpdateGlobalError]: this.#mergedGlobalErrors },
    });
    return true;
  }

  /**
   * 자신의 Error를 초기화합니다. 전달받은 Error는 초기화하지 않습니다.
   */
  clearErrors(this: AbstractNode) {
    this.setErrors([]);
  }

  /**
   * 외부에서 전달받은 Error를 로컬 Error와 병합합니다. rootNode의 경우 internalError도 병합합니다.
   * @param errors - 전달받은 Error 목록
   */
  setExternalErrors(this: AbstractNode, errors: JsonSchemaError[] = []) {
    if (equals(this.#externalErrors, errors, RECURSIVE_ERROR_OMITTED_KEYS))
      return;

    this.#externalErrors = new Array<JsonSchemaError>(errors.length);
    for (let index = 0; index < errors.length; index++)
      this.#externalErrors[index] = { ...errors[index], key: index };

    this.#mergedLocalErrors = [...this.#externalErrors, ...this.#localErrors];
    this.publish({
      type: NodeEventType.UpdateError,
      payload: { [NodeEventType.UpdateError]: this.#mergedLocalErrors },
    });

    if (this.isRoot) {
      this.#mergedGlobalErrors = this.#globalErrors
        ? [...this.#externalErrors, ...this.#globalErrors]
        : this.#externalErrors;
      this.publish({
        type: NodeEventType.UpdateGlobalError,
        payload: {
          [NodeEventType.UpdateGlobalError]: this.#mergedGlobalErrors,
        },
      });
    }
  }

  /**
   * 외부에서 전달받은 Error를 초기화합니다. localErrors / internalErrors는 초기화하지 않습니다.
   */
  public clearExternalErrors(this: AbstractNode) {
    if (!this.#externalErrors.length) return;
    if (!this.isRoot)
      this.rootNode.removeFromExternalErrors(this.#externalErrors);
    this.setExternalErrors([]);
  }

  /**
   * 외부에서 전달받은 Error 중 삭제할 Error를 찾아서 삭제합니다.
   * @param errors - 삭제할 Error 목록
   */
  public removeFromExternalErrors(
    this: AbstractNode,
    errors: JsonSchemaError[],
  ) {
    const deleteKeys: Array<number> = [];
    for (const error of errors)
      if (typeof error.key === 'number') deleteKeys.push(error.key);
    const nextErrors: JsonSchemaError[] = [];
    for (const error of this.#externalErrors)
      if (!error.key || !deleteKeys.includes(error.key)) nextErrors.push(error);
    if (this.#externalErrors.length !== nextErrors.length)
      this.setExternalErrors(nextErrors);
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
      return transformErrors(
        thrown?.errors as ErrorObject[],
        IGNORE_ERROR_KEYWORDS,
      );
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
    const internalErrors = await this.#validate(this.value);

    // 전체 error를 저장, 이전 error와 동일한 경우 setInternalErrors false 반환
    if (!this.#setGlobalErrors(internalErrors)) return;

    // 얻어진 errors를 dataPath 별로 분류
    const errorsByDataPath = new Map<
      JsonSchemaError['dataPath'],
      JsonSchemaError[]
    >();
    for (const error of internalErrors) {
      if (!errorsByDataPath.has(error.dataPath))
        errorsByDataPath.set(error.dataPath, []);
      errorsByDataPath.get(error.dataPath)?.push(error);
    }

    // 하위 Node에도 dataPath로 node를 찾아서 error setting
    for (const [dataPath, errors] of errorsByDataPath.entries())
      this.find(dataPath)?.setErrors(errors);

    // 기존 error에는 포함되어 있으나, 신규 error 목록에 포함되지 않는 error를 가진 node는 clearError
    const errorDataPaths = Array.from(errorsByDataPath.keys());
    if (this.#errorDataPaths)
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
        : BIT_MASK_NONE) |
      (validationMode & ValidationMode.OnRequest
        ? NodeEventType.RequestValidate
        : BIT_MASK_NONE);
    this.subscribe(({ type }) => {
      if (type & triggers) this.#handleValidation();
    });
  }
}
