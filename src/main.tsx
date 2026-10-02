import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./AppRouter";
import "./app/globals.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppRouter />
    </React.StrictMode>
  );
}
