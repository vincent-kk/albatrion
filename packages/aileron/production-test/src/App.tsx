import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import ComponentTest from "./pages/ComponentTest";
import FormTest from "./pages/FormTest";
import ApiTest from "./pages/ApiTest";
import About from "./pages/About";
import "./App.css";
import CanardForm from "./pages/CanardForm";

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<ComponentTest />} />
          <Route path="/canard-form" element={<CanardForm />} />
          <Route path="/forms" element={<FormTest />} />
          <Route path="/api" element={<ApiTest />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
