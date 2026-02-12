
import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import NewUserModal from '../components/NewUserModal';
import { UserProfile } from '../types/supabase';
import { UserPlus } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { users, mdas, loading, error, refetch } = useAdmin();
    const { mdaName } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getMDAName = (mdaId: string | null) => {
        if (!mdaId) return 'N/A';
        return mdas.find(m => m.id === mdaId)?.name || 'Unknown';
    };

    const columns = [
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
        },
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
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-700">System Users</h3>
                </div>
                <Table
                    data={users}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No users found."
                    keyExtractor={(item) => item.id}
                />
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
