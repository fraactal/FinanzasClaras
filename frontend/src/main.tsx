import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { AuthPage } from "./pages/AuthPage";
import { BackofficePage } from "./pages/BackofficePage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { LearnPage } from "./pages/LearnPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./styles/global.css";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/registro" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="semana" element={<Navigate to="/" replace />} />
        <Route path="mes" element={<Navigate to="/" replace />} />
        <Route path="categorias" element={<Navigate to="/configuracion" replace />} />
        <Route path="presupuestos" element={<Navigate to="/configuracion" replace />} />
        <Route path="perfil" element={<Navigate to="/configuracion" replace />} />
        <Route path="aprende" element={<LearnPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="backoffice" element={<BackofficePage />} />
      </Route>
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
);
