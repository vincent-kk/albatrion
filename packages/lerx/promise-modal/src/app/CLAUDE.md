# app

## Purpose

ModalManager 싱글톤 클래스를 통해 모달의 전역 상태, DOM 앵커링, 스타일 시트 관리를 담당하는 애플리케이션 레이어.

## Structure

- `ModalManager.ts` — 싱글톤 클래스: 앵커 DOM 생성, 스타일 주입, 모달 open/refresh 핸들러 관리
- `__tests__/` — ModalManager 단위 테스트

## Conventions

- 모든 상태는 static 멤버로 관리 (싱글톤 패턴)
- `@winglet/style-utils`로 스코프된 CSS 주입 (polynomial hashing)
- `@winglet/common-utils`로 고유 ID 생성
- prerender 리스트: React 마운트 전에 호출된 모달을 큐잉

## Boundaries

### Always do

- ModalManager의 static 인터페이스 유지
- `reset()` 메서드에서 모든 상태 초기화 보장
- 스타일 시트 정의 시 `compressCss` 적용

### Ask first

- 앵커 DOM 구조 변경 (tag, prefix 기본값)
- 스타일 스코핑 방식 변경

### Never do

- ModalManager를 인스턴스 기반으로 변경
- 전역 DOM 조작을 ModalManager 외부에서 수행
