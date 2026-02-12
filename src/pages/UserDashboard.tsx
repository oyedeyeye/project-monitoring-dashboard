import { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import UpdateModal from '../components/UpdateModal';
import { Project } from '../types/supabase';
import { PlusCircle } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { projects, loading, error, refetch } = useProjects();
    const { mdaName } = useAuth();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleUpdateClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleUpdateSuccess = () => {
        // Optionally refresh projects or show notification
        refetch();
    };

    const columns = [
        { header: 'Project Title', accessor: 'title' as keyof Project, className: 'w-1/3' },
        { header: 'Location', accessor: 'location_text' as keyof Project },
        {
            header: 'Budget',
            accessor: (item: Project) => `₦${Number(item.approved_budget).toLocaleString()}`
        },
        {
            header: 'Status',
            accessor: (item: Project) => (
                <Badge variant={item.status === 'Completed' ? 'success' : item.status === 'Ongoing' ? 'warning' : 'neutral'}>
                    {item.status}
                </Badge>
            )
        },
        {
            header: 'Action',
            accessor: (item: Project) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handleUpdateClick(item); }}
                >
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Update
                </Button>
            )
        }
    ];

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading projects: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        My Projects
                        {mdaName && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                {mdaName}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and update your assigned projects.</p>
                </div>
                <Button onClick={() => refetch()} variant="ghost" size="sm">
                    Refresh Data
                </Button>
            </div>

            <Card noPadding>
                <Table
                    data={projects}
                    columns={columns}
                    isLoading={loading}
                    emptyMessage="No projects assigned to your MDA yet."
                />
            </Card>

            <UpdateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={selectedProject?.project_id || null}
                projectTitle={selectedProject?.title || ''}
                onSuccess={handleUpdateSuccess}
            />
        </div>
    );
};
export default UserDashboard;
