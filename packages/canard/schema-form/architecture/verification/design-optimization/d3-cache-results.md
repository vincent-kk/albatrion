# D3 — 앱 캐시와 명시적 rebuild 검증

동일 스키마 객체의 두 번째 마운트에서 청사진 참조를 재사용하도록 연결했습니다. 공개 변경은 `FormHandle.rebuild(option?)` 하나이며, 이 메서드는 해당 스키마의 향후 캐시 재사용을 폐기하고 현재 폼의 트리를 교체합니다. 다른 폼의 일반 `reset`은 기존 트리와 청사진을 유지합니다.

## 범위와 계약

근거는 BLUEPRINT-052, SURFACE-063, LANDING-204의 438라운드 소유자 조건과 446C-03·04입니다. 새 `app/cache`의 INTENT·DETAIL과 연결 소유자의 DETAIL을 `671f74c18`에서 먼저 커밋했고, 회귀 시험은 `4fee0133d`, 구현은 `e1ab17dd0`, 공개 핸들 목록 보완은 `29223acb0`입니다. 엔진 파생 레코드·값/노드 키 메모·engineModes는 이동하지 않았습니다.

도메인은 WeakMap 객체 키, 생성 세대, 개발 모드의 값·항목 얕은 동결을 제공합니다. 청사진 항목은 스키마 객체 및 `isTerminal`·`isAtomic` 함수 identity별로 분리됩니다. `createRootLoad`만 저장소를 주입하고 core는 app을 import하지 않습니다. 기존 모듈 수준 술어의 identity는 유지했습니다. 경고 목록은 요청 시 수집하고 `collect` 함수 identity마다 한 번 재생하며, 수신자 기록은 WeakSet입니다.

코디네이터에게 질문하여 다음 결정을 반영했습니다.

- **원장 근거로 정정한 기대값 1건**: 기존 diagnostics 시험 한 사례에서 폐기된 `warningsCollected`를 직접 보던 두 필드 단언을 새 계약의 `diagnostics`·수신자 기록으로 교체했습니다. 같은 수집기 두 번 호출 시 경고 한 번이라는 기존 단언은 유지했습니다. Form 경고 수집은 트리마다 수행하는 기존 경로도 유지합니다.
- 447라운드 명료화: 다른 폼의 무효화가 일반 `reset`의 동작을 바꾸지 않습니다. 자신의 `rebuild` 또는 새 마운트에서 새 분석을 받습니다. 최초 브리프의 다른 폼의 다음 reset 관련 문구보다 이 결정을 따랐습니다.
- 공개 API 목록의 대응 갱신: migration 타입의 Expected 멤버와 Form.binding의 18→19 멤버 목록에 `rebuild`를 추가했습니다. 기존 94개 공개 이름 스냅숏은 그대로이며, 핸들 멤버 스냅숏을 별도로 추가했습니다.
- 기존 probes/profile은 app 바인딩의 저장소를 주입하지 않으므로, 아래 측정은 외부 dist 사본에서 `createRootLoad`를 노출하여 수행했습니다. 계측 범위 변경과 100표본·3회 짝 실행을 승인받았습니다.
- Filid는 새 fractal 발견 0과 변경되지 않은 기존 부채를 분리해 보고하는 조건으로 수용되었습니다. 전체 결과를 통과로 표현하지 않습니다.

## 실행 식별과 환경

- 실행 ID: `20261026T1636-bc0fb3d-d3-cache`
- 원자료 및 외부 계측 스크립트: `{scratch}/perf-runs/20261026T1636-bc0fb3d-d3-cache/`
- 기준 가지 끝: `bc0fb3d0a` (제품 소스는 `8d5c5dba1`과 동일). 비교 대상은 이전/이후 workspace dist이며 npm판과의 비교가 아닙니다.
- 구현 산출물 기준: `29223acb00a6b2e9d5421a19f4b401fb4f16bae3`의 코드. 이후 변경은 API 문서·검사·측정 기록과 시험 파일 끝 빈 줄 정리뿐입니다.
- Apple M1 Max, macOS 27.0.1 arm64, Node v26.12.1, Yarn 4.12.0. 측정은 `NODE_ENV=production`입니다.
- 승인된 조용한 창 시작: `2026-10-26T17:28:00Z`. build 실제 시작 `17:28:04.048551Z`, 전체 관문 마지막 종료 `17:35:00.592699Z`.
- 마운트 측정: 2026-10-26T17:45:38.320530+00:00 ~ 2026-10-26T17:48:01.090559+00:00 (UTC). `--quiet-since=2026-10-26T17:28:00Z`를 전달하고 각 프로세스 기록에 보관했습니다. 창 안에서 build·시험·비교·측정은 순차 실행했습니다.

| 산출물 | 이전 SHA256 | 이후 SHA256 |
| --- | --- | --- |
| index.node.mjs | `a396cf65e154187e33647e034429e323d66357133867bc6ea254861c098dcca6` | `a76e1c71537b992968adb000094221ef2b4b48a62c14f24f64134aad037633f6` |
| index.mjs | `de73871c020c93a9faf398ba496300f805a933cc70383db349b954cde463e4b2` | `373b96b6f520c3c9b3a5b91edb967f6d6602275319223fb06b7d191e8974fab3` |
| index.cjs | `07e6b2743116d332f424d6b709a95f3dd17c59b77ae61b3322660e623f84ab9d` | `3ee55d84d105e8eb6a4714535d00a59a199ee7652983e215e02874e2123b2f8d` |

이후 `index.d.ts` SHA256은 `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6`입니다. 원본 dist와 계측용 사본·스크립트·표본의 SHA256은 외부 `sha256-manifest.json`에 있습니다. 생성 산출물은 커밋하지 않았습니다.

## 두 번째 마운트 전후

각 표본은 새 flat 스키마를 만들고 같은 객체로 첫 번째 트리를 타이머 밖에서 생성·구체화한 뒤, 두 번째 `createRootLoad`와 하위 노드 구체화만 측정합니다. 각 판의 첫 번째 트리는 서로 독립적입니다. React 렌더·커밋·정리, 최초 분석 비용, fixture 생성과 단언은 타이머 밖입니다. 따라서 기존 `probes.mjs mount-blueprint`나 React 전체 렌더 행과 직접 같은 수치로 해석할 수 없습니다.

크기마다 독립된 짝 프로세스 3개를 실행했습니다. 프로세스마다 각 판 20회 준비 후 100표본이며 AB/BA를 번갈아 각 순서 50번씩 사용했습니다. 아래 수치는 세 프로세스의 **최솟값 중앙값**, 폭은 세 최솟값의 **최대−최소**입니다. Δ는 `(이후/이전−1)×100`입니다. 단위는 ms입니다.

| 같은 객체 두 번째 마운트 | 이전 | 이전 폭 | 이후 | 이후 폭 | Δ |
| --- | ---: | ---: | ---: | ---: | ---: |
| flat-1,000 | 3.3620 | 0.1980 | 0.9266 | 0.0767 | -72.44% |
| flat-2,500 | 10.8420 | 0.2614 | 2.5953 | 0.1307 | -76.06% |
| flat-5,000 | 23.5029 | 0.2975 | 5.5780 | 0.3264 | -76.27% |
| flat-10,000 | 48.2721 | 2.1928 | 15.2495 | 0.7470 | -68.41% |

총 12개 프로세스·2,400개 유효 표본이 모두 양수·유한 수치이고 순서 균형과 최솟값 재계산이 일치했습니다. 모든 표본에서 오류 없음, 자식 수, 두 트리의 값 동일, 루트 분리, 입력 스키마 불변을 단언했습니다. 이전 판의 두 청사진은 다른 참조, 이후 판은 같은 참조임도 확인했습니다. 근거는 `paired-results.json`, `measure-commands.json`, `measurement-validation.json`과 `mount-*.stdout`입니다.

재현 명령은 원자료 폴더의 `python3 run-measurements.py --quiet-since=2026-10-26T17:28:00Z`이며, 내부 Node 실행은 기존 `tools/profile/register.mjs`의 의존성 해석기를 사용합니다. 저장소의 측정 도구는 수정하지 않았습니다.

분석을 생략해도 폼마다 트리·값·이벤트 상태는 새로 생성하므로 비용은 필드 수에 따라 늘어납니다. 추가 보관 비용은 살아 있는 스키마별 청사진·술어별 항목·요청된 경고 목록이며, 도메인 등록소는 프로세스 수명 동안 도메인 소유자를 유지합니다. 객체 키와 경고 수신자는 약하게 보관하지만, 살아 있는 폼이 가리키는 기존 청사진은 rebuild 이후에도 그 폼과 함께 남습니다. 이 실행은 메모리 크기나 첫 마운트·일괄 입력의 개선을 측정하지 않았습니다.

## 회귀 증거와 관문

새 시험은 도메인 4건, 청사진 소비자 3건, Form 통합 6건, 캐시 전체 reset 1건입니다. 같은 객체의 청사진 참조 공유 실패와 `rebuild` 부재를 구현 전에 확인했습니다. 경고 재생은 기준판 `blueprint.ts`만 임시 복원한 단일 시험에서 AssertionError로 실패하고 현재 파일을 복구한 뒤 통과했습니다(`warning-replay-check.json`: beforeExit 1, afterExit 0, restored true). 초기 미존재 API 실패와 구체 동작 실패는 `scoped/d3-domain-red.log`, `scoped/d3-form-behavior-red.log`, `scoped/d3-form-rebuild-red.log`에 구분해 보관했습니다.

| 관문 | 결과 | 외부 증거 |
| --- | --- | --- |
| immutable install / 의존성 순서 build | exit 0 / exit 0 | scoped/d3-install.log, build.stdout·stderr, window.json |
| typecheck / lint | 모두 exit 0 | typecheck.stdout, lint.stdout·stderr |
| unit | 491파일, 3,565 통과·1 todo | test-unit.stdout |
| render | 128파일, 760 통과 | test-render.stdout |
| React 18 | 128파일, 760 통과 | test-react18.stdout |
| production | 9파일, 20 통과 | test-production.stdout |
| Storybook | 100파일, 251 통과 | test-storybook.stdout |
| test:verify | 624파일, 4,369 통과·1 todo | test-verify.stdout |
| 전후 배달 비교 | 72장면·323확인점, 차이 0 | delivery.stdout, delivery/out/differential-details.json |
| importModel | 2시험 통과, core→app import 0 | scoped/d3-import-model-green.log, test-unit.stdout |
| 공개 소스/배포 선언 | 기존 export 94개 유지, 핸들 18→19, 추가 rebuild뿐 | scoped/d3-public-green.log, public-dist-diff.json |
| Filid 새 fractal | app/cache 발견 0 | filid-scope-evidence.json |
| Filid 저장소 전체 | indeterminate, 기존 오류 24건 | filid-final-validate.json, filid-counts.json |

lint에는 기존 TypeScript import-type AST API 폐기 예정 경고가 출력되었습니다. Storybook 설정 안내도 기존 상태이며 실행 실패는 없습니다. todo 1건은 그대로 남겼습니다. 배달 비교의 최종 실행은 `status: pass`이고 skip이 아니며, 초기 외부 노출 스크립트의 누락을 수정한 뒤 다시 실행한 결과입니다.

배포 선언은 TypeScript checker로 alias를 해석하고 dist의 절대 경로만 정규화하여 비교했습니다. 기존 94개 export 기술과 기존 핸들 멤버의 형은 같고, `rebuild`는 `reset`과 동일한 옵션·반환형입니다. `src/index.ts`는 바꾸지 않았습니다.

## Filid의 범위와 남은 부채

facts 2,783개를 정확하게 제출했고 missing·uncertain·pending은 0입니다. 같은 snapshot `679375fa548d1e5d392ed9e3b9deb4bf60ccbf02d01fc169bae8bd5fd2b54b5f`에서 scan·6개 scope validate·verification을 수행했습니다. validate 집계는 passed 5,245, failed 14, skipped 308, 발견 378건(info 308·warning 46·error 24)입니다. 새 fractal의 acceptance heading 형식을 보정한 뒤 `app/cache` 발견은 0입니다.

기존 오류는 MUI 플러그인의 경계·순환, FieldProxy 순환, common-utils object/serialization 순환과 경계·stringifyGraph 문서 누락, 기존 시험 두 파일의 사례 상한입니다. 24건 모두의 경로가 기준 커밋 `bc0fb3d0a` 이후 변경 0임을 `git diff --quiet`로 확인했습니다. 상세 경로·규칙은 `filid-counts.json`, 변경 부재와 새 fractal 결과는 `filid-scope-evidence.json`에 보관했습니다. 코디네이터는 이를 공개하는 조건으로 D3 범위를 수용했습니다. 전체 저장소 Filid 검증은 통과 상태가 아니며, 소유 범위 밖의 기존 부채는 이 PR에서 수정하지 않았습니다.
