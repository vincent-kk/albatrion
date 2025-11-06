import { useState } from "react";
import { useModal } from "@lerx/promise-modal";

const ModalTriggerComponent = ({ label }: { label: string }) => {
  const { alert, confirm, prompt } = useModal();

  const handleAlert = () => {
    alert({
      title: `Alert from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
    }).then((result) => {
      console.log(`${label} Alert result:`, result);
    });
  };

  const handleConfirm = () => {
    confirm({
      title: `Confirm from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
    }).then((result) => {
      console.log(`${label} Confirm result:`, result);
    });
  };

  const handlePrompt = () => {
    prompt({
      title: `Prompt from ${label}`,
      content: `This modal should close immediately when ${label} unmounts (manualDestroy: false)`,
      Input: ({ defaultValue, onChange }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value);
        };
        return (
          <input
            defaultValue={defaultValue}
            onChange={handleChange}
            placeholder="Enter something..."
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
    }).then((value) => {
      console.log(`${label} Prompt result:`, value);
    });
  };

  const handleMultipleModals = () => {
    alert({
      title: `Alert 1 from ${label}`,
      content: "First modal",
    });

    setTimeout(() => {
      alert({
        title: `Alert 2 from ${label}`,
        content: "Second modal",
      });
    }, 100);

    setTimeout(() => {
      confirm({
        title: `Confirm from ${label}`,
        content: "Third modal",
      });
    }, 200);
  };

  return (
    <div
      style={{
        padding: "20px",
        margin: "10px",
        border: "2px solid #555",
        borderRadius: "8px",
        backgroundColor: "#2a2a2a",
        color: "#e0e0e0",
      }}
    >
      <h3 style={{ color: "#ffffff" }}>{label}</h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={handleAlert} style={buttonStyle}>
          Open Alert
        </button>
        <button onClick={handleConfirm} style={buttonStyle}>
          Open Confirm
        </button>
        <button onClick={handlePrompt} style={buttonStyle}>
          Open Prompt
        </button>
        <button onClick={handleMultipleModals} style={buttonStyle}>
          Open Multiple Modals
        </button>
      </div>
    </div>
  );
};

const ModalLifecycleTest = () => {
  const [showComponentA, setShowComponentA] = useState(false);
  const [showComponentB, setShowComponentB] = useState(false);
  const [showComponentC, setShowComponentC] = useState(false);
  const [autoUnmountCountdown, setAutoUnmountCountdown] = useState<number | null>(null);
  const [showAutoComponent, setShowAutoComponent] = useState(false);

  const startAutoUnmount = () => {
    setShowAutoComponent(true);
    setAutoUnmountCountdown(5);

    const interval = setInterval(() => {
      setAutoUnmountCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setShowAutoComponent(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="page">
      <h1>Modal Lifecycle Test (useModal)</h1>
      <p>
        This page tests <code>useModal</code> hook with automatic lifecycle
        management using <code>manualDestroy: false</code>.
      </p>

      <section style={{ marginTop: "2rem" }}>
        <h2>Basic Unmount Cleanup Test</h2>
        <p>
          1. Click "Show Component A" to mount the component.
          <br />
          2. Open modals from the component.
          <br />
          3. Click "Hide Component A" - <strong>all modals should close immediately</strong>.
        </p>
        <button
          onClick={() => setShowComponentA(!showComponentA)}
          style={{
            ...buttonStyle,
            backgroundColor: showComponentA ? "#ff4444" : "#4444ff",
          }}
        >
          {showComponentA ? "Hide Component A" : "Show Component A"}
        </button>

        {showComponentA && <ModalTriggerComponent label="Component A" />}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Multiple Components Cleanup Test</h2>
        <p>
          1. Show multiple components independently.
          <br />
          2. Open modals from each component.
          <br />
          3. Hide a specific component -{" "}
          <strong>only its modals should close immediately</strong>, others remain.
        </p>
        <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <button
            onClick={() => setShowComponentA(!showComponentA)}
            style={{
              ...buttonStyle,
              backgroundColor: showComponentA ? "#ff4444" : "#4444ff",
            }}
          >
            {showComponentA ? "Hide" : "Show"} Component A
          </button>
          <button
            onClick={() => setShowComponentB(!showComponentB)}
            style={{
              ...buttonStyle,
              backgroundColor: showComponentB ? "#ff4444" : "#44aa44",
            }}
          >
            {showComponentB ? "Hide" : "Show"} Component B
          </button>
          <button
            onClick={() => setShowComponentC(!showComponentC)}
            style={{
              ...buttonStyle,
              backgroundColor: showComponentC ? "#ff4444" : "#aa44aa",
            }}
          >
            {showComponentC ? "Hide" : "Show"} Component C
          </button>
        </div>

        {showComponentA && <ModalTriggerComponent label="Component A" />}
        {showComponentB && <ModalTriggerComponent label="Component B" />}
        {showComponentC && <ModalTriggerComponent label="Component C" />}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Auto Unmount Cleanup Test</h2>
        <p>
          1. Click "Start Auto Unmount Test".
          <br />
          2. Open modals from the component.
          <br />
          3. After 5 seconds, the component unmounts automatically -{" "}
          <strong>all modals should close immediately</strong>.
        </p>
        <button
          onClick={startAutoUnmount}
          disabled={autoUnmountCountdown !== null}
          style={{
            ...buttonStyle,
            backgroundColor: autoUnmountCountdown !== null ? "#888" : "#4444ff",
            cursor: autoUnmountCountdown !== null ? "not-allowed" : "pointer",
          }}
        >
          {autoUnmountCountdown !== null
            ? `Unmounting in ${autoUnmountCountdown}s...`
            : "Start Auto Unmount Test"}
        </button>

        {showAutoComponent && (
          <ModalTriggerComponent label="Auto-unmount Component" />
        )}
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
        <h2 style={{ color: "#ffffff" }}>Lifecycle Test Checklist</h2>
        <ul style={{ lineHeight: "1.8" }}>
          <li>
            ✓ useModal hook provides alert, confirm, and prompt functions
          </li>
          <li>
            ✓ Modals close automatically when component unmounts (manualDestroy:
            false)
          </li>
          <li>✓ Multiple components can have independent modal lifecycles</li>
          <li>
            ✓ Only the unmounted component's modals close, others remain open
          </li>
          <li>✓ Auto unmount scenario works correctly</li>
          <li>✓ No memory leaks after repeated mount/unmount cycles</li>
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
        <h3 style={{ color: "#ffd700" }}>Testing Instructions</h3>
        <p>
          1. Open modals from a component using the buttons.
          <br />
          2. Hide the component while modals are open.
          <br />
          3. Verify that all modals from that component close immediately without
          animation.
          <br />
          4. If multiple components are shown, verify that hiding one component
          doesn't affect other components' modals.
        </p>
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

export default ModalLifecycleTest;
