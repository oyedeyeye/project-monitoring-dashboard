import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';

const DashboardLayout = () => {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="app-shell flex min-h-screen bg-canvas">
            <Sidebar
                profile={profile}
                onSignOut={handleSignOut}
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />

            {/* Main content */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Mobile top bar */}
                <header className="flex h-14 items-center gap-3 border-b border-hairline bg-surface px-4 md:hidden">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="rounded-lg p-2 text-ink hover:bg-canvas"
                        aria-label="Open menu"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <img src={`${import.meta.env.BASE_URL}ONDO STATE Logo.png`} alt="Ondo State" className="h-7 w-auto object-contain" />
                </header>

                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
