# 새 설계의 조건부·FE 전용 키워드·인터페이스·기능 사실 (scout, 2026-09-23, 커밋 01e52d0bd)

읽기 전용 조사 원문이다. 비교표(round-6)의 재료. `raw-round6-current-syntax.md`의 항목 이름을 그대로 쓴다. 대상: 03-mental-model.md, adr 0001–0005/0007/0008/0011–0013, 00-goals.md, open-questions.md, 04-inherited-constraints.md, reviews/round-4-spec.md, round-5-derivations.md.

## 1. FE 전용 키워드의 운명

| 키워드 | 새 설계 | 근거 |
|---|---|---|
| `&if`/`computed.if` | 제거(oneOf/anyOf 분기는 값 가드·선택 가드로 이관) | adr/0002:34-40,155-157 |
| `&active` | 유지 | adr/0003:25 |
| `&visible`/`&readOnly`/`&disabled`/`&pristine`/`&watch`/`&derived` | 유지, 표현식 전체 존속 | adr/0003:25 |
| `computed.*` 컨테이너 존속 | **미결**(평면 `&`키 대 `&` 컨테이너) | adr/0003:30 |
| `virtual`(그룹) | 이름 변경 `&virtual` + 참조 그룹 노드 종류 신설(D-6 도출, 소유자 확정 대기) | adr/0011:58-71 |
| `virtual`(`type:'virtual'` 노드) | 문서에 별도 언급 없음 | **미확인** |
| `FormTypeInput`/`formType` | **미결**(새 이름 미정) | adr/0003:30-32 |
| `terminal` | 유지+확장(`terminal:false/true` 양방향 명시 재정의) | adr/0011:54 |
| `options.omitEmpty`/`omitTrailing` | 유지(방출 정책, P4) | 03-mental-model:12,89 |
| `options.trim`(강제 변환), `minItems` 채움/`maxItems` 차단 | **제거** → 입력 컴포넌트로 이관 | adr/0013:77-78 |
| `FormTypeInputProps.alias` / `placeholder` / `errorMessages` | 문서 언급 없음 | **미확인** |
| `injectTo` | 유지 | adr/0013:41 |
| `nullable` | 종류 아닌 노드 플래그로 유지 | adr/0005:58 |

표현식 문법: JSON Pointer 동적 함수 전체 유지(adr/0003:25). 평가 시점: 정착 루프 "파생" 단계로 이동(완성된 트리에서 평가)(03-mental-model:59; adr/0007:32). `&` 키 제거 규칙: 키워드 위치에서만 제거, strict 기본 아님, 목적은 판정이 아닌 컴파일 보호(adr/0003:16-19; adr/0001:21).

## 2. 표준 조건부 키워드

| 키워드 | 지원 | 처리 | 근거 |
|---|---|---|---|
| `if/then/else` | 확대 | then/else 밖 새 노드 선언 가능, `allOf` 안 if/then 필수 지원, 중첩(재귀) 지원, 순환은 비단조 재평가+상한으로 허용 | adr/0002:34-40,103-108 |
| `oneOf`/`anyOf` | 지원 | 판별식 식별 5단계(E14), 무판별이면 selection 가드+수동 선택, 빈 값·여분 키만 값→분기 없음(D-8+C-1·C-7, **소유자 확정 대기**) | adr/0005:75-86; adr/0002:121-133; round-5-derivations:19 |
| `allOf` | 지원 | 조각 병합 유지+상속 overlay(E12) | adr/0002:110 |
| `dependentSchemas`/`dependencies` | **미결(Q7)** | 가드→조각 환원 가능, 채택 여부 미정 | open-questions:54-56 |
| `not`/`false`/`additionalProperties` | **읽지 않음**(D-3=P1′) | 본체 선언 시 보통 필드+검증 에러; 미선언 시 잔여 키(`rejectedKey` 계약, 플러그인이 채움) | adr/0002:76-97 |
| `const`/`enum` | 판별식 식별에 값만 읽음, 판정은 검증기 | adr/0005:90 |
| `default` | 로드 계약, core 유일 자동 쓰기 | 없음인 키에만, 전체 교체 직후+조각 켜짐 직후 | 03-mental-model:45 |
| `$ref` | 깊이 **미결**(현재 기본값 1) | adr/0005:112 |

## 3. 공개 인터페이스

- Form props 전체 표는 문서에 없음. 신규 후보: `disableDefaultInjection`(adr/0007:71), `onListenerError` 가칭(adr/0008:147). `validationMode`/`virtualization`/`context` **미확인**(언급 없음).
- FormHandle: `setValue(value, {mode, disableDefaultInjection})`(adr/0013:46), `reset(options)` 동일 옵션(adr/0007:68), **`batch(fn)` 신규**(adr/0008:70-76), `refresh(path)`/`remount(path)` 신규 후보(C-11 도출, **소유자 확정 대기**)(adr/0008:121), `focus`/`select` 유지.
- `SetValueOption`: 비트 → **객체** `{mode?: 'Overwrite'|'Merge', disableDefaultInjection?: boolean}`(Q6 닫힘)(open-questions:52).
- 이벤트: `NodeEventType`은 3역할로 재정의(상태 통지/revision/명령 시그널)(adr/0008:24-28). 17종 세부 유지 여부 **미확인**. `subscribe`/`revision` 유지, `publish` 공개화는 **소유자 확정 대기**(round-5-derivations:22).
- `node.value`/`normalizedValue`: 구분 유지가 "자연스럽다"고만 언급, 확정 아님(open-questions:25). `enhancedValue`/`oneOfIndex` **미확인**.
- 배열 API: `push`/`remove`/`update` **동기화**(파괴적 변경)(adr/0007:127).
- 명령: `RequestFocus`/`Select`/`Refresh`/`Remount` 유지. `RequestEmitChange`/`RequestInjection` **미확인**.

## 4. 기능 증감

**사라짐**: `trim` 강제 변환·`minItems` 채움(adr/0013:77-78), null→`{}` 변환·`Normalize`·분기 전환 reset(adr/0013:79-81), virtual `required` 펼치기(adr/0011:71), `__enhanced__` 마커(adr/0001:40), React 컴포넌트 감지(adr/0011:53), 분석 단계 정적 throw(adr/0005:7), `afterMicrotask` 디바운스+마이크로태스크 배치(adr/0008:32,89), 두 단계 테스트 하네스(04-inherited-constraints T-5).

**신규**: 청사진/Fragment 트리(adr/0005:25-38), 상속 overlay(adr/0002:110), settle 상태+3종 예산(03-mental-model:28), 동기 통지+루트 디스패처(adr/0008:34-68), `batch(fn)`, 진입당 onChange 1회(adr/0008:87-93), 잔여 키 `rejectedKey` 계약(adr/0002:90), 참조 그룹 노드(adr/0011:58-71), 커밋 번호 스탬프(adr/0007:34), `&` 키 제거 유틸리티(adr/0003:16).

**미결 총목록**(문서가 명시): `computed` 컨테이너 이름·`FormTypeInput` 등 이름(adr0003:30), `dependentSchemas` 채택(Q7), `$ref` 깊이(adr0005:112), union 에러 라우팅 규칙(Q12), `onListenerError` 채널(adr0008:147), 명령 publish 공개화(C-11), 여분 키 값 분기 없음 확장(round-5-derivations:19 U-1), 잠복 값 API 이름(F26), `disableDefaultInjection` 등 옵션명은 후보일 뿐 확정 아님.

**미확인**(읽은 범위에서 답 없음): Form 전체 props 표, `FormTypeInputProps.alias`/`placeholder`/`errorMessages`, `oneOfIndex` 대응물, `enhancedValue`, `NodeEventType` 17종 개별 생사, `RequestEmitChange`/`RequestInjection`.
