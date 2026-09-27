# TEST-067 원본 코퍼스 수용 게이트 대조

기준 베이스는 `origin/1.0.0-beta`의 `85fa44d49`입니다. fetch와 rebase 뒤 루트와 verifier가 독립적으로 원장과 정본을 대조했습니다. 원장·계획서는 변경하지 않았습니다.

## 함께 만족할 수 없는 요구

- BLUEPRINT-039는 자기 type 없는 칸의 분기 형에 object·array가 있으면, 객체만·배열만인 경우도 UNKNOWN_JSON_SCHEMA로 정합니다.
- BLUEPRINT-045 E16은 type 없는 `oneOf: [{type:'object'}, {type:'object'}]`가 UNKNOWN_JSON_SCHEMA임을 직접 확인합니다. BLUEPRINT-044의 S3가 형 없는 칸을 먼저 다루고, S4의 object variant는 이미 object·array로 정해진 칸에 적용됩니다.
- TEST-067(b)는 기존 코퍼스 14종 모두가 설 것을 요구하고, (b) 실패는 소유자 보고 대상으로 명시합니다. 정본은 `reviews/round-18-closing.md:43–51`입니다.
- 이 정본의 근거인 `spikes/round11-corpus/REPORT.txt`는 `spikes/guard-cost/redteam3/corpus.mjs`를 사용하며, 원본에 지연 참조 Proxy만 붙인 pure 모드에서 14종 모두 예외 없이 빌드되었다고 설명합니다. 따라서 단순 스캐너 종료로 수용 게이트를 대신할 수 없습니다.

원본 14종 모두 형 없는 객체 분기 호스트를 포함합니다. 현재 구현은 모두 UNKNOWN_JSON_SCHEMA로 거절하며 E16과 일치합니다. 재귀 pydantic 표본도 루트와 배열 아이템의 형 없는 객체 분기에서 해당합니다. 스캐너는 원본 14종 모두 종료하고 참조 위치·순환 신호를 제공합니다. 이는 별도 `scanner-corpus.md`의 증거입니다.

## 확인한 해석과 한계

BLUEPRINT-037–039·044·045, LANDING-174, TEST-067 및 정본 출처를 대조했습니다. `object variant 호스트는 건드리지 않는다`는 문장만으로 E16을 무효화할 근거가 없으며, LANDING-174는 형 없는 원시 분기의 수용만 다룹니다. TEST-067을 위해 호스트 type을 자동 보충하거나 원본 코퍼스를 변형할 허용 근거도 찾지 못했습니다.

그러므로 구현은 BLUEPRINT-039/E16을 유지하고 TEST-067(b)를 미통과로 기록합니다. 소유자 판정은 (1) 현행 형 제한에 맞게 코퍼스 게이트를 정정하거나, (2) 형 없는 객체 분기 수용을 허용하도록 BLUEPRINT-039·045를 정정하는 것 중 하나가 필요합니다. 두 선택 모두 원장 정정이므로 이 개발 PR에서 임의로 수행하지 않습니다.

## 19라운드로 해소

위 판정은 당시 원장을 기준으로 한 역사적 기록입니다. 소유자가 `architecture/reviews/round-19-closing.md`의 19C-01·19C-02를 확정하고 BLUEPRINT-048·049·050·051, NODE-059, LANDING-207·208, TEST-079를 이 브랜치에서 고쳤습니다. 이제 형 없는 칸의 무게이트 분기를 U로 합친 뒤 F가 `{object}` 또는 `{array}`면 variant 호스트로 받아들이며, E16도 object variant 성공입니다. TEST-067(b)의 원본 14종 수용 요구는 그대로 유지됩니다. 실제 수용 여부는 19라운드 구현 후 원본 코퍼스 통합 재검증으로 판정합니다.
