import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { LanguageProvider } from "./lib/i18n/LanguageContext";
import { ThemeProvider } from "./lib/theme/ThemeContext";
import { AuthProvider, useAuth } from "./lib/auth/AuthContext";
import { NotificationProvider } from "./lib/notifications/NotificationContext";
import { FeedbackProvider } from "./lib/feedback/FeedbackContext";
import NotificationToasts from "./components/notifications/NotificationToasts";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/profilo" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <FeedbackProvider>
            <BrowserRouter>
              <ErrorBoundary
                label="DiVerge"
                fallback={(error, reset) => (
                  <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-red-400">
                      <AlertTriangle size={24} />
                    </span>
                    <h1 className="text-lg font-semibold">Qualcosa è andato storto</h1>
                    <p className="max-w-md break-words text-sm text-muted">
                      {String(error?.message || error)}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-accent-contrast hover:brightness-110"
                    >
                      Ricarica
                    </button>
                  </div>
                )}
              >
                <AppRoutes />
              </ErrorBoundary>
              <NotificationToasts />
            </BrowserRouter>
            </FeedbackProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
