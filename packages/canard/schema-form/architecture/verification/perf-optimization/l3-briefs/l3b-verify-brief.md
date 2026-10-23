# L3-b 검증 brief (읽기 전용)

당신은 검증자입니다. 어떤 파일도 만들거나 고치지 마십시오. git 상태를 바꾸는 명령(checkout, reset, stash, commit, push, worktree 등)을 실행하지 마십시오. 시험을 돌려도 되지만 빌드 결과물 외에 파일을 남기지 마십시오.

## 대상

- PR #417 (저장소 vincent-kk/albatrion, base feat/schema-form-08-review-and-perf). 구현 작업 폴더(읽기 전용): /Users/Vincent/Workspace/albatrion/l3e-direct-ownership
- 검토 범위 diff: 그 폴더에서 `git diff a55071005..67964cc21` (DETAIL 셋 +7/−7, 런타임 6파일 +61/−23, 새 시험 +184).
- 구현 brief(계약): /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/8ca6ecf8-6206-4c84-a31b-faf0d38f2409/scratchpad/l3b-brief.md (코디네이터가 추가로 허용한 것: assembleArray 의 extras 뿐인 끝 덧붙임 분기와 arrayBehavior DETAIL 의 템플릿 필요 문장 수정. 조건은 템플릿 있는 배열의 현재 경로 불변).
- 정본 측정 문서: 그 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/first-batch-measurement.md 의 "## A3 — items 없는 배열의 읽기 조사"(343~364행), "### L3 가설 다섯" 표의 L3-b 행, "### 관찰" 절.
- 원장 항목(packages/canard/schema-form/architecture/ledger/*.md, 제목 `### AREA-nnn `): VALUE-002(선언 밖 값의 불변 사본과 키 순서), WRITE-013(호출자 입력 불변), SETTLE-042, SETTLE-043, 그리고 settle DETAIL 이 인용하는 G8 관련 항목(arrayAppend·arrayPop·arraySplice 문장이 인용한 라운드·항목).
- 구현자의 측정 결과: 그 폴더의 packages/canard/schema-form/architecture/verification/perf-optimization/l3b-array-append-results.md (미커밋).

## 검증 축 (각각 통과/실패와 path:line 근거)

1. 자격의 정확성: 새 지름길 자격이 "items(아이템 템플릿) 없음 + extras 뿐인 배열 + 끝 덧붙임(push 또는 insert(N)) 한 번"에만 열리는가. prefixItems 튜플 꼬리, 게이트, 통째 raw, 배치, 로드·자동 쓰기, 가운데 insert·remove·pop 은 여전히 배제되는가. 템플릿이 있는 배열의 기존 경로(admitsStaticArrayTail·prepareArrayAppend·assembleArray)는 한 줄도 동작이 바뀌지 않았는가.
2. 관측 동치: A3 절의 "지름길이 일반 길과 같게 유지할 관측" 목록 각각(새 빈 children 참조·UpdateChildren 사건, revision, 로드 스냅숏 참조, extras 새 배열, itemCount 등)이 지름길에서도 같은가. 빈→빈 UpdateChildren 이 유지되는가. compareArrayAppend 전체 배달 비교가 실제로 일반 길과 대조하는가(시험이 두 길을 정말 비교하는지 확인).
3. 계약: DETAIL 세 곳의 새 문장이 위 원장 항목과 어긋나지 않는가. 코드 변경으로 틀려진 다른 기존 문장을 남기고 있지 않은가. 문서의 언어가 주변과 같은가.
4. 범위: 런타임 +61/−23 이 제거된 비효율에 비해 과하지 않은가. 캐시·전역 상태·상수 깎기가 없는가. 공개 API·공개 이름 수 불변인가. settlement.ts 형 변경이 공개 형에 새지 않는가.
5. 시험: 1천·8천에서 getItemEntries 상한(2회)이 상한 단언인가, 수정 전 구현에서 실패하는 시험인가, 기존 시험 기대값 변경 0건인가, 호출자 입력 불변(WRITE-013)과 extras 순서(VALUE-002)를 단언하는가.
6. 측정 보고·커밋 위생: 결과 파일 표가 두 바퀴 min/max 와 Node·Bun 버전을 적는가, 수용 사본 O(N)을 제외한 작업이 1천→8천에서 일정하다는 근거가 있는가, 커밋 메시지에 공동 저자·세션 ID·"Claude-Session" 줄이 없는가, 사용자의 법적 이름이 없는가, PR 본문에 자격 규칙 한 문장·측정 표·제외 조건·배달 차이 0 이 있는가.

## 보고 형식

한국어. 맨 위에 "판정: 통과" 또는 "판정: 실패"와 한 줄 이유. 그 아래 축 1~6 각각 통과/실패, 근거 path:line, 실패면 수정 지시 한 줄. 마지막에 "관찰"로 수정은 아니지만 원장에 남길 만한 사실. worker_done 은 --outcome succeeded 로(판정이 실패여도 검증 자체는 성공), 요약 첫 문장에 판정을 넣으십시오.
