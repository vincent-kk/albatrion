import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="nav">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/components"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Component Test
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/canard-form"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Canard Form
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/canard-form-ignore-additional-properties"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Canard Form Ignore Additional Properties
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/canard-form-nullable"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Canard Form Nullable
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/canard-form-computed"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Canard Form Computed
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/forms"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Form Test
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/api"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            API Test
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/promise-modal"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Promise Modal
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/modal-lifecycle"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Modal Lifecycle
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dynamic-object-formtype"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dynamic Object FormType
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            About
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
