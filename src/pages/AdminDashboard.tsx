import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useUsers } from '../hooks/useUsers';
import { useProjects } from '../hooks/useProjects';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import NewUserModal from '../components/NewUserModal';
import EditUserModal from '../components/EditUserModal';
import { UserProfile, MDA, Project } from '../types/api';
import { UserPlus, ArrowLeft, Building2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { users: allUsers, mdas, loading: adminLoading, error: adminError, refetch: refetchAdmin } = useAdmin();
    const {
        users: paginatedUsers,
        meta: usersMeta,
        page: usersPage,
        setPage: setUsersPage,
        limit: usersLimit,
        setLimit: setUsersLimit,
        loading: usersLoading,
        error: usersError,
        updateUser,
        deleteUser,
        refetch: refetchUsers
    } = useUsers();

    const { mdaName, profile } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState<'mdas' | 'users'>('mdas');
    const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditUser, setSelectedEditUser] = useState<any | null>(null);

    // Projects fetch based on selected MDA
    const { projects, loading: projectsLoading } = useProjects(selectedMDA?.id);

    const getMDAName = (mdaId: string | null) => {
        if (!mdaId) return 'N/A';
        return mdas.find(m => m.id === mdaId)?.name || 'Unknown';
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user account? This action is permanent.')) {
            try {
                await deleteUser(id);
                refetchAdmin();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed to delete user.');
            }
        }
    };

    const userColumns = [
        { header: 'Full Name', accessor: 'fullName' as keyof UserProfile },
        {
            header: 'Role',
            accessor: (item: UserProfile) => (
                <Badge variant={item.role === 'WEBMASTER_ADMIN' ? 'error' : item.role === 'PPIMU_ADMIN' ? 'warning' : 'neutral'}>
                    {item.role?.replace('_', ' ').toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'MDA',
            accessor: (item: UserProfile) => getMDAName(item.mdaId)
        },
        {
            header: 'Actions',
            accessor: (item: UserProfile) => {
                const canManage = profile?.role === 'WEBMASTER_ADMIN' || (profile?.role === 'PPIMU_ADMIN' && item.role === 'MDA_OFFICER');
                if (!canManage) return <span className="text-gray-400 text-xs font-medium">ReadOnly</span>;
                return (
                    <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => {
                                setSelectedEditUser(item);
                                setIsEditModalOpen(true);
                            }}
                            className="text-orange-600 hover:text-orange-800 font-semibold text-xs transition-colors"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDeleteUser(item.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-xs transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                );
            }
        }
    ];

    // --- MDA Columns ---
    const mdaColumns = [
        { header: 'MDA Name', accessor: 'name' as keyof MDA },
        { header: 'Short Name', accessor: 'code' as keyof MDA },
        {
            header: 'Staff Users',
            accessor: (item: MDA) => allUsers.filter((u: any) => {
                const uMdaId = u.profile?.mda_id || u.profile?.mdaId || u.mda_id;
                const uRole = u.profile?.role || u.role;
                return uMdaId === item.id && uRole === 'MDA_OFFICER';
            }).length
        },
        {
            header: 'Action',
            accessor: (item: MDA) => (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedMDA(item); }}>
                    <Building2 className="w-4 h-4 mr-1" />
                    View
                </Button>
            )
        }
    ];

    // --- Project Columns (Drilldown) ---
    const projectColumns = [
        { header: 'Project Title', accessor: 'title' as keyof Project, className: 'w-1/3' },
        { header: 'Location', accessor: 'location_text' as keyof Project },
        { header: 'Fund Group', accessor: 'fund_group' as keyof Project },
        {
            header: 'Status',
            accessor: (item: Project) => (
                <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Ongoing' ? 'warning' : 'neutral'}>
                    {item.status}
                </Badge>
            )
        }
    ];

    const handleRefresh = () => {
        refetchAdmin();
        refetchUsers();
    };

    if (adminError || usersError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading admin data: {adminError || usersError}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        Admin Dashboard
                        {mdaName && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                {mdaName}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage system users and configurations.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleRefresh} variant="ghost" size="sm">Refresh</Button>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New User
                    </Button>
                </div>
            </div>

            <Card noPadding>
                {selectedMDA ? (
                    // --- MDA Projects Drilldown View ---
                    <>
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button size="sm" variant="ghost" onClick={() => setSelectedMDA(null)}>
                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                    Back
                                </Button>
                                <div>
                                    <h3 className="font-semibold text-gray-700">{selectedMDA.name}</h3>
                                    <p className="text-xs text-gray-500">Project Portfolio</p>
                                </div>
                            </div>
                        </div>
                        <Table
                            data={projects}
                            columns={projectColumns}
                            isLoading={projectsLoading}
                            emptyMessage={`No projects found for ${selectedMDA.code || selectedMDA.name}.`}
                            keyExtractor={(item) => item.project_id}
                        />
                    </>
                ) : (
                    // --- Main Tabs View ---
                    <>
                        <div className="flex space-x-4 border-b border-gray-100 bg-gray-50/50 px-4 pt-2">
                            {(['mdas', 'users'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-2 px-1 text-sm font-medium capitalize ${activeTab === tab
                                        ? 'border-b-2 border-primary-600 text-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'mdas' ? 'Ministries, Depts & Agencies' : 'System Users'}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'users' && (
                            <div className="flex flex-col">
                                <Table
                                    data={paginatedUsers}
                                    columns={userColumns}
                                    isLoading={usersLoading}
                                    emptyMessage="No users found."
                                    keyExtractor={(item) => item.id}
                                />

                                {/* Elegant System Users Pagination Controls */}
                                {usersMeta && usersMeta.total_pages > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <span className="text-sm text-gray-600">
                                                Showing <span className="font-semibold">{(usersPage - 1) * usersLimit + 1}</span> to{' '}
                                                <span className="font-semibold">{Math.min(usersPage * usersLimit, usersMeta.total)}</span> of{' '}
                                                <span className="font-semibold">{usersMeta.total}</span> entries
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Rows per page:</span>
                                                <select
                                                    value={usersLimit}
                                                    onChange={(e) => {
                                                        setUsersLimit(Number(e.target.value));
                                                        setUsersPage(1);
                                                    }}
                                                    className="bg-white border border-gray-300 text-gray-700 text-xs rounded-lg focus:ring-orange-500 focus:border-orange-500 p-1.5 shadow-sm transition-all"
                                                >
                                                    <option value={25}>25</option>
                                                    <option value={30}>30</option>
                                                    <option value={50}>50</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                                                disabled={usersPage === 1}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                            >
                                                Previous
                                            </button>
                                            
                                            {Array.from({ length: usersMeta.total_pages }, (_, i) => i + 1)
                                                .filter((p) => Math.abs(p - usersPage) <= 2 || p === 1 || p === usersMeta.total_pages)
                                                .map((p, idx, array) => {
                                                    const showEllipsis = idx > 0 && p - array[idx - 1] > 1;
                                                    return (
                                                        <div key={p} className="flex items-center gap-1.5">
                                                            {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                                            <button
                                                                onClick={() => setUsersPage(p)}
                                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                                                    usersPage === p
                                                                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                                                                        : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {p}
                                                            </button>
                                                        </div>
                                                    );
                                                })}

                                            <button
                                                onClick={() => setUsersPage(Math.min(usersMeta.total_pages, usersPage + 1))}
                                                disabled={usersPage === usersMeta.total_pages}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'mdas' && (
                            <Table
                                data={mdas}
                                columns={mdaColumns}
                                isLoading={adminLoading}
                                emptyMessage="No MDAs found."
                                keyExtractor={(item) => item.id}
                                onRowClick={(item: MDA) => setSelectedMDA(item)}
                            />
                        )}
                    </>
                )}
            </Card>

            <NewUserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mdas={mdas}
                onSuccess={handleRefresh}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEditUser(null);
                }}
                user={selectedEditUser}
                mdas={mdas}
                onSuccess={handleRefresh}
                onUpdate={updateUser}
                currentUserRole={profile?.role}
            />
        </div>
    );
};

export default AdminDashboard;
