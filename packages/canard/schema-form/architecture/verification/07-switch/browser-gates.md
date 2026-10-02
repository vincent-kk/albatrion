# U11 브라우저 게이트

U9에서는 샌드박스의 Chromium 시작이 `bootstrap_check_in … Permission denied (1100)`으로 막혔습니다. 이번 U11의 context-mode 실행 경로에서는 Chromium이 시작되어 아래 자동 관측을 얻었습니다. 요청한 결과 칸은 소유자 실행/확인 대기로 유지하며, 자동 관측을 소유자 승인으로 읽지 않습니다. 시험은 Storybook의 `stories/scenarios/browser-gates.stories.tsx`에서 수집됩니다.

| 게이트 | 시험 이름 | 환경 | 결과 | 이번 자동 관측 | 소유자 확인 |
| --- | --- | --- | --- | --- | --- |
| EVENT-065 IME composition | EVENT-065 Korean IME plain, caret formatter and Refresh during composition | storybook 프로젝트, Playwright Chromium; CDP `Input.imeSetComposition`/`Input.insertText` | 소유자 실행 대기 | 실패: 평범한 입력·포매터의 ㄱ→가→각 단언은 통과했으나 `/refresh`에서 조합 중 Refresh 후 포커스가 사라지고 DOM이 가에 머물러 각 단언 실패 | 미확인 |
| REACT-027 number badInput 및 blur 표시 | REACT-027 number badInput stays local and blur restores node display | storybook 프로젝트, Playwright Chromium | 소유자 실행 대기 | 통과: 비운 값 undefined, 미완성 지수 badInput은 노드에 미전달, blur 후 1로 복원 | 미확인 |
| REACT-028 입력 재마운트 판정(reset/StrictMode/virtualization) | REACT-028 reset and Refresh remount judgment in StrictMode and virtualization | storybook 프로젝트, Playwright Chromium | 소유자 실행 대기 | 통과: StrictMode에서 자식을 그리는 컨테이너 유지, 터미널·전체값·빈 배열·접힌 입력 재마운트, 미노출 Refresh 유지와 focus 노출 및 늦은 쓰기 거절 | 미확인 |
| 18C-73 빈 ChildNodeComponents 감지 비용 | 18C-73 empty ChildNodeComponents detection cost | storybook 프로젝트, Playwright Chromium; 감지 배열과 동결 빈 배열 각 100,000회 읽기의 ms 기록 | 소유자 실행 대기 | 통과: 첫 읽기 경고 1건, 유한한 ms 측정; 실제 수치는 스토리 출력 및 `18C-73 detection timing` 로그 | 미확인 |

소유자는 `packages/canard/schema-form`에서 실행해 주십시오. Chromium이 없을 때만 첫 명령이 필요합니다. 이 작업에서는 설치하지 않았습니다.

```sh
npx playwright install chromium
yarn vitest run --project storybook
```

| 사람 확인 목록 | 확인할 결과 | macOS Safari 소유자 확인 | macOS Chrome 소유자 확인 |
| --- | --- | --- | --- |
| 한국어 IME ㄱ→가→각, 평범한 제어 입력 | 단계별 DOM 값 일치, 조합 중 value 세터 0회, compositionend 1회, 종료 후 노드 값 각 | 미확인 | 미확인 |
| 한국어 IME ㄱ→가→각, 캐럿 포매터 입력 | 조합 글과 캐럿 유지, 중간 초안 미전달, 종료 후 최종 값 반영 | 미확인 | 미확인 |
| 한국어 IME ㄱ→가→각, 조합 중 Refresh | 조합 표시 유지 및 DOM 쓰기 지연, 대체 입력의 늦은 쓰기가 노드에 닿지 않음 | 미확인 | 미확인 |

측정 비용은 스토리의 `ChildNodeComponents detection timing` 출력과 로그에 표시됩니다. 2026-10-03 최종 자동 실행에서 각각 100,000회 읽기에 감지 배열 약 2.80ms, 보통의 동결 빈 배열 약 0.40ms가 관측되었습니다. 단일 실행 수치이며 승인된 비용 한도는 원장에 없으므로 소유자가 판단합니다.
