import { useState, type FormEvent } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
  newsletter: boolean;
}

const FormTest = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    newsletter: false,
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="page">
      <h1>Form Test Page</h1>
      <p>Test form validation, submission, and state management.</p>

      <form
        onSubmit={handleSubmit}
        style={{ maxWidth: "500px", marginTop: "2rem" }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "0.25rem",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "0.25rem",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Message:
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              style={{
                display: "block",
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "0.25rem",
                resize: "vertical",
              }}
            />
          </label>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <input
              type="checkbox"
              name="newsletter"
              checked={formData.newsletter}
              onChange={handleInputChange}
            />
            Subscribe to newsletter
          </label>
        </div>

        <button type="submit">Submit Form</button>

        {submitted && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#d4edda",
              color: "#155724",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
            }}
          >
            Form submitted successfully! Check console for data.
          </div>
        )}
      </form>

      {formData.name || formData.email || formData.message ? (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
          }}
        >
          <h3>Form Data Preview:</h3>
          <pre>{JSON.stringify(formData, null, 2)}</pre>
        </div>
      ) : null}
    </div>
  );
};

export default FormTest;
