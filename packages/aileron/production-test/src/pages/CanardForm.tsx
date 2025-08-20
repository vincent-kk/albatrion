import { useEffect, useRef, useState } from "react";
import { ifThenElseSchema } from "../assets/jsonSchema/if-then-else";
import { jsonSchema } from "../assets/jsonSchema/bigSchema";
import { oneOfSchema } from "../assets/jsonSchema/oneOf";
import { Form, type FormHandle } from "@canard/schema-form";
import StoryLayout from "../components/StoryLayout";

const canardFormSchema = [ifThenElseSchema, oneOfSchema, jsonSchema];

const CanardForm = () => {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const ref = useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);
  const [index, setIndex] = useState(
    Number(localStorage.getItem("canardFormIndex")) || 0,
  );
  const schema = canardFormSchema[index];
  const revision = useRef(0);

  useEffect(() => {
    localStorage.setItem("canardFormIndex", index.toString());
    ref.current?.reset();
    revision.current = 0;
  }, [index]);

  return (
    <div className="page">
      <h1>Canard Form</h1>
      <button
        onClick={() => setIndex((prev) => (prev + 1) % canardFormSchema.length)}
      >
        Next
      </button>
      <button
        onClick={() =>
          setIndex(
            (prev) =>
              (prev - 1 + canardFormSchema.length) % canardFormSchema.length,
          )
        }
      >
        Prev
      </button>
      <StoryLayout jsonSchema={schema} value={value}>
        <Form
          jsonSchema={schema}
          ref={ref}
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
