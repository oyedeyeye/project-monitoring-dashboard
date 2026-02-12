
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Settings, Database, Users } from 'lucide-react';

const DashboardLayout = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                    <img src="/ONDO STATE Logo.png" alt="Ondo Logo" className="h-12 w-auto" />
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {/* Common Links can go here if any */}

                    {profile?.role === 'user' && (
                        <>
                            <a href="/dashboard" className="flex items-center px-4 py-3 text-gray-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                <LayoutDashboard className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="font-medium">My Projects</span>
                            </a>
                            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <FileText className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-medium">History</span>
                            </a>
                        </>
                    )}

                    {profile?.role === 'approver' && (
                        <>
                            <a href="/approvals" className="flex items-center px-4 py-3 text-gray-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                <FileText className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="font-medium">Approvals</span>
                            </a>
                            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <Database className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-medium">Agency Overview</span>
                            </a>
                        </>
                    )}

                    {profile?.role === 'super_user' && (
                        <>
                            <a href="/admin" className="flex items-center px-4 py-3 text-gray-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                <Settings className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="font-medium">Admin Dashboard</span>
                            </a>
                            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                <Users className="w-5 h-5 mr-3 text-gray-500" />
                                <span className="font-medium">User Management</span>
                            </a>
                        </>
                    )}


                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold mr-3">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 truncate">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ') || 'Guest'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 md:hidden">
                    <img src="/ONDO STATE Logo.png" alt="Ondo Logo" className="h-8" />
                    <button onClick={handleSignOut} className="text-gray-500">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
