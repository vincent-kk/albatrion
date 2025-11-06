import { useState } from "react";
import { alert, confirm, prompt } from "@lerx/promise-modal";

const PromiseModalTest = () => {
  const [promptValue, setPromptValue] = useState("");

  const handleAlert = () => {
    alert({
      title: "Simple Alert",
      content: "This is a simple alert message!",
    }).then(() => {
      console.log("Alert closed");
    });
  };

  const handleAlertWithTitle = () => {
    alert({
      title: "Success!",
      subtitle: "Operation Completed",
      content: "Your operation completed successfully.",
    }).then(() => {
      console.log("Alert with title closed");
    });
  };

  const handleConfirm = () => {
    confirm({
      title: "Confirm Action",
      content: "Are you sure you want to proceed?",
    }).then((result) => {
      console.log("Confirm result:", result);
      alert({
        title: "Result",
        content: `You clicked: ${result ? "OK" : "Cancel"}`,
      });
    });
  };

  const handleConfirmWithOptions = () => {
    confirm({
      title: "Delete Item",
      content: "This action cannot be undone. Are you sure?",
      footer: {
        confirm: "Delete",
        cancel: "Keep",
      },
    }).then((result) => {
      console.log("Confirm with options result:", result);
      if (result) {
        alert({
          title: "Deleted",
          content: "Item has been deleted successfully.",
        });
      } else {
        alert({
          title: "Cancelled",
          content: "Item was not deleted.",
        });
      }
    });
  };

  const handlePrompt = () => {
    prompt({
      title: "User Input",
      content: "What is your name?",
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <input
            defaultValue={defaultValue}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        );
      },
      defaultValue: "",
    }).then((result) => {
      console.log("Prompt result:", result);
      setPromptValue(result || "");
      if (result !== null) {
        alert({
          title: "Hello!",
          content: `Hello, ${result || "stranger"}!`,
        });
      } else {
        alert({
          title: "Cancelled",
          content: "You cancelled the prompt.",
        });
      }
    });
  };

  const handlePromptWithCustomInput = () => {
    prompt({
      title: "Email Input",
      content: "Please enter your email address:",
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <input
            type="email"
            placeholder="example@domain.com"
            defaultValue={defaultValue}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "1rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        );
      },
      defaultValue: "",
      footer: {
        confirm: "Submit",
        cancel: "Cancel",
      },
    }).then((result) => {
      console.log("Prompt with custom input result:", result);
      setPromptValue(result || "");
      if (result !== null) {
        alert({
          title: "Email Submitted",
          content: `Your email: ${result}`,
        });
      }
    });
  };

  const handleChainedModals = async () => {
    try {
      await alert({
        title: "Step 1",
        content: "Welcome to the process!",
      });

      const wantsToContinue = await confirm({
        title: "Step 2",
        content: "Do you want to continue?",
      });

      if (wantsToContinue) {
        const name = await prompt({
          title: "Step 3",
          content: "What's your name?",
          Input: ({ defaultValue, onChange }) => {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              onChange(e.target.value);
            };
            return (
              <input
                defaultValue={defaultValue}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            );
          },
          defaultValue: "",
        });

        if (name !== null) {
          const age = await prompt({
            title: "Step 4",
            content: "How old are you?",
            Input: ({ defaultValue, onChange }) => {
              const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.value);
              };
              return (
                <input
                  placeholder="Enter your age"
                  defaultValue={defaultValue}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "1rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              );
            },
            defaultValue: "",
          });

          if (age !== null) {
            await alert({
              title: "Profile Created!",
              content: `Name: ${name}\nAge: ${age}`,
            });
          }
        }
      } else {
        await alert({
          title: "Cancelled",
          content: "Process cancelled.",
        });
      }
    } catch (error) {
      console.error("Chained modals error:", error);
    }
  };

  const handleMultipleSimultaneous = async () => {
    try {
      // Open multiple modals simultaneously to test modal stacking
      alert({
        title: "Modal 1",
        content: "First alert",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert({
        title: "Modal 2",
        content: "Second alert",
      });
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert({
        title: "Modal 3",
        content: "Third alert",
      });

      console.log("All modals opened");
    } catch (error) {
      console.error("Multiple modals error:", error);
    }
  };

  const handleStressTest = async () => {
    try {
      for (let i = 1; i <= 5; i++) {
        const shouldContinue = await confirm({
          title: `Progress ${i}/5`,
          content: `Modal ${i} of 5. Continue to next?`,
        });
        if (!shouldContinue) {
          await alert({
            title: "Stopped",
            content: `Stopped at modal ${i}`,
          });
          return;
        }
      }
      await alert({
        title: "Complete!",
        content: "Stress test completed! All 5 modals handled successfully.",
      });
    } catch (error) {
      console.error("Stress test error:", error);
    }
  };

  return (
    <div className="page">
      <h1>Promise Modal Test Page</h1>
      <p>
        This page tests the <code>@lerx/promise-modal</code> package functionality
        in both development and production builds.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Basic Tests</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3>Alert</h3>
            <button onClick={handleAlert} style={buttonStyle}>
              Show Simple Alert
            </button>
            <button onClick={handleAlertWithTitle} style={buttonStyle}>
              Show Alert with Title & Subtitle
            </button>
          </div>

          <div>
            <h3>Confirm</h3>
            <button onClick={handleConfirm} style={buttonStyle}>
              Show Simple Confirm
            </button>
            <button onClick={handleConfirmWithOptions} style={buttonStyle}>
              Show Confirm with Options
            </button>
          </div>

          <div>
            <h3>Prompt</h3>
            <button onClick={handlePrompt} style={buttonStyle}>
              Show Simple Prompt
            </button>
            <button onClick={handlePromptWithCustomInput} style={buttonStyle}>
              Show Prompt with Custom Input
            </button>
            {promptValue && (
              <p style={{ marginTop: "0.5rem", color: "#aaa" }}>
                Last prompt value: <strong style={{ color: "#fff" }}>{promptValue}</strong>
              </p>
            )}
          </div>
        </div>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Advanced Tests</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <h3>Chained Modals</h3>
            <button onClick={handleChainedModals} style={buttonStyle}>
              Run Chained Modal Flow
            </button>
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>
              Tests sequential modal opening and data flow
            </p>
          </div>

          <div>
            <h3>Multiple Simultaneous Modals</h3>
            <button onClick={handleMultipleSimultaneous} style={buttonStyle}>
              Open Multiple Modals
            </button>
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>
              Tests modal stacking and concurrent modal handling
            </p>
          </div>

          <div>
            <h3>Stress Test</h3>
            <button onClick={handleStressTest} style={buttonStyle}>
              Run Stress Test (5 Modals)
            </button>
            <p style={{ fontSize: "0.9rem", color: "#aaa" }}>
              Opens 5 consecutive modals to test memory and performance
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#2a2a2a",
          border: "1px solid #555",
          borderRadius: "4px",
          color: "#e0e0e0",
        }}
      >
        <h2 style={{ color: "#ffffff" }}>Build Test Checklist</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>✓ All modal types (alert, confirm, prompt) should work</li>
          <li>✓ Modal options (title, subtitle, content, footer) should apply correctly</li>
          <li>✓ Promise returns should work properly (OK = true/value, Cancel = false/null)</li>
          <li>✓ Chained modals should execute in sequence</li>
          <li>✓ Multiple simultaneous modals should stack properly</li>
          <li>✓ Custom Input component should work in prompt</li>
          <li>✓ No console errors should appear</li>
          <li>✓ Memory leaks should not occur after repeated usage</li>
        </ul>
      </section>

      <section
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: "#3a3a1a",
          border: "1px solid #666",
          borderRadius: "4px",
          color: "#f4e4a6",
        }}
      >
        <h3 style={{ color: "#ffd700" }}>Console Output</h3>
        <p>Check the browser console for detailed logging of modal interactions.</p>
        <p>Each modal action logs its result for verification.</p>
      </section>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  margin: "0.25rem",
  fontSize: "1rem",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "4px",
  transition: "background-color 0.2s",
};

export default PromiseModalTest;
