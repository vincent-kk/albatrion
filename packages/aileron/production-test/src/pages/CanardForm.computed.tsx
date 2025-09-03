import { useRef, useState } from "react";
import { Form, type FormHandle, type JsonSchema } from "@canard/schema-form";
import StoryLayout from "../components/StoryLayout";

const schema = {
  type: "object",
  properties: {
    category: {
      type: "string",
      enum: ["game", "movie"],
      default: "game",
    },
    title: { type: "string" },
    openingDate: {
      type: "string",
      format: "date",
      "&active": '../category === "game"',
    },
    releaseDate: {
      type: "string",
      format: "date",
      "&active": '../category === "movie"',
    },
    numOfPlayers: { type: "number" },
    price: {
      type: "number",
      minimum: 50,
    },
  },
} satisfies JsonSchema;

const CanardForm = () => {
  const [value, setValue] = useState<Record<string, unknown>>({});
  const ref = useRef<FormHandle<typeof schema, Record<string, unknown>>>(null);
  const revision = useRef(0);

  return (
    <div className="page">
      <h1>Canard Form: computed</h1>
      <button
        onClick={() =>
          ref.current?.setValue({
            category: "movie",
            title: "ABC",
            openingDate: "1999-01-01",
            releaseDate: "2020-02-01",
            numOfPlayers: 10,
            price: 100,
          })
        }
      >
        Set Movie
      </button>
      <button
        onClick={() =>
          ref.current?.setValue({
            category: "game",
            title: "DEF",
            openingDate: "2030-02-01",
            releaseDate: "2030-03-01",
            numOfPlayers: 20,
            price: 200,
          })
        }
      >
        Set Game
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
