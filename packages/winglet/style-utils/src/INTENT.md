# style-utils — CSS 스코핑·압축·className 결합 패키지 루트

## Purpose

이 패키지의 공개 표면 전체를 소유한다 — 스코프 CSS 주입·해제 생명주기, CSS 압축, className 결합이라는 세 축을 엔트리 포인트에서 이름으로 재수출해 하나의 진입점으로 통합한다. 세 축의 실제 동작 계약은 각각을 소유하는 자식 fractal이 정의하며, 이 fractal은 재수출 구성과 서브패스 export 경계만 소유한다.

## Conventions

- 서브패스 export는 자식의 독립 엔트리 포인트와 1:1로 대응한다 — 대응하는 자식이 이미 자기 엔트리 포인트를 가질 때만 새 서브패스를 추가한다.
- 런타임 의존성 없음(devDependencies만 존재)과 framework-agnostic 성질은 이 패키지 전체의 약속이며 루트가 지킨다.

## Boundaries

### Always do

- 엔트리 포인트는 이름 지정 재수출만 사용하고 와일드카드 재수출을 쓰지 않는다
- 재수출 대상 자식의 공개 계약이 바뀌면 그 자식의 DETAIL.md를 먼저 갱신한다

### Ask first

- 새 서브패스 export 추가 또는 기존 서브패스가 가리키는 자식 변경
- 세 축(스코프 CSS·압축·className) 중 하나를 다른 패키지로 분리하거나 축 사이의 소유권 재배치

### Never do

- 엔트리 포인트에 변환·래핑 로직을 직접 구현
- React 등 프레임워크 런타임을 의존성으로 추가해 framework-agnostic 약속을 깨는 행위
