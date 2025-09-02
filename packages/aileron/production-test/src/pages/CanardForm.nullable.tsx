import { useRef, useState } from "react";
import {
  Form,
  SetValueOption,
  type FormHandle,
  type JsonSchema,
} from "@canard/schema-form";
import StoryLayout from "../components/StoryLayout";

const schema = {
  type: "object",
  properties: {
    // Control fields
    userType: {
      type: "string",
      enum: ["individual", "company", "none"],
      title: "User Type",
      default: "none",
    },
    accountTier: {
      type: "string",
      enum: ["free", "premium", "enterprise"],
      title: "Account Tier",
      default: "free",
    },
    dataSelection: {
      type: "string",
      enum: ["basic", "extended", "full"],
      title: "Data Selection",
      default: "basic",
    },

    // All properties pre-declared for individual path
    personalInfo: {
      type: "object",
      title: "Personal Information",
      nullable: true,
      computed: {
        visible: "#/userType === 'individual'",
      },
      properties: {
        firstName: { type: "string", nullable: true },
        lastName: { type: "string", nullable: true },
        age: { type: "number", nullable: true },
      },
    },

    // Premium features for individual
    premiumFeatures: {
      type: "object",
      title: "Premium Features",
      nullable: true,
      computed: {
        visible: "#/userType === 'individual' && #/accountTier === 'premium'",
      },
      properties: {
        prioritySupport: { type: "boolean", nullable: true },
        customTheme: { type: "string", nullable: true },
      },
    },

    // Extended data for premium individuals
    extendedData: {
      type: "object",
      title: "Extended Data",
      nullable: true,
      computed: {
        visible:
          "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection === 'extended'",
      },
      properties: {
        interests: {
          type: "array",
          nullable: true,
          items: { type: "string" },
        },
        preferences: {
          type: "object",
          nullable: true,
          properties: {
            notifications: { type: "boolean", nullable: true },
            newsletter: { type: "boolean", nullable: true },
          },
        },
      },
    },

    // Basic data for premium individuals with basic selection
    basicData: {
      type: "object",
      title: "Basic Data",
      nullable: true,
      computed: {
        visible:
          "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection !== 'extended'",
      },
      properties: {
        subscribed: { type: "boolean", nullable: true },
      },
    },

    // Free features for individual
    freeFeatures: {
      type: "object",
      title: "Free Features",
      nullable: true,
      computed: {
        visible: "#/userType === 'individual' && #/accountTier === 'free'",
      },
      properties: {
        adsEnabled: { type: "boolean", default: true },
        limitedAccess: { type: "boolean", default: true },
      },
    },

    // Company properties
    companyInfo: {
      type: "object",
      title: "Company Information",
      nullable: true,
      computed: {
        visible: "#/userType === 'company'",
      },
      properties: {
        companyName: { type: "string", nullable: true },
        taxId: { type: "string", nullable: true },
        employeeCount: { type: "number", nullable: true },
      },
    },

    // Enterprise features for company
    enterpriseFeatures: {
      type: "object",
      title: "Enterprise Features",
      nullable: true,
      computed: {
        visible: "#/userType === 'company' && #/accountTier === 'enterprise'",
      },
      properties: {
        dedicatedManager: { type: "boolean", nullable: true },
        sla: { type: "string", nullable: true },
        customIntegrations: {
          type: "array",
          nullable: true,
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              enabled: { type: "boolean", nullable: true },
            },
          },
        },
      },
    },

    // Business features for premium company
    businessFeatures: {
      type: "object",
      title: "Business Features",
      nullable: true,
      computed: {
        visible: "#/userType === 'company' && #/accountTier === 'premium'",
      },
      properties: {
        apiAccess: { type: "boolean", nullable: true },
        teamSize: { type: "number", nullable: true },
      },
    },

    // Trial features for free company
    trialFeatures: {
      type: "object",
      title: "Trial Features",
      nullable: true,
      computed: {
        visible: "#/userType === 'company' && #/accountTier === 'free'",
      },
      properties: {
        trialDaysLeft: { type: "number", nullable: true },
        upgradePrompt: { type: "boolean", default: true },
      },
    },

    // Basic info for none type
    basicInfo: {
      type: "object",
      title: "Basic Information",
      nullable: true,
      computed: {
        visible: "#/userType === 'none'",
      },
      properties: {
        email: { type: "string", format: "email", nullable: true },
        subscribeNewsletter: { type: "boolean", nullable: true },
      },
    },
  },

  // Standard if-then-else for required fields
  if: {
    properties: {
      userType: { const: "individual" },
      accountTier: { const: "premium" },
    },
  },
  then: {
    required: ["personalInfo"],
  },
  else: {
    if: {
      properties: { userType: { const: "company" } },
    },
    then: {
      required: ["companyInfo"],
    },
  },

  // OneOf for additional conditional logic
  oneOf: [
    {
      computed: {
        if: "#/userType === 'individual' && #/accountTier === 'premium' && #/dataSelection === 'full'",
      },
      properties: {
        fullAccessData: {
          type: "object",
          title: "Full Access Data",
          nullable: true,
          properties: {
            analytics: { type: "boolean", nullable: true },
            exportOptions: {
              type: "array",
              nullable: true,
              items: { type: "string", enum: ["pdf", "csv", "json"] },
            },
          },
        },
      },
    },
    {
      computed: {
        if: "#/userType === 'company' && #/accountTier === 'enterprise' && #/dataSelection === 'full'",
      },
      properties: {
        advancedAnalytics: {
          type: "object",
          title: "Advanced Analytics",
          nullable: true,
          properties: {
            dashboards: { type: "number", nullable: true },
            customReports: { type: "boolean", nullable: true },
            aiInsights: { type: "boolean", nullable: true },
          },
        },
      },
    },
  ],
} satisfies JsonSchema;

const CanardForm = () => {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const formHandle = useRef<FormHandle<typeof schema>>(null);
  const defaultValue = useRef({
    userType: "individual",
    accountTier: "premium",
    dataSelection: "extended",
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      age: 30,
    },
    premiumFeatures: {
      prioritySupport: true,
      customTheme: "dark",
    },
    extendedData: {
      interests: ["tech", "science"],
      preferences: {
        notifications: true,
        newsletter: false,
      },
    },
  });
  const revision = useRef(0);

  return (
    <div className="page">
      <h1>Canard Form: computed</h1>
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* User Type Switching - Tests data removal on condition change */}
        <button
          onClick={() => {
            console.log("Switching to Individual - should keep personal data");
            formHandle.current?.setValue(
              { userType: "individual" },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to Individual
        </button>
        <button
          onClick={() => {
            console.log(
              "Switching to Company - should remove personal data, add company data",
            );
            formHandle.current?.setValue(
              { userType: "company" },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to Company
        </button>
        <button
          onClick={() => {
            console.log(
              "Switching to None - should remove both personal and company data",
            );
            formHandle.current?.setValue(
              { userType: "none" },
              SetValueOption.Merge,
            );
          }}
        >
          Switch to None
        </button>

        {/* Account Tier Changes - Tests nested condition data removal */}
        <button
          onClick={() => {
            console.log(
              "Changing to Free tier - should remove premium/enterprise features",
            );
            formHandle.current?.setValue(
              { accountTier: "free" },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Free Tier
        </button>
        <button
          onClick={() => {
            console.log(
              "Changing to Premium tier - should adjust available features",
            );
            formHandle.current?.setValue(
              { accountTier: "premium" },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Premium Tier
        </button>
        <button
          onClick={() => {
            console.log(
              "Changing to Enterprise tier - should add enterprise features",
            );
            formHandle.current?.setValue(
              { accountTier: "enterprise" },
              SetValueOption.Merge,
            );
          }}
        >
          Change to Enterprise Tier
        </button>

        {/* Data Selection Changes - Tests deeply nested condition changes */}
        <button
          onClick={() => {
            console.log("Changing to Basic data - should remove extended data");
            formHandle.current?.setValue(
              { dataSelection: "basic" },
              SetValueOption.Merge,
            );
          }}
        >
          Basic Data Selection
        </button>
        <button
          onClick={() => {
            console.log(
              "Changing to Extended data - should add extended fields",
            );
            formHandle.current?.setValue(
              { dataSelection: "extended" },
              SetValueOption.Merge,
            );
          }}
        >
          Extended Data Selection
        </button>
        <button
          onClick={() => {
            console.log(
              "Changing to Full data - should maximize available fields",
            );
            formHandle.current?.setValue(
              { dataSelection: "full" },
              SetValueOption.Merge,
            );
          }}
        >
          Full Data Selection
        </button>

        {/* Complex Combined Changes - Tests multiple condition changes */}
        <button
          onClick={() => {
            console.log("Complex change: Individual + Premium + Extended");
            formHandle.current?.setValue({
              userType: "individual",
              accountTier: "premium",
              dataSelection: "extended",
              personalInfo: {
                firstName: "Alice",
                lastName: "Smith",
                age: 25,
              },
              premiumFeatures: {
                prioritySupport: false,
                customTheme: "light",
              },
              extendedData: {
                interests: ["art", "music"],
                preferences: {
                  notifications: false,
                  newsletter: true,
                },
              },
            });
          }}
        >
          Set Individual+Premium+Extended
        </button>
        <button
          onClick={() => {
            console.log("Complex change: Company + Enterprise");
            formHandle.current?.setValue({
              userType: "company",
              accountTier: "enterprise",
              companyInfo: {
                companyName: "Tech Corp",
                taxId: "12-3456789",
                employeeCount: 500,
              },
              enterpriseFeatures: {
                dedicatedManager: true,
                sla: "99.99%",
                customIntegrations: [
                  { name: "Salesforce", enabled: true },
                  { name: "Slack", enabled: false },
                ],
              },
            });
          }}
        >
          Set Company+Enterprise
        </button>
        <button
          onClick={() => {
            console.log("Complex change: Individual + Premium + Extended");
            formHandle.current?.setValue({
              userType: "individual",
              accountTier: "premium",
              dataSelection: "extended",
              personalInfo: {
                firstName: "Alice",
                lastName: "Smith",
                age: 25,
              },
              premiumFeatures: {
                prioritySupport: false,
                customTheme: "light",
              },
              companyInfo: {
                companyName: "Tech Corp",
                taxId: "12-3456789",
                employeeCount: 500,
              },
              extendedData: {
                interests: ["art", "music"],
                preferences: {
                  notifications: false,
                  newsletter: true,
                },
              },
            });
          }}
        >
          Set Individual+Premium+Extended+Company(will be removed)
        </button>

        {/* Null Setting Tests */}
        <button
          onClick={() => {
            console.log("Setting personalInfo to null");
            formHandle.current?.setValue(
              { personalInfo: null },
              SetValueOption.Merge,
            );
          }}
        >
          Set PersonalInfo to null
        </button>
        <button
          onClick={() => {
            console.log("Setting companyInfo to null");
            formHandle.current?.setValue(
              { companyInfo: null },
              SetValueOption.Merge,
            );
          }}
        >
          Set CompanyInfo to null
        </button>
        <button
          onClick={() => {
            console.log("Setting all nested objects to null");
            formHandle.current?.setValue({
              personalInfo: null,
              companyInfo: null,
              premiumFeatures: null,
              enterpriseFeatures: null,
              extendedData: null,
            });
          }}
        >
          Set All Nested to null
        </button>

        {/* Edge Case Tests */}
        <button
          onClick={() => {
            console.log("Testing rapid condition changes");
            formHandle.current?.setValue(
              { userType: "company" },
              SetValueOption.Merge,
            );
            setTimeout(() => {
              formHandle.current?.setValue(
                { userType: "individual" },
                SetValueOption.Merge,
              );
            }, 100);
            setTimeout(() => {
              formHandle.current?.setValue(
                { accountTier: "enterprise" },
                SetValueOption.Merge,
              );
            }, 200);
          }}
        >
          Rapid Condition Changes
        </button>

        <button onClick={() => formHandle.current?.reset()}>
          Reset to Default
        </button>
        <button
          onClick={() => {
            console.log("Current form value:", formHandle.current?.getValue());
          }}
        >
          Log Current Value
        </button>
      </div>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          jsonSchema={schema}
          ref={formHandle}
          defaultValue={defaultValue.current}
          onChange={(input) => {
            console.log("onChange", revision.current++, input);
            setValue(input as Record<string, unknown>);
          }}
        />
      </StoryLayout>
    </div>
  );
};

export default CanardForm;
