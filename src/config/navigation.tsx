import {
  LayoutDashboard,
  FolderKanban,
  AlertTriangle,
  Building2,
  Users,
  Settings,
  Database,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import type { UserProfile } from '../types/api';

type Role = NonNullable<UserProfile['role']>;

export interface NavSubItem {
  key: string;
  label: string;
  href: string;
  available: boolean;
}

export interface NavItem {
  /** Stable key */
  key: string;
  /** Visible label */
  label: string;
  icon: LucideIcon;
  /** Route path. When `available` is false the item is rendered but not navigable. */
  href: string;
  /** Whether a route currently exists for this item. */
  available: boolean;
  children?: NavSubItem[];
}

/**
 * The dashboard landing route differs per role. This keeps the shared
 * layout / sidebar reusable across PPIMU admin and agency (MDA) staff.
 */
export const DASHBOARD_ROUTE: Record<Role, string> = {
  WEBMASTER_ADMIN: '/admin',
  PPIMU_ADMIN: '/ppimu',
  MDA_OFFICER: '/dashboard',
};

export const ROLE_LABEL: Record<Role, string> = {
  WEBMASTER_ADMIN: 'Admin',
  PPIMU_ADMIN: 'PPIMU Admin',
  MDA_OFFICER: 'MDA Officer',
};

/**
 * Returns the navigation items for a given role. Items flagged
 * `available: false` map to screens that are not yet wired to a route;
 * they render in the sidebar (to match the design) but are non-navigable.
 */
export function getNavItems(role: Role | null | undefined): NavItem[] {
  const dashboardHref = role ? DASHBOARD_ROUTE[role] : '/';

  const base: NavItem[] = [
    {
      key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: dashboardHref, available: true,
    },
  ];

  if (role === 'PPIMU_ADMIN') {
    base.push({
      key: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      href: '/projects',
      available: true,
      children: [
        {
          key: 'projects-approvals', label: 'Current approvals', href: '/ppimu/approvals', available: true,
        },
        {
          key: 'projects-list', label: 'All Projects', href: '/projects', available: true,
        },
      ],
    });
  } else if (role === 'MDA_OFFICER') {
    base.push({
      key: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      href: '/mda/projects',
      available: true,
      children: [
        {
          key: 'projects-my', label: 'My Projects', href: '/mda/projects', available: true,
        },
        {
          key: 'projects-history', label: 'History', href: '/mda/projects?tab=history', available: true,
        },
      ],
    });
  } else {
    base.push({
      key: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      href: '/projects',
      available: true,
    });
  }

  base.push(
    {
      key: 'issues', label: 'Issues & Risks', icon: AlertTriangle, href: '/issues', available: true,
    },
  );

  // Admins additionally manage MDAs and Users.
  if (role === 'WEBMASTER_ADMIN' || role === 'PPIMU_ADMIN') {
    base.push(
      {
        key: 'mdas', label: 'MDAs', icon: Building2, href: '/mdas', available: true,
      },
      {
        key: 'users', label: 'Users', icon: Users, href: '/users', available: true,
      },
    );
  }

  if (role === 'WEBMASTER_ADMIN') {
    base.push(
      {
        key: 'reports', label: 'Reports', icon: FileText, href: '/reports', available: true,
      },
      {
        key: 'data-hub', label: 'Data Hub', icon: Database, href: '/data-hub', available: true,
      },
    );
  }

  base.push({
    key: 'settings', label: 'Settings', icon: Settings, href: '/settings', available: false,
  });

  return base;
}
