export const jsonSchema = {
  title: "E-commerce Platform Data Schema",
  description: "전자상거래 플랫폼의 종합적인 데이터 구조 - 6레벨 깊이",
  type: "object",
  additionalProperties: false,
  required: ["marketplace", "analytics", "system"],
  properties: {
    // 레벨 1: 마켓플레이스 데이터
    marketplace: {
      type: "object",
      description: "마켓플레이스 전체 정보",
      additionalProperties: false,
      required: ["stores", "categories", "campaigns"],
      properties: {
        // 레벨 2: 스토어들
        stores: {
          type: "array",
          description: "플랫폼 내 스토어 목록",
          minItems: 1,
          items: {
            type: "object",
            description: "개별 스토어 정보",
            additionalProperties: false,
            required: ["storeId", "storeName", "owner", "products"],
            properties: {
              storeId: {
                type: "string",
                format: "uuid",
                default: "550e8400-e29b-41d4-a716-446655440000",
              },
              storeName: {
                type: "string",
                minLength: 1,
                maxLength: 100,
                default: "Amazing Electronics Store",
              },
              owner: {
                type: "object",
                description: "스토어 소유자 정보",
                additionalProperties: false,
                required: ["ownerId", "contactInfo"],
                properties: {
                  ownerId: {
                    type: "string",
                    format: "uuid",
                    default: "660e8400-e29b-41d4-a716-446655440000",
                  },
                  contactInfo: {
                    type: "object",
                    description: "연락처 정보",
                    additionalProperties: false,
                    required: ["email", "phones"],
                    properties: {
                      email: {
                        type: "string",
                        format: "email",
                        default: "owner@store.com",
                      },
                      phones: {
                        type: "array",
                        description: "전화번호 목록",
                        minItems: 1,
                        items: {
                          type: "object",
                          description: "전화번호 정보",
                          additionalProperties: false,
                          required: ["type", "number"],
                          properties: {
                            type: {
                              type: "string",
                              enum: ["mobile", "office", "fax"],
                              default: "mobile",
                            },
                            number: {
                              type: "string",
                              pattern: "^\\+?[1-9]\\d{1,14}$",
                              default: "+1234567890",
                            },
                            // 레벨 6: 전화번호 검증 기록
                            verification: {
                              type: "object",
                              description: "번호 검증 상태",
                              additionalProperties: false,
                              properties: {
                                isVerified: {
                                  type: "boolean",
                                  default: true,
                                },
                                verifiedAt: {
                                  type: "string",
                                  format: "date-time",
                                  default: "2024-01-01T00:00:00Z",
                                },
                                verificationMethod: {
                                  type: "string",
                                  enum: ["sms", "call", "manual"],
                                  default: "sms",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              // 레벨 3: 제품들
              products: {
                type: "array",
                description: "스토어 제품 목록",
                minItems: 1,
                items: {
                  type: "object",
                  description: "개별 제품 정보",
                  additionalProperties: false,
                  required: ["productId", "name", "pricing", "inventory"],
                  properties: {
                    productId: {
                      type: "string",
                      format: "uuid",
                      default: "770e8400-e29b-41d4-a716-446655440000",
                    },
                    name: {
                      type: "string",
                      minLength: 1,
                      maxLength: 200,
                      default: "Premium Wireless Headphones",
                    },
                    // 레벨 4: 가격 정보
                    pricing: {
                      type: "object",
                      description: "제품 가격 정보",
                      additionalProperties: false,
                      required: ["basePrice", "currency"],
                      properties: {
                        basePrice: {
                          type: "number",
                          minimum: 0,
                          multipleOf: 0.01,
                          default: 299.99,
                        },
                        currency: {
                          type: "string",
                          pattern: "^[A-Z]{3}$",
                          default: "USD",
                        },
                        // 레벨 5: 할인 정보
                        discounts: {
                          type: "array",
                          minItems: 1,
                          description: "적용 가능한 할인들",
                          items: {
                            type: "object",
                            description: "개별 할인 정보",
                            additionalProperties: false,
                            required: ["discountId", "type", "value"],
                            properties: {
                              discountId: {
                                type: "string",
                                format: "uuid",
                                default: "880e8400-e29b-41d4-a716-446655440000",
                              },
                              type: {
                                type: "string",
                                enum: ["percentage", "fixed", "bogo"],
                                default: "percentage",
                              },
                              value: {
                                type: "number",
                                minimum: 0,
                                default: 15,
                              },
                              // 레벨 6: 할인 조건
                              conditions: {
                                type: "object",
                                description: "할인 적용 조건",
                                additionalProperties: false,
                                properties: {
                                  minimumQuantity: {
                                    type: "integer",
                                    minimum: 1,
                                    default: 2,
                                  },
                                  minimumAmount: {
                                    type: "number",
                                    minimum: 0,
                                    default: 100,
                                  },
                                  validUntil: {
                                    type: "string",
                                    format: "date-time",
                                    default: "2024-12-31T23:59:59Z",
                                  },
                                  applicableRegions: {
                                    type: "array",
                                    items: {
                                      type: "string",
                                      pattern: "^[A-Z]{2}$",
                                      default: "US",
                                    },
                                    uniqueItems: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                    // 레벨 4: 재고 정보
                    inventory: {
                      type: "object",
                      description: "재고 관리 정보",
                      additionalProperties: false,
                      required: ["warehouses"],
                      properties: {
                        // 레벨 5: 창고별 재고
                        warehouses: {
                          type: "array",
                          description: "창고별 재고 현황",
                          minItems: 1,
                          items: {
                            type: "object",
                            description: "개별 창고 재고 정보",
                            additionalProperties: false,
                            required: ["warehouseId", "location", "stock"],
                            properties: {
                              warehouseId: {
                                type: "string",
                                format: "uuid",
                                default: "990e8400-e29b-41d4-a716-446655440000",
                              },
                              location: {
                                type: "object",
                                description: "창고 위치 정보",
                                additionalProperties: false,
                                required: ["address", "coordinates"],
                                properties: {
                                  address: {
                                    type: "string",
                                    default: "123 Warehouse St, City, State",
                                  },
                                  coordinates: {
                                    type: "object",
                                    description: "GPS 좌표",
                                    additionalProperties: false,
                                    required: ["latitude", "longitude"],
                                    properties: {
                                      latitude: {
                                        type: "number",
                                        minimum: -90,
                                        maximum: 90,
                                        default: 37.7749,
                                      },
                                      longitude: {
                                        type: "number",
                                        minimum: -180,
                                        maximum: 180,
                                        default: -122.4194,
                                      },
                                      // 레벨 6: 위치 정확도 정보
                                      accuracy: {
                                        type: "object",
                                        description: "좌표 정확도 정보",
                                        additionalProperties: false,
                                        properties: {
                                          radiusMeters: {
                                            type: "number",
                                            minimum: 0,
                                            default: 5,
                                          },
                                          lastUpdated: {
                                            type: "string",
                                            format: "date-time",
                                            default: "2024-01-01T00:00:00Z",
                                          },
                                          source: {
                                            type: "string",
                                            enum: [
                                              "gps",
                                              "manual",
                                              "geocoding",
                                            ],
                                            default: "gps",
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                              stock: {
                                type: "object",
                                description: "재고 수량 정보",
                                additionalProperties: false,
                                required: ["available", "reserved"],
                                properties: {
                                  available: {
                                    type: "integer",
                                    minimum: 0,
                                    default: 100,
                                  },
                                  reserved: {
                                    type: "integer",
                                    minimum: 0,
                                    default: 5,
                                  },
                                  // 레벨 6: 재고 히스토리
                                  history: {
                                    type: "array",
                                    minItems: 1,
                                    description: "재고 변동 기록",
                                    items: {
                                      type: "object",
                                      description: "재고 변동 항목",
                                      additionalProperties: false,
                                      required: [
                                        "timestamp",
                                        "type",
                                        "quantity",
                                      ],
                                      properties: {
                                        timestamp: {
                                          type: "string",
                                          format: "date-time",
                                          default: "2024-01-01T00:00:00Z",
                                        },
                                        type: {
                                          type: "string",
                                          enum: [
                                            "inbound",
                                            "outbound",
                                            "adjustment",
                                            "damaged",
                                          ],
                                          default: "inbound",
                                        },
                                        quantity: {
                                          type: "integer",
                                          default: 10,
                                        },
                                        reason: {
                                          type: "string",
                                          default: "Regular restocking",
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // 레벨 2: 카테고리 분류
        categories: {
          type: "array",
          description: "제품 카테고리 계층구조",
          items: {
            type: "object",
            description: "카테고리 정보",
            additionalProperties: false,
            required: ["categoryId", "name"],
            properties: {
              categoryId: {
                type: "string",
                format: "uuid",
                default: "aa0e8400-e29b-41d4-a716-446655440000",
              },
              name: {
                type: "string",
                default: "Electronics",
              },
              subcategories: {
                type: "array",
                description: "하위 카테고리",
                items: {
                  type: "object",
                  description: "하위 카테고리 정보",
                  additionalProperties: false,
                  properties: {
                    subcategoryId: {
                      type: "string",
                      format: "uuid",
                      default: "bb0e8400-e29b-41d4-a716-446655440000",
                    },
                    name: {
                      type: "string",
                      default: "Audio Equipment",
                    },
                  },
                },
              },
            },
          },
        },
        // 레벨 2: 마케팅 캠페인
        campaigns: {
          type: "array",
          description: "진행중인 마케팅 캠페인",
          items: {
            type: "object",
            description: "캠페인 정보",
            additionalProperties: false,
            required: ["campaignId", "name", "targets"],
            properties: {
              campaignId: {
                type: "string",
                format: "uuid",
                default: "cc0e8400-e29b-41d4-a716-446655440000",
              },
              name: {
                type: "string",
                default: "Holiday Sale 2024",
              },
              // 레벨 3: 타겟 설정
              targets: {
                type: "object",
                description: "캠페인 타겟 설정",
                additionalProperties: false,
                required: ["demographics"],
                properties: {
                  // 레벨 4: 인구통계학적 타겟
                  demographics: {
                    type: "object",
                    description: "타겟 인구통계",
                    additionalProperties: false,
                    properties: {
                      ageRange: {
                        type: "object",
                        description: "연령대",
                        additionalProperties: false,
                        properties: {
                          min: { type: "integer", minimum: 0, default: 18 },
                          max: { type: "integer", maximum: 120, default: 65 },
                        },
                      },
                      // 레벨 5: 관심사 기반 세분화
                      interests: {
                        type: "array",
                        description: "관심사 카테고리",
                        items: {
                          type: "object",
                          description: "관심사 정보",
                          additionalProperties: false,
                          required: ["category", "weight"],
                          properties: {
                            category: {
                              type: "string",
                              enum: [
                                "technology",
                                "fashion",
                                "sports",
                                "books",
                              ],
                              default: "technology",
                            },
                            weight: {
                              type: "number",
                              minimum: 0,
                              maximum: 1,
                              default: 0.8,
                            },
                            // 레벨 6: 관심사 세부 키워드
                            keywords: {
                              type: "array",
                              description: "관련 키워드 목록",
                              items: {
                                type: "object",
                                description: "키워드 정보",
                                additionalProperties: false,
                                required: ["term", "relevanceScore"],
                                properties: {
                                  term: {
                                    type: "string",
                                    default: "wireless headphones",
                                  },
                                  relevanceScore: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 1,
                                    default: 0.95,
                                  },
                                  trending: {
                                    type: "boolean",
                                    default: true,
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    // 레벨 1: 분석 데이터
    analytics: {
      type: "object",
      description: "플랫폼 분석 정보",
      additionalProperties: false,
      required: ["metrics", "reports"],
      properties: {
        // 레벨 2: 메트릭스
        metrics: {
          type: "object",
          description: "주요 성과 지표",
          additionalProperties: false,
          properties: {
            sales: {
              type: "object",
              description: "매출 관련 메트릭",
              additionalProperties: false,
              properties: {
                total: { type: "number", minimum: 0, default: 1000000 },
                currency: {
                  type: "string",
                  pattern: "^[A-Z]{3}$",
                  default: "USD",
                },
              },
            },
          },
        },
        // 레벨 2: 리포트
        reports: {
          type: "array",
          description: "생성된 분석 리포트",
          items: {
            type: "object",
            description: "개별 리포트",
            additionalProperties: false,
            required: ["reportId", "type"],
            properties: {
              reportId: {
                type: "string",
                format: "uuid",
                default: "dd0e8400-e29b-41d4-a716-446655440000",
              },
              type: {
                type: "string",
                enum: ["daily", "weekly", "monthly", "quarterly"],
                default: "daily",
              },
            },
          },
        },
      },
    },
    // 레벨 1: 시스템 정보
    system: {
      type: "object",
      description: "시스템 메타데이터",
      additionalProperties: false,
      required: ["version", "timestamp"],
      properties: {
        version: {
          type: "string",
          pattern: "^\\d+\\.\\d+\\.\\d+$",
          default: "2.1.0",
        },
        timestamp: {
          type: "string",
          format: "date-time",
          default: "2024-01-01T00:00:00Z",
        },
      },
    },
  },
} as any;
