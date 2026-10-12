import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { UIProvider } from "./lib/ui";
import { StatsProvider } from "./lib/stats";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <UIProvider>
        <StatsProvider>
          <App />
        </StatsProvider>
      </UIProvider>
    </BrowserRouter>
  </StrictMode>,
);