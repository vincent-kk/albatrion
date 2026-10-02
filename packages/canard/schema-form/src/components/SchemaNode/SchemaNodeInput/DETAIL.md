# SchemaNodeInput

## Requirements

선택된 입력 컴포넌트를 노드의 값·상태·명령 체계에 연결합니다.

## API Contracts

- 입력 선택은 인라인 지정, 입력 맵, 내부 정의, 외부 정의, 플러그인 fallback의 우선순위를 유지합니다.
- 사용자 변경은 폼 전체 잠금과 노드의 읽기 전용·disabled 상태를 확인합니다. `handleChange`는 한 `batch` 안에서 ① `writeSchemaNodeInput`으로 값 쓰기 ② 외부 오류 지움 ③ dirty 표시를 수행합니다. 세 단계 전체가 사슬 진입의 입력 출처 표식을 가지며 공개 옵션 비트를 더하지 않습니다. 사슬 끝에서 던지는 오류가 있어도 이미 표시한 dirty를 보존하고, 폐기된 노드의 표식 있는 세 단계는 조용히 버립니다(REACT-009–011, 69C-01·02).
- 흐림 처리는 `Blurred` 발행 대신 `finishSchemaNodeInput`으로 입력 마침을 전달합니다. 문자열 행의 `finishInput`이 `options.trim` 자동 쓰기를 판단하고 외부 오류·dirty는 유지합니다(WRITE-083, LANDING-067).
- 대체된 입력은 마운트 시 붙잡은 노드 Refresh 번호와 쓰기 시 번호가 다르면 늦은 `onChange`·`onFileAttach`를 버립니다. 흐림 뒤 미룬 touched는 흐릴 때 읽은 상호작용 초기화 번호와 콜백 시 번호가 다르면 버립니다. 첨부 파일 맵은 컨테이너 입력에서도 폐기된 노드의 늦은 쓰기를 받지 않습니다(REACT-024, 69C-02).
- Refresh의 다시 마운트 판정은 노드 종류만이 아니라 자식 프록시의 실제 마운트 여부로 가릅니다. 터미널·값 전체 브랜치·빈 배열·접힌 입력은 다시 마운트하고, 자식을 그리는 기본 객체·배열 입력은 유지합니다. 컨테이너 입력에는 대체된 입력의 Refresh 번호 검사를 적용하지 않습니다(REACT-024·028).
- `useFormTypeInput`의 메모 의존에는 유효 `jsonSchema` 참조가 포함됩니다. Hint는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, formType }`이며 입력 props의 같은 이름은 같은 값입니다. `schemaType`은 integer와 union 목록을 보존하고 입력 props는 `typeMismatch`·`watchValues`도 전달합니다(REACT-012·032, LANDING-137·181·185).
- 객체 시험의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`formType`입니다. 모르는 키는 대조에서 빼고 `type`의 integer도 무효 시험으로 다루며, 개발 모드 `FORM_TYPE_TEST_INVALID`는 정의마다 한 번 보고합니다. union은 `{ type: 'union' }` 또는 함수 시험으로 선택합니다(REACT-032·033).
- 터미널 입력의 `ChildNodeComponents`는 빈 배열입니다. 개발 모드 또는 오류 핸들러가 있는 경우 읽기를 감지하는 동결 빈 배열을 전달하여 첫 색인·length·순회 읽기를 `CHILD_NODE_COMPONENTS_ON_TERMINAL`로 기록합니다. 필드 커밋 뒤 이펙트에서 보고하고 로드마다 `(code, path)`로 한 번만 전달하며, 핸들러가 없는 프로덕션은 보통의 빈 배열을 사용합니다(ERROR-202).
- 재귀 NodeProxy의 props는 형제 SchemaNodeProxyProps 계약을 통해 공유하며, 입력 계층은 SchemaNodeProxy 구현에 의존하지 않습니다.

## Acceptance Criteria

### schema-node-input-contract — 관찰 가능한 동작

- 언마운트하면 해당 경로의 첨부 파일 상태를 제거합니다.
- refresh는 자식 프록시 마운트 판정에 따라 입력 버전을 갱신하고 focus/select는 해당 입력의 DOM 명령으로 연결됩니다(REACT-028, EVENT-063).
- 한 입력 변경의 세 단계는 한 진입으로 정착·통지하고, 유효 스키마 변경은 입력 선택에 반영됩니다. 대체·폐기된 입력의 늦은 값·파일 쓰기와 초기화 뒤 미룬 touched는 살아 있는 폼 상태를 바꾸지 않습니다(REACT-011·012·024, 69C-01·02).

## Last Updated

계약 기준: REACT-009–012·024·028·032·033, WRITE-083, ERROR-202, 69C-01·02.
