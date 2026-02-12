
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import UserDashboard from './pages/UserDashboard';
import ApproverDashboard from './pages/ApproverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Protected Routes */}
                    <Route element={<DashboardLayout />}>
                        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                            <Route path="/dashboard" element={<UserDashboard />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['approver']} />}>
                            <Route path="/approvals" element={<ApproverDashboard />} />
                        </Route>

                        <Route element={<ProtectedRoute allowedRoles={['super_user']} />}>
                            <Route path="/admin" element={<AdminDashboard />} />
                        </Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

