# 421라운드 P1 실제 도구 M1 검토 기록

이 문서는 원장 관리자가 agy3.8의 전체 최종보고와 추가 소명을 읽어 작성한 검토 기록입니다. 검토자가 직접 쓴 파일이나 제공 검증기를 다시 실행한 결과가 아닙니다. 대상은 main ignored itemless-aa-order-probe의 준비34파일이며 실제 엔진·preflight·probe·타이밍 실행은0입니다.

검토 task_66fea695d673/ctx_646c093bc7ba/term_aa9119f9-bb88-46b4-8002-f6759838d7be의 모델은 gemini-3.8-flash-high입니다. 최초 receipt는 outcome_unknown/turn_start_unobserved였으나 실제 파일 읽기와 자체 Node 연산을 관측했습니다. 최초 check --terminal exit1의 codesign task_name_for_pid failure5/runtime metadata 거절 뒤 추가 IPC·우회·성공 worker_done은 없었습니다. 전체 최종보고 및 한정 소명과 idle을 읽은 뒤 정확 stop/release하여 owned agent terminal closed·archive unavailable을 확인했습니다.

검토자 자체 환경은 /opt/homebrew/Cellar/node/26.12.0/bin/node, v26.12.0과 TypeScript5.9.2입니다. 파서 SHA는029ac2b6f5337e62071559dddd2fc7648d355e253392b03dc1e207276344d799입니다. 자체 fs/JSON/crypto 및 createSourceFile/forEachChild/createScanner로34파일·277입력 항목, 원본 두 슬라이스와 wrapper/helper/fixture의 정적 구조를 대조했습니다. 제공 함수 소스를 import/require/eval/new Function/vm으로 실행하지 않았다고 명시적으로 소명했으며 엔진·Git·자식 프로세스·쓰기 실행도 없었습니다.

G1–G7의 exit0/성공 marker와 정상2·결함4 자식 실행 표는 생성자 Node24.20의 저장 근거입니다. 검토자가 같은 자식 실행을 했다고 적지 않습니다. 검토자의 별도 근거는 실제 파일 해시·AST·정적 판정과 옛 raw4건의136행/13600samples/2720warmups/168preflight 및 median·향후38/3800/760/84 재계산입니다. 28채널 확인은 입력 바인딩 검토이며 새로운28 runtime PASS가 아닙니다.

검토자 자체 감사는 externalInputs.length를19로 가정하여 실제18과 달라 AssertionError/exit1이 났습니다. 실제 externalInputs18과 additionalRuntimeInputs1로 나눈 뒤 exit0을 보고했습니다. 최초 최종보고가 이 실패를 빠뜨려 원장 관리자가 추가 명령 없는 한정 소명을 요청했습니다. 소명의 argv 본문은 시작부와 생략부를 포함하므로 전체 정확 명령이 보존되었다고 주장하지 않습니다. 실행 바이너리·cwd·실패 단언·stderr의18 !== 19·정정 결과는 확인했습니다. 별도 초기 IPC 거절과 생성자의 legacy.rawPath 가정 오류 및 네 expected negative를 합치지 않습니다.

독립 확인한 wrapper/helper/verifier/contract SHA는 각각42b9b0526f5bc1a42bb069b871973e3e12c964fdac90ea226074123c0c11bd4b, 96e0db7dcf82051598f5ea8b99c48ff48d151200ad306fc342779d11c421da98, 4f9c0df02034d492ff84e9752f512b385e8a3a9aff2a2f51962f43b4bcf759c4, 60f39fd5a982ad32e331b583df9266e443dda40dec975185330dedb62cefaef6입니다. epoch SHA228717e6229b2ae2f11066ccd3eca02519bec6076d6260d06bb7d60adba97313, 생성자 report SHA22716d8256fe788009bcc03cdd36774a18e17b9a9410fcee820c6d9f9a52c0cb와 일치했습니다. 입력 구분은 static10/metadata3/external18/additionalRuntime1/protected245입니다.

원장 관리자의 결정은 `tool-code-cleared`입니다. 현재code4와 G1–G7의 정적 M1 검토 범위로 수용합니다. 검토자의 일반적인 무결함 표현이나 타임스탬프 설계가 노이즈를 배제한다는 설명으로 확대하지 않습니다. wrapper의 processStartedUTC/processEndedUTC는 import 뒤 측정 함수 구간이며 OS 프로세스 생성 시각이 아닙니다. 전체 명령 시각과 PID·exit는 다음 실행 제어 기록으로 별도 확인해야 합니다.

quiet와 M2는 아직 승인하지 않습니다. 측정 워커가 마지막 명령 또는 첫 실패 직후 실제 창을 자동 종료하도록 별도 작은 실행 제어부를 준비하고, 추가된 제어 코드만 새 agy3.8이 확인한 뒤 승인 근거에 그 해시를 함께 묶습니다. 기존34파일·code4·epoch와 pending gates.md는 바꾸지 않으며 후속 승인·출력·게이트 상태는 별도로 기록합니다. 제어부는 엔진을 import하지 않고 승인된 wrapper 두 명령만 순차 호출하며 첫 실패 뒤 BA를 막아야 합니다. 제어 프로세스와 실제 두 측정 프로세스의 횟수를 구별합니다.

이 결정은 성능 수용이나 PR423 병합 승인이 아닙니다. owner59/60, TEST-027/M3/54/58, 전역 Filid FAIL/INDETERMINATE와 T14/F는 이 진단에서 변경하지 않습니다. 새 소유자 원문이나 새 정책 결정은 없습니다.
