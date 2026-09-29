# ADR 0014 — 오류는 삼키지 않는다: 오류·경고·검증 결과의 세 층

## 상태

| 항목 | 닫은 사람 | 라운드 |
| --- | --- | --- |
| ERROR-001 | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:32`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:34`) | 17 |
| ERROR-002 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-003 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-004 | 편집자 결정(ADR 0008 원리 도출) | 17 |
| ERROR-005 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-007 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-008 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-012 | 17라운드 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md`) | 17 |
| ERROR-013 | 17라운드 스웜 수렴(편집자 결정), 게이트 R17G-1–R17G-11 고침 | 17 |
| ERROR-014 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-016 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-017 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-019 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-020 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-021 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-022 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-023 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-024 | 17라운드 스웜 수렴(편집자 결정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| ERROR-025 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-026 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-028 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-029 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-030 | 17라운드 스웜 수렴(편집자 결정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| ERROR-031 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-032 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-039 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-040 | 17라운드 스웜 수렴(편집자 결정), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-101) | 18 |
| ERROR-041 | 17라운드 스웜 수렴(편집자 결정) | 17 |
| ERROR-042 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-045 | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:307,308,311,313,317,318`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:310`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `adr/0014-error-policy.md:317`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:312`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:314`) | 17 |
| ERROR-046 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| ERROR-070 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; 공유 충돌) | 17 |
| ERROR-071 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:82,89,93` E-frame·E9·E13, 14라운드 O-5 위임 `reviews/round-14-owner-answers.md:11`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 되먹임·중첩 초과, 검증 불가) | 17 |
| ERROR-072 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-073 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-074 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12) | 17 |
| ERROR-075 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90,92` E10·E12) | 17 |
| ERROR-076 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:90` E10) | 17 |
| ERROR-077 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-078 | 소유자 답(`reviews/round-14-owner-answers.md:16` O-10) | 14 |
| ERROR-079 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-080 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-081 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-082 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-083 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-084 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:87` E6) | 17 |
| ERROR-085 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-086 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-087 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-088 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) | 17 |
| ERROR-089 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-090 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-091 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-092 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:88` E8) | 17 |
| ERROR-093 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:57`; 핸들러 예외) | 17 |
| ERROR-094 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) | 17 |
| ERROR-095 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) | 17 |
| ERROR-096 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) | 17 |
| ERROR-097 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) | 17 |
| ERROR-098 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸) | 17 |
| ERROR-099 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 앞 절), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:93` E13; 뒤 절) | 17 |
| ERROR-100 | 스웜 수렴(편집자 결정, `reviews/round-17-owner-answers.md:15` 반영 칸), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `VALIDATOR_BIND_REFUSED`) | 18 |
| ERROR-101 | 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4) | 17 |
| ERROR-102 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-103 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-104 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-105 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-106 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-107 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-108 | 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) | 17 |
| ERROR-109 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:47`) | 17 |
| ERROR-110 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-111 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-112 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-113 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-114 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-115 | 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-116 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-117 | 스웜 수렴(편집자 결정, `reviews/raw-round17-onerror.md:56`) | 17 |
| ERROR-118 | 소유자 답(`reviews/round-17-owner-answers.md:34` (나)) | 17 |
| ERROR-119 | 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:34` 반영 칸) | 17 |
| ERROR-120 | 편집자 결정(17라운드, `adr/0014-error-policy.md:188`) | 17 |
| ERROR-121 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-122 | 편집자 결정(17라운드, `adr/0014-error-policy.md:188`) | 17 |
| ERROR-124 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14) | 18 |
| ERROR-125 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`) | 17 |
| ERROR-126 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-127 | 편집자 결정(17라운드, `adr/0014-error-policy.md:197`) | 17 |
| ERROR-128 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) | 17 |
| ERROR-129 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| ERROR-130 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `status` 두 값·`cause`·`commit`), 소유자 답(`reviews/round-14-owner-answers.md:8` O-2; `commit`), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21) | 18 |
| ERROR-131 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) | 17 |
| ERROR-132 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21) | 18 |
| ERROR-133 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; 원인 넷), 편집자 결정(17라운드, `adr/0014-error-policy.md:201`; 값 이름), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01·18C-21) | 18 |
| ERROR-134 | 편집자 결정(17라운드, `adr/0014-error-policy.md:201`) | 17 |
| ERROR-135 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |
| ERROR-136 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2) | 14 |
| ERROR-137 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-138 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-139 | 편집자 결정(17라운드, `adr/0014-error-policy.md:203`) | 17 |
| ERROR-140 | 편집자 결정(17라운드, `adr/0014-error-policy.md:203`) | 17 |
| ERROR-141 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1) | 17 |
| ERROR-142 | 편집자 결정(17라운드, `adr/0014-error-policy.md:205-207`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-01; `exceededBudget`에 `recursion` 추가) | 18 |
| ERROR-143 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) | 14 |
| ERROR-144 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) | 17 |
| ERROR-145 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) | 17 |
| ERROR-146 | 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3) | 17 |
| ERROR-147 | 소유자 답(`reviews/round-17-owner-answers.md:33` (가)) | 17 |
| ERROR-148 | 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`) | 17 |
| ERROR-149 | 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`) | 17 |
| ERROR-150 | 편집자 결정(17라운드, `reviews/round-17-owner-answers.md:14` 반영 칸) | 17 |
| ERROR-151 | 편집자 결정(17라운드, `adr/0014-error-policy.md:213`) | 17 |
| ERROR-152 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4) | 17 |
| ERROR-153 | 소유자 답(`adr/0004-validator-plugin-compile-guard.md:54`), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4) | 17 |
| ERROR-154 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:85` E4), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; 트리마다 한 번) | 17 |
| ERROR-155 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3; 한 로드에 오류 객체 하나, `onError`·싱크 한 번) | 17 |
| ERROR-156 | 스웜 수렴(편집자 결정, `reviews/raw-round17-convergence.md:84` E3) | 17 |
| ERROR-157 | 편집자 결정(17라운드, `adr/0014-error-policy.md:215`) | 17 |
| ERROR-158 | 편집자 결정(17라운드, `adr/0014-error-policy.md:215`) | 17 |
| ERROR-159 | 편집자 결정(17라운드, ADR 0014 4판 채택), 소유자 답 O-1(`reviews/round-14-owner-answers.md:7`)·O-10(`reviews/round-14-owner-answers.md:16`), 소유자 답 C-20(`reviews/round-10-owner-answers.md:17`)·13라운드 답 4(`reviews/round-13-owner-answers.md:10`), 소유자 답 E-23·E-19(`reviews/round-10-owner-answers.md:38,40`), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:229,231,234,237,239`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:230`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:238`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:240,242`), 게이트 고침(R17G-2, `reviews/raw-round17-onerror.md:150`; `adr/0014-error-policy.md:238`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-03·18C-14·18C-23) | 18 |
| ERROR-160 | 원리(`03-mental-model.md:17` P5) | 17 |
| ERROR-161 | 소유자 답(`reviews/round-14-owner-answers.md:7` O-1) | 14 |
| ERROR-162 | 편집자 결정(17라운드, `adr/0014-error-policy.md:244`) | 17 |
| ERROR-163 | 편집자 결정(17라운드, `adr/0014-error-policy.md:244`) | 17 |
| ERROR-164 | 편집자 결정(17라운드, ADR 0014 4판 채택), 게이트 고침(R17G-9·R17G-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1; `adr/0014-error-policy.md:263,266,267-271,279,281`), 소유자 답(`reviews/round-14-owner-answers.md:7` O-1; `adr/0014-error-policy.md:260`), 소유자 답(`reviews/round-14-owner-answers.md:16` O-10; `adr/0014-error-policy.md:261,266`), 소유자 답(`reviews/round-12-owner-answers.md:14` 6 `else: false` 경고; `adr/0014-error-policy.md:290`), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3; `adr/0014-error-policy.md:281,293`), 소유자 답(`reviews/round-17-owner-answers.md:33` (가); `adr/0014-error-policy.md:293`), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4; `adr/0014-error-policy.md:296`), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3; `adr/0014-error-policy.md:295`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14·18C-21·18C-24), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-90·18C-91·18C-92), 소유자 답(`reviews/round-18-owner-answers.md:34` union O4; `VALIDATOR_BIND_REFUSED` 행), 소유자 답(`reviews/round-18-owner-answers.md:37` union O7·O8), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98), 소유자 답(`reviews/round-18-owner-answers.md:41` 설계서 메모 4) | 18 |
| ERROR-166 | 소유자 답(`reviews/round-10-owner-answers.md:13` B-1) | 10 |
| ERROR-167 | 소유자 답(`reviews/round-14-owner-answers.md:10` O-4, `reviews/round-14-owner-answers.md:16` O-10, `reviews/round-14-owner-answers.md:8` O-2) | 14 |
| ERROR-168 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1, `reviews/round-17-owner-answers.md:14` 통보 3, `reviews/round-17-owner-answers.md:15` 통보 4, `reviews/round-17-owner-answers.md:33` (가), `reviews/round-17-owner-answers.md:34` (나)) | 17 |
| ERROR-169 | 스웜 수렴(편집자 결정, `adr/0014-error-policy.md:328`) | 17 |
| ERROR-170 | 편집자 결정(17라운드, `adr/0014-error-policy.md:329`) | 17 |
| ERROR-185 | 원리(`00-goals.md:105` C2 작성자 실수의 가시성, 소유자 채택 `reviews/round-2.md:112`), 편집자 결정(ADR 0011 4차 본문, `adr/0011-branch-node-composition.md:12`), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-73·18C-38) | 18 |
| EVENT-017 | 편집자 결정(14라운드 O-5 위임, `reviews/round-14-owner-answers.md:11`), 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| EVENT-034 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| EVENT-058 | 편집자 결정(17라운드, ADR 0014 4판 채택) | 17 |
| LANDING-024 | 편집자 결정(14라운드, `08-design-a-to-z.md:453`) | 14 |
| LANDING-025 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:14` 통보 3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 17라운드 스웜 수렴(편집자 결정, `08-design-a-to-z.md:454`) | 17 |
| LANDING-061 | 편집자 결정(16라운드, 답 10으로 확정 `reviews/round-16-owner-answers.md:16`), 소유자 답(`reviews/round-14-owner-answers.md:17` O-11 `merge` 선택 인자), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:12` 통보 1), 17라운드 스웜 수렴(편집자 결정, 터미널 전략·병합의 원자·데이터화), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-02·18C-08·18C-49), 소유자 답(`reviews/round-18-owner-answers.md:44` 개발계획 P3·P4), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-14; 정적 `injectTo` 오류 없음) | 18 |
| LANDING-064 | 소유자 답(`reviews/round-16-owner-answers.md:9` 3 배달 경로), 소유자 답(`reviews/round-16-owner-answers.md:16` 10 가드 캐시와 등록의 소유), 16라운드 스웜 수렴(편집자 결정, 재생성 reset의 같은 `$id`), 17라운드 스웜 수렴(편집자 결정, `onError` core 쪽과 가드 컴파일), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) | 18 |
| LANDING-067 | 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 소유자 답(`reviews/round-17-owner-answers.md:11` R17-3), 소유자 답(`reviews/round-17-owner-answers.md:15` 통보 4), 소유자 답(`reviews/round-17-owner-answers.md:22` `group`의 이름), 소유자 답(`reviews/round-17-owner-answers.md:34` (나)), 소유자 답(`reviews/round-16-owner-answers.md:11,13` 5·7), 16라운드 스웜 수렴(편집자 결정, reset·로드·`setValue(V)`), 17라운드 스웜 수렴(편집자 결정, 바운더리·마운트 계약), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-49), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-94), 소유자 답(`reviews/round-18-owner-answers.md:43` 개발계획 P2), 소유자 답(`reviews/round-18-owner-answers.md:42` 개발계획 P1) | 18 |
| REACT-007 | 편집자 결정(16라운드, `reviews/round-16-owner-review.md:33` 새로 정함), 17라운드 스웜 수렴(편집자 결정, `09-landing-and-test-strategy.md:48`) | 17 |
| REACT-013 | 편집자 결정(16라운드, `09-landing-and-test-strategy.md:54`) | 16 |
| VALIDATE-040 | 소유자 답(`reviews/round-14-owner-answers.md:13` O-7) | 14 |
| VALUE-003 | 소유자 답(`reviews/round-14-owner-answers.md:8` O-2), 소유자 답(`reviews/round-17-owner-answers.md:9` R17-1), 편집자 결정(18라운드, `reviews/round-18-closing.md` 18C-98) | 18 |

## 결정

### 02-node-and-value.md §2.1 노드 트리가 곧 상태, 노드가 드는 칸

**1. 별도의 데이터 모델을 두지 않는다(VALUE-001). 노드 트리가 곧 상태다(VALUE-001).**

소유자 답: "중앙에 값을 두는 걸 허용. 단, 데이터모델을 따로 두는 건 안 돼. react 파이버처럼 node가 동작하도록 했으면 해. 최적화와 라이프사이클 관점에서의 단일화는 동의해."(VALUE-001)

**2. 노드가 드는 칸은 열하나이고, 그 가운데 상태는 둘뿐이다(VALUE-002, WRITE-054).**

(VALUE-002, VALUE-003, VALUE-030, VALUE-037, WRITE-054, SURFACE-061)

| 칸 | 종류 | 내용 |
| -- | ---- | ---- |
| `raw` | 상태 | 원본. 리프와 터미널 노드가 값을 든다. 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다 |
| `extras` | 상태 | 호스트가 받은, 어떤 조각에도 선언되지 않은 키와 값, 그리고 그 순서(E16). 순서는 받은 순서이며 ECMAScript own-key 순서를 따른다 |
| `active` | 계산 | 이번 커밋의 활성 조각·노드 집합 |
| `local` | 계산 | 활성 자식 `emit`의 합성 — 투영 전 |
| `emit` | 계산 | `local`의 투영 |
| `schema` | 계산(메모) | 노드의 유효 스키마 — 켜진 조각을 병합한 것 |
| 재계산 목록 | 작업 | 이번 정착에서 다시 계산할 자식의 목록. 상호작용 상태 `dirty`와 다른 것이다 |
| `revision` | 원장 | 통지 원장. 커밋 때 일괄 갱신한다(F16) |
| 커밋 번호 | 원장 | 검증 결과의 스탬프. 오래된 결과를 버린다(F28) |
| `diagnostics` | 작업 | 마지막 로드 이후의 작업 기록(ERROR-130. 지속은 14라운드 답 O-2 가). `status`는 `'stable'` 또는 `'degraded'`이고 `cause`를 든다. `degraded` 동안 폼의 제출 경로가 거부한다(17라운드 소유자 답 R17-1 나). 루트에서 관측한다 |
| 경고등(`typeMismatch`) | 계산 | 원본과 노드의 현재 spec(게이트가 켜진 동안의 유효 목록)만의 함수, 공개 형의 판별자 |

**상태는 `raw`와 `extras` 둘뿐이다**(원리 P3(형상은 상태의 순수 함수다), VALUE-002). 나머지는 상태에서 계산되거나 작업의 기록이다(VALUE-002). "노드 트리가 곧 상태"는 이 둘을 노드가 소유한다는 뜻이다(VALUE-002). 폼은 `oneOf`·`anyOf`로 분기를 고르지 않으므로(원리 P1′(폼이 스키마에서 읽는 것은 노드 트리의 모양을 정하는 문법뿐)) 수동 분기 선택을 담을 칸이 없다(VALUE-002).

`extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(VALUE-002). `if` 안에만 적힌 키는 선언이 아니므로 `extras`다(VALUE-002). `extras`는 호스트가 받은, 청사진 어디에도 선언되지 않은 키와 그 순서다(정적. if 안에만 적힌 키도 여기, VALUE-002). 조각이 선언한 키는 그 조각이 모두 꺼지면 잠복 원본이며 게이트도 검증기도 보지 않는다(원리 P1(판정은 검증기의 것이다)·원리 P4(방출은 정책이다), 14라운드, VALUE-002). `schema`는 같은 조각 집합이면 같은 참조다(VALUE-002). 【추론】 경고등은 VALUE-002의 분류로 '계산' 칸이다(VALUE-002). 【추론】 배열 호스트의 `extras`는 아이템 청사진이 없는 자리의 값이다(VALUE-002). 【추론】 자리 순서로 들고, 선언된 아이템 뒤에 방출한다(VALUE-002).

`diagnostics`는 마지막 로드 이후의 기록('stable' 또는 'degraded', cause(예산·식·대상·공유 충돌), exceededBudget, iterations, commit)이고, 다음 로드까지 남고 그 동안 제출 경로가 거부하며, 작업의 기록으로 루트에서 관측한다(VALUE-003, ERROR-130). 【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(VALUE-003, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(VALUE-003, ERROR-204).

**상호작용 상태** `dirty`·`touched`는 현행 유지다(목표 후보 C6(편집 중 상태의 보존과 격리), VALUE-022, GOAL-019).

**3. 저장되는 값은 자식 노드가 없는 노드에만 있다** — 터미널 타입(string·number·boolean·null)과 터미널 전략의 object·array. 자식 노드가 있는 노드의 값은 자식들로부터 계산되어 **그 노드에 메모된다**(VALUE-004). 자식이 있는 노드는 잘못된 종류의 값(`null`, `17`)이 왔을 때만 든다(VALUE-004).

**4. 노출 표면은 전략과 무관하게 같다(VALUE-005).** `value`, `setValue`, 구독, 이벤트는 자식 노드의 유무에 따라 달라지지 않는다(VALUE-005). 경로 조회도 같다(VALUE-005).

그 결과 레벨마다의 사본, `__draft__`/`__composed__`의 지연 합성, 상향 콜백 그래프, 역류 방지 잠금이 필요 없어진다(VALUE-016).

버린 대안은 다음 셋이며, 어느 것도 택하지 않는다(VALUE-023).

- **1차안 — 루트가 소유하는 JSON 값 트리, 노드는 뷰.**(VALUE-023) 적대적 검토 R12로 기각(VALUE-023).
- **루트가 소유하는 셀 테이블 + 필요할 때 만드는 손잡이 노드.**(VALUE-023) 소유자가 별도의 데이터 모델을 거부했다(VALUE-023). 큰 배열에서 노드 생성을 늦추는 최적화는 이 결정 안에서도 가능하다 — 자식 노드가 실체화되기 전까지 array 노드가 터미널처럼 값을 직접 든다(VALUE-023). 필요 여부는 벤치마크로 정한다(NODE-053, VALUE-023).
- **노드별 소유를 유지하고 사본 동기화를 고친다.**(VALUE-023) 복잡함의 원인이 남는다(VALUE-023).

### 03-settle-and-events.md §2.4 예산 초과와 진단

**예산은 다섯이며 서로 다른 것을 센다**(EVENT-020). 이름은 EVENT-043의 `exceededBudget` 값이며, 17라운드에 정착의 세 예산만 남겼다(ERROR-130)(EVENT-020). 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다(EVENT-020, ERROR-190). 재귀 펼침의 멈춤이 예산 부류의 정착 오류로 더해져 `exceededBudget` 값은 정착 예산 셋에 (가칭) `'recursion'`을 더한 넷이다(EVENT-020, ERROR-190).

(EVENT-020)

| 예산 | 세는 것 | 상한 | `exceededBudget` |
| ---- | ------- | ---- | ---------------- |
| 호스트 바퀴 | 조각 집합이 안 바뀔 때까지 게이트를 다시 평가하는 횟수 | 게이트 가진 조각 수 + 노드 게이트 수 + 1 | `hostWheel` |
| 파생 라운드 | `controls.derived`·`controls.injectTo`·`controls.unsetValue`의 적용 라운드 | 25 | `derive` |
| 전이 라운드 | 생긴 노드에 채움을 넣고, 나감 정책이 참으로 정해진 나간 노드를 비우고 다시 도는 라운드 | SETTLE-005가 소유한다 | `transition` |
| 리스너 되먹임 파동 | 최외곽 진입의 사슬에서 되먹임이 낸 파동(EVENT-008) | 25 | 없음(`diagnostics`에 남기지 않는다) |
| `onChange` 중첩 | `onChange` 안의 쓰기가 연 새 진입의 중첩(EVENT-033, EVENT-034) | 25 | 없음(`diagnostics`에 남기지 않는다) |

5차의 이름 항목(`transitionDefaults`를 `nodeCreationDefaults`로 바꿀지, SURFACE-007)은 ERROR-130이 값을 `'transition'`으로 적어 닫혔다(EVENT-058). **`exceededBudget`의 `transitionDefaults` 이름** — 닫힘(EVENT-058). ERROR-130이 값을 `'hostWheel'`·`'derive'`·`'transition'` 셋으로 적었다(EVENT-043)(EVENT-058).

어느 예산을 넘겨도 그 진입은 개발 모드와 프로덕션 모두 **커밋 → 검증 요청 → `onChange`** 순서로 진행한다(EVENT-021). 예외는 `onChange` 중첩 예산 하나로, 넘긴 그 `onChange`만 부르지 않는다(EVENT-021, EVENT-034). 정착의 예산(호스트 바퀴·파생·전이)을 넘기면 그 정착의 자동 쓰기를 모두 뺀 원본 B를 커밋하고(SETTLE-011), 리스너 되먹임 예산을 넘기면 거부된 되먹임 없이 커밋이 이어진다(EVENT-021).

throw가 그 진입의 `onChange`와 검증 요청을 건너뛰게 하지 않는다 — D-10이 없앤 것이 바로 개발 모드와 프로덕션의 관측 차이였다(EVENT-022). 6라운드 검증 #11의 처방은 기각이다(EVENT-022, PROCESS-048).

소유자(4라운드 D-10): "**(c) 한 수정에 정확히 한 번.**"(EVENT-022).

예산 초과를 비롯한 정착의 결과 상태는 한 칸, 한 이벤트, 한 속성으로 관측한다(EVENT-043). `onChange`에 싣지 않는다 — emit 참조가 바뀌지 않은 쓰기는 `onChange`를 내지 않으므로 예산 초과가 보이지 않기 때문이다(목표 C2(작성자 실수의 가시성), EVENT-043, GOAL-015).

(EVENT-043, EVENT-044)

| 자리 | 이름 |
| ---- | ---- |
| 이벤트 | `UpdateDiagnostics` — `diagnostics`가 바뀐 커밋에만 낸다(EVENT-043) |
| Form 속성 | `onDiagnosticsChange` — 호스트가 진단 상태를 관측하는 자리(EVENT-044). 제출 거부는 `<Form>`이 한다(EVENT-044) |
| Form 속성 | `onError` — 원인 오류의 기록을 받는 관찰자(ERROR-001). 끄는 스위치 `throwOnBudgetExceeded`는 없다 |

삼중 짝은 `state` / `UpdateState` / `onStateChange`와 같은 모양이다(EVENT-043). 4차 본문에 흩어져 있던 리터럴 셋(`budget-exceeded`, `wave-cap-exceeded`, `onchange-cap-exceeded`)과 칸 이름 `settle`이 이 한 모양으로 모인다(원리 제안 P7(예산은 한 칸에 같은 모양으로 관측된다), EVENT-043, GOAL-083). 리터럴은 코드 관례대로 camelCase다(EVENT-043).

### 03-settle-and-events.md §2.6 배치의 경계와 값 읽기

`batch(fn)`은 fn 안의 쓰기를 표시만 하고, fn이 끝날 때 정착 한 번·파동 한 번을 낸다(EVENT-013).

**배치는 정착 횟수를 바꾸므로 값이 순차 호출과 다를 수 있다**(EVENT-019). 정착이 출발할 때 예약 층 규칙의 에지 기준점은 직전 커밋이고, 채움은 노드가 생길 때 한 번이다(EVENT-019). 그래서 순차 호출에서 첫 정착이 커밋한 값은 뒤 정착이 덮지 않지만, `batch`로 묶으면 정착이 한 번이라 중간 상태가 커밋되지 않는다(EVENT-019). 반례 E2: 분기 A는 `x`에 `default` `'A'`, 분기 B는 `'B'`일 때, `kind`를 `a`로 쓴 뒤 `b`로 쓰면 순차는 `x = 'A'`, 같은 두 쓰기를 `batch`로 묶으면 `x = 'B'`다(노드 단위 채움에서도 같다, 실행)(EVENT-019). 채움과 `controls.injectTo`의 결과가 이렇게 갈리는 것은 결함이 아니라 축의 귀결이며, `batch`의 문서 주석에 "배치는 정착 횟수를 바꾸므로 채움과 `controls.injectTo`의 결과가 순차 호출과 다를 수 있다"를 적는다(EVENT-019). 같게 만드는 길은 셋(배치 안에서도 쓰기마다 정착, 원본마다 출처 기록, 통지된 값의 철회)이고 모두 목표 G7(반응의 척추를 보존한다)·원리 P3(형상은 상태의 순수 함수다)·원리 P2(원본은 호출자와 작성자만 쓴다)와 부딪친다(EVENT-019, GOAL-012, GOAL-029, GOAL-028).

【추론】 `batch(fn)` 안에서 updater는 이어진다(EVENT-061). 【추론】 같은 노드에 `setValue(p => p + 1)`을 두 번 부르면 2가 더해진다(EVENT-061). 【추론】 updater 꼴이 호출자에게 기대하게 하는 결과다(EVENT-061). 【추론】 updater의 `prev`는 직전 커밋에, 이 배치에서 앞서 표시된 쓰기 가운데 그 노드의 서브트리에 닿은 것을 순서대로 얹은 값이다(EVENT-061). 【추론】 잎의 `prev`는 이 배치에서 그 노드에 마지막으로 표시된 원본(`interpret`를 지난 값)이다(EVENT-061). 【추론】 표시가 없으면 직전 커밋이다(EVENT-061). 【추론】 가지의 `prev`는 커밋된 값에 그 서브트리의 표시들을 경로별로 덮어 얹은 값이다(EVENT-061). 【추론】 정착의 의미는 적용하지 않는다(EVENT-061). 【추론】 채움, `derived`, 투영은 `prev`에 들지 않고, `fn`이 끝난 뒤 정착에서 한 번 적용된다(EVENT-061). 【추론】 updater는 부른 자리에서, 그 쓰기를 표시하는 동안 실행된다(EVENT-061). 【추론】 정착 때 실행하지 않는다(EVENT-061). 【추론】 updater가 던지면 그것은 `fn`의 예외다(EVENT-061). 【추론】 ERROR-004의 진입 규칙대로 모아 두었다가 사슬 머리가 끝날 때 던진다(EVENT-061, ERROR-004). 【추론】 정착 오류가 되지 않는다(EVENT-061). 【추론】 `fn` 안의 평범한 읽기(`value`, `outputValue`, `inactiveValues`, `FormHandle.getValue()`)는 여전히 직전 커밋을 돌려준다(EVENT-061). 【추론】 읽기는 계산하지 않기 때문이다(EVENT-061, VALUE-013). 【추론】 가지의 덮어 얹기는 updater라는 쓰기의 일부이며 읽기가 아니다(EVENT-061). 【추론】 `batch` 밖에서는 두 규칙이 겹친다(EVENT-061). 【추론】 쓰기마다 정착하므로 `prev`는 직전 커밋, 곧 `value`다(EVENT-061). 【추론】 그래서 SURFACE-031의 "`prev`는 `value`다"는 `batch` 밖에서 그대로 맞고, `batch(fn)` 안에서는 이 블록의 규칙이 이긴다(EVENT-061, SURFACE-031). 【추론】 `fn` 안에서 `reset`을 부르면 그 로드는 호출 안에서 곧바로 정착하고, 앞서 표시된 쓰기를 덮는다(EVENT-061, EVENT-015). 【추론】 그래서 그 뒤의 읽기와 updater의 기준은 reset의 커밋이다(EVENT-061). 【추론】 비용은 `batch` 안에서 updater를 부를 때만 든다(EVENT-061). 【추론】 잎은 원본 하나를 읽는다(EVENT-061). 【추론】 가지는 그 서브트리에 앞서 표시된 경로 수에 비례하는 조립이 든다(EVENT-061). 【추론】 평범한 읽기와 `batch` 밖의 쓰기에는 새 비용이 없다(EVENT-061). 【추론】 `batch` 문서 주석에 다음을 적는다: "fn 안의 쓰기는 표시만 되고 fn이 끝날 때 한 번 정착한다. fn 안의 updater `setValue(prev => …)`는 부른 자리에서 실행되고, 앞선 쓰기를 반영한 `prev`를 받아 이어진다(같은 노드에 +1을 두 번 하면 +2). updater가 던지면 fn의 예외로 다뤄진다. 그 밖의 읽기(`value`·`outputValue`·`inactiveValues`·`getValue()`)는 직전 커밋을 돌려준다. 채움·`derived`·투영은 정착에서 적용되므로 `prev`에 들지 않는다. 채움과 `injectTo` 때문에 배치의 결과는 순차 호출과 다를 수 있다."(EVENT-061).

중첩 `batch`는 가장 바깥이 이긴다(EVENT-014).

`fn` 안의 `reset`은 경로와 무관하게 그 로드를 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮고, 재생성 경로에서는 새 루트를 세우는 정착이다)(EVENT-015). `fn`의 나머지 쓰기 묶음은 그대로 끝에서 정착 한 번이며, `reset`의 커밋은 따로 파동을 내지 않고 `fn` 끝의 파동 한 번에 합류하며(두 커밋에서 바뀐 노드의 payload는 EVENT-024의 체인을 따른다. 리스너 안의 `reset`은 EVENT-008대로 다음 파동에 든다), 검증 요청과 `onChange`는 바깥 최외곽 진입의 끝에서 낸다(EVENT-030, 16라운드 스웜 수렴(편집자 결정))(EVENT-015, EVENT-024, EVENT-008). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-015).

`batch(fn)`·`onChange`·리스너 안의 reset은 경로와 무관하게 그 로드를 호출 안에서 곧바로 정착한다(로드는 새 수명이라 앞서 표시된 쓰기를 덮는다)(EVENT-015).

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `batch` 안의 로드를 곧바로 정착하는 규칙(EVENT-015)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072). 【추론】 `VALIDATOR_COMPILE_FAILED`는 폼 수준 기록이다(WRITE-099, EVENT-072). 【추론】 그 기록은 폼 수준 로드(마운트, `FormHandle.reset()`)마다 한 번 내고, `resetSubtree()`는 그 기록을 다시 내지도 초기화하지도 않으며, 그 기록이 막은 `OnChange` 검증 예약은 다음 폼 수준 로드까지 막힌 채다(EVENT-072, WRITE-099). 【추론】 "로드마다 다시 만든다"(VALUE-030)는 `resetSubtree()`에는 그 하위 트리에만 적용한다(EVENT-072).

PR: PR-2(정착)·PR-4(검증)(EVENT-072).
무엇: `OnChange` 폼에서 `batch` 안과 밖에서 `resetSubtree()`를 부르고, 정착 시점, 검증 요청 수, 검증 불가 기록, 경고등 경로 집합을 본다(EVENT-072).
통과: 로드 규칙이 그 하위 트리에만 적용되고, 하위 트리 밖의 기록과 경로는 그대로다(EVENT-072, WRITE-099).
실패: 이 블록을 고친다(EVENT-072).

리스너 안의 `batch`는 바깥 배치의 표시 구간이 이미 끝난 뒤이므로 **자기 배치**다 — 자기 정착 한 번과 파동 한 번을 낸다(EVENT-016). 진입으로는 새 진입이 아니다(EVENT-016). 리스너 안이므로 진입 깊이는 2 이상이고, 그 쓰기는 EVENT-008의 리스너 되먹임으로 세어진다(EVENT-016, EVENT-008).

`batch`의 fn이 throw하면 표시된 쓰기는 정착·통지되고, 그 예외는 모아 두었다가 사슬 머리의 끝에서 던진다(안쪽 `batch`는 정상 반환한다, ERROR-004)(EVENT-017).

### 03-settle-and-events.md §2.8 변경 알림과 이펙트

소유자 결정(2026-09-22, `reviews/round-4.md` §4): 디바운스의 목적은 파동이 여러 번 돌아도 `onChange`가 한 번만 불리고 비동기 검증기가 한 번만 요청되게 하는 것이었으며, 그 때문에 dev React와 prod React의 라이프사이클이 어긋나는 문제가 있었다(EVENT-026). 새 설계의 `onChange`는 **최외곽 동기 진입당 1회**, 그 진입의 마지막 파동 뒤에 최종 emit으로 부른다(EVENT-026). 디바운스는 없다(EVENT-026). 현재의 `afterMicrotask`(이름과 달리 매크로태스크 디바운스, 제약 T-9(루트 `onChange`와 OnChange 검증은 매크로태스크로 디바운스된다))는 사라지고 `useEffect`와의 경합도 사라진다(EVENT-026, GOAL-060). F31이 F22를 대체한다(EVENT-026).

`onChange` 안의 쓰기는 깊이 0에서 시작하므로 **새 진입**이다(EVENT-033). 중첩 상한은 25이며, 26번째는 쓰기를 적용하고 검증도 요청하되 `onChange`를 건너뛰고 모든 환경에서 사슬 끝에서 throw한다(17라운드 소유자 답 R17-1 나)(EVENT-034).

`spikes/events/entry.spike.test.tsx`(React 19 + jsdom, 7/7 통과)가 확정한 사실이다(EVENT-036). 컴포넌트가 이펙트에서 파생 값을 쓰면 키 입력 하나가 **진입 2·`onChange` 2·검증 2·React 커밋 2**를 낸다(EVENT-036). 레이아웃 이펙트든 패시브 이펙트든 같다 — React 19는 이산 이벤트 렌더의 패시브 이펙트를 커밋 끝에서 동기로 flush한다(EVENT-036). 이펙트가 돌 때 진입 깊이는 이미 0이므로, **어떤 스택 기반 진입 정의로도 합칠 수 없다**(EVENT-036).

core가 풀 문제가 아니라 **문서화 대상**이다(EVENT-036). 파생 값은 React 이펙트가 아니라 스키마 예약 층의 `controls.derived`(자기 값)·`controls.injectTo`(다른 노드의 값)로 쓰고, 값을 지우는 것은 `controls.unsetValue`로 하거나, 스토어 리스너로 쓴다 — 같은 스파이크의 스토어 리스너 변형은 진입 1·`onChange` 1·검증 1·커밋 1(파동 2)이다(EVENT-036). 예약 층의 쓰기는 정착의 파생 단계에서 일어나므로 새 진입을 만들지 않는다(EVENT-036). 소비자에게 보인다: 첫 `onChange`는 파생 값이 없는 stale emit(`{a:'x'}`, 커밋 2)이고 둘째가 최종값(`{a:'x', b:'derived:x'}`, 커밋 3)이다(EVENT-036). 통지마다 저장하는 앱은 키 입력당 두 번 저장하고 첫 저장이 stale이다(EVENT-036). DOM·emit·마지막 `onChange`는 끝에서 일치한다(tearing 없음)(EVENT-036).

【추론】 "파생 값은 이펙트가 아니라 `controls.derived`/`controls.injectTo`/스토어 리스너로 쓴다"는 판과 무관한 사용 규칙이므로 README(와 `docs/QUICK_REFERENCE.md`·`docs/agents`의 `validation-and-state.md`)가 소유한다(EVENT-069). 【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다(EVENT-069). 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022 이주 19와 짝)(EVENT-069, LANDING-022). 【추론】 작성은 PR-8이다(EVENT-069).

【추론】 규칙은 지금 정한다(EVENT-070). 【추론】 core의 예산은 진입 사슬 단위이고(EVENT-008), React 이펙트를 거친 순환은 매번 새 진입이라 core 예산에 넣지 않는다(EVENT-070, EVENT-008). 【추론】 예방은 C-10의 문서(EVENT-069)가 맡는다(EVENT-070, EVENT-069).

- PR: PR-7(React 18 실행 시험을 두는 PR, REACT-017)(EVENT-070, REACT-017).
- 무엇: 이벤트 스파이크(`spikes/events/`)에 이펙트 되먹임 사례를 더한다(EVENT-070).
- 무엇: `useLayoutEffect`와 `useEffect`에서 `node.setValue`로 서로를 되쓰는 두 필드를 만들고, React 18과 19에서 각각 실행한다(EVENT-070).
- 통과: 두 이펙트 모두에서 React가 순환을 끊는다(throw나 중단)(EVENT-070).
- 통과: 그러면 이 규칙을 그대로 둔다(EVENT-070).
- 실패(특히 패시브 이펙트 순환이 개발 모드 경고만 내고 계속 도는 경우): core가 진입 간 순환 감지를 더할지 소유자에게 올린다(EVENT-070).
- 실패: 이것은 core 예산의 단위를 바꾸는 일이라 편집자가 정하지 않는다(EVENT-070).

### 05-validation-and-errors.md §1.3 검증기 선택과 공통 계약

검증기를 내장하지 않는다(VALIDATE-014).

Form 속성 `validatorFactory`는 유지하고 넓힌다(14라운드 답 O-7: '플러그인을 통한 전역 속성이 아니라 특정 커스텀 검증기 등을 추가한 커스텀 인스턴스 주입기')(VALIDATE-040).

플러그인은 전역 기본이고 속성은 그 폼의 검증기 인스턴스이며, 같은 계약(`compile` + `compileGuard`)을 받고 플러그인보다 앞선다(VALIDATE-041). 미등록 판정은 둘을 함께 본다(VALIDATE-042).

【추론】 (1) 계약 형은 하나다(가칭 `Validator`)(VALIDATE-041, VALIDATE-044).
【추론】 `Validator`는 `compile(copy)`, `compileGuard(root, pointer)`, 선택 `release(root)`(VALIDATE-045), 선택 방언 선언(VALIDATE-026), 그리고 `compile` 결과 함수의 에러 정규화(`dataPath`, 루트 경로 표기, `rejectedKey`)를 담는다(VALIDATE-044).
【추론】 플러그인은 여기에 소비자 훅 `bind?`만 더 가진다(VALIDATE-044).
【추론】 core는 `bind`를 부르지 않는다(VALIDATE-044).
【추론】 `<Form validatorFactory>`(이름 유지, O-7)와 오늘의 `FormProvider` 속성 `validatorFactory`는 이 형을 그대로 받는다(VALIDATE-044).
【추론】 (2) 고르는 순서는 Form 속성 > `FormProvider` > 등록한 플러그인이다(VALIDATE-044).
【추론】 오늘의 순서다(`RootNodeContextProvider.tsx:94`, `ValidationManager.ts:203`)(VALIDATE-044).
【추론】 바인딩 계층이 트리를 만들 때 한 번 고르고, 그 결과나 없음을 core에 인자로 넘긴다(VALIDATE-044, CONTROLS-075).
【추론】 미등록 판정은 고른 결과가 없음인 것이다(VALIDATE-042와 같은 뜻)(VALIDATE-044).
【추론】 (3) 고른 검증기의 참조가 트리 생성 뒤 바뀌면 다른 스키마와 같이 재생성한다(VALIDATE-044).
【추론】 캐시와 등록이 검증기 인스턴스마다이기 때문이다(VALIDATE-044).
【추론】 오늘도 `useMemo` 의존으로 트리를 다시 만든다(`RootNodeContextProvider.tsx:85-104`)(VALIDATE-044).
【추론】 매 렌더 새 객체를 주지 말라고 문서화한다(VALIDATE-044).
【추론】 (4) 가드 함수는 같은 값에 같은 boolean을 동기로 돌려준다(VALIDATE-044).
【추론】 던지거나 boolean이 아닌 값(비동기 스키마의 Promise 등)을 내면 그 평가는 가드 실패(`GUARD_FAILED`, 정착 오류)다(VALIDATE-044).

(VALIDATE-015)

```ts
compile(schema):      (value) => Promise<Errors | null> | Errors | null  // 전체 검증, 에러 수집
compileGuard(root, pointer): (value) => boolean                           // 동기, 첫 실패에서 중단
```

- 가드는 **동기 전용**이다(VALIDATE-016). 비동기 포맷·키워드는 가드에서 지원하지 않는다고 계약에 명시한다(VALIDATE-016).

- 플러그인 패키지들이 변경 범위에 들어간다(VALIDATE-025).

검증기 미등록 시 "조건부 비활성 + 경고"에 대해 소유자는 "동의. 단, 그럼 플러그인도 변경 범위에 포함해서, error 처리를 생략한 단순 검증 기능도 제공하도록 하자."고 답했다(VALIDATE-025).

### 05-validation-and-errors.md §2.1 오류와 경고를 가르는 기준

(ERROR-001, ERROR-008, ERROR-021)

| 층 | 무엇 | 규칙 | 환경 차이 |
| --- | --- | --- | --- |
| **오류** | 폼의 약속이 깨진 사건. 형상이 서지 않거나(청사진), 작성자의 선언이나 호출자의 쓰기가 커밋에서 빠지거나 바뀌거나(정착), 검증기가 있으나 검증이 불가능하거나(검증기), 호출자·소비자 코드가 계약을 어겼다 | **드러낸다.** 기본 드러남은 throw, 프로미스 거부, 주인 없는 오류 싱크(ERROR-008) 가운데 정확히 하나다. 삼키지 않고, 끌 스위치도 없다. 마운트 뒤에는 폼이 이미 커밋한 값을 잃지 않는다 | 없음. 개발과 프로덕션이 같다(R17-1 나). 메시지도 줄이지 않는다 |
| **경고** | 약속은 지켜지나 작성자의 의도가 의심되는 것, 또는 동작을 바꾸지 않는 알림 | **개발 모드 로그**(코드+메시지로 중복 억제). 동작을 바꾸지 않는다 | 기본 출력(개발 모드 로그)은 프로덕션에서 침묵한다(경고는 결과를 바꾸지 않으므로 침묵해도 계약이 깨지지 않는다). `onError` 핸들러는 모든 환경에서 경고 기록을 받는다(ERROR-021) |
| **검증 결과** | 사용자의 값이 스키마에 맞지 않음 | 노드 `errors`(`ValidationIssue`)로 흘리고, 제출 시 `ValidationError`. `onError`에는 가지 않는다 | 없음 |

**폼의 약속**은 원장이 적은 규칙이다(ERROR-002). 스키마가 작성된 그대로 판정되는 한(원리 P1(판정은 검증기의 것이다)) **스키마의 뜻이 작성자의 의도와 다른 것은 경고**다(`else: false`가 빠져 거짓 분기가 공허하게 통과하는 것, 터미널이 아닌 객체 노드의 표준 `readOnly`가 자식 편집을 막지 않는 것)(ERROR-002). "조용한 데이터 손상"이라는 말은 **폼이 작성자의 선언이나 호출자의 쓰기를 빼거나 바꾼 커밋**에만 쓴다(ERROR-002). 가르는 물음은 하나다(ERROR-002). "이 사건 뒤에도 원장의 규칙이 지켜지는가"(ERROR-002). `onError` 기록의 `level`은 이 층을 따른다(`'error'`는 오류 층, `'warning'`은 경고 층)(ERROR-002).

**층과 level.**(ERROR-102)

`level`이 `'error'`이면 오류 층이다(ERROR-103).

폼의 약속이 깨진 사건이며, 기본 드러남은 throw, 거부, 싱크 가운데 정확히 하나다(ERROR-104).

`level`이 `'warning'`이면 경고 층이다(ERROR-105).

동작을 바꾸지 않는 사건이며, 기본 드러남은 개발 모드 콘솔이다(ERROR-106).

R17-1 나에 따라 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 되먹임·중첩 초과는 `'error'`다(ERROR-107).

검증기 없음은 거부하지 않으므로 `'warning'`이다(17라운드 소유자 답 (가) "(가) ㄱ warning으로.")(ERROR-108).

가르는 물음은 ERROR-002대로 '이 사건 뒤에도 원장의 규칙이 지켜지는가'다(ERROR-109, ERROR-002).

### 05-validation-and-errors.md §2.2 오류 분류표와 적용 범위

**오류와 경고의 분류(12라운드, 오늘 코드의 체계를 이어 다시 구성).**(ERROR-065) 축은 셋이다 — 언제, 누구 잘못, 어떻게 드러남(ERROR-065). 오늘의 클래스 `JSONSchemaError`(throw)·`SchemaFormError`·`ValidationError`·`UnhandledError`와 `warnDevelopmentIssue`(개발 모드 전용, 코드+메시지로 중복 억제)를 그대로 잇되, 예약 층과 분기 규칙의 항목을 더했다(ERROR-065). 이름 충돌 하나는 고친다: throw되는 클래스 `JSONSchemaError`와 노드 `errors` 항목의 인터페이스 `JSONSchemaError`가 같은 이름이므로 후자를 `ValidationIssue`로 부른다(슬라이스 4)(ERROR-065).

(ERROR-159, ERROR-164, CONTROLS-079, WRITE-078, ERROR-191, ERROR-197)

| 부류 | 층 | 언제 | 누구 잘못 | 드러남 | 항목 |
| --- | --- | --- | --- | --- | --- |
| 청사진 오류 | 오류 | 청사진 분석 | 작성자 | 마운트: 생성 자리에서 잡아 대체 화면, 커밋 뒤 `onError`와 싱크. 폼이 서지 않는다. reset 안: reset이 던짐(`JSONSchemaError`). 재대조: 지금 트리를 둔 채 싱크 | 지원하지 않는 `type`; 배열 형태 모순; 정적 연언의 `type` 재정의·`const` 충돌·불가능한 범위·공집합 `enum`; `options.virtual` 참조 오류; `controls`의 식의 컴파일 실패; 게이트 없는 선언끼리(본체·게이트 없는 `allOf` 항목·게이트 없는 분기) 같은 이름·다른 종류를 선언함(늘 함께 켜지므로 충돌이 확실하다, O-10); `controls.discriminator`의 키가 어느 분기에도 `const`·`enum`으로 없거나, 있는 분기끼리 종류가 다르거나 값이 겹치거나 선언 사이 값이 다름(O-1. 일부 분기에만 없는 것은 그 분기가 게이트 없음일 뿐 오류가 아니다); 선언 사이 터미널 전략 불일치; `controls`·`options` 안의 모르는 키(15라운드) |
| 마운트 정착 오류 | 오류 | 마운트의 첫 정착 | 작성자 스키마·호출자 데이터 | 원인별(ERROR-077). 공유 충돌은 모든 환경에서 폼이 서지 않고 대체 화면. 예산 초과·식·가드 실패·동적 대상 없음은 폼이 서고 `degraded`로 시작하며 커밋 뒤 `onError`와 싱크 | 첫 정착의 예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음, 공유 충돌 |
| 청사진 경고 | 경고 | 청사진 분석 | 작성자 | 개발 모드 로그. `onError` 경고 기록(핸들러가 있으면 모든 환경) | `oneOf`·`anyOf` 분기에 `if`는 있고 `else: false`가 없음; `null` 분기 무시; `allOf` 키워드 무시; `dependentSchemas`·`dependencies` 무시; 터미널이 아닌 객체 노드의 잠금(표준 `readOnly`, `controls.readOnly`·`controls.disabled`. 효과 없음) |
| 정착 오류 | 오류 | 마운트 뒤 정착의 계산·파생·전이·커밋 | 작성자 스키마·호출자 데이터 | 커밋·통지 뒤 사슬의 끝에서 throw, 모든 환경(`SchemaFormError`, 식 예외는 `details.error`). `diagnostics`가 `degraded`로 남고 그 동안 제출을 거부한다 | 예산 초과(호스트 바퀴·파생·전이. 원본 B 커밋); 게이트에 달린 선언이 실제로 동시에 켜짐(작성자가 선언한 노드 하나가 형상에서 빠진다, P1′. 전순서에서 앞선 종류로 커밋한 뒤 throw); 어느 자리든 `controls`의 식이나 `if` 게이트 함수의 런타임 throw와 가드의 평가·컴파일 실패(ERROR-122: 게이트는 거짓, 상태 키 선언은 없음, 파생 규칙은 후보 제외, `controls.resetInteraction`은 거짓); 동적으로만 아는 `controls.injectTo` 대상이 없음 |
| 정착 경고 | 경고 | 정착의 계산 | 작성자 스키마 | 개발 모드 로그. `onError` 경고 기록(핸들러가 없는 프로덕션에서는 판정하지 않음) | 같은 `oneOf`에서 게이트 가진 분기가 둘 이상 켜짐(소유자 답 20). 같은 대상 규칙 둘은 경고가 아니다(13라운드 답 4). 켜진 `then`과의 런타임 교차가 공집합인 것은 경고도 오류도 아니다 — 검증기가 값을 기각한다(검증 결과) |
| 정착 추적 | (기록) | 정착 | — | 개발 모드에서 정착마다 기록(진입, 라운드별 규칙·원천·대상·값·결과, 예산 초과 시 마지막 라운드). `onError`에 가지 않음 | 자동 쓰기 여섯의 출처(목표 C2(작성자 실수의 가시성)·원리 P2(원본은 호출자와 작성자만 쓴다)) |
| 되먹임·중첩 오류 | 오류 | 통지 | 소비자 코드 | 그 고리 하나를 끊고(되먹임 쓰기 거부, `onChange` 하나 생략) 사슬의 끝에서 throw, 모든 환경. `diagnostics`에 남기지 않는다 | 리스너 되먹임 파동 25, `onChange` 중첩 25 |
| 리스너 오류 | 오류 | 통지 | 소비자 코드 | 배달을 끝내고 사슬의 끝에서 throw, 모든 환경. 검증 결과 파동의 리스너와 `onValidate`가 던진 것은 `onError` 뒤 싱크 | 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`가 던진 예외, `batch` fn의 예외, 검증 결과 파동의 리스너와 `onValidate`의 예외 |
| 호출자 오류 | 오류 | 공개 API 호출 | 호출자 | 즉시 throw(`SchemaFormError`, 등록은 `UnhandledError`) | `FormTypeInputMap` 패턴(렌더 중 정규화에서 던져져 루트 바운더리가 가두므로 드러남은 렌더 오류 행을 따른다), 플러그인 등록 실패(폼 밖이라 `onError`에 가지 않음), `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `onError` 관찰자 안의 쓰기(`onError`에 가지 않음), 배열 아닌 노드의 배열 전용 명령(`ARRAY_METHOD_ON_NON_ARRAY`) |
| 제출 거부 | 오류 | 제출 | 작성자 스키마·호출자 데이터(폼이 `degraded`) | `FormHandle.submit`·`useFormSubmit`은 `SchemaFormError`로 거부, 네이티브 submit은 `onError` 뒤 싱크, 모든 환경. 렌더 계층의 일이며 core는 제출을 모른다 | `diagnostics.status === 'degraded'` 동안의 제출 |
| 검증기 경고 | 경고 | 트리 생성(마운트, 재생성 reset) | 호출자(검증기를 주지 않음) | 거부하지 않음. 개발 모드 로그, `onError` 경고 기록(트리마다 한 번) | 검증기 없음(검증 모드가 `None`이 아님); 검증기가 없어 `if` 조각이 꺼짐 |
| 검증기 오류 | 오류 | 검증 요청 | 플러그인·호출자 | `validate()`와 제출의 거부, `OnChange` 검증이면 `onError` 뒤 싱크, 모든 환경 | 검증기는 있으나 전체 스키마 컴파일 실패(검증 불가, 한 로드에 한 번); 검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환 |
| 렌더 오류 | 오류 | 렌더 | 소비자 코드(사용자 주입 구성 요소) 또는 호출자 | 바운더리가 가두어 대체 화면을 그리고 `componentDidCatch`에서 `onError`와 싱크. 다시 던지지 않는다 | 필드 바운더리가 감싼 구성 요소(`FormTypeInput`, 렌더러, `Placeholder`)의 렌더 오류, 루트의 렌더 오류, `formTypeInputMap` 정규화 오류 |
| 렌더 계층 경고 | 경고 | 렌더 계층 | 작성자·호출자 | 개발 모드 로그. `onError` 경고 기록 | 가상화를 켰는데 `IntersectionObserver`가 없음; `presentation` 키 의심(코어 키와 대소문자만 다름, 또는 `controls`·`options`의 키 이름) |
| 검증 결과 | 검증 결과 | 검증 뒤 | 사용자 입력 | 노드 `errors`(`ValidationIssue`), 제출 시 `ValidationError`. `onError`에 가지 않는다 | 검증기가 낸 항목 |

`controls.discriminator`의 "선언 사이 값이 다름"은 한 분기의 정적 연언 안 판별 선언들의 교차가 공집합일 때로 읽는다(ERROR-159, ERROR-164, FRAGMENT-048). 【추론】 한 분기의 정적 연언 안에서 판별 키의 `const`·`enum` 교차가 공집합이면 오류 코드는 ERROR-164의 정적 연언 행(`EMPTY_ENUM_INTERSECTION`)이며 `DISCRIMINATOR_MISMATCH`가 아니다(ERROR-159, ERROR-164). 【추론】 ERROR-164 `DISCRIMINATOR_MISMATCH` 행의 "선언 사이 값이 다름"은 별도 코드가 아니라 정적 연언 행의 사건을 판별 관점에서 적은 것이다(ERROR-159, ERROR-164).

정적으로 아는 `controls.injectTo` 대상은 없고, 그 경우는 모두 정착 오류 행의 동적 대상 없음이다(ERROR-159, CONTROLS-079).

동적 `controls.injectTo` 대상 없음은 대상 경로가 청사진에 없거나 터미널 아래인 것이며, 형상에 없는 노드를 가리키는 것은 오류가 아니다(ERROR-159, ERROR-124).

개발 모드 경고는 게이트 결과, 키의 유무, 선언의 `type`, 등록 상태만 보며 `if`의 내용은 읽지 않는다(ERROR-159). 검사하지 않는 것: 조건 프로퍼티가 `properties`에 있는지, `if`에 `required`가 있는지(ERROR-159).

`presentation`의 모르는 키는 플러그인 자유 칸이다(ERROR-159).

서로소인 `enum` 둘이 켜진 조각과의 연언에서 동시에 활성이면 그 필드는 "지금 고를 수 있는 값이 없는" 상태가 되고, 폼은 막지 않으며 검증기가 값을 기각한다(ERROR-159, BLUEPRINT-016). 필드를 비우면 값이 유효해지는 경우가 있으므로 폼 전체를 멈춰서는 안 된다(R11-e)(ERROR-159, BLUEPRINT-016).

정착 추적은 개발 모드에서 정착마다 기록한다: 진입(공개 API, 옵션 비트), 라운드별 {단계, 규칙 종류, 원천 경로, 대상 경로, 이전 값, 이후 값, 결과(적용 / 누구에게 짐 / `undefined`라 후보 아님 / 억제 / 최종 형상 밖이라 철회)}, 예산 초과 시 마지막 라운드의 규칙 목록(ERROR-159). 프로덕션은 기록하지 않는다(ERROR-159). `onError`에 가지 않는다(ERROR-159).

범위 밖: 렌더 중 쓰기는 core가 감지하지 않는다(원리 P5(core는 렌더러를 모른다), ERROR-160).

`controls.discriminator`의 키가 호스트 `properties`에 없는 것은 오류가 아니다(끌어올림, O-1)(ERROR-161).

오늘의 경고 `NULLABLE_ONE_OF_NULL_UNREACHABLE`은 분기 내용을 읽으므로 폐기하고, `VIRTUALIZATION_DISABLED_FOR_FORM`은 렌더 계층 경고로 옮긴다(ERROR-162).

분류표는 ERROR-159의 것이고 03의 재록은 이를 그대로 옮긴 것이다(ERROR-171).

### 05-validation-and-errors.md §2.3 기본 드러남과 환경 규칙

(ERROR-003, EVENT-018, ERROR-155, ERROR-039)

| 언제 | 자리 | 왜 |
| --- | --- | --- |
| 청사진 오류(마운트) | 렌더 중에 던지지 않는다. 트리를 만드는 자리에서 잡아 폼 자리에 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 주인 없는 오류 싱크로 드러낸다. 폼이 서지 않는다 | 형상 없이는 어떤 값도 뜻이 없다. 렌더 중에 던지면 서버 사이드 렌더링의 페이지가 실패하고, 호스트에 바운더리가 없으면 앱 전체가 내려간다 |
| 청사진 오류(reset의 스키마 교체) | reset이 던진다. 재대조(레이아웃 효과)에서 난 것은 지금 트리를 둔 채 그 레이아웃 효과에서 `onError`와 싱크로 드러낸다 | reset은 호출자가 있는 사슬이다. 재대조는 부른 쪽이 없다 |
| 마운트 정착의 오류 | 원인별(아래) | 폼이 서는지는 원인마다 소유자의 답을 따른다 |
| 호출자 오류(공개 API 오용, 관찰자 안의 쓰기, 폐기된 노드에 대한 쓰기) | 즉시, 그 호출에서 | 호출자의 코드가 원인이며 그 자리에서 고친다. 렌더 중 쓰기는 core가 감지하지 않는다(원리 P5(core는 렌더러를 모른다), EVENT-018) |
| 정착·통지 사슬의 오류 | **사슬의 가장 바깥 진입 끝에서 한 번**, 모든 환경 | 아래 |
| 검증기 오류 | `validate()`와 제출의 거부. `OnChange` 검증이면 `onError` 뒤 싱크 | ERROR-155, ERROR-039 |

청사진 오류: reset 호출 안의 재생성에서 난 것은 `reset()`이 던지고 옛 트리는 그대로 남는다(원자적)(ERROR-003).

청사진 오류는 트리를 만드는 자리(`RootNodeContextProvider`의 생성)에서 잡아 폼 자리에 오늘과 같은 대체 화면을 그리고 커밋 뒤 이펙트에서 드러낸다(17라운드 스웜 수렴(편집자 결정), ERROR-089)(ERROR-003). 오늘은 `console.error`뿐이다(ERROR-003).

작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)와 공유 충돌은 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던진다(R17-1 나, 17라운드 소유자 답: "나 허용. 망가진 값을 올리는게 더 위험하겠다")(ERROR-070).

청사진 오류, 호출자 오류, 되먹임·중첩 초과, 리스너·`batch` fn 예외(14라운드 O-5 위임), 검증기 오류도 모든 환경에서 같게 드러난다(ERROR-071).

끄는 스위치는 없다(Form 속성 `throwOnBudgetExceeded`는 없다)(ERROR-072).

12라운드 §4("프로덕션은 신호만"), 10라운드 B-1(제출 비차단), 14라운드 O-4 가(식 오류와 대상 없음은 개발 모드 경고)는 이 답으로 대체되었다(ERROR-073).

환경에 따라 다른 것은 둘뿐이다(ERROR-074).

경고의 기본 출력(개발 모드 콘솔)과, 가드 컴파일 실패를 알리는 시점(ERROR-041)이다(ERROR-075, ERROR-041).

오류 메시지는 어느 환경에서도 줄이지 않는다(번호와 해독 페이지로 바꾸지 않는다)(ERROR-076).

**기본 출력과의 관계.**(ERROR-022) 핸들러는 어떤 기본 드러남도 대신하거나 끄지 못하며, 반환값은 무시한다(ERROR-022).

- 오류의 기본 드러남: 사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크다(ERROR-008, ERROR-022).
- 경고의 기본 드러남: 오늘의 자리와 규칙 그대로다(ERROR-022). 개발 모드 콘솔에 발견 즉시 나가고, 세션 단위로 code+message 중복을 억제한다(`src/helpers/warning/warnDevelopmentIssue.ts:25-35`)(ERROR-022). 프로덕션에서는 기본 출력이 없다(ERROR-022). ERROR-001의 '침묵'은 기본 출력에만 해당한다(ERROR-022, ERROR-001).
- 개발 모드에서 경고는 콘솔과 핸들러 둘 다에 간다(의도한 동작이다)(ERROR-022).
- `@winglet/react-utils` ErrorBoundary의 `console.error`는 그 모듈의 의도대로 남는다(`packages/winglet/react-utils/src/hoc/withErrorBoundary/INTENT.md` '기본 로깅은 유지')(ERROR-022).

### 05-validation-and-errors.md §2.4 진입 사슬과 오류 묶음

**진입 사슬.**(ERROR-004) 사슬 머리(리스너·`onChange` 밖에서 열린 동기 진입)와, 그 통지·`onChange`·리스너 안에서 열린 진입 전부가 한 사슬이다(ERROR-004). ADR 0008의 "최외곽 진입"은 사슬 머리가 아닌 진입이며, 되먹임 상한(파동 25)은 진입마다, `onChange` 중첩 상한(25)은 사슬마다 센다(ERROR-004). 사슬 안에서 난 오류 — 정착 오류, 리스너 오류, 되먹임·중첩 초과, `batch(fn)`의 fn이 던진 예외 — 는 모두 모아 두었다가 **사슬 머리가 끝날 때 한 번** 던진다(ERROR-004). 안쪽 진입과 안쪽 `batch`는 정상 반환한다(fn이 던진 예외도 모아 둔다)(ERROR-004). 안쪽에서 던지면 사슬이 끊겨 통지가 빠진다(ERROR-004). 순서는 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError` → throw다(ERROR-004). 그래서 값은 커밋되고, 구독자는 통지받고(커밋된 것은 반드시 통지된다), 호출자는 한 번만 오류를 본다(ERROR-004).

**묶음.**(ERROR-005) 오류가 하나면 그대로 던진다(ERROR-005). 둘 이상이면(부른 쪽이 있는 자리에서 `onError` 핸들러가 던진 예외를 원래 오류와 합칠 때 포함) `SchemaFormError` 하나(전용 코드, 가칭 `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`)로 묶어 발생 순서대로 `details.errors`에 담는다(ERROR-005). 식이 던진 원래 예외는 `SchemaFormError`로 감싸고 `details.error`에 싣는다(오늘 `INJECT_TO`와 같은 방식)(ERROR-005). 내장 `AggregateError`와 `Error`의 `cause` 선택지는 쓰지 않는다(ERROR-005). 빌드 변환 대상이 ES2020이라 둘 다 없고, 내장 `AggregateError`로 판별하면 사용자 코드의 `Promise.any`가 낸 남의 오류까지 폼의 것으로 오인한다(ERROR-005). `BaseError.toJSON`이 `details`를 재귀 복사하므로 `details.errors`는 새 장치 없이 직렬화된다(ERROR-005).

**호출자 없는 진입.**(ERROR-007) 호출자 코드가 머리가 아닌 진입 — 마운트, 렌더 계층 자신의 이펙트, reset의 재대조 — 의 오류는 렌더 중이나 이펙트 안에서 던지지 않고, 폼이 커밋된 뒤 `onError`와 주인 없는 오류 싱크로 드러낸다(ERROR-007). 렌더 중에 던지지 않는 것은 드러남의 자리일 뿐이며, 마운트에서 폼이 서는지는 아래 원인별 규칙이 정한다(ERROR-007). 호스트나 사용자 주입 구성 요소의 이펙트에서 연 사슬은 그 코드가 호출자이므로 사슬 끝에서 던지고, 가까운 바운더리가 받는다(호스트 이펙트면 호스트의 바운더리)(ERROR-007). React 이벤트 처리기에서 시작된 쓰기의 throw는 화면과 입력을 내리지 않고 전역 오류로 보고되며, 호스트 이펙트에서 부른 쓰기의 throw는 호스트의 바운더리로 가 화면을 내릴 수 있다(ERROR-007).

**주인 없는 오류 싱크.**(ERROR-008) 부른 쪽이 없는 오류는 한 싱크로 드러낸다(ERROR-008). `window`가 있으면 `reportError`를 부르고, 없으면 `ErrorEvent`가 있을 때만 `window`에 보내며 취소되지 않으면 `console.error`를 한 번 낸다(ERROR-008). `window`가 없으면(서버 사이드 렌더링) `console.error` 한 번이다(ERROR-008). `process.emit('uncaughtException')`은 부르지 않는다(ERROR-008).

【추론】 되먹임 거부를 호출자에게 알리는 별도 표면은 두지 않는다(ERROR-194).
【추론】 거부된 리스너 되먹임 쓰기는 안쪽 진입이므로 정상 반환한다(ERROR-194).
【추론】 사슬 머리가 끝날 때 `FEEDBACK_LIMIT_EXCEEDED`를 던지고, 그 기록은 `onError`로 간다(ERROR-194).
【추론】 비객체 V의 `Merge`, `setValue(undefined)`, 되먹임 거부 표면에서는 새 오류 코드가 생기지 않는다(ERROR-194, WRITE-079, WRITE-090).

### 05-validation-and-errors.md §2.5 마운트 정착 오류

**마운트 정착의 오류 — 원인별.**(ERROR-077) 마운트 정착의 오류는 렌더 중에 던지지 않고 트리를 만드는 자리(청사진 오류와 같은 자리)에서 잡는다(ERROR-077).

공유 충돌: 모든 환경에서 폼이 서지 않는다(ERROR-078).

폼 자리에 청사진 오류와 같은 대체 화면을 그리고, 커밋 뒤 이펙트에서 `onError`와 싱크로 드러낸다(14라운드 O-10)(ERROR-079).

예산 초과, 식·가드 실패, 동적 `controls.injectTo` 대상 없음: 폼이 선다(R17-1 나)(ERROR-080).

원인마다 정의된 값(예산 초과는 원본 B, 식·가드 실패는 ERROR-122의 자리별 값, 대상 없음은 그 규칙을 후보에서 뺌)으로 정착을 마치고 커밋하며, `diagnostics`는 `degraded`로 시작한다(ERROR-134, ERROR-081).

오류는 커밋 뒤 준비 이펙트에서 `onError`와 싱크로 드러낸다(ERROR-082).

폼이 서는 원인에서는 마운트에서도 폼이 커밋한 값을 잃지 않는다(ERROR-083).

어느 경우든 생성 자리에서 잡으므로 서버 사이드 렌더링의 페이지는 실패하지 않는다(ERROR-084). 클라이언트는 하이드레이션에서 트리를 다시 만들어 같은 오류를 커밋 뒤에 드러낸다(ERROR-084). reset 재생성의 첫 로드는 호출자가 있는 사슬이므로 새 트리로 커밋하고 핸들을 바꾼 뒤 reset의 사슬 끝에서 던진다(ERROR-084).

### 05-validation-and-errors.md §2.6 식과 가드의 실패

식은 네 자리에서 평가된다(ERROR-120).

던지면 그 자리마다 정의된 값으로 정착을 마치고, 사슬의 끝에서 모든 환경에서 throw한다(R17-1 나, 가칭 코드 `SCHEMA_FORM_ERROR.EXPRESSION_THREW`, 원래 예외는 `details.error`)(ERROR-121).

(ERROR-122)

| 자리 | 던지면 |
| --- | --- |
| 게이트(`if` 게이트 함수와 그 가드, `controls.active`) | 그 게이트는 거짓이다 |
| 상태 키(`controls.visible`·`controls.readOnly`·`controls.disabled`, 조각과 `controls.children`의 `controls`) | 그 선언은 없는 것이다 |
| 파생 규칙(`controls.derived`·`controls.injectTo`·`controls.unsetValue`), 동적으로만 아는 `controls.injectTo` 대상이 없음 | 그 규칙을 그 라운드의 후보에서 빼고 에지를 소비한다 |
| `controls.resetInteraction` | 그 판정은 거짓이다 |

형상에 없는(비활성) 노드를 가리키는 것은 오류가 아니다 — 형상에 없는 노드의 규칙은 평가하지 않고 그 노드에 쓰지도 않는다(ERROR-124, WRITE-029). 【추론】 '그 노드에 쓰지도 않는다'는 형상에 없는 노드 자신의 규칙에 대한 말이며, 다른 규칙이 그 노드를 겨눈 쓰기(`controls.injectTo`)에는 적용되지 않는다(CONTROLS-053, WRITE-018과 같은 분배)(ERROR-124, CONTROLS-053, WRITE-018).

식이나 가드가 던져 거짓이 된 게이트로 나간 노드에는 나감 비움을 적용하지 않는다(작성자의 잘못으로 커밋된 값을 잃지 않는다)(ERROR-125).

어느 자리든 식이나 가드가 던지면 그 커밋은 `degraded`다(ERROR-132, ERROR-126).

가드의 평가 실패와 컴파일 실패는 가칭 `SCHEMA_FORM_ERROR.GUARD_FAILED`, 동적 대상 없음은 가칭 `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING`이다(ERROR-127).

### 05-validation-and-errors.md §2.7 진단 기록과 원인

`diagnostics`는 상태(`raw`·`extras`)도 계산 결과((스키마, 원본)의 함수)도 아니라 **작업의 기록**이다(VALUE-002의 분류. 재계산 목록·`revision`·커밋 번호와 같은 칸)(ERROR-128, VALUE-002).

`setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, `diagnostics`는 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 초기화하며 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(ERROR-129, ERROR-204, WRITE-090).

모양은 `{ status: 'stable' | 'degraded', cause?: 'budget' | 'expression' | 'injectTarget' | 'sharedConflict', exceededBudget?: 'hostWheel' | 'derive' | 'transition', iterations?, commit? }`이며 모든 칸은 `commit` 번호의 커밋을 기술한다(ERROR-130, ERROR-131). 재귀 펼침의 멈춤이 `exceededBudget` 값 (가칭) `'recursion'`을 더한다(ERROR-130, ERROR-190). `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해진다(ERROR-130, ERROR-195).

작성자의 선언이 빠지거나 뜻대로 평가되지 못한 커밋 — 원본 B, 어느 자리든 `controls`의 식·가드의 throw, 동적 `controls.injectTo` 대상 없음, 공유 충돌, 가상 노드에 모양이 틀린 자동 쓰기 — 이 하나라도 있으면 `status = 'degraded'`이고 `commit`은 그 첫 커밋 번호다(ERROR-132, ERROR-195).

`cause`는 예산 초과면 `'budget'`, `controls`의 식이나 `if` 가드의 평가·컴파일 실패면 `'expression'`, 동적 대상 없음이면 `'injectTarget'`, 공유 충돌이면 `'sharedConflict'`, 자동 쓰기가 대상이 받을 수 없는 모양의 값을 내면 다섯째 값 (가칭) `'writeShape'`다(R17-1 나가 식과 가드의 실패를 한 묶음으로 둔 것을 따른다)(ERROR-133, ERROR-195).

마운트 정착에서 난 것이면 `degraded`로 시작한다(ERROR-081, ERROR-134).

### 05-validation-and-errors.md §2.8 진단 기록의 지속과 초기화

**다음 로드까지 남는다.**(ERROR-135)

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(ERROR-030, ERROR-135, ERROR-164, ERROR-172, ERROR-196, ERROR-202, ERROR-204).

지속은 14라운드 답 O-2 가다(ERROR-136).

원인을 넷으로 넓힌 것과 그 동안의 제출 거부는 17라운드 소유자 답 R17-1 나다(10라운드 B-1의 제출 비차단을 대체한다)(ERROR-137).

【추론】 `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-204).

- PR: PR-2(진단)(ERROR-204).
- 무엇: 한 하위 트리의 예산 초과로 `degraded`가 된 폼에서 다른 하위 트리의 `resetSubtree()`, 루트 `setValue(V)`, `FormHandle.reset()`을 차례로 부르고 `diagnostics`, 경고 중복 키, 제출 거부를 본다(ERROR-204).
- 통과: 앞의 둘 뒤에는 `degraded`, 중복 키, 제출 거부가 그대로 남고, `FormHandle.reset()` 뒤에는 `stable`이며 중복 키가 비었다(ERROR-204).
- 실패: 초기화하는 로드의 목록을 고친다(ERROR-204).

### 05-validation-and-errors.md §2.9 상태 저하와 제출 거부

그 동안 `<Form>`의 제출 경로(`FormHandle.submit`, `useFormSubmit`, 네이티브 submit — 모두 `async onSubmit` 하나로 모인다)는 `SchemaFormError`(가칭 코드 `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED`, 제출 시도마다 새 객체)로 거부한다(ERROR-138).

`FormHandle.submit`과 `useFormSubmit`은 그 프로미스를 거부하고, 부른 쪽이 기다리지 않는 네이티브 submit은 `onError` 뒤 싱크로 보낸다(ERROR-139).

core는 제출을 모르므로 거부는 렌더 계층의 일이다(원리 P5(core는 렌더러를 모른다), ERROR-140).

`getValue()`는 막지 않는다(ERROR-141).

**제출이 막힐 때 호스트가 그릴 자리.**(ERROR-142) 폼은 `degraded`를 화면에 그리지 않는다(ERROR-142). 호스트는 두 자리에서 폼 수준 표시(배너, 제출 버튼의 비활성 같은 것)를 그린다(ERROR-142). 하나는 제출 거부의 `SchemaFormError`다(`FormHandle.submit`·`useFormSubmit`의 거부, 네이티브 submit이면 `onError` 기록)(ERROR-142). 다른 하나는 `onDiagnosticsChange`(`status`와 `cause`)로, 제출 전에 막힘을 미리 알 수 있다(ERROR-142). `setValue(V)`는 로드가 아니라 전체 교체 쓰기이고, `diagnostics`는 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 초기화하므로 `setValue(V)`와 `resetSubtree()`로는 돌아오지 않으며, `degraded`에서 돌아오는 길은 `FormHandle.reset()`이다(ERROR-142, ERROR-204, WRITE-090).

되먹임 파동과 `onChange` 중첩의 초과는 소비자 코드의 쓰기를 거부한 것이지 작성자의 선언을 뺀 것이 아니므로 `diagnostics`에 남기지 않고 사슬의 끝에서 던지기만 한다(`exceededBudget` 다섯 값을 셋으로 줄인다)(ERROR-142, EVENT-008, ERROR-130). 재귀 펼침의 멈춤이 (가칭) `'recursion'`을 더해 `exceededBudget`의 값은 넷이다(ERROR-142, ERROR-190).

같은 제출 거부라도 `degraded`는 기록되고 검증 실패는 기록되지 않는다(ERROR-016). 앞의 것은 폼의 약속이 깨진 사건이고 뒤의 것은 검증 결과이기 때문이다(ERROR-016).

작성자 스키마·호출자 데이터에서 온 정착 오류(예산 초과, `controls` 식·가드 실패, `controls.injectTo` 대상 없음)는 모든 환경에서 커밋·통지 뒤 사슬 끝에서 던지고, `degraded`가 다음 로드까지 남아 그 동안 폼의 제출 경로가 `SchemaFormError`로 거부한다(`getValue()`는 막지 않는다)(ERROR-172).

끄는 스위치는 없다(17라운드 소유자 답 R17-1 나. 12라운드 §4·10라운드 B-1·14라운드 O-4 가를 대체한다)(ERROR-173).

### 05-validation-and-errors.md §2.10 검증기 출처와 미등록

검증기는 플러그인(전역 기본) 또는 Form 속성 `validatorFactory`(그 폼의 인스턴스, 14라운드 답 O-7)에서 온다(ERROR-143). 어느 경우도 청사진 오류가 아니며 폼은 선다(ERROR-144). 기본 검증 모드 `OnChange | OnRequest`는 그대로 두고 '검증기가 있으면 `OnChange`, 없으면 `None`' 같은 암묵 기본값은 두지 않는다(ERROR-145).

**검증기 없음**(플러그인에도 `validatorFactory`에도 없고 검증 모드가 `None`이 아님): 거부하지 않고 검증 없이 진행한다(17라운드 소유자 답, 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다")(ERROR-146). 개발 모드 콘솔과 `onError`의 경고 기록(`level: 'warning'`, 가칭 코드 `SCHEMA_FORM_WARNING.VALIDATOR_MISSING`, 17라운드 소유자 답 (가))으로 알린다(ERROR-147). 트리마다 한 번(마운트, 재생성 reset) 보내고, 값을 통째로 바꾸는 `setValue`나 같은 스키마 reset에서는 다시 보내지 않는다(ERROR-148). 전달 시점은 마운트면 준비 이펙트, 재생성 reset이면 reset 사슬 끝이다(ERROR-149). 프로덕션에는 기본 출력이 없다(ERROR-150). 검증을 쓰지 않는 폼은 검증 모드를 `None`으로 적으면 알림이 없다(ERROR-151).

### 05-validation-and-errors.md §2.11 조건부 스키마와 가드 컴파일

**조건부 스키마.**(ERROR-152) VALIDATE-025와 VALIDATE-042의 합의("조건부 비활성 + 경고", 소유자 동의)를 유지한다(ERROR-153, VALIDATE-025, VALIDATE-042). 검증기가 없으면 `if` 게이트의 조각은 꺼진 채 두고 경고(가칭 `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR`)를 트리마다 한 번 낸다(ERROR-154).

**가드.**(ERROR-041) 프로덕션에서 가드는 처음 필요할 때 늦게 컴파일한다(작성 루트 기준 캐시. TEST-036의 '늦추고'는 프로덕션의 규칙으로 유지한다)(ERROR-041, TEST-036). 개발 모드에서는 청사진에서 모든 가드를 한 번 컴파일해 본다(ERROR-041). 어느 환경이든 컴파일 실패는 그 게이트의 가드 실패다(게이트는 거짓, R17-1 나에 따라 정착 오류)(ERROR-041, ERROR-121, ERROR-122). 청사진 오류가 아니므로 두 환경의 형상이 같고(목표 G5(한 장으로 설명되는 라이프사이클)), 개발 모드가 앞당기는 것은 `onError` 기록의 시점(마운트의 커밋 뒤)뿐이다(ERROR-041, GOAL-009). 프로덕션에서 한 번도 평가되지 않은 가드의 실패는 기록이 없다(ERROR-041).

AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(ERROR-041, TEST-036). 컴파일의 실패(지원하지 않는 정규식 등)를 폼 생성의 실패로 둘 것인가(ERROR-041). Python 정규식 `(?i)…`은 Ajv 컴파일이 throw한다(ERROR-041). 17라운드에 닫혔다: 가드 컴파일의 실패는 폼 생성의 실패가 아니라 그 게이트의 가드 실패(정착 오류)이고, 전체 스키마 컴파일의 실패는 검증 불가다(ERROR-041, ERROR-155).

### 05-validation-and-errors.md §2.12 검증 불가와 실행 실패

**검증 불가**(검증기는 있으나 전체 스키마 컴파일이 실패함): 한 로드에 오류 객체 하나(가칭 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`)로 커밋 뒤 첫 `OnChange` 검증, `validate()`, 제출을 모든 환경에서 거부하고(R17-1 나), `onError`와 (부른 쪽이 없으면) 싱크로 한 번 드러낸다(ERROR-155). 그 로드에서 `OnChange` 검증을 다시 예약하지 않는다(ERROR-156). 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다)(ERROR-157). 통보3의 근거(검증 없이 폼만 그리는 사용예, 기본 모드의 불편)는 검증기를 준 이 경우에 닿지 않는다(ERROR-158).

**검증 실행 실패**(검증 함수의 런타임 throw, 요청 시점의 `$ref` 순환, 가칭 `SCHEMA_FORM_ERROR.VALIDATOR_THREW`): 호출자가 기다리는 `validate()`와 제출은 그 프로미스의 거부로 드러낸다(ERROR-039). `OnChange` 검증이면 `onError`에 한 번, 이어 싱크로 한 번 드러내며, core가 소유한 프로미스를 미처리 거부로 남기지 않는다(ERROR-039). 모든 환경에서 같다(ERROR-039). 입력의 판정과의 경계는 `ValidateFunction`의 문서 주석 "입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다"로 못박는다(ERROR-039). 그래서 실행 실패는 검증 결과가 아니며 `onValidate`로 가지 않는다(ERROR-039). 폼 쪽 타입은 이미 동기 반환을 허용한다: `Promise<JSONSchemaError[] | null> | JSONSchemaError[] | null`(`src/types/error.ts:209-212`)(ERROR-039).

**로드 검증의 자리.**(ERROR-040) 마운트 로드는 검증을 요청하지 않고, 렌더 계층이 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리)에 `OnChange` 비트가 켜져 있으면 한 번 요청한다(ERROR-040). reset의 로드는 진입 끝에서 요청한다(ERROR-040). 규칙은 '로드 뒤 `OnChange` 비트면 한 번'으로 같다(ERROR-040). 그래서 서버 사이드 렌더링에서는 검증이 돌지 않는다(ERROR-040). core만 쓰는 호스트(목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, GOAL-016). 【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(ERROR-040).

【추론】 이 경우는 오류도 경고도 아니다(ERROR-201). 【추론】 재생성 reset은 원자적으로 성공한다(ERROR-201). 【추론】 플러그인이 떼어 두지 못해 등록이 실패하면 새 코드 없이 있는 부류로 드러낸다(ERROR-201). 【추론】 전체 컴파일은 `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED`, 가드는 `SCHEMA_FORM_ERROR.GUARD_FAILED`이며, `details`에 가칭 `reason: 'duplicateSchemaId'`와 `$id`를 싣는다(ERROR-201). 【추론】 (미정) 행(ERROR-198)의 이 줄은 "코드 없음"으로 닫는다(ERROR-201, ERROR-198).

### 05-validation-and-errors.md §2.13 오류 관찰자의 원칙

Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 **관찰자**다(17라운드 4번 수렴의 안 B, 17라운드 스웜 수렴(편집자 결정), 소유자의 "validate error 가 걸러진 에러 로깅용 전용 채널")(ERROR-094, ERROR-095). 핸들러는 흐름을 바꾸지 못한다(ERROR-096). 반환값은 무시되고, 어떤 기본 드러남(사슬 끝 throw, 프로미스 거부, 주인 없는 오류 싱크, 개발 모드 콘솔)도 대신하거나 끄지 못하므로, 핸들러가 던지지 않는 한 핸들러가 있든 없든 폼의 동작은 같다(핸들러가 던지면 그 예외도 원래 오류와 함께 드러난다)(ERROR-097). 핸들러가 없으면 비용도 없다(ERROR-098). `throwOnBudgetExceeded`는 없고(R17-1 나), 가칭 `onListenerError`는 `onError`에 흡수된다(ERROR-099).

Form 속성 `onError(record)`는 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자다(17라운드 스웜 수렴(편집자 결정), 안 B. 받는 것·받지 않는 것·기록 모양·시점은 ERROR-014·ERROR-100·ERROR-101·ERROR-017·ERROR-019)(ERROR-174). 핸들러는 흐름을 바꾸지 못하며(던질 것은 던지고 기본 출력도 그대로), 핸들러가 없으면 비용이 없다(ERROR-175). "프로덕션은 기본 출력 없음"은 기본 출력에만 해당하며, `onError` 핸들러는 모든 환경에서 경고를 받는다(ERROR-176). 가칭 `onListenerError`는 두지 않는다(`onError`에 흡수)(ERROR-177).

### 05-validation-and-errors.md §2.14 관찰자 계약과 수신 범위

아래가 계약이다(17라운드 4번 수렴의 계약 열아홉 항목에 게이트 R17G-1–R17G-11의 고침을 모두 적용한 것)(ERROR-013). **이름과 자리.**(ERROR-013) Form 속성은 `onError?: (record: FormErrorRecord) => void`다(ERROR-013). 기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(문자열 리터럴 합집합)는 가칭이며 PR-4에서 확정한다(ERROR-013). 렌더 계층(React 바인딩)이 이 속성을 소유하고 `useHandle`로 최신 속성을 부른다(`Form.tsx:110`과 같은 방식)(ERROR-013). 그래서 인라인 함수를 넘겨도 트리와 캐시를 다시 만들지 않는다(ERROR-013). core는 React를 모르므로(목표 C3(프레임워크 독립적인 core)) 트리를 만들 때 보고기 `{ report(record): void; hasConsumer(): boolean }`(가칭) 하나를 인자로 받고, 트리마다 하나인 `SchemaNodeRuntime`이 그것을 든다(ERROR-013, GOAL-016). 렌더 계층의 `hasConsumer`는 부를 때마다 '최신 `onError` 속성이 함수임 또는 `process.env.NODE_ENV !== 'production'`'을 돌려주고, core는 기록·서식·경고 판정 전에 매번 이것을 묻는다(ERROR-013). 마운트 뒤에 핸들러를 새로 단 폼은 그 뒤의 사건부터 받고, 이미 지난 로드의 청사진·마운트 기록은 받지 않는다(ERROR-013). core만 쓰는 호스트는 자기 보고기를 넘긴다(ERROR-013). 선언의 문서 주석 첫 줄은 "폼 내부의 오류와 경고를 받는 관찰자. 검증 결과는 오지 않는다(onValidate). 반환값은 무시되고 오류를 막지 못한다"이다(이름이 검증 오류로 읽히는 함정을 푼다)(ERROR-013).

**받는 것.**(ERROR-014) 폼 인스턴스에 묶인 오류 층과 경고 층의 사건 전부다(ERROR-014).

- 청사진 오류와 경고(ERROR-014).
- 마운트 정착의 오류와 경고(ERROR-014).
- 정착 오류와 경고: 예산 초과, 식·가드 실패, 동적 대상 없음, 공유 충돌, 게이트 가진 분기 둘 이상 켜짐(ERROR-014).
- 되먹임·중첩 초과(ERROR-014).
- 리스너 오류: 구독 리스너, `onChange`, `onStateChange`, `onDiagnosticsChange`, `batch` fn, 검증 결과 파동의 리스너와 `onValidate`(ERROR-014).
- 호출자 오류: `Overwrite`와 `Merge`를 함께 준 `setValue`, 재생성 reset으로 폐기된 노드에 대한 쓰기, `FormTypeInputMap` 패턴(ERROR-014).
- `degraded` 동안의 제출 거부(ERROR-014).
- 검증 불가(검증기는 있으나 컴파일 실패)(ERROR-014).
- 검증기 실행 실패(ERROR-014).
- 바운더리가 잡은 렌더 오류(ERROR-014).
- 검증기 없음과 조건부 스키마 경고(ERROR-014).
- 렌더 계층 경고: 가상화 꺼짐, `presentation` 키 의심(ERROR-014).

**받지 않는 것.**(ERROR-100)

- 정착 추적(개발 모드 기록)(ERROR-100).
- `diagnostics`의 상태 변화(원인 오류는 기록된다)(ERROR-100).
- 묶음 `SchemaFormError` 자체(구성 오류마다 기록한다)(ERROR-100).
- 핸들러 자신의 예외와 핸들러 안 쓰기의 거부(ERROR-100).
- 호스트 `onSubmit`이 던지거나 거부한 것(호스트 자신의 코드이며 제출 프로미스로 부른 쪽에 간다)(ERROR-100).
- 폼 인스턴스 밖의 사건: `registerPlugin`의 `UNHANDLED_ERROR.REGISTER_PLUGIN`(ERROR-100).
- React 자신의 경고와, core가 감지하지 않는 렌더 중 쓰기(원리 P5(core는 렌더러를 모른다))(ERROR-100, GOAL-031).
- 검증 결과 전부: 노드 `errors`의 `ValidationIssue`, `onValidate`, `errors` 속성과 `setExternalErrors`·`clearExternalErrors`, 제출의 `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED`(17라운드 소유자 답, 통보4 둘째 답)(ERROR-101).

### 05-validation-and-errors.md §2.15 기록의 모양과 전달 시점

**기록 모양.**(ERROR-017) `{ level: 'error' | 'warning'; code: FormErrorCode; message: string; path?: string; schemaPath?: string; details?: ErrorDetails; error?: unknown; aggregate?: SchemaFormError; surface?: 'thrown' | 'rejected' | 'sink'; componentStack?: string }`(ERROR-017).

- `code`: `BaseError.code`와 같은 `<GROUP>.<SPECIFIC>` 형식이다(`packages/winglet/common-utils/src/errors/BaseError.ts:29-32`)(ERROR-017). 경고는 `SCHEMA_FORM_WARNING.<SPECIFIC>`이다(ERROR-017). 소비자 코드의 예외에는 폼이 부류 코드(가칭 `SCHEMA_FORM_ERROR.LISTENER_THREW`, `SCHEMA_FORM_ERROR.RENDER_FAILED`)를 붙인다(ERROR-017).
- `message`: 프로덕션에서도 줄이지 않으며, 전달할 때 한 번 서식한다(ERROR-017).
- `path`: 데이터 경로(JSON Pointer)이며, 노드에 묶인 사건에만 있다(ERROR-017).
- `schemaPath`: 작성된 스키마 안의 위치(JSON Pointer)이며, 청사진 사건에 있다(ERROR-017).
- `details`: 오류면 `error.details`와 같은 참조이고, 경고면 경고의 세부다(ERROR-017).
- `error`(`level`이 `'error'`일 때만): 폼이 드러내는 바로 그 값이다(ERROR-017). 폼이 감싸는 식·가드 예외는 `SchemaFormError`이고 원래 예외는 `details.error`에 있다(ERROR-017). 감싸지 않는 소비자 예외 하나와 사용자 렌더 오류는 원래 값 그대로다(ERROR-017).
- `aggregate`: 둘 이상이 묶여 던져졌을 때 실제로 던진 묶음이다(ERROR-017).
- `surface`(`level`이 `'error'`일 때만): 그 오류가 핸들러 밖에서 드러나는 길이다(ERROR-017).
- `componentStack`: 바운더리가 잡은 오류에만 있으며, `errorInfo.componentStack`이다(ERROR-017).

호스트는 `aggregate ?? error`의 동일성으로 전역 처리기와의 중복을 거를 수 있다(ERROR-017). 다만 핸들러가 던져 부른 쪽이 있는 자리에서 새 묶음이 생기면, 이미 전달된 기록의 `aggregate ?? error`와 실제로 던진 값은 다르다(핸들러 결함의 경우다)(ERROR-017). 경고는 `BaseError` 인스턴스가 아닌 평범한 기록이다(ERROR-017).

**시점.**(ERROR-019) 한 사건에 기록 하나이며, 발생 순서대로 부른다(ERROR-019).

1. 렌더 중에 트리를 만드는 자리가 하는 일(청사진, 마운트 정착)의 기록은 그 로드 객체(`useMemo`의 결과)에 모은다(ERROR-019). 폼이 커밋된 뒤 준비 이펙트에서 초기 `onChange` 다음에 부른다(ERROR-019). 청사진 오류로 폼이 서지 않으면, 생성 자리가 돌려준 실패 로드가 그 오류와 그 전에 모인 경고를 들고 대체 화면의 이펙트가 부른다(ERROR-019). 커밋되지 않은 로드의 기록은 부르지 않는다(ERROR-019). 다만 루트 바운더리가 하위 트리를 버리고 대체 화면을 그리면, 바깥 감싸개의 보고기가 가장 최근에 만든 로드를 들고 있다가 루트 바운더리의 `componentDidCatch`가 그 로드의 오류 층 기록을 렌더 실패 기록보다 먼저 `onError`와 싱크로 보낸다(ERROR-019). 경고 기록은 버린다(청사진 경고는 캐시에 남는다)(ERROR-019). 입력 맵 정규화의 오류는 트리보다 먼저 던져져 루트 바운더리가 잡으므로 여섯째를 따르고, 가상화 관리자 생성의 경고는 일곱째를 따른다(ERROR-019).
2. 마운트 뒤의 사슬은 커밋 → 통지 → 검증 요청 → `onChange` → 기록마다 `onError`(경고 포함) → throw의 순서다(ERROR-019). 정착 도중에는 부르지 않는다(ERROR-019). reset의 재생성과 첫 로드도 reset 사슬의 끝에서 부른다(ERROR-019).
3. `validate()`와 제출은 오류 층의 원인(검증기 실행 실패, 검증 불가, `degraded`)일 때만 거부 직전에 부른다(ERROR-019). 부른 쪽이 기다리지 않는 네이티브 submit 경로에서는 거부 대신 `onError` 뒤 싱크로 보낸다(ERROR-019).
4. 호출자 오류는 throw 직전에 부른다(ERROR-019).
5. `OnChange` 검증의 실행 실패와 검증 결과 파동의 리스너 예외는 그것을 알게 된 마이크로태스크에서 `onError` 뒤 싱크로 보낸다(ERROR-019).
6. 바운더리가 잡은 오류는 `componentDidCatch`에서 `onError` 뒤 싱크로 보낸다(ERROR-019).
7. 렌더 계층 경고는 그 필드나 폼의 커밋 뒤 이펙트에서 부른다(ERROR-019). 지연 마운트된 필드면 그 필드가 커밋된 뒤다(ERROR-019).
8. 재대조(레이아웃 효과)의 기록은 그 레이아웃 효과에서 부른다(ERROR-019).

청사진 경고는 청사진 캐시에 남아 다음 커밋된 로드에서 간다(ERROR-019).

**렌더 중 보증의 범위.**(ERROR-020) 폼이 여는 렌더 단계 작업(청사진, 마운트 정착, 입력 맵 정규화)에서는 부르지 않는다(ERROR-020). 호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, 원리 P5(core는 렌더러를 모른다))은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(REACT-013의 문서화 항목 '렌더 중 사용자 코드의 쓰기는 React의 렌더 중 갱신 경고를 받는다'와 같은 자리에 적는다)(ERROR-020, GOAL-031, REACT-013).

**환경.**(ERROR-021) 클라이언트의 모든 환경에서 같은 사건은 같은 `code`, `level`, `details`, `surface`로 한 번 간다(목표 G5(한 장으로 설명되는 라이프사이클))(ERROR-021, GOAL-009). 핸들러가 있으면 프로덕션에서도 경고를 받는다(ERROR-021). 예외는 하나다(ERROR-021). 가드 컴파일 실패는 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보낸다(`surface`는 `'sink'`)(ERROR-021). 프로덕션에서는 그 가드를 처음 평가하는 사슬 끝에서 보내며(`surface`는 `'thrown'`), 한 번도 평가되지 않은 가드의 실패는 기록이 없다(ERROR-021, ERROR-041). 오류 메시지는 어느 환경에서도 줄이지 않는다(ERROR-021).

**중복 막기 — 오류.**(ERROR-023)

- 원점 경로(사슬 끝, 거부, 호출자 오류, 마이크로태스크, 로드 전달)는 사건마다 부른다(ERROR-023). 그래서 소비자가 같은 객체를 되풀이해 던져도 사건마다 기록된다(ERROR-023).
- 폼이 던진 객체 값(원래 값 그대로 던진 소비자 예외와 묶음 포함)은 폼 인스턴스의 `WeakSet`에 넣는다(ERROR-023). `componentDidCatch`는 잡은 값이 그 집합에 있으면 집합에서 한 번 빼고 핸들러 전달만 건너뛴다(ERROR-023). 싱크는 그 경로가 처음이므로 부른다(ERROR-023). 집합에 남은 값(폼 밖 바운더리가 잡아 빠지지 않은 것)을 폼 안의 다른 렌더가 같은 값을 또 던지면, 그 렌더 실패의 핸들러 전달이 한 번 빠질 수 있다(싱크는 간다)(ERROR-023).
- 원시값(문자열, 숫자)은 `WeakSet`에 넣을 수 없으므로 표지 없이 사건마다 보낸다(ERROR-023). 이펙트에서 연 사슬의 원시값 throw가 필드 바운더리에 다시 잡히면 두 번 갈 수 있다(ERROR-023).
- 검증 불가는 한 로드에 오류 객체 하나이며, 그 로드에서 처음 드러날 때 한 번 보낸다(ERROR-023).
- 묶음은 구성 오류마다 기록하고, 묶음 자체는 `aggregate` 칸으로만 싣는다(ERROR-023).

**중복 막기 — 경고.**(ERROR-024) 키는 서식 전의 구조 키다(ERROR-024). code, 위치(`path`, 없으면 `schemaPath`, 둘 다 없으면 폼 수준), 코드마다 정한 판별 칸(예: `ALL_OF_KEYWORD_IGNORED_FOR_FORM`의 `keyword`, `PRESENTATION_KEY_SUSPECT`의 키 이름)으로 이룬다(ERROR-024). 메시지는 이 키를 통과한 첫 번에만 서식한다(ERROR-024). 키는 폼 인스턴스의 폼 수준 로드인 마운트·`FormHandle.reset()`에서만 비우며, `diagnostics`와 같은 단위다(ERROR-024, ERROR-204). 루트 전체 교체(`setValue(V)`)는 로드가 아니라 전체 교체 쓰기이고, `setValue(V)`와 `resetSubtree()`는 경고 중복 키와 `diagnostics`를 비우지 않는다(ERROR-024, ERROR-204, WRITE-090). 집합은 핸들러가 있을 때만, 처음 경고가 날 때 만든다(ERROR-024). 청사진 경고는 청사진의 목록이 이미 발생마다 하나씩이라 따로 거르지 않는다(ERROR-024). 검증기 없이 쓰는 폼은 트리마다 `VALIDATOR_MISSING` 하나를 받으며, 검증 모드를 `None`으로 적으면 사라진다(ERROR-024, ERROR-148, ERROR-151).

**서버.**(ERROR-025) 서버에서는 부르지 않는다(ERROR-025). 이펙트, `componentDidCatch`, 사슬, 검증이 서버 렌더에서 돌지 않기 때문이다(ERROR-025). 서버에서 생성 자리에 잡힌 오류는 싱크의 서버 가지(`console.error` 한 번)로만 남는다(ERROR-025). 서버의 기록을 클라이언트로 옮기지 않는다(ERROR-025). 하이드레이션이 트리를 다시 만들 때 같은 기록이 클라이언트 준비 이펙트에서 한 번 간다(ERROR-025). 서버 개발 모드의 콘솔 경고는 오늘처럼 남는다(ERROR-025).

**StrictMode.**(ERROR-026) 로드 기록은 커밋된 로드 객체에 붙으므로, 버려진 이중 렌더의 기록은 가지 않는다(ERROR-026). 로드 객체의 '전달함' 표지는 이펙트 정리에서 되돌리지 않으므로, 이펙트가 두 번 돌아도 한 번 간다(ERROR-026). StrictMode의 흉내 언마운트·재마운트는 로드가 아니므로 경고 집합을 비우지 않는다(ERROR-026). React 18 개발 모드가 바운더리 오류를 전역 오류로 한 번 더 재생하는 것은 싱크 쪽의 사실이며, 핸들러는 `componentDidCatch`에서 한 번만 불린다(ERROR-026). 실행 확인은 PR-7의 React 18 시험에서 한다(ERROR-026).

### 05-validation-and-errors.md §2.16 핸들러 예외와 비용

외부 조사의 안 B("`onError` 하나로 보내고 없으면 throw", 17라운드 4번 수렴의 안 B와 다르다)는 소비자가 오류를 삼킬 수 있어 완결성이 깨지므로 택하지 않는다(ERROR-012). 핸들러가 받은 항목의 기본 출력을 대신하는 안도 같은 이유로 택하지 않는다(ERROR-012). 빈 핸들러 하나가 주인 없는 오류 싱크를 끄는 스위치가 되기 때문이다(ERROR-012). 버린 안의 나머지(안 A, 이름 `onLog`, 경고를 개발 모드에서만 보내는 안, 검증기 없음을 `'error'`로 두는 안, 모든 경로의 `WeakSet`, 앱 수준 기본 `onError` 등)와 근거는 `reviews/raw-round17-onerror.md`에 있다(ERROR-012).

**핸들러가 던질 때.**(ERROR-028) 모든 전달은 try/catch 안에서 한다(ERROR-028). 핸들러의 예외는 원래 사건의 기본 드러남을 건너뛰게 하거나 바꾸지 못한다(ERROR-028).

- 부른 쪽이 있는 자리(사슬 끝, `validate()`·제출의 거부, 호출자 오류의 즉시 throw): 남은 기록의 전달을 마친다(ERROR-028). 그다음 원래 드러날 값(오류 하나 또는 이미 만든 묶음)을 펼치지 않고 앞에, 핸들러 예외들을 뒤에 두고 발생 순서대로 `SchemaFormError` 하나(`details.errors`)로 묶어 던지거나 거부한다(ERROR-028). 원래 오류 객체는 `details.errors`에 그대로 남는다(ERROR-028). 경고만 있던 사슬이면 핸들러 예외(둘 이상이면 묶음)를 사슬 끝에서 던진다(ERROR-028).
- 부른 쪽이 없는 자리(커밋 뒤 이펙트, 마이크로태스크, `componentDidCatch`, 네이티브 submit): 원래 사건의 싱크는 그대로 부르고, 핸들러의 예외는 싱크로 한 번 보내며, 남은 기록의 전달은 계속한다(ERROR-028). `componentDidCatch` 밖으로 예외를 내보내지 않으므로 호스트의 바운더리가 화면을 내리지 않는다(ERROR-028).
- 핸들러 자신의 예외는 `onError`에 다시 보내지 않는다(재귀가 없다)(ERROR-028).
- async 핸들러가 거부하면, 반환값을 무시한다는 규칙에 따라 그것은 호스트 자신의 프로미스이므로 폼이 잡지 않는다(ERROR-028).

**핸들러 안의 쓰기.**(ERROR-029) 전달하는 동안 폼 인스턴스의 '전달 중' 표지를 켠다(ERROR-029). 그 사이 이 폼에 대한 쓰기(`setValue`, `reset`, `batch`, 배열 `push`·`remove`·`update`, 상태 쓰기, `setExternalErrors`·`clearExternalErrors`)는 호출자 오류(`SchemaFormError`, 가칭 `WRITE_IN_OBSERVER`)로 즉시 던지며 `onError`에 보내지 않는다(ERROR-029). 그 예외가 핸들러 밖으로 새어 나가면 '핸들러가 던질 때'의 규칙을 따른다(ERROR-029). `validate()`는 허용한다(ERROR-029). 동기 진입을 열지 않고 결과는 자기 파동으로 오기 때문이다(ERROR-029). 다만 실패 기록(`VALIDATOR_THREW`) 안에서 `validate()`를 다시 부르면 실패가 되풀이될 수 있으므로 그렇게 하지 말라고 문서에 적는다(ERROR-029). 호스트의 setState와 다른 폼에 대한 쓰기는 막지 않는다(ERROR-029). 비용은 불리언 하나다(ERROR-029).

**비용.**(ERROR-030) 소비자가 있는지는 '핸들러가 있음 또는 `process.env.NODE_ENV !== 'production'`(정적 치환)'으로 판정한다(판정은 보고기의 `hasConsumer()`로 사건마다 한다)(ERROR-030).

- 소비자가 없을 때(핸들러 없는 프로덕션): 기록 객체, 메시지 서식, 경고 집합, 정착 경고 판정, 청사진 경고 데이터를 만들지 않는다(ERROR-030). 오늘 프로덕션에서 돌다 버려지는 경고 검출과 서식(`warnIfNullUnreachable.ts:25-38`, `processAllOfSchema.ts:38-44`)도 건너뛰므로 오늘보다 싸다(ERROR-030).
- 청사진: 소비자가 있을 때 수집기 인자로 경고를 데이터(code, 위치, details, 서식 없음)로 모아 캐시에 담는다(ERROR-030). 소비자 없이 만들어진 캐시 청사진을 핸들러를 가진 폼이 처음 쓰면, 그 작성 루트에 경고 수집을 한 번 돌려 캐시 항목에 붙인다(ERROR-030). 작성 루트마다 한 번이며, 캐시와 함께 해제된다(ERROR-030).
- 핸들러가 있을 때: 사건마다 작은 객체 하나를 만든다(ERROR-030). 정착 경고는 그 정착이 다룬 `oneOf` 호스트에서 이미 계산한 게이트 결과를 세는 것이라 분기 수에 비례하고, 추가 순회가 없다(ERROR-030). 경고 집합은 서로 다른 경고 수 이하이고 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 비우며, `setValue(V)`와 `resetSubtree()`는 비우지 않는다(ERROR-030, ERROR-204). `WeakSet`은 약한 참조다(ERROR-030).
- 노드 수에 비례하는 칸은 없다(ERROR-030). 오류 객체를 새로 만들지 않고 경고는 평범한 기록이므로 스택 수집 비용도 없다(ERROR-030). 고속성 대 투명성의 '프로덕션 비용 없이 추적성'을 지킨다(ERROR-030, GOAL-086).

### 05-validation-and-errors.md §2.17 렌더 오류와 바운더리

**React에서 보이는 것.**(ERROR-085) 이벤트 핸들러 안에서 던져진 예외는 에러 바운더리를 발화시키지 않는다(ERROR-086). 화면은 백지가 되지 않고 직전 커밋 상태로 남으며, 브라우저 전역 오류와 모니터링 도구에 잡힌다(ERROR-087). 폼의 바운더리(루트 바운더리와 사용자 주입 구성 요소의 필드 바운더리)는 **다시 던지지 않고 삼키지도 않는다.**(ERROR-088) 오늘처럼 가두어 대체 화면을 그리되, 잡은 오류를 `componentDidCatch`에서 `onError`와 싱크로 넘긴다(오늘은 `console.error`뿐이다)(ERROR-089).

필드 바운더리는 오늘처럼 인라인 입력(`useFormTypeInput.ts:36-37`), 덮어쓴 입력(`SchemaNodeInputWrapper.tsx:56-57`), 정의·맵의 입력(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`), 렌더러(`SchemaNodeProxy.tsx:59`), `Placeholder`(`VirtualizationManager.ts:214`)를 감싼다(ERROR-090). 바운더리가 다시 던지지 않으므로 오류 부류 판별(`instanceof`, `group`)에 기대지 않고, 중첩 `<Form>`의 청사진 오류는 안쪽 폼 자리에서 멈춘다(ERROR-091). 공개 동작(대체 화면)은 바뀌지 않는다(ERROR-092). 바운더리가 오류를 호스트로 올려 보내지 않는 것은 17라운드 소유자 답(통보4)이고, 핸들러의 예외를 바운더리 밖으로 내보내지 않는 것은 스웜 수렴(편집자 결정)이다(ERROR-093). 바운더리는 렌더 오류를 다시 던지지 않고 가두어 대체 화면을 그린다(ERROR-178, ERROR-088, ERROR-089).

### 05-validation-and-errors.md §2.18 폼과 필드 바운더리의 보고

**바운더리 경로.**(ERROR-110) `Form.tsx:311-312`의 범용 `withErrorBoundaryForwardRef`를 schema-form의 바깥 감싸개로 바꾼다(ERROR-111). 바깥 감싸개는 인스턴스 보고기(최신 핸들러, `WeakSet`, 경고 집합, 전달 중 표지)를 `useRef`로 들고 문맥으로 내려 주며, 그 안에 보고를 받는 루트 바운더리를 둔다(ERROR-112). 보고기가 루트 바운더리 바깥에 있으므로 대체 화면으로 바뀐 뒤에도 살아 있다(ERROR-113). 감싸는 자리가 모듈 수준(`PluginManager.ts:39-40`·`:78`), `FormProvider`(`ExternalFormContextProvider.tsx:222`), 폼마다(`FormTypeInputsContextProvider.tsx:31-36`)로 갈리는 필드 바운더리(`formTypeInputDefinitions.ts:32`·`:37`, `formTypeInputMap.ts:32`·`:37`)는 감싸기를 그대로 두고, 렌더 때 문맥에서 보고기를 읽는다(ERROR-114). 사용자 주입 구성 요소를 격리하는 필드 바운더리(`withErrorBoundary`, 패키지 규칙)는 그대로이며, 그 바운더리가 잡은 렌더 오류가 `onError`에 가는 것만 새롭다(ERROR-163).

### 05-validation-and-errors.md §2.19 오류 경계 유틸리티 확장

`@winglet/react-utils`의 `withErrorBoundary`·`withErrorBoundaryForwardRef`에는 렌더 때 보고 함수를 얻는 선택 인자를 더한다(ERROR-115). 주지 않으면 오늘 동작이고 판은 minor다(ERROR-116). 인자의 모양(ErrorBoundary 보고 콜백 속성과 그 공개, 또는 감싸개의 보고기 읽기 인자)은 PR-7에서 고른다(ERROR-117). 그 모듈 INTENT의 'Ask first' 두 항목(고차 구성 요소의 시그니처 확장, 내부 오류 경계 구성 요소의 공개 표면 승격)에 해당하며, 소유자가 확장을 허용했다(17라운드 소유자 답 (나) "(나) 확장 허용합니다")(ERROR-118). PR-7에서 그 모듈의 `DETAIL.md`를 먼저 갱신한 뒤 코드를 고친다(ERROR-119).

### 05-validation-and-errors.md §2.20 추가 경고의 발생 조건

변환에러는 onError 로 전달하죠(ERROR-184).

편집자 결정: `onError` 기록의 level은 `warning`이다(ERROR-186). 값을 보존하므로 폼의 약속은 지켜진다(ERROR-186). error 층은 throw·거부·싱크로 드러나야 해 통보 3과 부딪힌다(ERROR-186). `SCHEMA_FORM_WARNING.TYPE_MISMATCH`를 노드의 정합 상태가 켜질 때마다 한 번 보낸다(path, 기대 형, 받은 값의 종류, 쓰기 출처)(ERROR-186, SURFACE-061). level은 `warning`이다(개발 모드 콘솔, 프로덕션은 핸들러가 있을 때만)(ERROR-186). 【추론】 `SCHEMA_FORM_WARNING.TYPE_MISMATCH` 기록은 `{ level: 'warning', code, path, expected: { schemaType, nullable, effective }, received, reason, candidates?, source }`이다(ERROR-186, EVENT-060, SURFACE-061). 【추론】 `expected.schemaType`은 `node.schemaType`이고, `expected.effective`는 그 커밋의 유효 목록이다(ERROR-186). 【추론】 `source`는 EVENT-060의 쓰기 출처 값에 `'gate'`를 더한 것이다(ERROR-186, EVENT-060). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`다(ERROR-186, SURFACE-061).

검증기가 있든 없든 보낸다(core의 parse가 찾는 것이라 검증 결과가 아니다)(ERROR-187). 제출은 검증기가 있으면 검증이 막고 없으면 막지 않는다(통보 3)(ERROR-187).

터미널이 된 노드의 입력이 비어 있는 `ChildNodeComponents`를 읽으면 개발 모드에서 경고한다(목표 C2(작성자 실수의 가시성))(ERROR-185, GOAL-015). 【추론】 가상은 `branch`이므로 ERROR-185의 경고(터미널 노드의 입력이 빈 `ChildNodeComponents`를 읽을 때의 개발 모드 경고)는 가상 노드에 적용되지 않는다(ERROR-185).

플러그인이 자기 방언을 선택적으로 선언하고, 스키마의 `$schema`와 어긋나면 개발 모드에서 경고만 낸다(프로덕션 출력 없음, `onError` 핸들러가 있으면 경고 기록)(ERROR-188). 경고 코드는 ERROR-164의 목록에 더한다(가칭, 편집자)(ERROR-188, ERROR-164).

### 05-validation-and-errors.md §2.21 오류 코드의 공개 계약과 목록

**공개 계약과 판 규칙.**(ERROR-031) 오늘 오류·경고 코드는 공개 계약이 아니다(ERROR-031). `package.json`의 `exports`는 '.'뿐이고, `src/index.ts`는 판별 함수만 내보내며, 경고 상수는 내부 배럴 `src/helpers/warning`에 있다(ERROR-031). 이 결정은 코드 문자열 목록을 새로 공개한다(공개 표면이 넓어지는 대가다)(ERROR-031). 형 `FormErrorCode`는 이름으로 내보내고, 런타임 상수 묶음은 소비자가 드러날 때 더한다(ERROR-031). README와 docs에 코드 표(코드, level, 부류, 언제, 누구 잘못, 기본 드러남)를 싣는다(ERROR-031). 코드를 더하면 minor, 이름을 바꾸거나 없애면 major다(ERROR-031).

17라운드 4번 수렴의 목록 50행을 게이트 R17G-9와 R17G-2대로 고친 것이다(ERROR-164). `(조건부) SCHEMA_FORM_WARNING.UNSET_ON_INACTIVE_ON_OBJECT` 행은 R17-2가 ㄴ으로 확정되어 지웠고, `presentation.trim`은 `PRESENTATION_KEY_SUSPECT`의 둘째 경우에 들며, `FormProvider`를 폼 인스턴스 밖으로 제외한 문구는 사실과 달라(`FormProvider`는 맵을 받지 않고 정의 정규화에는 던지는 자리가 없다) 지웠다(ERROR-164). 검증기 없음과 조건부 스키마 경고는 트리마다 한 번이다(ERROR-164). 끝에 설계 항목에서 생길 수 있는 코드의 행을 더했다(ERROR-164). '(가칭)'인 코드 이름은 PR-4에서 확정한다(ERROR-164). '(제외)' 행은 `onError`가 받지 않는 것이다(ERROR-164). '자리'는 오늘 코드의 위치(`src/` 아래) 또는 이 목록의 규칙을 든 원장 ID다(ERROR-164). `surface`의 값은 `'thrown'`(사슬 끝이나 호출에서 던짐), `'rejected'`(프로미스 거부), `'sink'`(주인 없는 오류 싱크)다(ERROR-164).

(ERROR-164, ERROR-185, ERROR-202, ERROR-195, CONTROLS-079, BLUEPRINT-044)

| 코드 | level | 언제 | 자리 | 기본 드러남 | 핸들러 전달 | 오늘과 새 설계 |
| --- | --- | --- | --- | --- | --- | --- |
| `JSON_SCHEMA_ERROR.UNKNOWN_JSON_SCHEMA` | `error` | 청사진 분석(마운트, reset의 스키마 교체) | src/core/nodes/schemaNodeFactory.ts:116. 기록에 schemaPath | 마운트: 생성 자리에서 잡아 폼 자리에 대체 화면을 그리고 커밋 뒤 싱크(ERROR-003). reset 안: reset이 던짐. 재대조(레이아웃 효과): 지금 트리를 둔 채 그 레이아웃 효과에서 싱크(ERROR-003) | 받음. 마운트는 대체 화면의 이펙트(surface 'sink'), reset은 throw 직전('thrown'). 재대조는 그 레이아웃 효과('sink') | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.UNEXPECTED_ARRAY_SCHEMA` | `error` | 청사진 분석 | src/core/nodes/ArrayNode/validate.ts:26, :40, :53, :72. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.ALL_OF_TYPE_REDEFINITION` 또는 CONFLICTING_CONST_VALUES 또는 INVALID_RANGE 또는 EMPTY_ENUM_INTERSECTION | `error` | 청사진 분석(정적 연언의 교차). 오늘은 노드 생성 때(src/core/nodes/schemaNodeFactory.ts:133의 processAllOfSchema)이며 Form 전처리가 아님 | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:46, intersectSchema/utils/intersectConst.ts:24, validateRange.ts:22, intersectEnum.ts:36. 오늘은 details에 경로가 없고, 새 설계는 schemaPath를 실음 | 청사진 오류와 같음. PR-1부터 교차 함수는 공집합 표시를 돌려주고 청사진만 던짐(LANDING-061) | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| `JSON_SCHEMA_ERROR.COMPOSITION_TYPE_REDEFINITION` 또는 COMPOSITION_PROPERTY_REDEFINITION 또는 COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION | `error` | 오늘: 합성 노드 표를 구성할 때 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:81, :96; utils/throwIfTypeRedefinition.ts:29 | 오늘: throw를 Form 자기 바운더리가 console.error로 가둠 | 새 설계에서 없어짐. 노드 공유와 SHARED_NODE_KIND_CONFLICT(청사진), SHARED_NODE_CONFLICT(정착)로 대체 | 오늘에만 |
| `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_NOT_VALID` 또는 VIRTUAL_FIELDS_NOT_IN_PROPERTIES | `error` | 청사진 분석(options.virtual 참조) | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getVirtualReferencesMap/getVirtualReferencesMap.ts:41, :55 | 청사진 오류와 같음 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| (가칭) `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES` | `error` | 가상 노드에 길이가 다른 배열을 쓰는 쓰기 | src/core/nodes/VirtualNode/VirtualNode.ts:46(__emitChange__). 기록에 path | 오늘: 즉시 throw. 새 설계: 쓰기의 출처로 가름. 공개 API에서 오면 호출자 오류(즉시 throw), 자동 쓰기(controls.injectTo 등)에서 오면 정착 오류(그 규칙을 후보에서 빼고 사슬 끝 throw, degraded). 분류는 확정되었다 — 공개 API에서 오면 호출자 오류, 자동 쓰기에서 오면 정착 오류(`cause` (가칭) `'writeShape'`) | 받음(호출자 오류면 throw 직전, 정착 오류면 사슬 끝) | 새 설계에도 있으며 코드는 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(가칭)이고, 공개 API에서 오면 호출자 오류, 자동 쓰기에서 오면 정착 오류(`cause` (가칭) `'writeShape'`)다 |
| `JSON_SCHEMA_ERROR.CREATE_DYNAMIC_FUNCTION` 또는 OBSERVED_VALUES 또는 CONDITION_INDEX 또는 CONDITION_INDICES | `error` | 청사진 분석(controls 식 컴파일 실패) | src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/createDynamicFunction/createDynamicFunction.ts:43, getObservedValuesFactory.ts:58, getConditionIndexFactory.ts:65, getConditionIndicesFactory.ts:76 | 청사진 오류와 같음. 컴파일러는 PR-1에서 청사진으로 옮김 | 청사진 오류와 같음 | 오늘과 새 설계 모두 |
| (가칭) `JSON_SCHEMA_ERROR.UNKNOWN_GROUP_KEY` | `error` | 청사진 분석: controls·options·children[].controls의 닫힌 목록 밖 키 | R15-4. 기록에 schemaPath | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| (가칭) `JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE` | `error` | 청사진 분석: `controls`·`options`·`children[].controls`의 닫힌 목록 안 키의 값 모양이 선언과 다름 — 그룹이 객체가 아님, `injectTo`가 함수가 아님, `children`이 배열이 아님, `children` 항목의 모양 | 기록에 schemaPath와 `{ group, key, expected }` | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| (가칭) `JSON_SCHEMA_ERROR.DISCRIMINATOR_MISMATCH` | `error` | 청사진 분석: controls.discriminator 키가 어느 분기에도 없거나, 분기끼리 종류가 다르거나 값이 겹치거나, 선언 사이 값이 다름 | ERROR-159의 청사진 오류 행, R15-7 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| (가칭) `JSON_SCHEMA_ERROR.SHARED_NODE_KIND_CONFLICT` | `error` | 청사진 분석: 정적 선언끼리는 교집합으로 노드 하나를 정하고 비면 `ALL_OF_TYPE_REDEFINITION`이며, 이 코드는 호스트의 게이트 없는 분기의 fold가 정적 노드의 fold에 들지 않을 때 | ERROR-159의 청사진 오류 행(14라운드 O-10) | 청사진 오류와 같음(폼이 서지 않음) | 청사진 오류와 같음 | 새 설계에만(오늘의 COMPOSITION_*_REDEFINITION을 대체) |
| (가칭) `JSON_SCHEMA_ERROR.TERMINAL_STRATEGY_MISMATCH` | `error` | 청사진 분석: 노드가 형상에 있는 경우마다 정한 터미널 전략이 서로 다름 | R15-10 | 청사진 오류와 같음 | 청사진 오류와 같음 | 새 설계에만 |
| `JSON_SCHEMA_ERROR.INJECT_TO` | `error` | 오늘: injectTo 실행 중 아무 예외 | src/core/nodes/AbstractNode/AbstractNode.ts:1010-1016 | 오늘: 커밋 없이 배치 도중 throw해 이벤트 처리기를 뚫고 나감 | 새 설계에서 둘로 나뉨: 동적 대상 없음은 INJECT_TARGET_MISSING, 식 예외는 EXPRESSION_THREW. 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다 | 오늘에만 |
| `SCHEMA_FORM_ERROR.INFINITE_LOOP_DETECTED` | `error` | 오늘: 배치 수가 상한을 넘음 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:97 | 오늘: 커밋 없이 throw | 새 설계에서 BUDGET_EXCEEDED와 FEEDBACK_LIMIT_EXCEEDED로 대체 | 오늘에만 |
| (가칭) `SCHEMA_FORM_ERROR.SHARED_NODE_CONFLICT` | `error` | 정착: 게이트에 달린 같은 이름·다른 종류 선언이 실제로 동시에 켜짐 | ERROR-078, ERROR-079, ERROR-159의 정착 오류 행. 기록에 path | 마운트: 모든 환경에서 폼이 서지 않고 대체 화면을 그린 뒤 커밋 뒤 싱크. 마운트 뒤: 앞선 종류로 커밋, 통지 뒤 사슬 끝 throw, degraded | 마운트는 대체 화면의 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.BUDGET_EXCEEDED`(details.exceededBudget: hostWheel·derive·transition) | `error` | 정착의 예산 초과 | ERROR-159의 정착 오류 행. 기록에 path(마지막 라운드의 규칙 대상) | 원본 B 커밋과 통지 뒤 사슬 끝 throw, 모든 환경(R17-1 나). degraded가 다음 로드까지 남고 그 동안 제출을 거부. 마운트에서는 폼이 서고 커밋 뒤 싱크 | 마운트는 준비 이펙트('sink'), 마운트 뒤는 throw 직전('thrown') | 새 설계에만(오늘의 INFINITE_LOOP_DETECTED를 대체) |
| (가칭) `SCHEMA_FORM_ERROR.EXPRESSION_THREW` | `error` | 정착: controls 식이나 if 게이트 함수의 런타임 throw(게이트, 상태 키, 파생 규칙, resetInteraction) | ERROR-121. 기록에 path | 자리마다 정의된 값으로 정착을 마치고 커밋, 통지 뒤 사슬 끝 throw, degraded, 모든 환경(R17-1 나). 마운트에서는 폼이 서고 싱크 | 받음. error는 SchemaFormError이고 원래 예외는 details.error | 부류는 새 설계에만(오늘은 식의 런타임 예외를 잡지 않아 원래 예외가 그대로 전파됨. 잡는 자리는 컴파일 시점뿐) |
| (가칭) `SCHEMA_FORM_ERROR.GUARD_FAILED` | `error` | 정착: 가드 평가 실패 또는 가드 컴파일 실패 | ERROR-041. 기록에 path(게이트의 호스트) | 게이트는 거짓, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음. 컴파일 실패만 개발 모드가 시점을 앞당겨 마운트의 커밋 뒤에 보냄('sink'). 프로덕션은 처음 평가하는 사슬 끝('thrown')에 보내고, 평가되지 않은 가드는 기록이 없음. 가드 표가 실패한 컴파일의 오류를 캐시하므로 그 가드를 쓰는 폼 인스턴스마다 자기 사건으로 받음 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.INJECT_TARGET_MISSING` | `error` | 정착: 동적으로만 아는 controls.injectTo 대상이 없음 | ERROR-122, ERROR-127, ERROR-159의 정착 오류 행 | 그 규칙을 후보에서 빼고 커밋, 사슬 끝 throw, degraded, 모든 환경(R17-1 나) | 받음(마운트는 준비 이펙트, 마운트 뒤는 throw 직전) | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.FEEDBACK_LIMIT_EXCEEDED` | `error` | 통지: 리스너 되먹임 파동 25, onChange 중첩 25 초과 | ERROR-159의 되먹임·중첩 오류 행 | 고리 하나를 끊고 사슬 끝 throw, 모든 환경(R17-1 나). diagnostics에는 남기지 않음 | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.LISTENER_THREW` | `error` | 통지: 구독 리스너, onChange, onStateChange, onDiagnosticsChange, batch fn이 던짐. 검증 결과 파동의 리스너와 onValidate가 던짐 | src/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:211-212(오늘은 잡지 않음), src/components/Form/Form.tsx:139(onValidate, catch 없음), EVENT-046의 검증 결과 행 | 사슬: 배달을 끝내고 사슬 끝 throw(하나면 원래 값 그대로). 검증 결과 파동: 싱크로 보내고 미처리 거부로 남기지 않음(ERROR-019의 다섯째). 모든 환경 | 사슬은 throw 직전('thrown'), 파동은 그 마이크로태스크('sink'). error는 소비자의 원래 값이고 code는 폼이 붙임 | 오늘은 잡지 않고 전파(onValidate는 미처리 거부). 부류는 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.MULTIPLE_ERRORS`(묶음) | `error` | 한 사슬에서 오류가 둘 이상이거나, 부른 쪽이 있는 자리에서 핸들러가 던짐 | ERROR-005 | SchemaFormError 하나로 묶어 details.errors에 발생 순서대로 담아 throw 또는 거부 | 따로 기록하지 않음. 구성 기록마다 aggregate 칸에 이 객체를 실음 | 새 설계에만 |
| `SCHEMA_FORM_ERROR.FORM_TYPE_INPUT_MAP` | `error` | 렌더: Form 속성 formTypeInputMap 정규화(src/providers/FormTypeInputsContext/FormTypeInputsContextProvider.tsx:29-34의 useMemo) | src/helpers/formTypeInputDefinition/formTypeInputMap.ts:53. 기록에 맵의 키 | 오늘: 루트 바운더리가 console.error로 가둠. 새 설계: 루트 바운더리가 가두어 대체 화면을 그리고 componentDidCatch에서 싱크 | componentDidCatch('sink', componentStack 포함) | 오늘과 새 설계 모두 |
| `UNHANDLED_ERROR.REGISTER_PLUGIN` | `error` | registerPlugin 호출(전역) | src/app/plugin/registerPlugin.ts:215 | 부른 쪽에 즉시 throw | 받지 않음(폼 인스턴스가 없음) | 오늘과 새 설계 모두 |
| (가칭) `SCHEMA_FORM_ERROR.INVALID_WRITE_OPTION` | `error` | 공개 API: Overwrite와 Merge를 함께 준 setValue | ERROR-159의 호출자 오류 행. 기록에 path | 즉시 throw(호출자 오류) | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.DISPOSED_NODE_WRITE` | `error` | 재생성 reset으로 폐기된 노드에 호출자가 옛 참조로 한 쓰기 | WRITE-046. 기록에 path | 적용하지 않고 즉시 throw, 모든 환경. 입력 출처 표식이 있는 늦은 입력 쓰기는 오류가 아니며 조용히 버림 | throw 직전('thrown') | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.WRITE_IN_OBSERVER` | `error` | onError 전달 중 이 폼에 대한 쓰기 | ERROR-029 | 핸들러 안으로 즉시 throw | 받지 않음(재귀 없음). 핸들러 밖으로 새면 핸들러 예외의 규칙을 따름 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_ERROR.SUBMIT_WHILE_DEGRADED` | `error` | diagnostics.status가 degraded인 동안의 제출 | ERROR-138, ERROR-139, ERROR-159의 제출 거부 행, R17-1 나 | FormHandle.submit과 useFormSubmit은 거부. 네이티브 submit(src/components/Form/Form.tsx:127-133, 부른 쪽 없음)은 싱크 | 거부 직전('rejected') 또는 싱크 직전('sink'). 제출 시도마다 새 객체 | 새 설계에만 |
| `JSON_SCHEMA_ERROR.CIRCULAR_REFERENCE` 또는 SCHEMA_COMPILE_FAILED(+ 노드 errors의 jsonSchemaCompileFailed) | `error` | 오늘: 노드 생성 때 전체 스키마 컴파일 실패 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:205-222, utils/getFallbackValidator.ts:14-26 | 오늘: 모든 환경에서 console.error를 내고, 이어 대체 검증기가 노드 errors에 항목을 넣음 | 새 설계에서 없어짐. VALIDATOR_COMPILE_FAILED로 대체되며 노드 errors에는 넣지 않음 | 오늘에만 |
| (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_COMPILE_FAILED` | `error` | 로드 뒤 첫 검증 요청: 검증기는 있으나 전체 스키마 컴파일이 실패하고 검증 모드가 None이 아님 | ERROR-155 | 한 로드에 오류 객체 하나로 첫 OnChange 검증, validate(), 제출을 모든 환경에서 거부(R17-1 나). 그 로드에서 OnChange 검증을 다시 예약하지 않음 | 한 로드에 한 번, 처음 드러날 때(OnChange면 'sink', validate()·제출이면 'rejected') | 새 설계에만. 통보3의 답은 검증기가 있는 이 경우에 닿지 않음 |
| (가칭) `SCHEMA_FORM_ERROR.VALIDATOR_THREW` | `error` | 검증 요청: 검증 함수의 런타임 throw, 요청 시점의 $ref 순환 | src/core/nodes/AbstractNode/AbstractNode.ts:1215-1222(오늘 OnChange는 잡지 않음), src/components/Form/Form.tsx:139, ERROR-159의 검증기 오류 행 | validate()와 제출은 거부. OnChange는 싱크로 보내며 미처리 거부로 남기지 않음(ERROR-039). 모든 환경 | validate()는 거부 직전('rejected'), OnChange는 마이크로태스크에서 핸들러 뒤 싱크('sink'). ValidateFunction 문서 주석에 '입력의 판정은 돌려주고 던지지 않는다'를 적어 검증 결과와의 경계를 못박음 | 새 설계에만(오늘은 미처리 거부) |
| (가칭) `SCHEMA_FORM_ERROR.RENDER_FAILED` | `error` | 렌더: 사용자 주입 구성 요소(FormTypeInput, 렌더러 넷, Placeholder, 렌더러 안의 formatError)와 루트의 렌더 오류 | 필드 바운더리 src/components/SchemaNode/SchemaNodeInput/hooks/useFormTypeInput.ts:36-37, SchemaNodeInputWrapper.tsx:56-57, src/components/SchemaNode/SchemaNodeProxy/SchemaNodeProxy.tsx:59, src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:214. 루트 src/components/Form/Form.tsx:311-312 | 가두어 대체 화면을 그리고 componentDidCatch에서 싱크(ERROR-089). ErrorBoundary의 console.error는 남음(packages/winglet/react-utils/src/hoc/withErrorBoundary/components/ErrorBoundary.tsx:52-54) | componentDidCatch('sink'). error는 원래 값이고 componentStack을 실으며, 필드 바운더리면 path가 있음. 폼이 이미 던진 값이면 핸들러를 한 번 건너뜀 | 오늘은 console.error뿐. 부류는 새 설계에만 |
| (코드 없음) onError 핸들러 자신의 예외 | `error` | 핸들러를 호출할 때(동기 throw) | ERROR-028 | 부른 쪽이 있으면 원래 오류를 앞에 두고 묶어 던지거나 거부함. 부른 쪽이 없으면 싱크로 한 번 보냄. async 핸들러의 거부는 호스트 자신의 프로미스 | 받지 않음(재귀 없음) | 새 설계에만 |
| `SCHEMA_FORM_WARNING.ALL_OF_KEYWORD_IGNORED_FOR_FORM` | `warning` | 청사진 분석(노드 생성의 allOf 처리) | src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:40-44. 판별 칸은 keyword. 새 설계에서 schemaPath를 붙임 | 개발 모드 콘솔(세션 단위 code+message 중복 억제), 프로덕션 기본 출력 없음 | 커밋된 로드의 준비 이펙트. 무시한 키워드마다 기록 하나 | 오늘과 새 설계 모두 |
| `SCHEMA_FORM_WARNING.NULL_BRANCH_IGNORED_FOR_FORM` | `warning` | 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullBranchIgnored.ts:25 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 오늘과 새 설계 모두 |
| `SCHEMA_FORM_WARNING.NESTED_COMPOSITION_IGNORED_FOR_FORM` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNestedComposition.ts:24 | 오늘: 개발 모드 콘솔 | 없음(폐기. 중첩 합성은 재귀로 다룸, FRAGMENT-021) | 오늘에만 |
| `SCHEMA_FORM_WARNING.NULLABLE_ONE_OF_NULL_UNREACHABLE` | `warning` | 오늘: 청사진 분석 | src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/utils/warnIfNullUnreachable.ts:34 | 오늘: 개발 모드 콘솔 | 없음(폐기. 분기 내용을 읽음, ERROR-162) | 오늘에만 |
| `SCHEMA_FORM_WARNING.VIRTUALIZATION_DISABLED_FOR_FORM` | `warning` | 렌더 계층: virtualization을 켰는데 IntersectionObserver가 없음 | src/helpers/virtualization/VirtualizationManager/VirtualizationManager.ts:199-205(인스턴스 없는 정적 메서드이므로 보고기를 인자로 넘김). 폼 수준 | 개발 모드 콘솔 | 커밋 뒤 이펙트 | 오늘과 새 설계 모두(렌더 계층 경고로 옮김, ERROR-162) |
| (가칭) `SCHEMA_FORM_WARNING.IF_WITHOUT_ELSE_FALSE` | `warning` | 청사진 분석: oneOf·anyOf 분기에 if는 있고 else: false가 없음 | FRAGMENT-024, ERROR-159의 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.LOCK_ON_NON_TERMINAL_OBJECT` | `warning` | 청사진 분석: 터미널이 아닌 객체 노드의 표준 readOnly, controls.readOnly, controls.disabled | ERROR-159의 청사진 경고 행 | 개발 모드 콘솔 | 커밋된 로드의 준비 이펙트 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.CONDITIONAL_SCHEMA_WITHOUT_VALIDATOR` | `warning` | 트리 생성(마운트, 재생성 reset): 검증기가 없는데 if 게이트가 있어 조각이 꺼짐 | ERROR-154, ERROR-153 | 개발 모드 콘솔 | 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝) | 새 설계에만(오늘은 조용함) |
| (가칭) `SCHEMA_FORM_WARNING.VALIDATOR_MISSING` | `warning` | 트리 생성(마운트, 재생성 reset): 플러그인에도 validatorFactory에도 검증기가 없고 검증 모드가 None이 아님 | src/core/nodes/AbstractNode/utils/ValidationManager/ValidationManager.ts:198-204(오늘은 조용히 건너뜀). 소유자 통보3 답 | 거부하지 않음(17라운드 소유자 답, 통보3). 개발 모드 콘솔, 프로덕션 기본 출력 없음 | 모든 환경, 트리마다 한 번(마운트는 준비 이펙트, 재생성 reset은 reset 사슬 끝). 값을 통째로 바꾸는 setValue나 같은 스키마 reset에서는 다시 보내지 않음. level은 17라운드 소유자 답 (가). 검증 모드를 None으로 적으면 사라짐 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.MULTIPLE_GATED_BRANCHES_ACTIVE` | `warning` | 정착: 같은 oneOf에서 게이트 가진 분기가 둘 이상 켜짐 | ERROR-159의 정착 경고 행. 기록에 호스트의 path | 개발 모드 콘솔 | 마운트면 준비 이펙트, 그 뒤면 사슬 끝(발생 순서). 로드마다 구조 키(code, path)로 한 번. 핸들러가 없는 프로덕션에서는 판정하지 않음 | 새 설계에만 |
| (가칭) `SCHEMA_FORM_WARNING.PRESENTATION_KEY_SUSPECT` | `warning` | 렌더 계층이 한 노드의 presentation을 처음 읽을 때: 코어 키 다섯과 대소문자만 다른 키, 또는 controls·options의 키 이름(R17-3이 `options.trim`으로 확정되어 `presentation.trim`도 둘째 경우에 든다) | R15-9. 판별 칸은 키 이름 | 개발 모드 콘솔 | 그 필드가 커밋된 뒤의 이펙트(지연 마운트 필드 포함) | 새 설계에만 |
| 【추론】 (가칭) `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL` | 【추론】 `warning` | 【추론】 렌더 계층에서, 터미널 전략인 노드의 입력 구성 요소가 받은 빈 `ChildNodeComponents`를 처음 읽을 때(색인·`length`·순회) | 【추론】 ERROR-185와 ERROR-159의 렌더 계층 경고 행. 기록에 path | 【추론】 개발 모드 콘솔, 프로덕션 기본 출력 없음. 개발 모드와 핸들러가 있는 프로덕션에서는 빈 배열 대신 읽기를 감지하는 얼린 빈 배열을 넘기고, 핸들러가 없는 프로덕션에서는 판정하지 않고 보통의 빈 배열을 넘김 | 【추론】 그 필드가 커밋된 뒤의 이펙트에서 전달, 로드마다 구조 키(code, path)로 한 번 | 【추론】 새 설계에만 |
| (제외) 검증 결과: ValidationIssue(오늘 이름 JSONSchemaError), onValidate, errors 속성, setExternalErrors·clearExternalErrors, `VALIDATION_ERROR.SCHEMA_VALIDATION_FAILED` | `error` | 검증 뒤, 제출 | src/components/Form/type.ts:54, :66; src/core/nodes/AbstractNode/AbstractNode.ts:816-839; src/components/Form/Form.tsx:117-123 | 노드 errors, onValidate, 필드 오류 표시, 제출 거부. 네이티브 submit에서는 오늘 미처리 거부(Form.tsx:127-133, packages/winglet/common-utils/src/utils/function/enhance/getTrackableHandler/getTrackableHandler.ts:429-431)이며 PR-7 설계 항목 | 받지 않음(둘째 답 고정) | 오늘과 새 설계 모두 |
| (제외) 정착 추적 | `warning` | 개발 모드에서 정착마다 | ERROR-159의 정착 추적 행 | 개발 모드 기록, 프로덕션은 없음 | 받지 않음(사건이 아니라 추적이며 양이 정착 수에 비례함) | 새 설계에만 |
| (제외) diagnostics의 상태 변화 | `error` | degraded로 바뀌는 커밋, 로드 | ERROR-129, ERROR-132 | UpdateDiagnostics, onDiagnosticsChange | 받지 않음(상태이며, 그 원인 오류가 따로 기록됨) | 새 설계에만 |
| (제외) 호스트 onSubmit이 던지거나 거부한 것 | `error` | 제출 | src/components/Form/Form.tsx:124 | 제출 프로미스의 거부로 부른 쪽에 감(네이티브 submit이면 호스트 자신의 미처리 거부) | 받지 않음(호스트 자신의 코드) | 오늘과 새 설계 모두 |
| (제외) React 자신의 경고와 렌더 중 쓰기 | `warning` | 렌더 중 사용자 코드의 쓰기 | ERROR-003의 호출자 오류 행(P5), REACT-013의 문서화 항목 | React의 렌더 중 갱신 경고(문서화 항목) | 받지 않음(core가 감지하지 않음). 그 사슬에서 난 폼 사건의 전달 시점은 보증하지 않음 | 오늘과 새 설계 모두 |

(가칭) `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠진다(ERROR-164, CONTROLS-079). 【추론】 `DISCRIMINATOR_MISMATCH`는 키가 어느 분기에도 없음, 분기끼리 종류가 다름, 분기 사이 값이 겹침 셋만이다(ERROR-164). 【추론】 두 코드의 details 모양은 원장이 정하지 않았고, 02의 `EMPTY_ENUM_INTERSECTION` details `{ propertyName }`(schemaPath는 오류 자리)와 `DISCRIMINATOR_MISMATCH` details `{ propertyName, reason: 'kind' | 'overlap' | 'missing' }`을 그대로 받는다(ERROR-164). 【추론】 ERROR-164에 오류 행 (가칭) `JSON_SCHEMA_ERROR.INVALID_CONTROL_SHAPE`(`error`, 청사진 분석: `controls`·`options`·`children[].controls`의 닫힌 목록 안 키의 값 모양이 선언과 다름 — 그룹이 객체가 아님, `injectTo`가 함수가 아님, `children`이 배열이 아님, `children` 항목의 모양 — 기록에 schemaPath와 `{ group, key, expected }`, 청사진 오류와 같음, 새 설계에만)을 더한다(ERROR-164). 【추론】 `UNKNOWN_GROUP_KEY`는 닫힌 목록 밖 키에만 쓴다(ERROR-164).

입력 컴포넌트가 래퍼를 거치지 않고 `FormTypeInputProps`의 `node`로 한 쓰기도 표식이 없으므로 이 옛 노드 참조에 들며, 재생성 reset 뒤 타이머나 언마운트 정리에서 하면 던진다(문서화, LANDING-121)(ERROR-164). 입력 컴포넌트의 늦은 쓰기는 `node`가 아니라 `onChange`로 한다는 것(재생성 reset 뒤 `node`로 한 늦은 쓰기는 `SchemaFormError`)(ERROR-164).

【추론】 '(미정)' 행은 없앤다(ERROR-198). 【추론】 설계 항목이 정한 코드는 그 항목의 원장 번호와 함께 ERROR-164의 목록에 정식 행으로 더한다(ERROR-198). 【추론】 이름은 가칭이고 PR-4에서 확정한다(ERROR-164 머리 문단)(ERROR-198). 【추론】 코드를 두지 않기로 한 항목은 행 없이 그 항목에 '코드 없음'을 적는다(ERROR-198). 【추론】 (미정) 행의 넷 가운데 같은 `$id` 사본 루트의 중복 등록(PR-4)은 코드 없음이다(ERROR-198, ERROR-201). 【추론】 같은 가상 이름의 다른 `fields`(슬라이스 1)는 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`다(ERROR-198, ERROR-192). 【추론】 비객체 V의 `Merge`와 되먹임 거부 표면(슬라이스 2)은 코드 없음이며, 되먹임은 기존 `FEEDBACK_LIMIT_EXCEEDED`가 드러내고, `Overwrite`로 온 `undefined`도 코드가 생기지 않는다(ERROR-198, ERROR-194). 【추론】 `controls.children` 대상이 형상에 없을 때(슬라이스 6)는 코드 없음이고, 청사진에 없는 이름만 청사진 오류 (가칭) `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`다(ERROR-198, ERROR-193). 【추론】 쓰기 쪽이 ERROR-164의 목록에 더하는 행은 `SCHEMA_FORM_ERROR.INVALID_VIRTUAL_NODE_VALUES`(무리 이동, ERROR-195), `SCHEMA_FORM_WARNING.RESET_REBUILT_BY_REFERENCE`(ERROR-196), `SCHEMA_FORM_ERROR.ARRAY_METHOD_ON_NON_ARRAY`(ERROR-197)다(ERROR-198, ERROR-164). 【추론】 청사진 쪽이 ERROR-164의 목록에 더하는 행은 `JSON_SCHEMA_ERROR.RECURSIVE_SHAPE_UNBOUNDED`·`SCHEMA_FORM_ERROR.RECURSIVE_SHAPE_DIVERGED`(ERROR-189, ERROR-190), `SCHEMA_FORM_WARNING.DEPENDENT_SCHEMAS_IGNORED_FOR_FORM`(ERROR-191), `JSON_SCHEMA_ERROR.VIRTUAL_FIELDS_MISMATCH`(ERROR-192), `JSON_SCHEMA_ERROR.CHILDREN_TARGET_NOT_FOUND`(ERROR-193), `JSON_SCHEMA_ERROR.TERMINAL_OPTION_UNSUPPORTED`(ERROR-200)다(ERROR-198, ERROR-164). 【추론】 렌더 계층의 빈 `ChildNodeComponents` 경고는 `SCHEMA_FORM_WARNING.CHILD_NODE_COMPONENTS_ON_TERMINAL`(ERROR-202)이다(ERROR-198, ERROR-164, ERROR-185, ERROR-202). 【추론】 S1 변환 실패의 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(ERROR-186)는 이미 있다(ERROR-198, SURFACE-061). 【추론】 안건 `reviews/round-18-agenda.md:108`의 `if` 공허한 참 경고(Q10)는 두지 않으며 경고 코드도 없다(ERROR-198). 【추론】 `JSON_SCHEMA_ERROR.INJECT_TARGET_NOT_FOUND`는 목록에서 빠진다(ERROR-198, CONTROLS-079). 게터 `typeMismatch: boolean`, 경로 목록 `typeMismatches: readonly string[]`, 경고 코드 `SCHEMA_FORM_WARNING.TYPE_MISMATCH`(ERROR-198, ERROR-164, SURFACE-061).

### 05-validation-and-errors.md §2.25 이주와 구현 순서

이주: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다(ERROR-042). 알림을 없애려면 검증 모드를 `None`으로 적는다(ERROR-042). 서버 사이드 렌더링을 쓰면 검증기 등록은 서버와 클라이언트 모두에서 한다(ERROR-042).

**기록.**(ERROR-045, ERROR-190, CONTROLS-079)

| 5차 문서와 오늘 | 이 ADR |
| --- | --- |
| 정착 예산 초과: 개발 모드 throw, 프로덕션은 신호만(12라운드 §4) | 모든 환경에서 throw(커밋·통지 뒤, 사슬의 끝). `diagnostics`는 다음 로드까지 `degraded`로 남고 그 동안 제출을 거부한다(R17-1 나. 10라운드 B-1의 제출 비차단을 대체한다) |
| Form 속성 `throwOnBudgetExceeded`(가칭) | 없다. 끄는 스위치가 없다 |
| 리스너 오류: `onListenerError`(가칭)로 보고, 없으면 개발 모드 `console.error` | 배달 뒤 사슬의 끝에서 모든 환경에서 throw. `onError`가 기록으로 먼저 본다 |
| 노드 공유 충돌: 청사진 경고 + 프로덕션 폼 수준 경고(ADR 0005 §3 "명시 없는 생성기 union이 마운트마다 터지면 안 된다") | 확실한 충돌은 청사진 오류, 실제 동시 활성은 정착 오류(O-10). 마운트에서 나면 모든 환경에서 폼이 서지 않고 대체 화면을 그린다. 생성기 union은 `controls.discriminator`를 더한다(이주) |
| `controls`의 식 런타임 오류·풀리지 않는 `controls.injectTo` 대상: 14라운드 O-4 가(개발 모드 경고) | 정적이면 청사진 오류, 동적이면 정착 오류(R17-1 나). 정적으로 아는 `injectTo` 대상은 없고, 대상 경로가 청사진에 없거나 터미널 아래인 경우는 모두 동적 대상 없음(`INJECT_TARGET_MISSING`)이다. 마운트에서 나면 폼이 서고 커밋 뒤 보고한다 |
| 검증기 미등록: 조용히 검증을 건너뜀(`enabled = false`), `if` 게이트는 조각 없음(ERROR-154) | 거부하지 않고 개발 모드 콘솔과 `onError` 경고 기록으로 트리마다 한 번 알린다(통보3). `if` 조각이 꺼지는 것과 그 경고는 ERROR-153의 합의대로다 |
| 검증기 오류: 전체 스키마 컴파일 실패는 노드 `errors`에 `jsonSchemaCompileFailed` + 모든 환경 `console.error`. `OnChange` 검증의 실행 실패는 미처리 거부 | 컴파일 실패는 검증 불가로 첫 검증 요청·`validate()`·제출을 모든 환경에서 거부하고, 실행 실패는 `validate()`의 거부 또는 `onError` 뒤 싱크다. 노드 `errors`에는 넣지 않는다(사용자의 잘못이 아니다) |
| `Form`이 자기 바운더리로 마운트 오류를 삼킴(`console.error`뿐) | 바운더리는 다시 던지지 않고 가두어 대체 화면을 그리며, `componentDidCatch`에서 `onError`와 싱크로 보고한다. 청사진 오류는 트리를 만드는 자리에서 잡는다 |
| `onError` 없음. 경고는 개발 모드 콘솔뿐이며 프로덕션에서도 검출과 서식을 돌린 뒤 버림 | Form 속성 `onError`: 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자. 핸들러가 없는 프로덕션은 기록·서식·경고 판정을 만들지 않는다 |
| 오류 둘 이상의 묶음: 없음 | `SchemaFormError` 하나의 `details.errors`(발생 순서). `AggregateError`와 `cause`는 쓰지 않는다 |
| `diagnostics.status`: `'stable'` 또는 `'budgetExceeded'`, 이번 정착만, `exceededBudget` 다섯 값 | `'stable'` 또는 `'degraded'`와 `cause`·`commit`, 마지막 로드 이후의 작업 기록. `exceededBudget`은 정착 예산 셋만. 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다 |
| 가드 컴파일은 늦춘다(ERROR-041) | 프로덕션은 늦게(유지), 개발 모드는 청사진에서 일괄. 실패는 그 게이트의 가드 실패이며 정착 오류다 |
| 오류·경고 코드는 공개 계약이 아님 | 형 `FormErrorCode`와 README·docs의 코드 표를 공개한다. 더하면 minor, 바꾸거나 없애면 major |

**기록.**(ERROR-046) 이주 항목: 검증기 없이 쓰던 폼은 그대로 동작하며 경고를 받는다(검증 모드를 `None`으로 적으면 사라진다)(ERROR-046). `INFINITE_LOOP_DETECTED`가 배치 도중 throw해 커밋을 남기지 않던 것이 원본 B 커밋 뒤 throw(`BUDGET_EXCEEDED`, 되먹임·중첩이면 `FEEDBACK_LIMIT_EXCEEDED`)로 바뀌고, 프로덕션에서도 던지며, 그 뒤 다음 로드까지 제출이 거부된다(ERROR-046). `ValidationManager.ts:221`의 `console.error`와 `jsonSchemaCompileFailed`가 사라진다(ERROR-046). `oneOfIndex`·자동 감지 없이 같은 이름·다른 종류를 둔 생성기 union은 `controls.discriminator` 없이는 마운트에 실패한다(ERROR-046). 검증 결과 형은 `ValidationIssue`로 이름이 바뀐다(`onError`의 공개보다 먼저)(ERROR-046). `@winglet/react-utils`의 감싸개에는 선택 인자가 더해질 뿐 기존 호출은 그대로다(ERROR-046).

**착수 조건과 PR 배치.**(ERROR-032)

- PR-1: 청사진 오류와 경고를 수집기 인자로 데이터화한다(code, `schemaPath`·`path`, details, 판별 칸)(ERROR-032). 캐시 청사진의 늦은 경고 수집을 넣고, `warnDevelopmentIssue` 호출 자리를 수집기 뒤로 정리한다(ERROR-032).
- PR-4: 기록 형과 코드 형, core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝의 기록마다 전달, core 경로의 핸들러 예외 규칙, 전달 중 쓰기 거부, 경고의 구조 키, 정착 경고 판정의 소비자 조건, `ValidationIssue` 개명, `ValidateFunction`의 문서 주석("입력의 판정은 돌려주고 던지지 않는다. 던지면 실행 실패다")을 넣는다(ERROR-032).
- PR-7: Form 속성, 바깥 감싸개와 보고기 문맥, 로드 기록의 준비 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부 처리, `@winglet/react-utils`의 minor 변경(그 모듈의 `DETAIL.md`를 먼저 갱신)을 넣는다(ERROR-032).
- PR-8: 코드 표와 이주 안내를 넣는다(ERROR-032).
- 착수 조건: 검증 결과 형의 `ValidationIssue` 개명(LANDING-024)이 `onError`의 공개보다 먼저(또는 같은 PR에) 선다(ERROR-032). 오늘은 `onValidate`가 공개 형 `JSONSchemaError[]`를 받는다(ERROR-032).

### 05-validation-and-errors.md §2.26 합의와 판정의 근거

**기록.**(ERROR-166)

- 소유자 10라운드 답 B-1: "권고를 따릅니다만, 기본적으론 form을 터트려서(error를 throw해서) 알려주는게 좋지 않을까 싶네요."(ERROR-166)

**기록.**(ERROR-167)

- 소유자 14라운드 답 O-4: "전반적으로 '오류가 나도 동작하는' 형태보다는 안되면 오류를 터트려서 인지시키는 방향이 좋지 않을까 싶네요." O-10: "경고만 일어나고 동작하는것처럼 보이는게 더 위험합니다." O-2: "이런 예산초과된 상태로 동작하는건 되도록 막는 방향을 원하긴 해요."(ERROR-167)

**기록.**(ERROR-168)

- 소유자 17라운드 답(ERROR-168). R17-1: "나 허용. 망가진 값을 올리는게 더 위험하겠다." 통보3: "오류만 내보내고 거절은 하지 마시죠. 사용자가 인지만 하면 될거고, 기본값이 있어서 사용자가 오히려 불편할겁니다. 저는 jsonSchema 로 form 만 그리고, 유효성검증은 따로 하지 않는 사용예도 알고있어서요." 통보4: "아 이게, onError 와 onValidate 를 섞는건 사용자 입장에서 엄청 햇갈립니다", "모든 form 내부 error를 정리해서 출력할 수만 있다면, (warning / error 모두) onError 핸들러를 넣어도 괜찮을 것 같기도 해. 오히려, validate error 가 걸러진 에러 로깅용 전용 채널로 쓸 수 있겠어. 이거 에이전트들로 수렴을 시켜봐. 어떤게 나을지". 4번 수렴 뒤의 확인 (가): "(가) ㄱ warning으로." (나): "(나) 확장 허용합니다"(ERROR-168).

**기록.**(ERROR-169)

- 17라운드 4번 수렴(ERROR-169): 안 B를 17라운드 스웜 수렴(편집자 결정)으로 택했다(ERROR-169). 답이 이름과 방향을 주었고, 투명성·C2·10라운드 A-2("form은 고지 의무만 진다")·O-10이 같은 쪽이며, 비용이 핸들러가 있을 때만 생겨 가치끼리 맞바꾸지 않는다(ERROR-169). 게이트는 조건부 통과였고 R17G-1–R17G-11을 모두 적용했다(R17G-3은 소유자 답 (가), R17G-4는 소유자 답 (나)로 닫혔다)(ERROR-169).

**기록.**(ERROR-170)

- 외부 조사(antigravity) 최종 판정: "안 A(커밋 보존 후 최외곽 진입 끝 예외 발생)를 기본 원칙으로 채택 … 안 B는 소비자가 오류를 고의로 삼킬 수 있어 조기 실패의 완결성을 파괴합니다." 여기의 안 B는 외부 조사의 안('`onError` 하나로 보내고 없으면 throw')이며 17라운드 4번 수렴의 안 B(흐름을 바꾸지 못하는 관찰자)와 다르다(ERROR-170). 사슬 끝 throw는 이 판정대로 두었다(ERROR-170).

### 06-react-and-surface.md §1.2 구독과 마운트 정착

오늘의 훅(`useSchemaNodeTracker`의 `useSyncExternalStore` + revision, `useSchemaNodeSubscribe`의 구독 뒤 따라잡기)은 새 통지 모델에 그대로 맞는다(REACT-006).
`useSyncExternalStore` 스냅숏으로 쓰는 현재 방식(`hooks/useSchemaNodeTracker.ts:36-49`)은 유지한다(REACT-006).

**마운트 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤로 미룬다.**(REACT-007)
트리는 렌더 중 `useMemo`에서 만들어지고 로드 정착이 그 안에서 동기로 돈다(REACT-007).
구독자가 없으니 통지는 무해하다(REACT-007).
`onChange`·`onDiagnosticsChange`는 준비 전의 호출을 버린다(마운트 뒤의 `diagnostics`는 핸들로 읽는다)(REACT-007).

StrictMode의 이중 호출은 가드 캐시가 작성 루트 객체를 키로 하므로 컴파일을 두 번 하지 않는다(REACT-008).

문서화할 것 둘: 모든 통지가 동기이므로 렌더 중 사용자 코드의 쓰기는 React의 "렌더 중 갱신" 경고를 받는다(REACT-013). `startTransition` 안의 쓰기는 동기 차선으로 강등된다(REACT-013).
호출자가 렌더 중에 연 사슬(core가 감지하지 않는 사용자 코드의 쓰기, P5)은 호출자의 오용이므로 그 안의 전달 시점은 보증하지 않는다(REACT-013).

### 07-landing-and-tests.md §1.2 기존 기능과 공개 계약의 이주

(LANDING-004, LANDING-005, LANDING-006, LANDING-007, LANDING-008, LANDING-009, LANDING-010, LANDING-011, LANDING-012, LANDING-013, LANDING-014, LANDING-015, LANDING-016, LANDING-017, LANDING-018, LANDING-019, LANDING-020, LANDING-021, LANDING-022, LANDING-023, LANDING-024, LANDING-025, LANDING-026, LANDING-027, LANDING-028, LANDING-029, LANDING-030, LANDING-031, LANDING-032, LANDING-033, LANDING-034, LANDING-035, LANDING-036, LANDING-037, LANDING-038, LANDING-039, LANDING-040, LANDING-041, LANDING-042, LANDING-043, LANDING-044, LANDING-045, LANDING-046, LANDING-048, LANDING-049, EVENT-071, LANDING-199, ERROR-195, ERROR-190, LANDING-188, LANDING-149)

| # | 오늘 | 새 설계 |
| --- | --- | --- |
| 1 | `oneOf`·`anyOf`의 `const`·`enum` 자동 감지로 분기를 고른다 | 폼은 분기를 고르지 않는다. 명시 `controls.discriminator` 또는 분기 안 `if/then/else: false` 또는 `controls.active` |
| 2 | `oneOfIndex`·`anyOfIndices`, 분기 선택 API | 대체물 없이 사라진다. 분기의 필드는 노드이고 활성 여부는 노드의 `active` |
| 3 | `&if`(분기의 조건) | `controls.active`로 흡수 |
| 4 | `computed` 컨테이너 | `controls`로 이름 변경. 별칭 없음(15라운드) |
| 5 | `&pristine` | `controls.resetInteraction` |
| 6 | 없음 | `controls.unsetValue`, `controls.default`, `controls.children`, `controls.discriminator`, `controls.unsetOnInactive` 신설 |
| 7 | `allOf` 항목 안의 `if/then/else`는 병합되지 않고 경고만 | 병합된다 |
| 8 | 분기 전환 때 공유 노드를 다시 채운다 | 이미 있던 노드는 다시 채우지 않는다 |
| 9 | 표준 `readOnly`와 `&readOnly`는 택일(표준이 이김) | OR |
| 10 | `allOf` 항목끼리 겹친 표준 `readOnly`는 먼저 승 | OR |
| 11 | 공개 문서의 `derived` 레벨 약속 | 에지(의존 값이 바뀔 때만) |
| 12 | 루트 키 다섯(`readOnly`·`disabled`·`active`·`visible`·`pristine`)의 특수 처리, README "Priority System" | 사라진다. 루트 키는 루트 노드의 로컬 키. 전체 잠금은 Form 속성 |
| 13 | 로컬 순위 사슬(노드 `readOnly: false`가 `&readOnly`를 이김) | OR |
| 14 | 맨 키 `disabled`·`visible`·`active` | `controls.disabled`·`controls.visible`·`controls.active` |
| 15 | 조각이 꺼지면 원본을 지우고 켜지면 노드가 생성될 때의 값(없으면 `default`)으로 복원 | 기본 유지(방출에서만 빠짐). 비움은 `unsetOnInactive` |
| 16 | `virtual`의 `required` 재작성(가상 이름 → 실제 자식) | 하지 않는다. 작성자가 실제 필드를 적는다 |
| 17 | `find`·`findNodes`가 터미널 아래 경로에 터미널 노드를 별칭으로 돌려줌 | 노드 없음 |
| 18 | 10비트 `SetValueOption` | 비트 넷 |
| 19 | 루트 `onChange` 매크로태스크 디바운스 | 최외곽 동기 진입당 1회 |
| 20 | `normalizedValue` | `outputValue` |
| 21 | 인터페이스 `JSONSchemaError`(노드 오류 항목) | `ValidationIssue` |
| 22 | `INFINITE_LOOP_DETECTED`는 배치 도중 throw해 커밋을 남기지 않음. 검증기 컴파일 실패는 `console.error` + 노드 오류. `Form`의 자기 바운더리가 마운트 오류를 삼킴. 검증기 없이도 조용히 동작 | 원본 B를 커밋·통지한 뒤 사슬의 끝에서 모든 환경에서 throw(17라운드 소유자 답 R17-1 나). 전체 스키마 컴파일 실패는 검증 불가, 가드 컴파일 실패는 그 게이트의 가드 실패, 요청 시점 실패는 `validate()`의 거부. 루트 바운더리는 다시 던지지 않고 가두어 `onError`와 주인 없는 오류 싱크로 보고한다. 검증기가 없어도 폼은 서며 `if` 게이트의 조각은 꺼진 채 경고를 낸다. 검증기가 없으면 거부하지 않고 개발 모드 콘솔과 `onError`의 경고 기록으로 트리마다 한 번 알리며, 검증기는 있으나 전체 스키마 컴파일이 실패하면 검증 모드가 `None`이 아닐 때 검증 요청·`validate()`·제출이 모든 환경에서 거부된다(소유자 통보 3 답, R17-1 나, 17라운드 스웜 수렴(편집자 결정)) |
| 23 | 조건부 폼 생성 시 가드 컴파일 비용 없음 | `compileGuard` 컴파일이 생긴다(가드 200개에 14–54 ms, 위치당 1회·인스턴스 사이 공유) |
| 24 | `then`·`else`의 `required`로 필드를 켜고 끔(`then.required`가 `computed.active`가 됨) | 읽지 않는다. 그 필드를 `then.properties`로 옮기거나 `controls.active`를 적는다 |
| 25 | 조건도 판별식도 없는 `oneOf`·`anyOf`는 어느 분기도 켜지지 않음 | 모든 분기가 켜진다 |
| 26 | `&if`의 경로 기준점은 호스트(`./kind`) | 바뀌지 않는다. 조각·`children`·`discriminator`의 식도 호스트 기준(15라운드). 자식에 적던 식을 `controls.children`으로 옮길 때만 `../x`를 `./x`로 고친다 |
| 27 | `injectTo` 순환 자동 차단 | 없다. 예산이 잡는다. 왕복이 정확하지 않은 양방향 주입은 식이 `undefined`를 돌려주어 멈춘다(FRAGMENT-034) |
| 28 | 검증기 앞 제거 키 여섯 | 키워드 위치의 그룹 객체 셋(VALIDATE-004). strict 검증기에는 동작 변화 |
| 29 | 꺼졌다 켜질 때 노드 생성 시점의 값으로 복원, `oneOf` 전환에서 같은 이름·같은 타입 값을 이음 | 원본은 그대로 남는다(기본). 잇기 장치는 없고 노드 공유가 대신한다 |
| 30 | 평면 `&키` 축약 | 사라진다. 제어 키는 `controls` 안에만(15라운드) |
| 31 | 맨 키 `terminal`·`virtual`·`propertyKeys`, `formType`·`FormTypeInput`·`FormTypeInputProps`·`FormTypeRendererProps`·`errorMessages`, `options.trim`, `options`의 플러그인 자유 칸 | `options.terminal`·`options.virtual`·`options.propertyKeys`, `presentation`의 다섯 키, 자유 칸. `options.trim`은 `options`에 그대로 두고 적용 자리만 바뀐다(LANDING-145, 17라운드 소유자 답 R17-3) |
| 32 | 플러그인 키 `FormGroup`·`FormLabel`·`FormInput`·`FormError`, Form 속성 `CustomFormTypeRenderer`, 타입 `FormTypeRenderer` | `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`. Form 속성 `CustomFormTypeRenderer`는 `FormTypeGroupRenderer`가 되고 같은 이름의 Form 속성 `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`가 새로 생긴다. `ChildNodeComponentProps`와 `FormGroupProps`의 공개 prop `FormTypeRenderer`(와 `OverridableFormTypeInputProps`의 Omit 목록)도 `FormTypeGroupRenderer`로 바꾼다. `FormInputProps`·`FormRenderProps`도 `ChildNodeComponentProps`와 교차하므로 같은 이름 변경을 받는다(17라운드 스웜 수렴(편집자 결정), 사실 정정). 합성 API `Form.*`의 이름과 `…Props` 형 이름은 그대로(그 안의 prop `FormTypeRenderer`는 위대로 바뀐다) |
| 33 | Form 속성 `validatorFactory`는 함수 하나 | `{ compile, compileGuard }` 객체. 플러그인과 같은 계약(VALIDATE-041) |
| 34 | 검증기 플러그인 계약은 `compile`뿐 | `compileGuard(root, pointer)`와 `rejectedKey`가 더해진다. ajv6·7·8 플러그인이 동기 가드 경로를 구현한다 |
| 35 | `node.jsonSchema`는 마운트 때 고정된 값 | 켜진 조각을 병합한 유효 스키마. 활성 조각 집합마다 메모되어 같은 집합이면 같은 참조, 바뀌면 통지의 배달 집합에 든다(VALUE-002, SETTLE-007, SCHEMA-007) |
| 36 | `FormHandle.reset`은 `<Form>` 안의 `RootNodeContextProvider` 아래를 다시 마운트하고(`showError`·첨부 파일 맵 인스턴스·provider는 남고 맵의 내용은 비운다) 그때 새 `jsonSchema`·`defaultValue` prop을 반영 | 로드다(WRITE-042, 16라운드 스웜 수렴(편집자 결정)). 같은 스키마(같은 객체이거나, JSON 부분이 키 순서까지 깊게 같고 함수·컴포넌트 칸이 참조로 같음)면 루트의 로드 한 번이고 트리·캐시·노드 참조가 남는다. 다르면 reset 호출 안에서 트리와 캐시를 새로 만들고(비용은 `<Form key>`의 재생성과 같다) 돌아오기 전에 핸들을 새 트리로 바꾼다. 값은 호출 시점에 커밋된 prop이며, 같은 처리기에서 prop을 바꾼 reset은 그 커밋에서 한 번 더 반영한다(끝에서 새 prop이 반영된다. 그 경로에서는 `onChange`가 두 번이고, `startTransition` 안에서는 첫 로드의 옛 값이 한 번 그려진다). 입력은 자식 프록시를 그리지 않는 입력만 다시 마운트하고(오늘은 provider 아래 전부), 대체된 입력의 늦은 쓰기는 버린다. 어느 경로든 `showError`는 prop 값으로 돌아가고(오늘은 유지), `onStateChange`는 상태가 바뀐 때만 내며, 검증 결과는 비운 뒤 `OnChange` 비트가 켜져 있을 때만 한 번 검증한다(오늘은 모드와 무관하게 늘). `onChange`는 방출 값의 참조가 바뀐 때만 낸다(오늘은 늘 낸다). 스키마 객체를 제자리에서 고친 뒤의 reset은 그 변경을 반영하지 않는다(오늘은 reset마다 `clone`해 다시 읽는다). 노드 참조가 reset을 넘어 이어지는 것은 같은 스키마일 때뿐이다. `FormHandle.reset(option?)`은 억제 비트 둘만 받는다 |
| 37 | 플러그인이 `options.*`에 자유 키를 둠(`protocols`·`lazy`·`minimum`·`maximum` 등)과 맨 키(`lazy`·`radioLabels`·`switchLabels`·`switchSize`·`ampm`·`minRows`·`maxRows`) | `presentation.*`로 옮긴다. `options`는 닫힌 목록(`terminal`·`virtual`·`propertyKeys`·`omitEmpty`·`omitTrailing`·`trim`)이라 남겨 두면 청사진 오류 |
| 38 | 마운트 때 검증 모드와 무관하게 한 번 검증한다(`Form.tsx:139`) | 로드(마운트·reset) 뒤의 검증은 `ValidationMode`의 `OnChange` 비트가 켜져 있을 때만 한 번이다. `OnRequest`만 켠 폼은 마운트 때 검증하지 않는다(EVENT-032, 16라운드 스웜 수렴(편집자 결정)). 마운트의 검증 요청은 렌더 계층의 준비 시점(폼이 커밋된 뒤, 오늘 `handleReady`의 자리), reset은 진입 끝에서 내며 규칙은 "로드 뒤 `OnChange` 비트면 한 번"이다. core만 쓰는 호스트(추가 목표 C3(프레임워크 독립적인 core))는 마운트 검증을 직접 요청한다(ERROR-040, 17라운드 스웜 수렴(편집자 결정)) |
| 39 | 호출자의 전체 교체 `setValue(V)`는 브랜치에도 Refresh를 내어 객체·배열 입력 아래 서브트리 전체를 다시 마운트한다 | 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다(EVENT-071, LANDING-199). 자식 프록시를 그리지 않는 입력만 다시 마운트하고(로드가 아닌 `setValue(V)`는 원본이 실제로 바뀐 노드에만 Refresh를 내고 그 노드만 다시 마운트하므로, 값 전체를 그리는 브랜치 입력도 그 노드의 원본이 바뀐 때만 다시 마운트된다, EVENT-071, LANDING-199), 대체된 입력의 늦은 쓰기는 버린다(REACT-019, REACT-024, 16라운드 스웜 수렴(편집자 결정)) |
| 40 | 공개 `node.group`(`'branch'` 또는 `'terminal'`) | `node.strategy`(값은 그대로, 17라운드 소유자 확정). 가드 `isBranchNode`·`isTerminalNode`는 이름을 유지한다. 소비자는 `FallbackComponents/FormGroupRenderer.tsx:18`, UI 플러그인 넷의 `FormGroup`, 스토리와 시나리오 시험이다 |
| 41 | 오류를 받는 Form 속성이 없다. 오류는 throw·`console.error`·노드 오류로 흩어지고 경고는 개발 모드 콘솔뿐이다 | Form 속성 `onError` 신설. 검증 결과를 뺀 폼 내부의 오류와 경고를 같은 모양의 기록으로 받는 관찰자이며 흐름을 바꾸지 못한다(17라운드 4번 수렴의 안 B, ERROR-094, ERROR-096). 오류·경고 코드 목록이 공개 계약이 된다 |
| 42 | 진단 신호가 없다(`INFINITE_LOOP_DETECTED`를 던질 뿐). 앞 판 설계의 `diagnostics.status`는 `'budgetExceeded'`, `exceededBudget`은 예산 다섯이었다 | `status`는 `'stable'` 또는 `'degraded'`, 원인 `cause`(예산, 식, 대상, 공유 충돌), `exceededBudget`은 정착 예산 셋, `commit`. `cause`에 다섯째 값 (가칭) `'writeShape'`가 더해지고(ERROR-195), `exceededBudget`에 재귀 펼침의 멈춤을 뜻하는 (가칭) `'recursion'`이 더해져 값이 넷이다(ERROR-190). 다음 로드까지 남고 그 동안 폼의 제출 경로가 거부한다(R17-1 나, ERROR-135, ERROR-138) |
| 43 | 필드 바운더리와 `Form`의 자기 바운더리는 렌더 오류를 가두어 대체 화면을 그리고 `console.error`만 한다 | 가두고 대체 화면을 그리는 것은 같다. 다시 던지지 않고 `componentDidCatch`에서 `onError`와 주인 없는 오류 싱크로 보고한다(ERROR-089). `@winglet/react-utils`의 바운더리 감싸개에 렌더 때 보고 함수를 얻는 선택 인자가 더해진다(소유자 허용, `minor`) |
| 45 | `isTerminalNode`는 `node.group === 'terminal'`로 판정하면서 형을 잎 넷으로 좁힌다(`src/core/nodes/filter.ts:195-198`) | `node.strategy`로 판정하고, 형의 좁히기를 터미널 객체·배열까지 포함하도록 바로잡는다(공개 형 변경). `isTerminalNode`의 반환 형 합집합에 `UnionNode`가 들어가고(LANDING-188), 가상 노드는 전략이 `branch`라 `isTerminalNode(가상)`은 거짓이다(LANDING-149) |
| 46 | 노드 메서드 `findAll` | `findNodes`(`FormHandle`은 이미 `findNodes`다) |

【추론】 이주 안내에는 한 줄만 두고 README를 가리킨다(LANDING-022). 【추론】 그 한 줄은, 오늘 매크로태스크 디바운스가 가리던 "이펙트 쓰기면 키 입력당 `onChange` 2회"가 새 설계에서 드러난다는 점이다(LANDING-022).

조건부 폼의 생성은 현재 구현보다 1.7배 느리다 — 가드 200개에 22.4 ms(LANDING-026, TEST-064). AJV에서 가드의 호출은 싸고(좁은 가드 5–58 ns, 루트에 걸린 가드 200개를 키 입력마다 전부 돌려 7.9 µs) 비싼 것은 **컴파일**이다(가드 하나에 70–270 µs, 200개면 폼 생성 시점에 14–54 ms)(LANDING-026).

소유자(16라운드 답 2): "기본적으로 값에 대한 리셋이긴 한데요, 기존 사용방식을 참고해서 로드로 충분한지 검토해보세요. 불필요한 캐시 리빌드를 원하진 않습니다만, 사용자가 key를 사용한 리셋보다 효율적이고 안전한 방법을 얻길 바라긴 합니다"(LANDING-039)

【추론】 로드 뒤 `OnChange` 비트면 한 번 하는 검증(LANDING-041, ERROR-040, EVENT-032)은 `resetSubtree()`에는 그 하위 트리에만 적용한다(LANDING-041).

【추론】 `diagnostics`와 경고 중복 키는 폼 수준 로드(마운트, `FormHandle.reset()`)에서만 초기화한다(LANDING-045). 【추론】 `setValue(V)`와 `resetSubtree()`는 초기화하지 않는다(LANDING-045).

### 07-landing-and-tests.md §1.16 기반과 청사진의 착수

(LANDING-060, LANDING-090, PROCESS-061, PROCESS-062, PROCESS-026)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-0 문서 | 08·09와 옛 ADR은 백업 디렉토리로 가고 설계문서와 ADR은 원장에서 새로 만들며 소유자의 절 단위 통과는 새 설계문서에서만 한다(PROCESS-061, PROCESS-062). 프로토타입 v7(게이트 입력의 `extras` 정적 규칙, 같은 순위 동점·정착 단위 순위, 나감 에지, 전이 라운드 상한, 재계산 목록만 순회). 시나리오 패키지 `@aileron/schema-form-scenarios`의 뼈대, vitest `test.projects` 셋, addon-vitest(LANDING-090) | 없음 | 소유자의 O-1 – O-11 답, 절 단위 통과는 새 설계문서에서만 하고 08·09는 통과 절차 없이 백업으로 간다(PROCESS-062), 18라운드 정련(PROCESS-026) |

【추론】 PR-0의 세 프로젝트 글롭(`unit`·`render`·`storybook`)이 `src/__legacy__/**`를 포함한다(LANDING-060).

반영 칸(개발계획 1-가): "설계문서 8편·ADR 재작성·역검사 `doc-coverage`·옛 문서의 `_archive/` 이동·소유자 절 단위 통과는 별도 설계문서 PR로 `1.0.0-beta`에 연다."(LANDING-060)

반영 칸(개발계획 1-가): "기반 PR과 병렬이며 코드 PR을 막지 않는다."(LANDING-060) 【추론】 02(#347)는 2026-09-27에, 01(#348)은 2026-09-29에 머지되었고, 병렬은 소유자 선택(LANDING-060 반영 칸)이라 순서는 위반이 아니다(LANDING-060). 【추론】 01이 코드를 보지 않고 원장에서 쓰여 생긴 어긋남 16건은 이 라운드와 보정 PR `fix/schema-form-realign-01-02`가 닫으며, 새 과정 규칙은 두지 않는다(LANDING-060). 【추론】 설계문서 PR(01, #348)은 2026-09-29에 머지되었고 8편 머리 표 192절은 대기이므로 PLAN의 상태는 "머지(절 통과 대기)"로 적는다(LANDING-060).

(LANDING-090, TEST-008, TEST-009, TEST-023, TEST-049)

| PR | 더해진 것 |
| --- | --- |
| PR-0 | 시나리오 데이터 모듈의 형(`FormScenario`)과 코어 러너·화면 어댑터 `playScenario`의 뼈대(시나리오 감싸개와 핸들 등록 포함), vitest `test.projects` 셋, addon-vitest 설치, 옛 스토리의 처분 목록, 패키지 `CLAUDE.md`의 'Render-Level Test Harness' 절 개정(신규 시나리오의 자리와 파일당 상한을 TEST-008·TEST-009·TEST-023에 맞춘다), 비공개 패키지 `@aileron/schema-form-scenarios`의 생성(TEST-023), 릴리스 전환 PR 뒤라면 `test.yml`에 vitest 세 프로젝트와 playwright chromium 단계(TEST-049) |

(LANDING-061, SCHEMA-007, BLUEPRINT-016, PROCESS-027, CONTROLS-079, ERROR-164, LANDING-159, LANDING-205, SCHEMA-043)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-1 청사진 | 순수 함수 `blueprint`: 조각 표와 전순서, 노드 공유, `controls.discriminator` 변환(끌어올림 포함), 유효 스키마 병합 함수(SCHEMA-007 병합표는 새로 쓴다. 렌더 계층이 넘긴 판정으로 정하는 원자(React 요소, ref 모양)와 한쪽 값의 참조 이동은 `@winglet/common-utils` `merge`의 선택 인자(배열 교체, 원자 판정, 참조 이동. 양쪽에 있는 객체는 새 객체에 병합한다: 쓰기 시 복사. 인자가 없으면 오늘 동작, changeset `minor`)로 쓴다(17라운드 스웜 수렴(편집자 결정)). 오늘의 교차 연산은 먼저 승·얕은 덮어쓰기·무조건 throw라 SCHEMA-007과 다르므로 잎 교차 함수 `intersectEnum`·`intersectConst`·`intersectMinimum`·`intersectMaximum`·`intersectMultipleOf`·`validateRange`를 청사진 밖의 새 fractal로 옮겨(청사진 안에 두면 그것을 가져가는 옛 `helpers/jsonSchema`와 서로 가져오는 고리가 될 수 있다. 이름은 PR-1이 정한다) 이름으로 내보내되, `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. `intersectPattern`은 새 fractal로 옮기지 않는다. throw는 청사진이 정적 연언을 교차할 때만 한다(BLUEPRINT-016). 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 `JSONSchemaError`를 던지도록 import와 함께 고쳐 옛 동작을 PR-7까지 지킨다(레거시로 옮긴 옛 코드가 PR-7까지 도는 방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다), 검증기 앞 제거 규칙 하나, `controls`의 식 컴파일(오늘의 컴파일러 `createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형은 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고(filid 배치 규칙 §1), `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행(`eval`, `new Function`)을 금한다. PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고친다. 16라운드 편집자 결정, 답 10으로 확정)과 역의존 표, 청사진 오류·경고(선언 사이 `options.terminal`·렌더 계층 판정·`controls.discriminator` 불일치, `controls`·`options`의 모르는 키. 터미널 전략은 `options.terminal` → 렌더 계층이 인자로 넘긴 판정 함수 → `type`의 순서로 정하며 청사진은 `presentation`을 읽지 않는다, 17라운드 스웜 수렴(편집자 결정)), `controls.watch` 의존의 합집합, `options`의 닫힌 목록(`trim` 포함), `controls.injectTo`는 함수 형태 하나라 청사진이 정적으로 아는 대상이 없고, 그 오류 코드 `INJECT_TARGET_NOT_FOUND`는 낼 자리가 없어 PR-4의 코드 확정에서 빠지며, 대상 없음은 모두 동적 대상 없음 `INJECT_TARGET_MISSING`이다(CONTROLS-079, ERROR-164), 청사진 오류·경고의 데이터화(수집기 인자로 코드·`schemaPath`·세부·판별 칸을 모으며 소비자가 없으면 모으지 않는다. 캐시 청사진의 늦은 경고 수집은 작성 루트마다 한 번, 17라운드 스웜 수렴(편집자 결정)). 테이블 테스트 | 없음 | 18라운드 안건 A(`$ref` 재귀, 다중 `type`, `dependentSchemas`·`patternProperties` 등)와 B(식 언어 명세), 전환 방식의 세부(레거시 디렉토리의 이름과 자리), 노드 구조 N14(행이 없는 조합, 청사진의 전략 결정)(PROCESS-027) |

【추론】 (7) PR 배치: 청사진이 `union` 종류를 알아보는 것은 PR-1이다(청사진이 종류를 정한다)(LANDING-061). 【추론】 잎 교차 함수의 새 fractal은 `src/helpers/schemaIntersection/`이고, 공집합 표시는 `EMPTY_INTERSECTION`(Symbol)이며, `EMPTY_INTERSECTION`과 함께 이름으로 내보내는 함수는 `intersectConst`·`intersectEnum`·`intersectMaximum`·`intersectMinimum`·`intersectMultipleOf`·`validateRange` 여섯이고, `intersectPattern`은 SCHEMA-043대로 레거시에 남는다(LANDING-061, LANDING-081, LANDING-091). 【추론】 LANDING-061 표의 "착수 전 닫을 것"은 모두 닫혔다: 안건 A는 18라운드(BLUEPRINT-030·BLUEPRINT-041·SCHEMA-040·FRAGMENT-047), 안건 B는 CONTROLS-080, 전환 방식의 세부는 LANDING-159·LANDING-205, N14는 NODE-047이 닫았다(LANDING-061).

【추론】 규칙 1은 파일 한정 ESLint `no-restricted-imports`로 막고 PR-1에서 건다(LANDING-061). 【추론】 규칙 2: 레거시 → 새 코드는 LANDING-061이 이미 적은 곳만 허용한다(예: 옛 `intersect*Schema`가 새 잎 교차 함수를, 옛 소비자가 청사진으로 옮긴 식 컴파일러를 가져온다)(LANDING-061). 【추론】 PR-1 점검에 "filid `max-depth` 통과. 실패하면 `src/__legacy__/**`를 예외로 두는 설정 변경을 같은 PR에서 한다"를 둔다(LANDING-061).

반영 칸(개발계획 P3·P4): "인접 단계 합침 둘을 채택한다: 기반(PR-0의 코드 부분)과 청사진(PR-1)은 한 PR, 파생(PR-3)과 상태 키·제어(PR-6)는 한 PR."(LANDING-060, LANDING-061)

(LANDING-081, SCHEMA-043)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-1 청사진 | `preprocessSchema`(`oneOf` 자동 감지·`virtual` `required` 재작성), `processAllOfSchema`(정적 평탄화, `if/then/else` 무시), `schemaNodeFactory`의 스키마 변이, `BranchStrategy/utils`의 조건 사전 | `stripSchemaExtensions`의 스캐너 틀(키 목록만 그룹 셋으로), 잎 교차 함수(잎 교차 함수 가운데 `intersectConst`는 깊은 비교로 뜻이 바뀌고 `intersectPattern`은 새 fractal로 옮기지 않는다(SCHEMA-043)), `jsonPointer`, 옮긴 식 컴파일러 | `src/core/blueprint/`(옮긴 식 컴파일러 포함) |

`core/INTENT.md`의 "새 노드는 `AbstractNode`를 상속한다"는 PR-1에서 먼저 고친다(문서가 코드보다 먼저 바뀐다)(LANDING-088).

(LANDING-091, SCHEMA-043, TEST-055, LANDING-159, LANDING-205)

| PR | 더해진 것 |
| --- | --- |
| PR-1 | 식 컴파일러(`createDynamicFunction`과 그 `utils`, `JSON_POINTER_PATH_REGEX`, `getPathManager`, `DynamicFunction` 형)를 `src/core/blueprint/`로 통째로 옮김(PR-7까지는 옛 엔진도 쓰므로 청사진 진입점이 이름으로 내보내고 그 유지 이유를 청사진의 `DETAIL.md`에 적는다. 옛 소비자는 import만 고침), 잎 교차 함수를 새 fractal로 옮김(옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정) 이것이 그 규칙의 예외이고, `intersectPattern`은 새 fractal로 옮기지 않고 레거시에 남는다(SCHEMA-043)), `core/INTENT.md` 개정, `@winglet/common-utils`의 `merge` 선택 인자와 그 changeset(`minor`, TEST-055) |

(LANDING-073, LANDING-074, LANDING-037, LANDING-064, LANDING-070, VALIDATE-015, VALIDATE-017, VALIDATE-018, VALIDATE-019, LANDING-061, LANDING-069, SCHEMA-043, LANDING-159, LANDING-205)

| 조건 | 처분 |
| --- | --- |
| 1 가드 계약을 (루트, 위치)로 고치고 ajv 셋에 동기 가드 경로를 두며 작성 루트 기준 캐시를 둔다 | **LANDING-037·LANDING-064·LANDING-070·VALIDATE-015·VALIDATE-017·VALIDATE-018·VALIDATE-019에 반영.** 떼어 낸 `if`는 `$ref` 때문에 단독 컴파일이 실패하고(ajv 8 실행 확인), 세 플러그인이 모두 `$async: true`이며, 같은 `$id` 루트의 재컴파일은 throw한다. `compileGuard(root, pointer)`. 캐시는 코어가 검증기 인스턴스마다 WeakMap<작성 루트 객체, { 사본, 가드 표 }>로 든다. 플러그인의 `compileGuard`는 가드 캐시를 들지 않는다. 사본 루트의 등록(루트마다 한 번의 `addSchema`와 고유 키 배정)은 플러그인의 검증기 인스턴스가 든다(ajv는 같은 키의 재등록에 실패한다, 16라운드 실행 확인). `Form`의 스키마 `clone`은 없앤다. 가드 캐시와 등록의 소유는 편집자 결정이며 16라운드 답 10으로 확정했다 |
| 2 "재사용" 두 문장을 사실대로 | **LANDING-061·LANDING-069에 반영.** 교차 연산은 잎 함수만 재사용하고 병합표는 새로 쓴다(오늘은 먼저 승·얕은 덮어쓰기·무조건 throw). 식 컴파일러는 `AbstractNode` 조직 안에 있으므로 PR-1에서 청사진(`src/core/blueprint/`)으로 통째로 옮긴다. 새 엔진에서 식을 컴파일하는 곳은 청사진 하나뿐이고, `helpers/dynamicExpression/`의 `INTENT.md`는 표현식 직접 실행을 금하기 때문이다(편집자 결정, 16라운드 답 10으로 확정). 잎 함수 `intersectEnum`·`intersectConst`·`validateRange`는 공집합·충돌에서 던지지 않고 공집합 표시를 돌려주도록 바꾼다. 옛 `intersect*Schema`는 공집합 표시를 받으면 오늘처럼 던지도록 고쳐 옛 동작을 PR-7까지 지킨다(방법은 닫혔다: PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검하며 옛 코드는 `src/__legacy__/`에 보존한다, LANDING-159, LANDING-205). 레거시의 `const` 비교는 깊은 비교로 바뀌며(결함 수정), 이것이 옛 동작을 PR-7까지 지킨다는 규칙의 예외다(SCHEMA-043) |

### 07-landing-and-tests.md §1.19 통지와 검증의 착수

(LANDING-064, ERROR-041, EVENT-045, EVENT-046, VALIDATE-046, REACT-002)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-4 통지와 검증 | 루트 디스패처, `batch`, 진입당 `onChange` 1회, 진입 사슬과 사슬 끝의 throw, `onError` 로깅 채널의 core 쪽(기록 형 `FormErrorRecord`와 코드 형 `FormErrorCode`(가칭), core가 인자로 받는 보고기(`report`, `hasConsumer`), 사슬 끝 기록마다 전달, 핸들러 예외의 묶음 규칙, 전달 중 쓰기 거부, 경고의 구조 키 중복 억제, 정착 경고 판정의 소비자 조건, `ValidateFunction` 문서 주석 "판정은 돌려주고 던지지 않는다". `ValidationIssue` 개명이 `onError`의 공개보다 먼저 선다, 17라운드 스웜 수렴(편집자 결정)), 진입 사슬의 소유는 `dispatch`(쓰기 동사마다 진입 함수)이며 겉면의 쓰기 위임을 `dispatch` 진입으로 옮김, `SchemaFormError`의 집계 오류(`details.errors`), 주인 없는 오류 싱크, 검증 실행 실패와 검증 불가의 드러남, 가드의 늦은 컴파일(프로덕션)과 개발 모드 일괄 컴파일(어느 환경이든 실패는 그 게이트의 가드 실패)(ERROR-041, 17라운드 스웜 수렴(편집자 결정)), `UpdateDiagnostics`, 커밋 번호 스탬프 검증과 실행 합치기, 검증기 계약(`compileGuard`, `rejectedKey`)의 플러그인·`validatorFactory` 통일과 ajv6·7·8 플러그인 구현, 에러 라우팅, 오류 클래스(`ValidationIssue`), 훅 수준의 React 바인딩 시험(동기 통지와 `useSyncExternalStore`, StrictMode 이중 호출, 구독 뒤 따라잡기), 같은 `$id` 루트의 중복 등록 처리, 상태·오류·명령 사건과 검증 결과의 배달 경로(EVENT-045, EVENT-046, 16라운드 답 3), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(VALIDATE-046, 16라운드 스웜 수렴(편집자 결정)) | PR-2 (PR-3과 병렬) | `compileGuard` 계약 세부, 에러 라우팅, 유효 스키마 변경 이벤트, core가 `ValidationManager` → `app/plugin`의 `PluginManager`를 거쳐 React 구성 요소 모듈을 가져오는 import의 분리(검증기 주입 경로, REACT-002) |

(LANDING-084)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-4 통지·검증 | `EventCascadeManager`(노드별 마이크로태스크, 100회 throw), `ValidationManager`(실패 삼킴), `compile` 하나뿐인 계약 | 비트별 배달 원장 개념, 세대 번호, `transformErrors` | `src/core/dispatch/`, `src/core/validation/`, `app/plugin/type.ts` 개정. 진입 사슬은 `dispatch`가 쓰기 동사마다 진입 함수로 소유하고, 검증 결과 배달은 `dispatch`가 넘긴 콜백이다 |

(LANDING-093, EVENT-045, EVENT-046, WRITE-046, VALIDATE-046, ERROR-032)

| PR | 더해진 것 |
| --- | --- |
| PR-4 | ajv6·7·8의 동기 `compileGuard(root, pointer)` 구현과 코어의 사본·가드 캐시, 훅 수준 바인딩 시험, 같은 `$id` 재등록, 배달 경로(EVENT-045, EVENT-046), 검증기 등록의 참조 세기와 최근 해제 목록, 재생성 reset의 같은 `$id`(새 루트를 등록할 때 옛 트리가 아직 살아 있으므로 살아 있는 두 트리의 충돌로 다루고 reset의 원자성을 지킨다, WRITE-046·VALIDATE-046, 16라운드 스웜 수렴(편집자 결정)), `onError`의 core 쪽(보고기 인자, 기록 형과 코드 형, 사슬 끝의 기록마다 전달, 핸들러 예외 규칙, 전달 중 쓰기 거부, ERROR-032) |

【추론】 가드 200개인 조건부 폼 생성은 새 판 23.0 ms(트리 585 µs + AJV 컴파일 22.4 ms) 대 오늘 13.4 ms로 1.7배다(`spikes/work-loop/REPORT.txt:113-118`, `:196-200`)(LANDING-093). 【추론】 이 항목을 PR-4(동기 `compileGuard`를 구현하는 PR)의 수용 필요 항목으로 미리 적고, 이유는 "검증기 컴파일"이다(LANDING-093). 【추론】 미리 적는 것이지 미리 받아들이는 것이 아니다(LANDING-093).

【추론】 저장소의 ajv 플러그인 셋과 core의 폴백 검증기(`src/core/nodes/AbstractNode/utils/ValidationManager/utils/getFallbackValidator.ts:19`)는 PR-4(동기 `compileGuard`를 구현하는 그 PR)에서 함께 루트에 `''`를 내도록 고친다(LANDING-093).

반영 칸(개발계획 P1): "ajv6·ajv7·ajv8의 `compileGuard`·`rejectedKey`·같은 `$id` 처리는 원장대로 PR-4에서 셋 다 구현한다."(LANDING-064, LANDING-093)

(LANDING-076, EVENT-045, EVENT-046)

| 조건 | 처분 |
| --- | --- |
| 4 상태·오류·명령 사건과 검증 결과의 배달 경로 | **EVENT-045·EVENT-046에서 정함(16라운드 답 3으로 확정).** |

### 07-landing-and-tests.md §1.22 엔진 전환과 레거시 경계

(LANDING-067, EVENT-071, LANDING-199, LANDING-205, LANDING-206, TEST-073, WRITE-085, REACT-028, WRITE-083, LANDING-145)

| PR | 내용 | 의존 | 착수 전 닫을 것 |
| --- | --- | --- | --- |
| PR-7 전환 | `nodeFromJSONSchema`를 새 엔진 위에 다시 짓고, React 바인딩(`providers`·`hooks`·`components`)을 새 값 채널(`value`·`outputValue`)과 통지에 연결, Form 속성(`readOnly`·`disabled` 전체 잠금, `unsetOnInactive`, `disableAutomaticWrites`, `onError`, `onDiagnosticsChange`, `validatorFactory`, 렌더러 넷 `FormTypeGroupRenderer`·`FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer`), 청사진 오류의 생성 자리 포착과 대체 화면, 마운트 정착 오류의 원인별 처리(ERROR-077–ERROR-084), 루트·필드 바운더리의 가두고 보고하기(17라운드 스웜 수렴(편집자 결정), ERROR-088, ERROR-089), `degraded` 동안의 제출 거부(네이티브 submit은 `onError`와 싱크로)와 검증 불가의 거부(R17-1 나), 터미널 전략과 병합의 원자(렌더 계층의 터미널 판정 함수와 원자 판정 함수를 청사진에 넘김, REACT-003), 명령, 레거시 디렉토리는 PR-8까지 보존하고 PR-7은 레거시 import 0만 점검한다, `core/index.ts`의 수출을 `src/core/SchemaNode/` 진입점으로, `node.group` → `node.strategy`의 소비자 이주(LANDING-043), 렌더 시나리오 438건의 처분(TEST-013. 17파일은 단언을 이름만 바꿔 살린다, 16라운드 답 7), UI 플러그인 넷의 타입과 등록 키 대응, UI 플러그인 넷의 이주는 PR-7 뒤의 플러그인 PR이 하고 PR-7은 기본 입력으로 검증한다, `SchemaNodeInput`의 흐림 처리에서 `Blurred` 발행을 입력 마침 신호 `finishInput`으로 바꿈(`options.trim`은 문자열 행의 `finishInput` 칸이 판단, R17-3), `ChildNodeComponentProps`·`FormGroupProps`의 prop `FormTypeRenderer` → `FormTypeGroupRenderer`, `SchemaNodeInput.handleChange`의 세 진입(값 쓰기·외부 오류 지움·dirty)을 `batch` 하나로 묶기, 입력 출처 표식(Refresh 판정과 폐기된 노드의 늦은 입력 쓰기 판별용 내부 통로), 마운트 로드 정착 동안 `onChange`·`onDiagnosticsChange`는 버리고 `onError`는 커밋 뒤 한 번 전달하는 계약과 마운트 로드의 검증 요청을 준비 시점에 내는 것(17라운드 스웜 수렴(편집자 결정), REACT-007), `onError`의 렌더 계층(바깥 감싸개와 인스턴스 보고기 문맥, 로드 기록의 준비 이펙트 전달과 대체 화면 이펙트 전달, 바운더리의 렌더 때 보고기 읽기와 `componentStack`, 네이티브 submit 경로의 오류 층 거부를 `onError`와 싱크로), `@winglet/react-utils` ErrorBoundary와 감싸개 둘의 렌더 때 보고 함수를 얻는 선택 인자(소유자 허용. 그 모듈의 `DETAIL.md`를 먼저 갱신한다, 17라운드 스웜 수렴(편집자 결정)), React 18 실행 시험(16라운드 답 5), `useFormTypeInput`의 메모 의존에 유효 스키마 참조 추가와 `SchemaNodeProxy`의 유효 스키마 변경 비트 구독, 배달 경로의 렌더 계층 구독(EVENT-045, EVENT-046), `Form`의 스키마 `clone`(`preprocessSchema(clone(inputJSONSchema))`) 제거(작성 루트 객체를 가드 캐시의 키로 지킨다. `defaultValue`의 `clone`은 이 항목이 아니다), `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 입력 판정과 노드가 드는 Refresh 번호, 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함, LANDING-041)(WRITE-042, WRITE-043, WRITE-044, WRITE-046, REACT-019, REACT-024, 16라운드 스웜 수렴(편집자 결정)), 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다, `@winglet/react-utils`의 changeset(`minor`), 벤치 비교 | PR-1 – PR-6 전부 | 성능 예산 수치는 닫혔다(예산의 수치는 기존 `guard:check`의 선이다, TEST-073), 브라우저 IME 확인, 노드 `resetSubtree()`의 존치는 닫혔고(WRITE-085, `resetSubtree()`와 게터 `defaultValue`를 남김) 입력 판정의 구현 확인만 PR-7 게이트로 남는다(REACT-028), `trim` 쓰기의 부수 효과는 닫혔다(`trim`은 `finishInput` 칸의 자동 쓰기이고 바깥 오류와 dirty는 그대로다, WRITE-083, LANDING-145), `@winglet/react-utils` 선택 인자의 모양, 네이티브 submit 경로의 검증 실패(`ValidationError`) 처리(오늘은 미처리 거부, `Form.tsx:127-133`, `getTrackableHandler.ts:429-431`) |

반영 칸(개발계획 P1): "UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다."(LANDING-067, LANDING-078).

(LANDING-087, LANDING-206)

| PR | 부딪히는 오늘의 코드(교체 대상) | 그대로 쓰는 것 | 새 fractal |
| --- | --- | --- | --- |
| PR-7 전환 | `RootNodeContextProvider`, `Form`, `SchemaNodeProxy`, `SchemaNodeInput`, `useFormTypeInput`, `PluginManager`의 렌더 키트, `types/jsonSchema`의 맨 키. UI 플러그인 넷(antd5·antd6·antd-mobile·mui)의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다 | 가상화(WeakSet identity), `renderForm`, `providers` 대부분, `useSchemaNodeTracker`·`useSchemaNodeSubscribe` | 기존 자리. `core/index.ts`의 수출만 새 fractal로 돌려 import 경로를 지킨다(`core/index.ts`는 `SchemaNode/`의 진입점을 가리키고 바인딩 전용 내부 통로를 이름으로 다시 내보낸다). `core/types`의 event·state·value는 남고 node·constructor는 지운다 |

(LANDING-095, EVENT-071, LANDING-199, LANDING-206)

| PR | 더해진 것 |
| --- | --- |
| PR-7 | 바인딩 계약 다섯(REACT-007, REACT-009, REACT-011, ERROR-088, ERROR-089, REACT-012. 첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘. 드러남과 제출 거부는 모든 환경에서 같다, R17-1 나), Form 속성 `onError`와 바깥 감싸개·인스턴스 보고기, 입력 마침 신호 `finishInput`(trim), `node.group` → `node.strategy`의 소비자 이주, UI 플러그인 넷의 `presentation.*` 이주, 자사 플러그인 수정 목록, 플러그인마다의 union 항목은 PR-7이 아니라 플러그인 PR(우산 순서 N+1, PR-7 뒤)이 한다, `renderForm` 다섯(TEST-021), 부류별 e2e 실행기, React 18 실행, 배달 경로의 렌더 계층 구독(EVENT-045, EVENT-046), 시나리오 스토리와 `playScenario`, 옛 스토리 49파일 전체 정리, `architecture/spikes/**` 가운데 제품 동작에 남는 상황의 e2e 이식(TEST-024), `Form`의 스키마 `clone` 제거, `reset`의 로드 전환(같은 스키마 판정, 커밋 재대조, 호출 안의 재생성, 자식 프록시 마운트 여부로 가르는 입력 판정, 노드가 드는 Refresh 번호와 상호작용 초기화 번호), 로드의 검증 규칙(마운트 포함)(WRITE-042, WRITE-043, WRITE-044, WRITE-046, REACT-019, REACT-024, LANDING-041, 16라운드 스웜 수렴(편집자 결정)), 로드가 아닌 쓰기(`setValue(V)` 포함)는 원본이 실제로 바뀐 노드에만 Refresh를 내고 쓴 입력 자신은 제외하며, "값이 같아도 낸다"는 로드의 새 수명에만 해당한다, `@winglet/react-utils`의 changeset(`minor`, TEST-055) |

(LANDING-075, LANDING-078, LANDING-080, LANDING-206)

| 조건 | 처분 |
| --- | --- |
| 3 바인딩 계약 넷 | **REACT-007, REACT-009, REACT-011, ERROR-088, ERROR-089, REACT-012에서 정함(첫째·넷째는 17라운드 스웜 수렴(편집자 결정)으로 닫힘: 마운트 동안 `onError`는 커밋 뒤로 미루고 바운더리는 다시 던지지 않고 가두고 보고한다. 다섯째 '유효 스키마를 따라간다'는 편집자가 더함).** LANDING-067에 반영 |
| 6 UI 플러그인 규모와 `options` 닫힌 목록의 충돌 | **LANDING-070·LANDING-040에 반영.** 27파일이 `options.*`·맨 키를 읽으므로 PR-7 뒤의 플러그인 PR이 `presentation.*`로 옮긴다 |
| 8 훅·바인딩 시험과 React 18 실행 | **TEST-017·TEST-020에 넣음.** LANDING-064·LANDING-067에 반영(React 18 실행은 16라운드 답 5로 확정) |

**위험이 모이는 곳은 PR-7이다.**(LANDING-071) PR-1 – PR-6은 `<Form>`에 닿지 않으므로 사용자 관점의 동작은 PR-7에서 처음 검증된다(LANDING-071). 완화: PR-2부터 엔진 수준의 통합 시나리오(TEST-004의 상황 목록)를 각 PR에 넣고, PR-4 뒤에 차등 테스트(독립 검증기와의 판정 동치)를 돌린다(LANDING-071).

**PR-7을 더 쪼갤 수 없는 이유.**(LANDING-072) 옛 엔진과 새 엔진은 값의 소유(다중 사본 대 `raw` 하나), 통지(마이크로태스크 배치 대 동기 1회), 분기(자동 감지 대 게이트)가 다르다(LANDING-072). `<Form>`이 둘을 동시에 섬길 수 없고, 렌더 시나리오의 기대값도 한 계약에만 맞는다(LANDING-072).

`src/__legacy__/`는 PR-7이 지우지 않고 정리·릴리스 PR(PR-8)까지 참고용으로 보존한다(LANDING-205, LANDING-067). PR-7은 진입점을 새 엔진으로 바꾸고 새 코드가 레거시를 가리키는 import가 0임을 점검한다(LANDING-205). 디렉토리 삭제는 PR-8이 한다(LANDING-205). 우산 브랜치에 딸려 들어온 무관한 파일(`.seiri/.gitignore`, 벤치 결과)은 정리하지 않는다(LANDING-205). 소유자(개발계획 P2): "레거시는 마지막까지 보존. 참고용."(LANDING-205). 소유자(개발계획 P2): "무관한 커밋을 굳이 정리할 필욘 없어."(LANDING-205).

## 설계문서

- `design/02-node-and-value.md` §2.1 (VALUE-003)
- `design/03-settle-and-events.md` §2.4 (EVENT-058)
- `design/03-settle-and-events.md` §2.6 (EVENT-017)
- `design/03-settle-and-events.md` §2.8 (EVENT-034)
- `design/05-validation-and-errors.md` §1.3 (VALIDATE-040)
- `design/05-validation-and-errors.md` §2.1 (ERROR-001, ERROR-002, ERROR-102, ERROR-103, ERROR-104, ERROR-105, ERROR-106, ERROR-107, ERROR-108, ERROR-109)
- `design/05-validation-and-errors.md` §2.2 (ERROR-159, ERROR-160, ERROR-161, ERROR-162)
- `design/05-validation-and-errors.md` §2.3 (ERROR-003, ERROR-070, ERROR-071, ERROR-072, ERROR-073, ERROR-074, ERROR-075, ERROR-076, ERROR-022)
- `design/05-validation-and-errors.md` §2.4 (ERROR-004, ERROR-005, ERROR-007, ERROR-008)
- `design/05-validation-and-errors.md` §2.5 (ERROR-077, ERROR-078, ERROR-079, ERROR-080, ERROR-081, ERROR-082, ERROR-083, ERROR-084)
- `design/05-validation-and-errors.md` §2.6 (ERROR-120, ERROR-121, ERROR-122, ERROR-124, ERROR-125, ERROR-126, ERROR-127)
- `design/05-validation-and-errors.md` §2.7 (ERROR-128, ERROR-129, ERROR-130, ERROR-131, ERROR-132, ERROR-133, ERROR-134)
- `design/05-validation-and-errors.md` §2.8 (ERROR-135, ERROR-136, ERROR-137)
- `design/05-validation-and-errors.md` §2.9 (ERROR-138, ERROR-139, ERROR-140, ERROR-141, ERROR-142, ERROR-016)
- `design/05-validation-and-errors.md` §2.10 (ERROR-143, ERROR-144, ERROR-145, ERROR-146, ERROR-147, ERROR-148, ERROR-149, ERROR-150, ERROR-151)
- `design/05-validation-and-errors.md` §2.11 (ERROR-152, ERROR-153, ERROR-154, ERROR-041)
- `design/05-validation-and-errors.md` §2.12 (ERROR-155, ERROR-156, ERROR-157, ERROR-158, ERROR-039, ERROR-040)
- `design/05-validation-and-errors.md` §2.13 (ERROR-094, ERROR-095, ERROR-096, ERROR-097, ERROR-098, ERROR-099)
- `design/05-validation-and-errors.md` §2.14 (ERROR-013, ERROR-014, ERROR-100, ERROR-101)
- `design/05-validation-and-errors.md` §2.15 (ERROR-017, ERROR-019, ERROR-020, ERROR-021, ERROR-023, ERROR-024, ERROR-025, ERROR-026)
- `design/05-validation-and-errors.md` §2.16 (ERROR-012, ERROR-028, ERROR-029, ERROR-030)
- `design/05-validation-and-errors.md` §2.17 (ERROR-085, ERROR-086, ERROR-087, ERROR-088, ERROR-089, ERROR-090, ERROR-091, ERROR-092, ERROR-093)
- `design/05-validation-and-errors.md` §2.18 (ERROR-110, ERROR-111, ERROR-112, ERROR-113, ERROR-114, ERROR-163)
- `design/05-validation-and-errors.md` §2.19 (ERROR-115, ERROR-116, ERROR-117, ERROR-118, ERROR-119)
- `design/05-validation-and-errors.md` §2.20 (ERROR-185)
- `design/05-validation-and-errors.md` §2.21 (ERROR-031, ERROR-164)
- `design/05-validation-and-errors.md` §2.25 (ERROR-042, ERROR-045, ERROR-046, ERROR-032)
- `design/05-validation-and-errors.md` §2.26 (ERROR-166, ERROR-167, ERROR-168, ERROR-169, ERROR-170)
- `design/06-react-and-surface.md` §1.2 (REACT-007, REACT-013)
- `design/07-landing-and-tests.md` §1.2 (LANDING-024, LANDING-025)
- `design/07-landing-and-tests.md` §1.16 (LANDING-061)
- `design/07-landing-and-tests.md` §1.19 (LANDING-064)
- `design/07-landing-and-tests.md` §1.22 (LANDING-067)
