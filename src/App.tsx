import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TenantDashboard from "./pages/TenantDashboard";
import TenantPayments from "./pages/TenantPayments";
import TenantMaintenance from "./pages/TenantMaintenance";
import LandlordDashboard from "./pages/LandlordDashboard";
import LandlordProperties from "./pages/LandlordProperties";
import LandlordLeases from "./pages/LandlordLeases";
import LandlordPayments from "./pages/LandlordPayments";
import Messages from "./pages/Messages";
import MaintenanceDetail from "./pages/MaintenanceDetail";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import BrowseProperties from "./pages/BrowseProperties";
import PropertyDetail from "./pages/PropertyDetail";
import AvailableLeases from "./pages/AvailableLeases";
import TenantLease from "./pages/TenantLease";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* --- TENANT ROUTES --- */}
          <Route
            path="/tenant/dashboard"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/payments"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantPayments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/maintenance"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantMaintenance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <BrowseProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <PropertyDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/available-leases"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <AvailableLeases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant/lease"
            element={
              <ProtectedRoute allowedRoles={['tenant']}>
                <TenantLease />
              </ProtectedRoute>
            }
          />

          {/* --- LANDLORD ROUTES --- */}
          <Route
            path="/landlord/dashboard"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/properties"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordProperties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/leases"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordLeases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/landlord/payments"
            element={
              <ProtectedRoute allowedRoles={['landlord']}>
                <LandlordPayments />
              </ProtectedRoute>
            }
          />

          {/* --- SHARED PROTECTED ROUTES --- */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance/:id"
            element={
              <ProtectedRoute>
                <MaintenanceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          {/* Legacy Redirects */}
          <Route path="/landlord/profile" element={<Navigate to="/profile" replace />} />
          <Route path="/tenant/profile" element={<Navigate to="/profile" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
