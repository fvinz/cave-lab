import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PeFratte from "./PeFratte.jsx";
import "./pe-fratte.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PeFratte />
  </StrictMode>
);
