import { useState } from "react";
import { jsonSchema } from "../assets/jsonSchema/bigSchema";
import { Form } from "@canard/schema-form";
import StoryLayout from "../components/StoryLayout";

const CanardForm = () => {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <div className="page">
      <h1>Canard Form</h1>
      <StoryLayout jsonSchema={jsonSchema} value={value}>
        <Form jsonSchema={jsonSchema} onChange={setValue} />
      </StoryLayout>
    </div>
  );
};

export default CanardForm;
