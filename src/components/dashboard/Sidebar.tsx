import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { LogOut, X } from 'lucide-react';
import { getNavItems, ROLE_LABEL, type NavItem } from '../../config/navigation';
import type { UserProfile } from '../../types/api';

interface SidebarProps {
    profile: UserProfile | null;
    onSignOut: () => void;
    /** Mobile drawer open state */
    open?: boolean;
    /** Close handler for the mobile drawer */
    onClose?: () => void;
}

const NavItemLink = ({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) => {
    const Icon = item.icon;
    const location = useLocation();
    const baseClass =
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors';

    const isChildActive = (childHref: string) => {
        return location.pathname + location.search === childHref;
    };

    if (!item.available) {
        return (
            <button
                type="button"
                aria-disabled="true"
                title="Coming soon"
                className={clsx(
                    baseClass,
                    'w-full text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground cursor-default text-left',
                )}
            >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
            </button>
        );
    }

    if (item.children && item.children.length > 0) {
        // Render parent label and children sub-items
        return (
            <div className="space-y-1">
                <div className={clsx(baseClass, 'text-sidebar-foreground/70 select-none pb-1')}>
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                </div>
                <div className="pl-6 space-y-1 border-l border-sidebar-accent/40 ml-5">
                    {item.children.map((child) => (
                        <NavLink
                            key={child.key}
                            to={child.href}
                            onClick={onNavigate}
                            className={
                                clsx(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors w-full text-left',
                                    isChildActive(child.href)
                                        ? 'bg-brand text-brand-foreground shadow-sm'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                                )
                            }
                        >
                            <span>{child.label}</span>
                        </NavLink>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <NavLink
            to={item.href}
            onClick={onNavigate}
            end
            className={({ isActive }) =>
                clsx(
                    baseClass,
                    isActive
                        ? 'bg-brand text-brand-foreground shadow-sm'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
                )
            }
        >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
        </NavLink>
    );
};

const SidebarContent = ({ profile, onSignOut, onNavigate }: {
    profile: UserProfile | null;
    onSignOut: () => void;
    onNavigate?: () => void;
}) => {
    const navItems = getNavItems(profile?.role);
    const roleLabel = profile?.role ? ROLE_LABEL[profile.role] : 'Guest';
    const initial = profile?.fullName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="flex h-full flex-col bg-sidebar">
            {/* Logo */}
            <div className="flex items-center gap-2 px-6 py-6">
                <img
                    src={`${import.meta.env.BASE_URL}ONDO STATE Logo.png`}
                    alt="Ondo State"
                    className="h-9 w-auto object-contain"
                />
                <span className="text-base font-bold tracking-tight text-white">PPIMU</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Main navigation">
                {navItems.map((item) => (
                    <NavItemLink key={item.key} item={item} onNavigate={onNavigate} />
                ))}
            </nav>

            {/* Profile + sign out */}
            <div className="border-t border-sidebar-accent p-3">
                <div className="mb-2 flex items-center gap-3 px-2 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
                        {initial}
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-white">
                            {profile?.fullName || 'User'}
                        </p>
                        <p className="truncate text-xs text-sidebar-muted">{roleLabel}</p>
                    </div>
                </div>
                <button
                    onClick={onSignOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-white"
                >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

const Sidebar = ({ profile, onSignOut, open = false, onClose }: SidebarProps) => {
    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden w-64 shrink-0 md:block">
                <div className="fixed inset-y-0 left-0 w-64">
                    <SidebarContent profile={profile} onSignOut={onSignOut} />
                </div>
            </aside>

            {/* Mobile drawer */}
            <div
                className={clsx(
                    'fixed inset-0 z-40 md:hidden',
                    open ? 'pointer-events-auto' : 'pointer-events-none',
                )}
                aria-hidden={!open}
            >
                {/* Overlay */}
                <div
                    className={clsx(
                        'absolute inset-0 bg-black/50 transition-opacity',
                        open ? 'opacity-100' : 'opacity-0',
                    )}
                    onClick={onClose}
                />
                {/* Panel */}
                <div
                    className={clsx(
                        'absolute inset-y-0 left-0 w-64 transition-transform duration-200',
                        open ? 'translate-x-0' : '-translate-x-full',
                    )}
                    role="dialog"
                    aria-label="Navigation menu"
                >
                    <button
                        onClick={onClose}
                        className="absolute -right-10 top-4 rounded-lg p-2 text-white"
                        aria-label="Close menu"
                    >
                        <X className="h-6 w-6" />
                    </button>
                    <SidebarContent
                        profile={profile}
                        onSignOut={onSignOut}
                        onNavigate={onClose}
                    />
                </div>
            </div>
        </>
    );
};

export default Sidebar;
