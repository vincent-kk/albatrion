# Form contract

## Requirements

- `Form`은 공개 폼 컴포넌트로서 Provider를 고정 순서로 조합하고 `FormHandle` ref를 노출한다. 노드 생성은 `RootNodeContextProvider`에 맡겨 폼 조합과 트리 생성의 책임을 분리한다.
- **폼 밖으로 나가는 값은 `rootNode.outputValue`(투영 값)이고, 폼 안으로 들어오는 값은 원본 입력이다.** `getValue`·제출·변경 방출은 투영 값을 읽고 `setValue`는 받은 값을 노드에 전달한다. 편집 중인 `value`와 방출 값을 구별한다(LANDING-067).
- 모든 폼 콜백은 첫 commit을 마친 현행 load에서 숨김·unmount 뒤에도 engine chain 끝에 전달한다. 마운트 정착 중 변경·진단 통지는 버리며, 직전 방출 값과 같은 참조는 다시 내보내지 않는다. 마운트의 오류 기록 전달과 검증 요청은 커밋 뒤 준비 layout effect가 담당한다(REACT-007, ERROR-026, 69C-05).
- `submit`은 진단이 `degraded`이면 모든 환경에서 `SUBMIT_WHILE_DEGRADED`로 거부한다. 검증기가 있으나 전체 스키마 컴파일이 실패하여 검증 불가이고 모드가 `None`이 아니면 제출도 거부한다. 검증기 미등록만으로는 제출을 거부하지 않는다. 허용된 제출은 투영 값을 확정하고 필요한 검증을 수행하며, 검증 오류가 있으면 `inputOnSubmit`을 호출하지 않고 `ValidationError('SCHEMA_VALIDATION_FAILED')`의 상세에 `{value, errors, jsonSchema}`를 담는다. 네이티브 submit 경로의 거부 가운데 degraded 같은 오류 계층 원인은 `onError` 뒤 주인 없는 오류 싱크로(이미 보고한 같은 컴파일 실패 객체는 싱크만), 검증 실패(`SCHEMA_VALIDATION_FAILED`)는 기록되지 않으므로 `onError` 없이 싱크로만 전달한다(ERROR-016·019·139, LANDING-025·095).
- Provider의 현행 중첩 순서는 계약이다. 바깥 설정과 안쪽 노드·폼 루트의 소비 관계를 유지해야 하므로 부분 렌더나 순서 변경은 허용하지 않는다.
- 네이티브 제출 함수는 추적 제출 핸들이 같은 동안 참조를 유지하여 관계없는 Form 속성 변경이 FormRootProxy를 다시 렌더하지 않는다. 제출 이벤트의 기본 동작 억제와 실패의 호스트 보고는 유지한다(121C-01 F-C).

## API Contracts

- 보조 렌더링 컴포넌트는 `Form.Render`·`Form.Field`·`Form.Label`·`Form.Input`·`Form.Error` 정적 멤버로 제공한다. `FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`는 내부 구현이며 이 fractal의 index가 별도 이름으로 내보내지 않는다.
- 공개 `Roll` 형 셋은 이 fractal이 소유한다. 각 자식 fractal(`components/FormField` 등)의 `types` 칸 props 파일이 본 형(`FormFieldProps` 등)과 그 `Roll` 표현(`RolledFormFieldProps` 등)을 함께 정의하고, 자식 관문과 이 fractal의 index는 `Rolled*` 형을 내보낸다. 루트 `src/index.ts`가 `RolledFormFieldProps as FormFieldProps`처럼 공개 이름으로 바꿔 재수출한다.

- 기본값·스키마 변경과 같은 React 배치에서 호출한 `reset(option?)`은 커밋 재대조에도 원래 자동 쓰기 억제 옵션을 전달하여 최신 기본값을 자동 채움 없이 읽는다(WRITE-044).

### 값 채널

- `getValue()`·`submit`·`onChange`는 `rootNode.outputValue`를 읽는다. `setValue(value, options)`는 받은 값을 `rootNode.setValue`에 넘긴다.
- `node`와 경로 조회는 노드 자체를 제공하므로 호출자가 raw 상태를 관찰할 수 있다. 이 조회를 폼 방출 값의 정제와 혼동하지 않는다.
- 정제의 내용은 스키마 옵션과 노드가 결정한다. 현재 `ArrayNode`의 `options.omitTrailing`이 적용 사례이며, `Form`은 읽을 채널을 고를 뿐 정제 규칙을 다시 구현하지 않는다.

### Form 속성

- `readOnly`·`disabled`는 렌더 계층에서 노드의 로컬 잠금과 결합하는 폼 전체 잠금이며 core의 명령형 쓰기를 막지 않는다. `unsetOnInactive`는 노드별 나감 정책이 없는 경우의 폼 기본값이고, `disableAutomaticWrites`는 자동 쓰기의 폼 기본 억제값이다(LANDING-067, WRITE-015·031–040).
- `onError`는 폼 인스턴스의 오류 기록을 받고 `onDiagnosticsChange`는 준비 뒤 루트 진단 변경을 받는다. `validatorFactory`의 공개 형은 필수 `compile`·`compileGuard`를 가진 `{ compile, compileGuard }` 객체이며 선택 순서는 Form 속성 > FormProvider > 플러그인이다. 선택 검증기 참조가 바뀌면 트리를 재생성한다(ERROR-026, VALIDATE-044, 32C-01).
- 렌더러 속성은 `FieldRenderer`·`FormLabelRenderer`·`FormInputRenderer`·`FormErrorRenderer`의 넷이며 플러그인 키와 같은 이름을 사용한다(LANDING-035·067).
- 작성 `jsonSchema`는 clone하지 않아 청사진·가드 캐시의 루트 identity를 유지한다. `defaultValue`는 clone하여 로드하며, 스키마와 기본값은 마운트·reset 계약에 따라 읽는다(LANDING-095, WRITE-043·044).
- `Form.Label`은 입력 선택을 판정하지 않고 항상 `htmlFor={path}`와 id `label:${path}`를 둘 다 가진 label을 그린다. 단일 입력은 `id={path}`로, 묶음 입력은 `aria-labelledby`로 `label:${path}`를 참조해 이 제목에 이어지며, 사용자 입력·렌더러도 같은 규약을 따른다(대기열 38, 소유자 결정). 접두어 `label:`은 `/`로 시작하는 경로 id와 겹칠 수 없어, 형제 속성 이름이 `<이름>-label`이어도 id가 충돌하지 않는다.

### 오류 경계

- 폼 바깥 감싸개가 인스턴스 보고기를 소유하고 문맥으로 전달한다. 루트 경계는 공개 `onError` 속성으로 보고하며, 필드 경계는 컴포넌트를 해석·소유하는 자리에서 한 번 둔다. 렌더러는 `FieldProxy`가, 입력은 사설 어댑터 `withFieldInputErrorBoundary`가 렌더 때 `useBoundaryReporter(path)`로 보고기를 읽고 `ErrorBoundary`를 직접 렌더한다. 지연 필드의 Placeholder만 `VirtualizationManager`가 form당 한 번 `withErrorBoundary`로 감싸고 셋째 인자 보고 훅으로 경로 문맥의 보고기를 읽는다(68C-08, ERROR-112–117, 121C-01).
- 루트·필드 렌더 오류는 fallback으로 가두고 `RENDER_FAILED` 기록과 `componentStack`을 보고하며 다시 던지지 않는다. 보고기는 루트 fallback 이후에도 살아 있고 전달 중 표지·중복 억제·경고 집합을 소유하며, 경계는 보고기를 호출한다. 청사진 오류는 트리 생성 자리에서 포착하여 대체 화면과 커밋 뒤 보고로 연결한다(ERROR-110–117, LANDING-067·075·095).

### `FormHandle`

`FormHandle`의 멤버는 `node`·`focus`·`select`·`refresh`·`remount`·`reset`·`findNode`·`findNodes`·`getState`·`setState`·`clearState`·`getValue`·`setValue`·`getErrors`·`getAttachedFilesMap`·`validate`·`showError`·`submit`의 18개이다. 현재 루트에 위임하며 공개 `publish`는 두지 않는다(EVENT-063·073, SURFACE-059, 68C-03).

`reset(option?)`은 같은 스키마면 `reloadFieldNodeForm`으로 트리를 유지하고, 다르면 같은 호출 안에서 작성·인계·마운트·옛 트리 폐기·핸들 교체를 끝낸다. 옵션은 공개 `SetValueOption.DisableAutomaticWrites`·`EnableAutomaticWrites`만 받으며 그 로드에서 Form `disableAutomaticWrites` 속성보다 우선한다. 생략하면 속성을 따르고 둘 다 주면 억제가 이긴다. 캐스트로 전달된 다른 비트는 무시하며 로드 의미는 바뀌지 않는다(WRITE-015, LANDING-039, ADR 0013). 외부 오류와 검증 결과를 비우고 경로 키 `errors`를 재적용하며, 커밋된 속성 재대조는 Provider의 로드 계약을 따른다(WRITE-042–046, 69C-02·03).

- `rootNode`가 아직 없어도 조회 계열은 예외를 던지지 않는다. `findNode`는 `null`을, `findNodes`·`getErrors`·`validate`는 빈 배열을, `getState`는 빈 객체를 반환하고, `getValue`는 런타임에서 `undefined`를 반환한다.
- `focus(path?)`·`select(path?)`·`refresh(path?)`·`remount(path?)`는 해당 노드의 `request(kind)`를 호출한다. 경로가 없으면 루트이고 지정 경로의 노드가 없으면 무동작이다(EVENT-063·073, SURFACE-059).
- `submit`은 `getTrackableHandler`로 감싸므로 진행 상태를 추적할 수 있다.

- 위계: `components/`에 fractal 여섯이 있다. `components/FormCore/`는 Provider 조립·핸들·오류 경계를 소유하며, 경계를 입힌 바깥 `FormCore`와 경계 없는 안쪽 `FormRoot`를 둔다. 공개 조각 다섯(`FormRender`·`FormField`·`FormLabel`·`FormInput`·`FormError`)도 각자의 fractal이다. `components/`에는 index를 두지 않으며, `Form.tsx`와 `index.ts`가 여섯 자식의 진입점(`./components/FormCore` 등)을 직접 가리킨다. `Form.tsx`는 `FormCore`에 정적 멤버 다섯을 붙여 `Form`을 만든다. 뿌리에는 문서·진입점·`Form.tsx`만 둔다(filid zero-peer-file).

## Acceptance Criteria

### reset-options — 로드별 자동 쓰기 억제

- 같은 트리 reload와 재생성 트리 mount 및 validator·props 커밋 재대조 모두 호출의 억제 비트가 Form 기본값보다 우선한다. 옵션 생략은 Form 속성을 따르고 두 비트 동시 지정은 억제가 이긴다(WRITE-015·044, LANDING-039).
- 공개 형은 `Overwrite`·`Merge`를 거부하며 캐스트로 전달된 다른 비트는 로드 의미를 바꾸지 않는다.

### emit-normalized — 방출 경로는 정제 값을 낸다

- `options.omitTrailing`이 켜진 배열을 가진 폼에서 `getValue()`와 `onSubmit` 인자에 후행 빈 항목이 없다.
- 같은 폼의 최초 `onChange` 방출도 정제 값을 전달한다.
- 같은 폼에서 렌더된 배열 입력 개수는 줄지 않는다. 정제는 방출에만 적용되며 노드 트리나 DOM을 지우지 않는다.

### submit-gate — 검증 실패는 제출을 막는다

- 검증 오류가 있는 상태에서 `submit()`을 호출하면 `inputOnSubmit`이 호출되지 않고 `ValidationError`가 던져진다.
- 던져진 오류의 `details`에 `value`·`errors`·`jsonSchema`가 들어 있다.
- `degraded`와 활성 검증 모드의 검증 불가는 모든 환경에서 제출을 거부하고, 네이티브 submit의 거부도 `onError`와 싱크로 보고한다. 단, 폼이 이미 보고한 같은 컴파일 실패 객체는 싱크에만 보고한다(LANDING-025·095).

### emit-dedupe — 동일 값 재방출 억제

- never-prepared 또는 reset-retired load에서는 `onChange`가 호출되지 않고 prepared 현행 load는 숨김 중에도 한 번 전달한다.
- 직전 방출과 동일한 참조가 다시 전달되면 `onChange`가 추가로 호출되지 않는다.

## Last Updated

계약 기준: LANDING-067·095, WRITE-042–046, EVENT-063·073, 68C-08, 69C-01–05; 정돈-2·Form 조각 fractal 분리(2026-10-14).
