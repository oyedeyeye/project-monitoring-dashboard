
import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useProjects } from '../hooks/useProjects';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { ProgressUpdate, Project } from '../types/api';
import { Search, CheckCircle, Bell } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const ApproverDashboard = () => {
    const { reports, loading, error, refetch } = useReports();
    const { projects, loading: projectsLoading } = useProjects();
    const { mdaName } = useAuth();

    const [activeTab, setActiveTab] = useState<'pending' | 'overview' | 'history'>('pending');

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedUpdate, setSelectedUpdate] = useState<ProgressUpdate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);



    const handleRowClick = (updateOrProject: any) => {
        // Map the parameter to an adequate Project shape depending on whether it's an update with joined project or just a project
        const projectBase = updateOrProject.projects
            ? { project_id: updateOrProject.project_id, ...updateOrProject.projects, approved_budget: 0 }
            : updateOrProject;

        setSelectedProject(projectBase);
        
        // If the row clicked represents a progress update (e.g. pending approvals), preserve it
        if (updateOrProject.milestone_status) {
            setSelectedUpdate(updateOrProject);
        } else {
            setSelectedUpdate(null);
        }
        
        setIsModalOpen(true);
    };



    const pendingReports = reports.filter(r => r.milestone_status !== 'Approved');
    const approvedReports = reports.filter(r => r.milestone_status === 'Approved');

    const pendingColumns = [
        { 
            header: 'Date', 
            accessor: (item: ProgressUpdate) => new Date(item.report_date).toLocaleDateString() 
        },
        {
            header: 'Project',
            accessor: (item: ProgressUpdate) => (item as any).projects?.title || 'Unknown Project'
        },
        {
            header: 'Progress',
            accessor: (item: ProgressUpdate) => `${item.physical_progress_pct}%`
        },
        {
            header: 'Stage',
            accessor: (item: ProgressUpdate) => <Badge variant="info">{item.stage}</Badge>
        },
        {
            header: 'Status',
            accessor: (item: ProgressUpdate) => (
                <Badge variant={item.milestone_status === 'Approved' ? 'success' : 'warning'}>
                    {item.milestone_status}
                </Badge>
            )
        },
        {
            header: 'Action',
            accessor: () => (
                <Button
                    size="sm"
                    variant="primary"
                    className="pointer-events-none" // Action happens on row click
                >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                </Button>
            )
        }
    ];

    const projectColumns = [
        { header: 'Project Title', accessor: 'title' as keyof Project, className: 'w-1/3' },
        { header: 'Location', accessor: 'location_text' as keyof Project },
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
            accessor: () => (
                <Button
                    size="sm"
                    variant="outline"
                    className="pointer-events-none"
                >
                    <Search className="w-4 h-4 mr-1" />
                    Details
                </Button>
            )
        }
    ];

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading reports: {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        Approvals
                        {mdaName && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                {mdaName}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Review and approve project progress reports.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className="relative p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200 transition-all hover:bg-gray-50"
                        title="View Pending Approvals"
                    >
                        <Bell className="w-5 h-5 text-orange-600" />
                        {pendingReports.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                                {pendingReports.length}
                            </span>
                        )}
                    </button>
                    <Button onClick={() => refetch()} variant="ghost" size="sm">
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex space-x-4 border-b border-gray-200">
                {(['pending', 'overview', 'history'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-1 text-sm font-medium capitalize ${activeTab === tab
                            ? 'border-b-2 border-primary-600 text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab === 'pending' ? 'Pending Approvals' : tab === 'overview' ? 'Agency Overview' : 'Approval History'}
                    </button>
                ))}
            </div>

            <Card noPadding>
                {activeTab === 'pending' && (
                    <Table
                        data={pendingReports}
                        columns={pendingColumns}
                        isLoading={loading}
                        onRowClick={handleRowClick}
                        emptyMessage="No pending reports found."
                        keyExtractor={(item) => item.id}
                    />
                )}
                {activeTab === 'overview' && (
                    <Table
                        data={projects}
                        columns={projectColumns}
                        isLoading={projectsLoading}
                        onRowClick={handleRowClick}
                        emptyMessage="No projects found for this MDA."
                        keyExtractor={(item) => item.project_id}
                    />
                )}
                {activeTab === 'history' && (
                    <Table
                        data={approvedReports}
                        columns={pendingColumns}
                        isLoading={loading}
                        onRowClick={handleRowClick}
                        emptyMessage="No approval history yet."
                        keyExtractor={(item) => item.id}
                    />
                )}
            </Card>

            {selectedProject && isModalOpen && (
                <ProjectDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUpdate(null);
                    }}
                    project={selectedProject as Project}
                    selectedUpdate={selectedUpdate}
                    isApproverView={true}
                    onProgressUpdate={() => refetch()}
                />
            )}


        </div>
    );
};

export default ApproverDashboard;
