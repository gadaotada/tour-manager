import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createRouter, RouterProvider } from "@tanstack/react-router";

import { bootstrapLocaleHeaderSync } from "@libs/i18n";
import { initThemeStore } from "@libs/theme";
import { bootstrapClientVersion } from "@libs/versioning";
import { routeTree } from "./routeTree.gen";
import "./styles/app.css";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found.");
}

initThemeStore();
bootstrapLocaleHeaderSync();

bootstrapClientVersion()
  .catch(() => undefined)
  .finally(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    );
  });
