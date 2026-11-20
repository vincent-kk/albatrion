# style-utils contract

## Requirements

- 루트 엔트리 포인트는 스코프 CSS 생명주기(`destroyScope`, `styleManagerFactory`), CSS 압축(`compressCss`), className 결합(`cx`, `cxLite`)을 이름 지정 재수출로 노출한다.
- 재수출은 참조를 그대로 전달하며 별도의 래핑·변환을 거치지 않는다.
- 패키지는 런타임 `dependencies`를 선언하지 않는다(devDependencies만 존재) — 어떤 소스 파일도 React 등 프레임워크 런타임을 import하지 않는다.

## API Contracts

압축과 스코핑이 공유하는 CSS Syntax Level 3 토큰·구조 위치의 읽기는 이 공통 소유자의 내부 organ에 둡니다. UTF-8 바이트와 문자열에서 같은 경계를 사용해야 개행 종결자의 해석이 두 구현에서 갈라지지 않으며, 공개 루트에는 이 헬퍼를 노출하지 않습니다. 문자열의 CRLF 복구 경계는 CR 하나로 다시 분할하지 않아 반복된 잘못된 문자열에서도 지수적 정규식 재시도를 방지합니다.


workspace의 source 조건은 개발 빌드의 입력입니다. 배포 파일에는 src가 없으므로 publishConfig.exports는 source 조건을 제외한 동일한 런타임·선언 경계를 기록합니다. 공개 진입점과 types·import·require 대상의 일치를 유지하여 개발 입력이 배포 해석을 가로채지 않게 합니다.

- `index.ts`는 세 그룹의 심볼을 각각 소유 자식 모듈에서 named export로 가져와 그대로 다시 export한다 — 자체 함수·클래스 선언은 없다.
- 각 심볼의 시그니처와 동작 계약은 그 심볼을 소유하는 자식 fractal의 DETAIL이 정의한다.

공유 위치 상태는 토큰 소비와 함께 선택자·at-rule prelude·선언 이름·값·규칙 목록 및 component 스택을 진행합니다. 압축기는 공백 정책에, 스타일 주입기는 같은 순회의 EOF 경계에 이 상태를 사용합니다. 두 소비자의 공통 소유자 아래에 처리기를 두며 공개 루트에는 구현 헬퍼를 추가하지 않습니다. EOF 연결만을 위한 별도 문자열 순회나 독립 문법 판독기는 두지 않습니다. 문서 모드에서는 끝나지 않은 최상위 블록 규칙을 위치 상태가 가리키는 시작점부터 버려 기존 스코퍼의 결과를 유지하고, 그 밖의 경계는 토큰·component 끝 상태로 닫은 뒤 스코핑합니다.

선택자의 attribute component는 내부 공백을 해석하지 않는 불투명 문맥을 사용하며 닫는 대괄호에서 부모 문맥을 복원합니다. attribute 내부 연산자와 선택자 결합자의 공백 정책을 같은 상태로 판단하지 않습니다. component 스택의 첫 프레임은 스칼라로 유지하고 두 번째부터 배열을 사용하여 평평한 시트에 배열을 만들지 않습니다.

## Acceptance Criteria

### root-reexport — 루트 엔트리 포인트 재수출 무결성

- `index.ts`는 named export 3문으로만 구성되며 와일드카드 재수출이나 로컬 로직을 포함하지 않는다(엔트리 포인트 코드로 확인).
- 재수출된 각 심볼은 자식 구현과 동일한 참조이므로, 자식 fractal의 테스트 스위트가 검증하는 동작이 루트 심볼 호출에도 그대로 적용된다.

## Last Updated

style-utils의 공개 경계·입력 해석·반환값 또는 실패 처리 계약이 바뀔 때 갱신합니다.
