# 컨텍스트 비교가 `Symbol.toStringTag`만으로 내장 객체로 판정할 수 있습니다

- **종류** — 동작 결함 후보입니다. 소스 분석으로만 찾았고 실행해서 확인하지는 않았습니다. 속도 작업에서는 고치지 않았습니다.
- **내용** — `@canard/schema-form`의 컨텍스트 비교(`packages/canard/schema-form/src/providers/hooks/contextSnapshot/utils/areContextsEqual.ts:82–109`, 커밋 `d78e45c6b`)는 사용자 클래스가 `Symbol.toStringTag`로 `'Map'`을 내놓고 두 인스턴스의 `size` 읽기가 같으면, 실제 Map 슬롯이 없어도 `Map.prototype.entries.call(left)`에 도달할 수 있습니다.
- **예상 증상** — 그런 인스턴스를 `context`에 넣으면 비교 중 `TypeError`가 납니다. 바운티 원장의 R3-SF-7은 불투명 클래스 인스턴스를 참조로만 비교한다고 정하고 있어, 그 계약과 어긋납니다.
- **선택지** — (1) 실행으로 재현해 확정한 뒤 다음 바운티 라운드에서 다룹니다. (2) 태그를 위조한 객체는 지원 범위 밖으로 문서화합니다.
- **권고** — (1)입니다.
