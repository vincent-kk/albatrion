# difference contract

## Requirements

- `source`에서 `target`으로 변환하는 RFC 7396 병합 패치를 생성한다. 변경이 없으면 `undefined`를 반환한다.
- `target`이 원시 타입이면 `target` 자체가 결과다(전체 치환). 배열이거나 객체·배열 타입이 섞이면 `equals` 비교 후 다르면 `target` 전체를 결과로 반환한다.
- 두 값이 모두 plain object면 속성 단위로 재귀 비교해 병합 패치 객체를 만든다.
- 예약 멤버 이름(`__proto__`,`constructor`,`prototype`)은 source·target 양쪽에서 건너뛴다 — 병합 패치에 나타나지 않는다.
- 결과 병합 패치의 키는 이스케이프되지 않는다 — RFC 7396 문서는 JSON Pointer 경로 목록이 아니라 원본 구조를 그대로 따르는 객체이기 때문이다.

## API Contracts

- `difference(source, target)`:
  - `source === target`이면 `undefined`를 반환한다.
  - `target`이 원시 타입이면 `target`을 그대로 반환한다(치환).
  - 둘 다 plain object면 `differenceObjectPatch`(재귀 비교)의 결과를 반환한다.
  - 그 외(배열 포함)는 `equals(source, target)`이 true면 `undefined`, 아니면 `target`을 그대로 반환한다 — 배열은 원소 단위로 병합하지 않는다.
- `differenceObjectPatch(source, target)`(내부 재귀 위임, entry point 비노출):
  - 제거된 속성과 값이 `undefined`로 바뀐 기존 속성은 `null`로 인코딩된다.
  - 값이 `undefined`인 새 속성은 결과에서 생략된다 — 추가해도 병합 결과가 바뀌지 않는다.
  - 값이 바뀐 배열·객체는 `target`과 참조를 공유하지 않도록 클론되어 들어간다.
  - 예약 멤버 키를 건너뛰면 "키 개수가 같으니 변경 없음" 조기 종료를 적용하지 않는다 — 그 판단이 모든 소스 키가 비교됐다는 전제에 의존하기 때문이다.

## Acceptance Criteria

### rfc7396-appendix — RFC 7396 Appendix A 표준 예제 정합

- RFC 7396 Appendix A가 정의한 예제 전량(속성 변경·추가·제거, 배열 전체 치환, 타입 간 치환, 중첩 객체 처리 포함)에서 사양이 명시한 병합 패치와 동일한 결과를 낸다.

### reserved-member-excluded — 예약 멤버는 병합 패치에 나타나지 않는다

- source·target 양쪽에 예약 멤버 키가 있어도 결과 병합 패치의 키 목록에 포함되지 않고, 결과 객체의 프로토타입은 `Object.prototype`에서 오염되지 않는다.
- 예약 멤버를 건너뛰어 소스·타깃 키 개수가 우연히 같아지는 경우에도 다른 속성의 추가가 정상적으로 보고된다.

### merge-patch-roundtrip — mergePatch와의 왕복 재구성

- `difference(source, target)`가 생성한 패치를 `mergePatch(source, patch)`에 적용하면 `target`과 동일한 값이 재구성된다.
- `Date` 값은 재귀 대상 구조가 아니라 리프 값으로 유지되어 왕복 후에도 `target`의 `Date`와 동일하다.

### key-unescaped — 병합 패치 키는 RFC 6901 이스케이프를 거치지 않는다

- `/`나 `~`를 포함한 키가 중첩·배열 내부·빈 문자열 등 어떤 형태로 있어도 결과 병합 패치에 원본 그대로 나타난다.

## Boundary Exemptions

### `differenceObjectPatch.ts` — 재귀 위임 root peer 유지

- **Consumers**: `difference.ts`와 `__tests__`
- **Direct import**: `allowed`
- **Reason**: entry point가 재수출하지 않는 내부 전용 진입이다 — `difference`가 위임하는 객체 병합 패치 생성기와 진입점은 한 몸의 두 파일이라 organ 재배치는 경로 깊이만 늘리고 경계를 바꾸지 못한다. flat root peer가 의도된 형태다.

## Last Updated

2026-08-18 — 최초 계약 작성
