import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./routes/AuthContext.jsx";
import { SidebarProvider } from "./hooks/useSidebar.jsx";
import { ThemeProvider } from "./hooks/useTheme.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
