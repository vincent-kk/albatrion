# 239라운드 — Vincent의 답 (이름 체계 확정: 힌트 `inputType`, 입력 `FieldInput*`, 필드 렌더러 `FieldRenderer`, 슬롯 `Form{Label,Input,Error}Renderer`, `Renderer` 접미어 유지)

2026-10-13. 238라운드 뒤 원장 관리자가 역할 3 제안(`FieldRenderer` + `Form{Label,Input,Error}Renderer`)과 `Renderer` 접미어 유지 이유를 올렸고, 소유자가 세 번에 걸쳐 답했다.

| 확인 | 물음(요지) | 답 원문 | 반영 |
| --- | --- | --- | --- |
| 슬롯 렌더러 이름 | `Form{Label,Input,Error}Renderer`를 그대로 쓰는지(공개 prop은 `FormType*Renderer`에서 `Type`을 뺀 것) | "FormLabelRenderer·FormInputRenderer·FormErrorRenderer\n\n이건 그대로 쓰는거야?\n\nForm{Label,Input,Error}Renderer 이건 바꿀 필욘 없는건가..." | 원장 관리자가 "공개 prop은 바뀜(FormType → Form), Field 접두어를 쓰지 않는 이유 둘"을 답함 |
| Renderer 접미어 | 매번 `Renderer`를 붙이는 것이 필수인지 | "오케이 그건 좋아 근데, 매번 뒤에 renderer 를 붙이는건? 이건 필수적인거야?" | 원장 관리자가 "필수는 아니나 `Form.Label`·MUI `FormLabel`·Formik `Field`와의 충돌 때문에 유지 권고"를 답함 |
| 확정 | 지금 안으로 확정할지 | "오케이 그럼 지금으로 확정. \n이어지는 질문 하나 더 있어" | 239C-01: 이름 체계 확정(아래 대응표); 07b-2 ②-a·②-b를 새 이름으로 재계획 |

## 이름 대응표(239C-01)

| 역할 | 옛 이름 | 새 이름 |
| --- | --- | --- |
| 힌트(스키마 키) | `presentation.formType` | `presentation.inputType` |
| 힌트(Hint·test 객체 키) | `formType` | `inputType` |
| 입력 컴포넌트(스키마 키) | `presentation.FormTypeInput` | `presentation.FieldInput` |
| 입력 props 형 | `FormTypeInputProps` | `FieldInputProps` |
| 입력 props(스키마 키) | `presentation.FormTypeInputProps` | `presentation.FieldInputProps` |
| 파생 props 형 | `FormTypeInputPropsWithSchema`·`FormTypeInputPropsWithNode`·`UnknownFormTypeInputProps` 등 | `FieldInputPropsWithSchema`·`FieldInputPropsWithNode`·`UnknownFieldInputProps` 등(같은 규칙) |
| 정의 형 | `FormTypeInputDefinition` | `FieldInputDefinition` |
| 맵 형 | `FormTypeInputMap` | `FieldInputMap` |
| Form prop(목록) | `formTypeInputDefinitions` | `fieldInputDefinitions` |
| Form prop(경로 맵) | `formTypeInputMap` | `fieldInputMap` |
| 플러그인 등록 키 | `SchemaFormPlugin.formTypeInputDefinitions` | `SchemaFormPlugin.fieldInputDefinitions` |
| test 형 | `FormTypeTestFn`·`FormTypeTestObject` | `FieldInputTestFn`·`FieldInputTestObject` |
| 필드 전체 렌더러(Form prop) | `FormTypeGroupRenderer` | `FieldRenderer` |
| 렌더러 props 형 | `FormTypeRendererProps` | `FieldRendererProps` |
| 렌더러 props(스키마 키) | `presentation.FormTypeRendererProps` | `presentation.FieldRendererProps` |
| 슬롯 렌더러(Form prop) | `FormTypeLabelRenderer`·`FormTypeInputRenderer`·`FormTypeErrorRenderer` | `FormLabelRenderer`·`FormInputRenderer`·`FormErrorRenderer` |
| 플러그인 등록 키(렌더러) | `SchemaFormPlugin.FormType*Renderer` | 같은 규칙 |
| 플러그인 디렉터리 | `formTypeInputs/` | `fieldInputs/` |
| 내부 훅·파일 | `useFormTypeInput` 등 | `useFieldInput` 등(같은 규칙) |

옛 이름 별칭 없음. 명세 한 줄: "inputType은 정의의 test가 해석하는 문자열 힌트이며 HTML input type과 같지 않다." 원장 본문의 `formType`·`FormTypeInput`·`FormTypeRenderer`는 역사로 두고 이 표로 읽는다.

다음 라운드 번호는 240이다.
