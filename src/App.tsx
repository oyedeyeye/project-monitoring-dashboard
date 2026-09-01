import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import UserDashboard from './pages/UserDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PPIMUDashboard from './pages/PPIMUDashboard';
import MDADashboard from './pages/MDADashboard';
import Unauthorized from './pages/Unauthorized';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Projects from './pages/Projects';
import DataHub from './pages/DataHub';
import Mdas from './pages/Mdas';
import Users from './pages/Users';
import Issues from './pages/Issues';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SystemHealth from './pages/SystemHealth';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/project-monitoring">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/setup-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN']} />}>
            <Route path="/data-hub" element={<DataHub />} />
          </Route>
          {/* Protected Routes */}
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute allowedRoles={['MDA_OFFICER']} />}>
              <Route path="/dashboard" element={<MDADashboard />} />
              <Route path="/mda/projects" element={<UserDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['PPIMU_ADMIN']} />}>
              <Route path="/ppimu" element={<PPIMUDashboard />} />
              <Route path="/ppimu/approvals" element={<ApproverDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/reports" element={<Reports />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN', 'PPIMU_ADMIN', 'MDA_OFFICER']} />}>
              <Route path="/projects" element={<Projects />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN', 'PPIMU_ADMIN']} />}>
              <Route path="/mdas" element={<Mdas />} />
              <Route path="/users" element={<Users />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN']} />}>
              <Route path="/system-health" element={<SystemHealth />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
