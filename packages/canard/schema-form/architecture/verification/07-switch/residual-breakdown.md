# 82C-01 잔여 성장 재진단

이 문서는 앞선 performance.md의 “잔여 원인 미확정”을 대체하는 후속 진단입니다. 같은 stage-07 작업 트리에서 수행했으며 git 쓰기·설치는 없습니다. 시간 단위는 ms입니다. BF 새/옛 배율의 상승과 새 엔진 자체의 연산 수 초선형을 구별합니다.

## 계측과 분해

[수정 전 phase raw](phases-residual-before.json) · [수정 후 phase raw](phases-residual-after.json) · [계측 스크립트](measure-phases.mjs) · [연산 계수](operation-counts.json) · [계수 스크립트](measure-operations.mjs). 기존 첫 82C 수정본을 before, 이번 두 잔여 수정 후를 after로 계측했습니다. 원래 b49f53962와의 차이는 첫 보고서에 남아 있습니다. 각 fixture warmup20/sample101, 전용 프로세스, GC 후 측정이며 다른 테스트/벤치를 겹치지 않았습니다.

L=t_small×R, E=t_large−L, Q=t_large/(t_small×R)입니다. L은 작은 입력의 노드/깊이/분기당 비용을 선형으로 확장한 기준이며 E는 부호 있는 잔차입니다. E>0 자체는 이차 알고리즘의 증명이 아닙니다. mount R은 실제 N(51/101/501, 85/1365), nested update는 실제 path 깊이 D=3/5, oneOf는 영향 분기 B=5/10/20입니다. update는 BF가 정의한 상호작용 묶음 전체입니다. 각 phase 중앙값은 독립이므로 합계가 전체 중앙값과 같을 필요는 없습니다.

## 확인한 구조 비용과 수정

| phase / 귀속 | 최대 크기 전 L + E = 시간 | 후 L + E = 시간 | 원인·수정·연산 증거 |
| --- | --- | --- | --- |
| 03 transition/source presence | 0.685808 + (0.244410) = 0.930218; Q=1.356 | 0.027428 + (-0.001075) = 0.026353; Q=0.961 | transitionSettlement.ts:61–63 → isMissingRaw.ts:17. 각 entered branch마다 전체 빈 하위 트리를 다시 읽는 O(ND). 실제 default 후보만 검사해 방문313/7737→64/1024. 추가 영구 메모리 없음; branch 자체 default가 있는 경우 기존 source 보호 유지. |
| 06 dirty index / mount | 1.899068 + (1.086697) = 2.985765; Q=1.572 | 1.382231 + (-0.042809) = 1.339422; Q=0.969 | DirtyPathSet.ts:66–76의 노드별 모든 prefix 색인. registerRecalculation.ts:15–16에서 ungated 계산 경계만 beginPostOrder(:22)로 전환; 직접 에지(:59)만 유지. 계산된 전 색인456/12744→실측168/2728=2(N−1). 시간·메모리는 고유 prefix closure 수에 선형. |
| 06 dirty index / leaf update | 0.026802 + (0.008329) = 0.035131; Q=1.311 | 0.029653 + (0.004052) = 0.033705; Q=1.137 | registerRecalculation.ts:29–32가 만든 각 조상을 다시 DirtyPathSet에 prefix 색인하던 O(D²). 깊이4/16/64 색인 peak10/136/2080→4/16/64 검증. 실제 BF 10회 입력의 link 삽입60/150→60/100(일반 최초 색인+직접 closure). 작은 d3는 전환 고정비 때문에0.016081→0.017792ms로 증가한다. |

위 파일은 모두 PKG의 src/core/settle/utils 아래입니다. 두 구조 비용 모두 stage 07의 nodeFromJSONSchema/binding 경로와 BF nested mount/update가 직접 도달하므로 49C-01에 따라 수정했습니다. 일반 임의 add/delete와 gated 계산의 첫 살아 있는 descendant 순서는 그대로입니다. scratch 처음부터 모드를 바꾸는 안은 기존 순서 테스트가 실패하여 폐기했고, 등록 경계에서만 전환하도록 좁혔습니다. clear는 일반 모드를 되살리며 미존재 경로를 위한 조상 복구 루프도 유지했습니다.

source-presence Q는1.356→0.961, mount dirty-index Q는1.572→0.969입니다. update dirty-index의 후 잔차0.004052ms를 0으로 감추지 않습니다. 그러나 단계 호출 수와 실제 link 삽입은 이제 D에 선형이며, 깊이64 회귀 테스트가 이전 삼각수 색인을 검출합니다. 즉 남은 짧은 시간 잔차를 여전히 O(D²) 코드가 있다고 해석하지 않습니다.

## 새/옛 배율 상승의 정량적 해석

[최신 BF core raw](../../../../../aileron/benchmark-form/results/equivalent-82c01-residual-core.json)는 같은 --equivalent --mode=core --min-samples=100 명령으로 19 fixture를 모두 측정했습니다. 새/옛 각100개, AB/BA 교대이며 phase timer가 없는 결과입니다. 아래 affine fit은 T(S)=a+bS이고 3점 자료는 최대 절대 잔차를 함께 표시합니다. 2점 nested fit은 항등적인 보간이므로 지수를 증명하는 통계로 쓰지 않습니다.

| 그룹 / S | 옛 a + bS | 새 a + bS | 최대 잔차 옛 / 새 |
| --- | --- | --- | --- |
| flat mount / fields | 0.641103 + 0.003750S | 2.374929 + 0.019437S | 0.047459 / 0.312125 |
| nested mount / nodes | 0.636166 + 0.002957S | 2.351625 + 0.023213S | 0.000000 / 0.000000 |
| oneOf update / branches | 0.156355 + 0.000239S | 0.745520 + 0.048083S | 0.000509 / 0.012875 |

flat의 증가 배율은 새/옛의 고정비와 선형 기울기가 다른 것으로 설명됩니다. 주요 phase Q는1 아래이며, 작은 derive-index 양의 잔차는 src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:41–46의51/101/501회 선언 읽기에서 나옵니다. 실제 연산 계수는 정확히 선형이고 controls 부재로 즉시 continue합니다. 이 타이밍 잔차를 이차 검색이라고 부를 근거는 없으며, JIT/GC의 특정 원인이라고 단정하지도 않습니다.

oneOf는 새 gate 평가가120/240/480회이고 prefix link도35/65/125=6B+5회입니다. src/core/settle/utils/compute/selectChildren.ts:127의 후보 선언 순회, utils/gates/evaluateGate.ts:26의 영향 gate 평가, utils/write/getDependencyIndex.ts:74–112의 영향 owner 조회(registration phase에 포함)가 분기 수에 따라 늘어납니다. phase Q(gate/children/registration)=0.835/0.511/0.654이고 양의 초선형 잔차가 없습니다. 거의 일정한 legacy 분모와 새 필수 O(B) 기울기의 차이가 배율 상승을 만듭니다. SETTLE-017·020·044·050의 전체 영향 게이트 평가를 생략하는 의미 변경은 하지 않았습니다.

nested는 위 두 실제 중복을 제거했습니다. 남은 transition exclusive 양의 잔차는 뒤 전체 표에 남겼습니다. 이 몫에는 entered bucket/filled membership/원본 표시·유효 타입 확인이 포함되며 반복 하위 검사와 dirty prefix 작업은 별도 phase로 빠졌습니다. 고유 tree edge N−1, mount 두 처리회차의 총 direct link 삽입2(N−1), default 후보 leaf 수, node creation N, derive declaration N의 실측 계수를 함께 제시하므로 “원인 미확정 초선형 코드”로 뭉뚱그리지 않습니다. path 문자열 자체의 길이와 그 저장·해시 비용은 연산 횟수와 별개이며 깊이 비용이 전부 사라졌다고 주장하지 않습니다.

## 전체 phase 수치와 귀속

아래는 수정 후 exclusive 중앙값입니다. 비교 범위마다 모든 계측 phase를 표시했습니다. 첫 settlement는 writeSchemaNode의 하위 계측을 뺀 자체 비용이며 blueprint, 생성, transition, commit 등과 중복 합산하지 않습니다. validationMode=0이므로 validation registration/run은 0회입니다. raw의 delivery-flush 키는 대응 함수가 없어 0이며 독립 측정으로 해석하지 않습니다. 실제 flushQueuedEvents/runDeliveryWaves와 onChange는 dispatch-exit에 포함됩니다. phase 진단은 source 직접 호출의 동기 구간이고 BF는 dist의 onChange 완료 경계와 tick drain을 사용하므로 두 절대 시간을 합치거나 동일 표본으로 취급하지 않습니다.

### flat mount

| phase | 크기 순 ms | 최대 크기 L | E | Q |
| --- | --- | ---: | ---: | ---: |
| blueprint | 0.373791 / 0.644708 / 2.957167 | 3.671947 | -0.714780 | 0.805340 |
| node-creation | 0.022875 / 0.039411 / 0.159794 | 0.224713 | -0.064919 | 0.711102 |
| settlement | 0.062750 / 0.085834 / 0.338083 | 0.616426 | -0.278343 | 0.548456 |
| commit | 0.067376 / 0.112583 / 0.464375 | 0.661870 | -0.197495 | 0.701610 |
| delivery-marking | 0.135708 / 0.243167 / 1.079875 | 1.333132 | -0.253257 | 0.810029 |
| validation-registration | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| validation-run | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| recursive-expansion | 0.010247 / 0.018168 / 0.067597 | 0.100662 | -0.033065 | 0.671526 |
| child-selection | 0.226624 / 0.390664 / 1.754705 | 2.226248 | -0.471543 | 0.788190 |
| output | 0.063383 / 0.112419 / 0.517492 | 0.622645 | -0.105153 | 0.831119 |
| recalculation-registration | 0.014665 / 0.022914 / 0.096832 | 0.144062 | -0.047230 | 0.672155 |
| dispatch-exit | 0.003958 / 0.006459 / 0.017542 | 0.038882 | -0.021340 | 0.451165 |
| dependency-index | 0.006792 / 0.003334 / 0.003417 | 0.066721 | -0.063304 | 0.051213 |
| derive-rule-index | 0.003501 / 0.006042 / 0.050500 | 0.034392 | 0.016108 | 1.468357 |
| transition | 0.093628 / 0.158181 / 0.653696 | 0.919757 | -0.266061 | 0.710727 |
| gate-evaluation | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| source-presence | 0.002128 / 0.004291 / 0.012919 | 0.020904 | -0.007985 | 0.618002 |
| default-selection | 0.010456 / 0.015538 / 0.162207 | 0.102715 | 0.059492 | 1.579198 |
| dirty-children | 0.015291 / 0.027376 / 0.120752 | 0.150212 | -0.029460 | 0.803879 |
| dirty-index | 0.040084 / 0.069961 / 0.356739 | 0.393766 | -0.037027 | 0.905966 |

### nested mount

| phase | 크기 순 ms | 최대 크기 L | E | Q |
| --- | --- | ---: | ---: | ---: |
| blueprint | 0.566166 / 8.765583 | 9.091960 | -0.326377 | 0.964103 |
| node-creation | 0.031246 / 0.518123 | 0.501774 | 0.016349 | 1.032582 |
| settlement | 0.094045 / 1.033416 | 1.510252 | -0.476836 | 0.684267 |
| commit | 0.100792 / 1.714375 | 1.618601 | 0.095774 | 1.059171 |
| delivery-marking | 0.206750 / 3.098667 | 3.320162 | -0.221495 | 0.933288 |
| validation-registration | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| validation-run | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| recursive-expansion | 0.014795 / 0.197687 | 0.237590 | -0.039903 | 0.832050 |
| child-selection | 0.393669 / 6.320285 | 6.321861 | -0.001576 | 0.999751 |
| output | 0.095867 / 1.395026 | 1.539511 | -0.144485 | 0.906149 |
| recalculation-registration | 0.022744 / 0.282958 | 0.365242 | -0.082284 | 0.774714 |
| dispatch-exit | 0.003541 / 0.044625 | 0.056864 | -0.012239 | 0.784763 |
| dependency-index | 0.003208 / 0.004792 | 0.051517 | -0.046725 | 0.093018 |
| derive-rule-index | 0.007625 / 0.203918 | 0.122449 | 0.081469 | 1.665336 |
| transition | 0.143495 / 2.581025 | 2.304361 | 0.276664 | 1.120061 |
| gate-evaluation | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| source-presence | 0.001708 / 0.026353 | 0.027428 | -0.001075 | 0.960790 |
| default-selection | 0.018589 / 0.401615 | 0.298517 | 0.103098 | 1.345365 |
| dirty-children | 0.028540 / 0.417293 | 0.458319 | -0.041026 | 0.910486 |
| dirty-index | 0.086073 / 1.339422 | 1.382231 | -0.042809 | 0.969029 |

### nested update

| phase | 크기 순 ms | 최대 크기 L | E | Q |
| --- | --- | ---: | ---: | ---: |
| blueprint | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| node-creation | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| settlement | 0.054543 / 0.070130 | 0.090905 | -0.020775 | 0.771465 |
| commit | 0.024289 / 0.024753 | 0.040482 | -0.015729 | 0.611462 |
| delivery-marking | 0.071875 / 0.096332 | 0.119792 | -0.023460 | 0.804163 |
| validation-registration | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| validation-run | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| recursive-expansion | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| child-selection | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| output | 0.029749 / 0.049046 | 0.049582 | -0.000536 | 0.989196 |
| recalculation-registration | 0.009922 / 0.016713 | 0.016537 | 0.000176 | 1.010663 |
| dispatch-exit | 0.003332 / 0.003999 | 0.005553 | -0.001554 | 0.720108 |
| dependency-index | 0.000461 / 0.000625 | 0.000768 | -0.000143 | 0.813449 |
| derive-rule-index | 0.001000 / 0.001047 | 0.001667 | -0.000620 | 0.628200 |
| transition | 0.003291 / 0.003292 | 0.005485 | -0.002193 | 0.600182 |
| gate-evaluation | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| source-presence | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| default-selection | 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| dirty-children | 0.009540 / 0.015998 | 0.015900 | 0.000098 | 1.006164 |
| dirty-index | 0.017792 / 0.033705 | 0.029653 | 0.004052 | 1.136634 |
### oneOf mount

| phase | 5 / 10 / 20 ms | 최대 크기 L | E | Q |
| --- | --- | ---: | ---: | ---: |
| blueprint | 0.275584 / 0.382875 / 0.605750 | 1.102336 | -0.496586 | 0.549515 |
| node-creation | 0.025415 / 0.024459 / 0.024958 | 0.101660 | -0.076702 | 0.245505 |
| settlement | 0.104791 / 0.124711 / 0.175626 | 0.419164 | -0.243538 | 0.418991 |
| commit | 0.028624 / 0.028708 / 0.028500 | 0.114496 | -0.085996 | 0.248917 |
| delivery-marking | 0.047583 / 0.048917 / 0.048917 | 0.190332 | -0.141415 | 0.257009 |
| validation-registration | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| validation-run | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| recursive-expansion | 0.003834 / 0.005499 / 0.008167 | 0.015336 | -0.007169 | 0.532538 |
| child-selection | 0.196591 / 0.277703 / 0.473460 | 0.786364 | -0.312904 | 0.602088 |
| output | 0.036292 / 0.040831 / 0.047706 | 0.145168 | -0.097462 | 0.328626 |
| recalculation-registration | 0.035458 / 0.048669 / 0.075504 | 0.141832 | -0.066328 | 0.532348 |
| dispatch-exit | 0.002417 / 0.002250 / 0.002166 | 0.009668 | -0.007502 | 0.224038 |
| dependency-index | 0.030126 / 0.051417 / 0.090292 | 0.120504 | -0.030212 | 0.749286 |
| derive-rule-index | 0.002916 / 0.004084 / 0.005500 | 0.011664 | -0.006164 | 0.471536 |
| transition | 0.080329 / 0.090670 / 0.112788 | 0.321316 | -0.208528 | 0.351019 |
| gate-evaluation | 0.069538 / 0.120386 / 0.225297 | 0.278152 | -0.052855 | 0.809978 |
| source-presence | 0.000250 / 0.000250 / 0.000250 | 0.001000 | -0.000750 | 0.250000 |
| default-selection | 0.005124 / 0.005000 / 0.005499 | 0.020496 | -0.014997 | 0.268296 |
| dirty-children | 0.007499 / 0.010582 / 0.016332 | 0.029996 | -0.013664 | 0.544473 |
| dirty-index | 0.008751 / 0.011500 / 0.018376 | 0.035004 | -0.016628 | 0.524969 |

### oneOf update

| phase | 5 / 10 / 20 ms | 최대 크기 L | E | Q |
| --- | --- | ---: | ---: | ---: |
| blueprint | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| node-creation | 0.006376 / 0.005000 / 0.004918 | 0.025504 | -0.020586 | 0.192832 |
| settlement | 0.166956 / 0.171379 / 0.195623 | 0.667824 | -0.472201 | 0.292926 |
| commit | 0.053291 / 0.050792 / 0.051001 | 0.213164 | -0.162163 | 0.239257 |
| delivery-marking | 0.045291 / 0.044458 / 0.045501 | 0.181164 | -0.135663 | 0.251159 |
| validation-registration | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| validation-run | 0.000000 / 0.000000 / 0.000000 | 0.000000 | 0.000000 | — |
| recursive-expansion | 0.000458 / 0.000417 / 0.000417 | 0.001832 | -0.001415 | 0.227620 |
| child-selection | 0.198956 / 0.258405 / 0.407031 | 0.795824 | -0.388793 | 0.511459 |
| output | 0.028709 / 0.034461 / 0.042083 | 0.114836 | -0.072753 | 0.366462 |
| recalculation-registration | 0.037792 / 0.057880 / 0.098835 | 0.151168 | -0.052333 | 0.653809 |
| dispatch-exit | 0.001916 / 0.001751 / 0.001751 | 0.007664 | -0.005913 | 0.228471 |
| dependency-index | 0.000249 / 0.000209 / 0.000209 | 0.000996 | -0.000787 | 0.209839 |
| derive-rule-index | 0.000332 / 0.000291 / 0.000291 | 0.001328 | -0.001037 | 0.219127 |
| transition | 0.044663 / 0.047833 / 0.058792 | 0.178652 | -0.119860 | 0.329087 |
| gate-evaluation | 0.080507 / 0.143590 / 0.268796 | 0.322028 | -0.053232 | 0.834698 |
| source-presence | 0.000166 / 0.000126 / 0.000126 | 0.000664 | -0.000538 | 0.189759 |
| default-selection | 0.002375 / 0.002334 / 0.002625 | 0.009500 | -0.006875 | 0.276316 |
| dirty-children | 0.007043 / 0.010790 / 0.018126 | 0.028172 | -0.010046 | 0.643405 |
| dirty-index | 0.009998 / 0.014372 / 0.025166 | 0.039992 | -0.014826 | 0.629276 |

### phase별 코드 주소

경로는 PKG 기준입니다. 양의 E를 구조 결함으로 단정하지 않고, 해당 phase가 실제 실행하는 루프·자료구조를 아래에 연결합니다. 전후 구조 차이는 위 계수와 복잡도 회귀 테스트가 증명합니다.

| phase | file:line | 메커니즘 / 비용 |
| --- | --- | --- |
| blueprint | src/core/blueprint/blueprint.ts:15 | 선언 및 템플릿 구축; flat의 주요 비용은 선형 기준 이하. |
| node-creation | src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 활성 occurrence당 생성; flat/nested 실제51/101/501 및85/1365회. |
| settlement | src/core/settle/utils/write/writeSchemaNode.ts:35 | 한 호출의 scratch와 단계 연결; 하위 측정 제외. |
| commit | src/core/settle/utils/commit/commitSettlement.ts:31 | 계산 frontier를 커밋; 하위 delivery marking 제외. |
| delivery-marking | src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 변경 노드의 배달 표식. 경로 보관 비용 포함, 별도 Set 중복 탐색 없음. |
| validation-registration | src/core/validation/utils/run/requestSchemaNodeValidation.ts:14 | BF 검증기 미등록으로0; 실제 등록 시 cache/readValidationEntry.ts:32. |
| validation-run | src/core/validation/utils/run/runSchemaNodeValidation.ts:12 | 이 입력은0; 비동기 검증 성능을 추론하지 않음. |
| recursive-expansion | src/core/settle/utils/compute/hasRecursiveExpansion.ts:17,48 | 청사진 cache miss에 전체 DFS 한 번 O(V+E), 이후 O(1). 순환이면 기존 조상 보호. 아래 별도 cold 측정 참조. |
| child-selection | src/core/settle/utils/compute/selectChildren.ts:75,127 | 직계 후보 순회; oneOf는 B개 영향 gate가 필수. 재귀·gate·output 시간은 별도. |
| output | src/core/settle/utils/compute/updateOutput.ts:13 | 재계산 직계 자식 합성; 객체 얕은 사본은 키 수에 선형. |
| recalculation-registration | src/core/settle/utils/write/registerRecalculation.ts:15,29 | 고유 조상 등록과 미해결 경로 조상 복구. ungated index는 직접 에지로 전환. |
| dispatch-exit (delivery 포함) | src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24,35; flushQueuedEvents.ts:27 | queue/wave 배달과 onChange; 이 BF의 feedback 없는 일정 호출 수. |
| dependency-index | src/core/settle/utils/write/getDependencyIndex.ts:156 | 색인 cache 조회/최초 생성만 포함. 실제 .affected():74–112는 registerRecalculation 호출 아래 registration phase에 포함. |
| derive-rule-index | src/core/settle/derive/utils/rules/getDeriveRuleTable.ts:41–46 | controls 없는 선언은1회 읽고 continue; flat/nested 선언 수와 선형. |
| transition | src/core/settle/utils/transition/transitionSettlement.ts:44,47,70 | entered 깊이 bucket, filled membership, written input의 타입 확인. ungated filledNodes는 노드 정체성 Set; default/source/index 하위 비용 제외. |
| gate-evaluation | src/core/settle/utils/gates/evaluateGate.ts:26 | 영향 gate의 평가; update120/240/480회, 순서·의미 유지. |
| source-presence | src/core/settle/utils/transition/isMissingRaw.ts:17 | 빈 자식 재귀. 호출자를 default 후보로 제한하여 nested 중복 하위 트리 탐색 제거. |
| default-selection | src/core/settle/utils/transition/readDefault.ts:14 | 노드의 선택 선언에서 default 탐색. nested에서는 단일 선언이며 leaf default만 source 검사. |
| dirty-children | src/core/settle/utils/compute/dirtyChildren.ts:18 | 부모에 색인된 직계 계산 후보 순회; ungated 직접 에지당 처리. |
| dirty-index | src/core/settle/utils/write/DirtyPathSet.ts:22,59,66 | post-order frontier에서 직접 에지만 보관; 일반/gated index의 첫 descendant 순서 유지. 문자열 slice/hash의 경로 길이 비용은 남음. |
## 양의 시간 잔차의 구체적 처리

- flat default-selection: L=0.102715, E=+0.059492ms(Q=1.579). readDefault.ts:17 → utils/controls/getControlLayers.ts:49,61은 이 fixture에서 노드와 직계 부모의 단일 선언만 읽습니다. 호출51/101/501회이며 조상 전체를 훑지 않습니다. derive-rule-index의 E=+0.016108ms와 마찬가지로 선형 연산의 시간 잔차이며 이차 구조의 증거가 아닙니다.
- nested default-selection: L=0.298517, E=+0.103098ms(Q=1.345), 호출85/1365회. 위와 같은 직계 부모 범위입니다. derive-rule-index는 L=0.122449, E=+0.081469ms(Q=1.665)이고 실제 선언 읽기는85/1365회입니다.
- nested node-creation: L=0.501774, E=+0.016349ms(Q=1.033). schemaNodeFactory.ts:37의 부모 path 연결과 노드당 생성이며 총 path 바이트 길이 비용을 포함합니다.
- nested commit: L=1.618601, E=+0.095774ms(Q=1.059). commitSettlement.ts:50–52의 선언 기록은 노드당1회이고 getCommittedDeclarationKey.ts:21에서 path/kind를 처음 직렬화합니다. 시간·메모리는 노드 수 외에 총 path 바이트에도 비례합니다. 이 입력에는 mismatch가 없어 commitSettlement.ts:149–165의 mismatch별 조상 루프를 실행하지 않습니다.
- nested transition exclusive: L=2.304361, E=+0.276664ms(Q=1.120). transitionSettlement.ts:44–47의 bucket/flat, :51–53의 노드 membership, :70–75의 written input 타입 확인이 남습니다. pendingExits는0이라 :49,:72의 path JSON은 실행하지 않고, load여서 :59의 조상 검사도 실행하지 않습니다. 재귀 source/index 비용은 각각 별도로 계측했으며 제거 전후의 구조 변화와 분리합니다.

시간 잔차를 모두0으로 간주하거나 임의로 GC 탓으로 돌리지 않습니다. 위 주소와 실행 범위에서는 입력당 반복 연산이 선형이며 총 path 문자 길이 비용은 표현 크기에 비례하는 비용입니다. 관측하지 않은 입력, 순환 그래프, controls 밀도에 대한 선형 보장은 하지 않습니다. “새/옛 전체 배율이 크기 독립”이라는 주장도 하지 않아 해당 행은 수용하지 않습니다.

## d5 acyclic-check 3.39×의 의미

[별도 원자료](recursion-cost.json) · [재현](measure-recursion.mjs). 이전 phase의0.058841→0.199245ms(3.386×)는 감소했다고 정정할 수 없습니다. timer/counter를 제거한 별도 guard 모듈에서도 cold 비용 증가를 재현했으므로 단순 측정 오류로 처리하지 않습니다. 실제 fixture의 청사진 구조를 재현한 synthetic parent chain에서 각 guard 호출을 실행했으며, cold는 타이머 밖에서 새 blueprint 정체성을 만들고 warm은 같은 정체성을 재사용했습니다.201표본/30warmup, 별도 계수 모듈은 실제 mount의 방문 수를 측정했습니다.

| 구현 / fixture | cold ms | warm ms | 실제 mount 조상 방문 | DFS 방문 |
| --- | ---: | ---: | ---: | ---: |
| original / nested-d3-f4 | 0.001166 | 0.000875 | 228 | 0 |
| current / nested-d3-f4 | 0.017750 | 0.001167 | 0 | 85 |
| original / nested-d5-f4 | 0.027500 | 0.026750 | 6372 | 0 |
| current / nested-d5-f4 | 0.173792 | 0.017833 | 0 | 1365 |

귀속은 stage07 hasRecursiveExpansion.ts:48–51의 cache miss 및 :17–29의2개 Set을 쓰는 DFS입니다. 기존 조상 검사228/6372회(O(ND))를 DFS85/1365회(O(V+E))와 O(1) cache 조회로 바꿨지만 작은 트리에서 DFS/Set의 상수가 큽니다. cold d5는 기존0.027500→0.173792ms(6.320×), 새 d3→d5의 Q=0.610으로 크기 초선형 증가와는 다릅니다. 서로 계측 경계가 달라6.320×를 이전3.386×의 대체 숫자로 쓰지 않습니다. warm d5는0.026750→0.017833ms입니다. mount마다 새 blueprint를 만들므로 cold 비용은 매 mount 발생하며 같은 blueprint 내 발생들에만 분산됩니다. 임시 메모리O(V), 지속 메모리는 살아 있는 blueprint당 약한 boolean 하나입니다. 이 상수 비용 회귀는 공개하며 수용 선언하지 않습니다.

## 비도달·검증·재현

P-135는 stage06(07a083c18) src/core/settle/utils/transition/withdrawDetachedFills.ts:19의 fill별 자동 로그/조상/잠복 로그 중첩 O(F·(A·D+L))입니다. 이번 실제 연산 계수의19 fixture×mount/update38행 모두 detachedFills=0, withdrawLogEntries=0입니다. 함수 자체가 호출되지 않는다는 뜻이 아니라 비용을 만드는 내부 분기가 비도달이라는 뜻입니다. 수정하지 않고 **열린 행 — 수용 대상 아님, 어느 PR의 머지도 막지 않음**을 유지합니다. P-25의 선행 참조 복원 문제도 열려 있습니다.

복잡도 회귀는 src/core/settle/__tests__/settle.residual-scaling.test.ts의9사례입니다. source branch 검사21/341회가 수정 전 실패하고 수정 후0회, index peak10/136/2080이 수정 전 실패하고4/16/64로 통과했습니다. 부모 default 우선순위·기존 자식 source·일반 삭제 순서·미존재 경로 재등록·전환/clear 순서도 검증했습니다. DETAIL의 전이와 재계산 계약을 코드보다 먼저 갱신했습니다. 읽기 전용 검토자는 현재 소스에 PASS를 반환했습니다.

최종 소스에서 PKG 명령 `npx --no-install vitest run --project unit --project render --project react18 --reporter=dot` 결과399파일 중397통과/2실패,3035통과/4실패/1todo입니다. 네 실패는 Form.effectFeedback의 useEffect/useLayoutEffect EVENT-070이 render와 react18에 각각 있는 것뿐입니다. `npx --no-install tsc --noEmit --composite false --rootDir . -p tsconfig.json` 및 `npx --no-install eslint "src/**/*.{ts,tsx}"`는 exit0입니다. 이후 소스 수정 없이 문서만 정리했습니다.

재현 순서: PKG에서 `npx --no-install rolldown -c` 후 BF에서 `node --expose-gc --import tsx src/index.ts --equivalent --mode=core --min-samples=100 --out=results/equivalent-82c01-residual-core.json`을 실행합니다. phase/guard/계수 스크립트도 모두 **BF cwd**에서 각각 `node --expose-gc ../../canard/schema-form/architecture/verification/07-switch/measure-phases.mjs residual-after --focus`, `node --expose-gc ../../canard/schema-form/architecture/verification/07-switch/measure-recursion.mjs`, `node ../../canard/schema-form/architecture/verification/07-switch/measure-operations.mjs`로 순차 실행합니다. before raw는 두 수정 직전 snapshot이며 현재 소스로 덮어쓰지 않습니다.

패키지 bench:baseline 실제 명령도 최신 소스로 재실행하여 [bench-82c01-residual-baseline.json](bench-82c01-residual-baseline.json)에 보존했습니다(7파일44항목, legacy 비교 없음). 최신 번들은 dist minify+gzip71,994B, gzip104,592B이고 전체 fractal 표는 performance.md의(라)에 갱신했습니다. 기존 React BF 시간 자료는 이번 잔여 수정 이전 자료입니다. 최신 소스의 React 동작은 위 render/react18 전체 suite로 검증했으며 이번 후속에서는 React BF 시간 자료를 재측정한 것으로 주장하지 않습니다.

원장 의미 변경이나 승인 요청은 없습니다. flat/nested/oneOf core mount 및 oneOf update의 배율은 여전히 크기 독립이 아니므로 (나)에 새로 이동한 행은 없습니다. 기존 (나)의 nested update는 최신1.559/1.558×입니다. 구조 결함 해결, 선형 상수 비용 기록, 소유자 수용은 구별합니다.
