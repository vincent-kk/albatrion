# Non-executing equality contract

## Requirements

인식기는 식 전체가 단일 참조와 string·유한 number·boolean·null 리터럴의 `===`, 그 비교들의 `||`, 괄호로만 이루어진 경우에 정적 증거를 반환합니다. 기존 식 언어와 정착 동작은 바꾸지 않습니다.

## API Contracts

- `recognizeEqualityExpression(source, dependencies)`는 형제 컴파일러의 공용 치환과 새 경로 관리자를 사용합니다. 얻은 경로가 정확히 하나이며 컴파일 결과와 원소별로 같아야 합니다. 반환값은 `literals` 순서를 보존하며 실패하면 undefined입니다.
- 스캐너는 정확한 `dependencies[0]`만 받고 프로퍼티·색인·호출·연쇄 비교·블록·임의 식별자·목록 포함을 거절합니다. 우선순위는 JavaScript와 같으며 괄호·논리합은 반복형 파서와 트리 순회로 처리합니다.
- 문자열은 명시된 단순 이스케이프, 뒤에 숫자가 없는 NUL, hex, Unicode와 코드 포인트만 받습니다. 줄 이음·옛 8진·식별 이스케이프·날 줄바꿈·U+2028·U+2029는 거절합니다. 수는 단항 음수, 십진 정수·소수·지수, hex·octal·binary만 받고 옛 8진·구분자·BigInt·비유한 값은 거절합니다.
- 문법 정본은 `/Users/Vincent/Workspace/albatrion/.seiri/tasks/decision-62-442/design.md` 2.1절입니다. 문자열 길이에 비례하는 시간·임시 토큰과 트리 공간이 들며 결과 리터럴 목록만 청사진에 남깁니다.

## Acceptance Criteria

### equality-evidence — 전체 식 증거와 실행 부재

- 허용·거절 꼴, 컴파일러와 같은 리터럴 의미, 의존 경로 일치, Function·eval 호출 부재를 검증합니다.

## Last Updated

2026-10-21 — 결정 62 (라) PR-1b.
