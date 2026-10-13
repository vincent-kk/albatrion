# 261라운드 닫기 — 핵심 고유명사 재검토(260라운드 요구 2)의 후보 목록과 사실 확인; 소유자 결정 대기

2026-10-14. 원장 관리자가 공개 어휘 전수 목록(scout: index export, FormProps·FormHandle, Form statics, 노드 멤버, enum, 작성 키, 플러그인 표면, 컨텍스트·훅, core 디렉터리)을 만들고 fairy07이 사실 셋을 확인했다(scratchpad/259C-01/followup-extras-group-options.md): (가) 노드 멤버 `extras`는 자식으로 분배되지 않은 입력(객체의 선언 밖 키, 배열의 청사진 없는 꼬리 값)을 담는 상태 칸이며 공개 형에 드러남; (나) `Form.Group`은 path 하나를 FieldProxy로 그리며 FieldInput·FieldRenderer·Wrapper를 덮어쓰는 공개 래퍼로, README에 플러그인 형 주석으로만 나오고 SPEC에는 없으며 문서 사이트 api-reference.mdx:158이 없는 플러그인 칸 "FormGroup"을 적고 있음(실제 키 FieldRenderer); (다) `options.virtual`은 populateVirtualNodes.ts:30이 읽고 명세·문서·시험에 있음, `options.propertyKeys`는 getStaticChoices.ts:44가 읽어 객체 출력 키 순서에 쓰지만 공개 형·README·SPEC·문서 사이트·스토리 어디에도 없고 엔진 시험 6개 파일에만 있음.

### 261C-01 추가 이름 변경 후보(소유자 결정 입력) — 승인되면 259C-01 대응표에 더해 07b-5로 한 번에 치환

| 번호 | 후보 | 권고 |
| --- | --- | --- |
| 1 | `SchemaNodeEventType.UpdateComputedProperties` → `UpdateControlledProperties` | 변경(옛 낱말 `computed`) |
| 2 | `ChildNodeComponentProps`·`ChildNodeComponents`·`useChildNodeComponentMap`·`useChildNodeErrors` → `ChildField*` | 변경(FieldNode와 어휘 통일) |
| 3 | `SchemaNodeState.ShowError` → `FieldNodeState.ErrorVisible` | 변경(ShowError 네 겹 해소; prop·메서드는 유지) |
| 4 | 노드 멤버 `extras` → `undeclaredValues` | 변경(담는 것을 말함; 대안 `passthrough`) |
| 5 | `Hint` → `FieldInputHint`, `FieldInputTestObject`는 그 부분형 | 변경 |
| 6 | `dispatch` 디렉터리 → 역할 이름(예: `write`) | C 재배치에서 |
| 7 | `SetValueOption` 셋 → 공개 하나, 내부는 다른 이름 | 정리(런타임 불변) |
| 8 | `JSONSchema` 셋 → 공개 하나, 내부는 다른 이름 | 정리 |
| 9 | core/SchemaNode/type.ts:235의 `FieldInputProps` → 내부 이름 | 정리 |
| 10 | `src/types` 대 `src/core/types` | C 재배치에서 `engine/types` |
| 11 | `Form.Group`·`FormGroupProps` → `Form.Field`·`FormFieldProps`; 문서 사이트 api-reference.mdx:158의 "FormGroup" 플러그인 칸 오기 정정 | 변경(묶음이 아니라 필드 하나를 그림) |
| 12 | `controls.children` 작성 키 | 질문(유지 권고 — 명세에 든 작성 API) |
| 13 | `options.virtual`은 유지(공개 형에 없으면 36처럼 추가); `options.propertyKeys`는 문서화할지 제거할지 | 질문 |
| 14 | `VirtualNode`·`type: 'virtual'` | 유지 권고 |
| 15 | `UnionNode`·`BranchNode`·`TerminalNode`·`strategy` | 유지 권고 |

- 닫는 항목: LANDING-210(보충)
- 결정:
  - 【추론】 소유자가 "핵심 시스템 구성 이름을 다 바꾸고 가고 싶다"고 했으므로 옛 낱말이 남은 것(1), 새 어휘와 섞이는 것(2·11), 한 이름이 여러 뜻인 것(3·7·8·9), 뜻을 말하지 않는 것(4·5·6)을 후보로 올리고, 뜻이 읽히는 이름(14·15)과 작성 API(12)는 유지를 권한다.
- 근거: scout 어휘 목록; fairy07 사실 확인 셋; 239·259라운드 소유자 결정; seiri naming 규칙.
- 다음: 소유자 답을 받아 259C-01 대응표를 확장하고 07b-5 브리프를 쓴다.
