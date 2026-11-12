# app

## Purpose

ModalManager 싱글톤 클래스를 통해 모달의 전역 상태, DOM 앵커링, 스타일 시트 관리를 담당하는 애플리케이션 레이어.

## Conventions

- 모든 상태는 static 멤버로 관리 (싱글톤 패턴)
- `@winglet/style-utils`로 스코프된 CSS 주입 (polynomial hashing)
- 고유 id와 쌓임 순서는 static 저장소에서 발급
- prerender 큐: 마운트 전 open 요청을 `{ modal, dispatch }`로 큐잉, `openHandler` 설정 시 큐를 flush하여 Promise 배선을 유지

## Boundaries

### Always do

- 키보드·포커스·inert·스크롤 자원은 매니저만 소유하고 해제와 reset에서 복원

- ModalManager의 static 인터페이스 유지
- `reset()`은 전체 상태를 초기화하고 스타일 관리자는 다음 적용 시 지연 생성
- 스타일 시트 정의 시 `compressCss` 적용
- 외부 소비자는 `@/promise-modal/app` entry point로 import

### Ask first

- 앵커 DOM 구조 변경 (tag, prefix 기본값)
- 스타일 스코핑 방식 변경

### Never do

- ModalManager를 인스턴스 기반으로 변경
- 전역 DOM 조작을 ModalManager 외부에서 수행
