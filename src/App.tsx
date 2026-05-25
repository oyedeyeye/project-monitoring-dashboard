
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import UserDashboard from './pages/UserDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/setup-password" element={<ResetPassword />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected Routes */}
                    <Route element={<DashboardLayout />}>
                        <Route element={<ProtectedRoute allowedRoles={['MDA_OFFICER']} />}>
                            <Route path="/dashboard" element={<UserDashboard />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['PPIMU_ADMIN']} />}>
                            <Route path="/ppimu" element={<ApproverDashboard />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['WEBMASTER_ADMIN']} />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

