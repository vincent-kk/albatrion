# app

## Purpose

ModalManager 싱글톤 클래스를 통해 모달의 전역 상태, DOM 앵커링, 스타일 시트 관리를 담당하는 애플리케이션 레이어.

## Conventions

- 모든 상태는 static 멤버로 관리 (싱글톤 패턴)
- `@winglet/style-utils`로 스코프된 CSS 주입 (polynomial hashing)
- `@winglet/common-utils`로 고유 ID 생성
- prerender 큐: 마운트 전 open 요청을 `{ modal, dispatch }`로 큐잉, `openHandler` 설정 시 큐를 flush하여 Promise 배선을 유지

## Boundaries

### Always do

- ModalManager의 static 인터페이스 유지
- `reset()`은 `initialize`의 완전한 역연산 보장 (styleManager 재바인딩 포함)
- 스타일 시트 정의 시 `compressCss` 적용
- 외부 소비자는 `@/promise-modal/app` entry point로 import

### Ask first

- 앵커 DOM 구조 변경 (tag, prefix 기본값)
- 스타일 스코핑 방식 변경

### Never do

- ModalManager를 인스턴스 기반으로 변경
- 전역 DOM 조작을 ModalManager 외부에서 수행
