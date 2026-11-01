# IR-8 round b decisions

- 【추론】 IR-8 round b: 전체 컴파일 실패는 캐시 항목마다 거부 객체 하나를 쓰므로, 폼이 이미 onError로 보고한 그 객체의 네이티브 submit 거부는 onError에 다시 보내지 않고 호스트 싱크에만 보고한다.
- 【추론】 IR-8 round b: 중복 $id 원인은 readValidationEntry의 컴파일 시점 판정만 읽으며, 나중 retain은 캐시된 원인을 바꾸지 않는다. readValidationEntry가 해제된 같은 $id 루트를 컴파일 전에 축출하므로 이 판정으로 충분하다.
