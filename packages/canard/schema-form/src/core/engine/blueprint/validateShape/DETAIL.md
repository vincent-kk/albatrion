# validateShape contract

## Requirements

완료된 청사진 노드 그래프에서 무게이트 객체 순환과 무한 형상 확장을 검증한다.

## API Contracts

- 분석 문맥의 노드 그래프를 검증하며 배열 아이템, 게이트, 터미널에서 형상 확장을 절단한다. 무한 객체 형상은 작성 위치를 가진 정적 오류로 보고한다.

## Acceptance Criteria

### recursion — 유한 분석과 형상

- TEST-067의 스캐너 신호, 무한 형상 표본, 절단 표본을 통과하고, 참조가 많은 스키마의 분석 1회 비용을 기록한다. 정착 표본 (c′)는 후속 노드 엔진 단계에서 다룬다.

## Last Updated

정돈-3 blueprint 재구성(2026-10-15)
