
import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useProjects } from '../hooks/useProjects';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import NewUserModal from '../components/NewUserModal';
import { UserProfile, MDA, Project } from '../types/supabase';
import { UserPlus, ArrowLeft, Building2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { users, mdas, loading, error, refetch } = useAdmin();
    const { mdaName } = useAuth();

    // UI State
    const [activeTab, setActiveTab] = useState<'mdas' | 'users'>('mdas');
    const [selectedMDA, setSelectedMDA] = useState<MDA | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Projects fetch based on selected MDA
    const { projects, loading: projectsLoading } = useProjects(selectedMDA?.id);

    const getMDAName = (mdaId: string | null) => {
        if (!mdaId) return 'N/A';
        return mdas.find(m => m.id === mdaId)?.name || 'Unknown';
    };

    const userColumns = [
        { header: 'Full Name', accessor: 'full_name' as keyof UserProfile },
        {
            header: 'Role',
            accessor: (item: UserProfile) => (
                <Badge variant={item.role === 'super_user' ? 'error' : item.role === 'approver' ? 'warning' : 'neutral'}>
                    {item.role?.replace('_', ' ').toUpperCase()}
                </Badge>
            )
        },
        {
            header: 'MDA',
            accessor: (item: UserProfile) => getMDAName(item.mda_id)
        }
    ];

    // --- MDA Columns ---
    const mdaColumns = [
        { header: 'MDA Name', accessor: 'name' as keyof MDA },
        { header: 'Short Name', accessor: 'short_name' as keyof MDA },
        {
            header: 'Staff Users',
            accessor: (item: MDA) => users.filter(u => u.mda_id === item.id && u.role === 'user').length
        },
        {
            header: 'Approvers',
            accessor: (item: MDA) => users.filter(u => u.mda_id === item.id && u.role === 'approver').length
        },
        {
            header: 'Action',
            accessor: (item: MDA) => (
                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedMDA(item); }}>
                    <Building2 className="w-4 h-4 mr-1" />
                    View Projects
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

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading admin data: {error}
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
                    <Button onClick={() => refetch()} variant="ghost" size="sm">Refresh</Button>
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
                            emptyMessage={`No projects found for ${selectedMDA.short_name}.`}
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
                            <Table
                                data={users}
                                columns={userColumns}
                                isLoading={loading}
                                emptyMessage="No users found."
                                keyExtractor={(item) => item.id}
                            />
                        )}

                        {activeTab === 'mdas' && (
                            <Table
                                data={mdas}
                                columns={mdaColumns}
                                isLoading={loading}
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
                onSuccess={() => refetch()}
            />
        </div>
    );
};

export default AdminDashboard;
