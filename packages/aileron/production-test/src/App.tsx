import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import ComponentTest from "./pages/ComponentTest";
import FormTest from "./pages/FormTest";
import ApiTest from "./pages/ApiTest";
import About from "./pages/About";
import "./App.css";
import CanardForm from "./pages/CanardForm";
import CanardFormNullable from "./pages/CanardForm.nullable";
import CanardFormComputed from "./pages/CanardForm.computed";
import CanardFormIgnoreAdditionalProperties from "./pages/CanardForm.ignoreAdditionalProperties";

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<ComponentTest />} />
          <Route path="/canard-form" element={<CanardForm />} />
          <Route
            path="/canard-form-nullable"
            element={<CanardFormNullable />}
          />
          <Route
            path="/canard-form-computed"
            element={<CanardFormComputed />}
          />
          <Route
            path="/canard-form-ignore-additional-properties"
            element={<CanardFormIgnoreAdditionalProperties />}
          />
          <Route path="/forms" element={<FormTest />} />
          <Route path="/api" element={<ApiTest />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
