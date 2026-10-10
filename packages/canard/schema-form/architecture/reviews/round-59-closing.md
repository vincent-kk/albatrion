# 59라운드 닫기 — 05의 원장 해석 하나: 같은 대상을 겨눈 서로 다른 출처의 주입 대상 없음·쓰기 모양 오류는 `details.sourcePath`로 가른다

2026-10-02. 05 작업자(세션 fixy01, PR #352)가 58C-01을 구현한 뒤(`14ae38a32`) 물었다: 서로 다른 출처 노드 둘의 `controls.injectTo`(또는 가상 노드 쓰기 모양)가 같은 없는 대상을 겨누면 두 오류가 하나로 중복 제거되던 결함을 고쳐 둘 다 남기게 했는데, 그러면 두 기록이 `details.path`(대상), `schemaPath`(공유 선언), 메시지까지 같아 구별할 수 없다. 출처 노드의 경로 `details.sourcePath`를 PR-4에서 더할지, 모양을 두고 미룰지 물었다. 06의 배열에서는 아이템마다 같은 없는 조상 경로에 주입하는 일이 흔해진다. ERROR-017·005와 ERROR-195에서 유도되므로 편집자 결정으로 닫는다. 소유자에게 물을 것은 없다.

### 59C-01 `INJECT_TARGET_MISSING`과 가상 노드 쓰기 모양 오류(가칭 `INVALID_VIRTUAL_NODE_VALUES`)의 `details`에 출처 노드의 데이터 경로 `sourcePath`를 더한다 — `path`는 사건이 묶인 노드(대상)로 두고, 출처는 `details`가 든다; 덧붙이는 변경이라 PR-4에서 한다

- 닫는 항목: ERROR-017(보충), ERROR-005(보충), ERROR-195(보충)
- 결정:
  - 【추론】 ERROR-017은 `path`를 "데이터 경로이며 노드에 묶인 사건에만 있다"로, `details`를 오류의 세부(`error.details`와 같은 참조)로 두었고 ERROR-005는 둘 이상의 오류를 발생 순서대로 `details.errors`에 담게 했으므로, 같은 대상을 겨눈 다른 출처의 오류 둘이 묶음 안에서 같은 모양으로 보이는 것은 묶음의 쓸모(어느 선언이 잘못되었는지 찾기)를 깎는다; 그래서 자동 쓰기가 대상에서 실패하는 두 오류 — `INJECT_TARGET_MISSING`(동적 대상 없음, `cause` `'injectTarget'`)과 자동 쓰기의 가상 노드 쓰기 모양 오류(가칭 `INVALID_VIRTUAL_NODE_VALUES`, `cause` 가칭 `'writeShape'`) — 의 `details`에 출처 노드의 데이터 경로 `sourcePath`(쓰기를 낸 `controls.injectTo` 선언의 노드)를 더한다. `path`는 지금처럼 사건이 묶인 대상 노드의 경로로 두어 ERROR-017의 뜻을 지키고, ERROR-195가 적은 `details`(기대 길이, 받은 값)는 그대로 남는다; 호출자 경로의 쓰기 모양 오류(42C-02)는 출처가 호출자라 `sourcePath`가 없다. 덧붙이는 변경이고 두 코드는 PR-4의 오류 라우팅 범위라 05가 PR-4에서 하며, 중복 제거를 없앤 수정(같은 대상에 대한 출처별 오류를 모두 남김)은 58C-01의 "모두 모아"에 든다.
- 근거: ERROR-017 "`path`: 데이터 경로(JSON Pointer)이며, 노드에 묶인 사건에만 있다.", "`details`: 오류면 `error.details`와 같은 참조이고, 경고면 경고의 세부다."; ERROR-005 "둘 이상이면 … 발생 순서대로 `details.errors`에 담는다."; ERROR-195 "기록에는 `path`와 `details`(기대 길이, 받은 값)를 싣는다.", "자동 쓰기(`controls.injectTo` 등)에서 오면 정착 오류다."; ERROR-133(`cause`의 값, `'injectTarget'`은 동적 대상 없음); 58C-01(`reviews/round-58-closing.md:9`); 05 verifier 보고(같은 없는 대상을 겨눈 출처 둘의 중복 제거).
