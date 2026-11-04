# Form error reporting

## Purpose

루트 오류 경계 바깥에서 보고기의 수명을 소유하고, 필드 경계에 명시적 path를 받는 콜백을 제공한다. 경로 문맥은 래퍼가 필드 props를 풀지 않는 지연 Placeholder에만 쓴다.

## Boundaries

### Always do

- Require an explicit operation origin for captures; keep warning scope independent from origin.

- 커밋된 기록을 최신 콜백에 전달하고 오류 identity를 유지한다.
- 부른 쪽이 없는 실패는 core 경계를 통해 잎 순서로 호스트에 전달하며, caller 거부와 렌더 경계의 원래 값은 유지한다.
- 경계 래퍼는 해당 컴포넌트가 소유하는 지점에 둔다.
- 보고기는 렌더 중에 읽고, 현재 필드 path는 훅 인자로 받는다.

### Ask first

- 공개 오류 기록의 필드나 sink의 의미를 바꾸는 경우

### Never do

- form, 플러그인 레지스트리, 코어 구현을 import하지 않는다.
- 경계 콜백에서 잡은 렌더 오류를 다시 던지지 않는다.
