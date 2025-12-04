import { BrowserRouter, Routes, Route } from "react-router-dom";
import OpeningPage from "./pages/OpeningPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
    <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route
            path="/"
            element={
              <PublicLayout fullBleed>
                <OpeningPage />
              </PublicLayout>
            }
          />
          <Route
            path="/home"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout fullBleed>
                <LoginPage />
              </PublicLayout>
            }
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Receptionist */}
          <Route
            path="/receptionist"
            element={
              <ProtectedRoute roles={["RECEPTIONIST"]}>
                <ReceptionistDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}
