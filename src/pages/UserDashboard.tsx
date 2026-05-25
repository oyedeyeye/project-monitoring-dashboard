import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useMdaHistory } from '../hooks/useMdaHistory';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { Project } from '../types/api';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const {
        projects,
        meta: projectsMeta,
        page: projectsPage,
        setPage: setProjectsPage,
        limit: projectsLimit,
        setLimit: setProjectsLimit,
        loading: projectsLoading,
        error: projectsError,
        refetch: refetchProjects
    } = useProjects();
    const {
        updates,
        meta,
        page,
        setPage,
        limit,
        setLimit,
        loading: historyLoading,
        error: historyError,
        refetch: refetchHistory
    } = useMdaHistory();

    const { mdaName } = useAuth();
    const [activeTab, setActiveTab] = useState<'projects' | 'history'>('projects');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleRowClick = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleHistoryRowClick = (updateItem: any) => {
        if (updateItem.projects) {
            setSelectedProject(updateItem.projects);
            setIsModalOpen(true);
        }
    };

    const projectColumns = [
        {
            header: '#',
            accessor: (_: Project, index: number) => (projectsPage - 1) * projectsLimit + index + 1,
            className: 'w-12 text-gray-400 font-medium'
        },
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
        }
    ];

    const historyColumns = [
        {
            header: '#',
            accessor: (_: any, index: number) => (page - 1) * limit + index + 1,
            className: 'w-12 text-gray-400 font-medium'
        },
        {
            header: 'Date',
            accessor: (item: any) => new Date(item.report_date || item.created_at).toLocaleDateString(),
            className: 'w-32'
        },
        {
            header: 'Project Title',
            accessor: (item: any) => item.projects?.title || 'Unknown',
            className: 'w-1/3 font-medium text-gray-900'
        },
        {
            header: 'Progress',
            accessor: (item: any) => `${item.physical_progress_pct}%`,
            className: 'w-24'
        },
        {
            header: 'Stage',
            accessor: (item: any) => (
                <Badge variant="info">
                    {item.stage}
                </Badge>
            ),
            className: 'w-32'
        },
        {
            header: 'Status',
            accessor: (item: any) => {
                const status = item.milestone_status || 'Draft';
                const variant = 
                    status === 'Approved' ? 'success' :
                    status === 'Ready for Approval' ? 'info' :
                    status === 'Changes Required' ? 'error' : 'neutral';
                return (
                    <Badge variant={variant}>
                        {status}
                    </Badge>
                );
            },
            className: 'w-32'
        }
    ];

    const handleRefresh = () => {
        if (activeTab === 'projects') {
            refetchProjects();
        } else {
            refetchHistory();
        }
    };

    if (projectsError || historyError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading dashboard data: {projectsError || historyError}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        MDA Officer Dashboard
                        {mdaName && (
                            <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full border border-orange-100">
                                {mdaName}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 mt-1">Manage and update your assigned projects and view submission history.</p>
                </div>
                <Button onClick={handleRefresh} variant="ghost" size="sm">
                    Refresh Data
                </Button>
            </div>

            {/* Premium Dashboard Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`py-3 px-6 font-semibold text-sm transition-all relative ${
                        activeTab === 'projects'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    My Projects
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`py-3 px-6 font-semibold text-sm transition-all relative ${
                        activeTab === 'history'
                            ? 'text-orange-600 border-b-2 border-orange-600'
                            : 'text-gray-500 hover:text-gray-800'
                    }`}
                >
                    History
                </button>
            </div>

            {activeTab === 'projects' ? (
                <Card noPadding>
                    <div className="flex flex-col">
                        <Table
                            data={projects}
                            columns={projectColumns}
                            onRowClick={handleRowClick}
                            isLoading={projectsLoading}
                            emptyMessage="No projects assigned to your MDA yet."
                        />

                        {/* Elegant Projects Pagination Controls */}
                        {projectsMeta && projectsMeta.total_pages > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{(projectsPage - 1) * projectsLimit + 1}</span> to{' '}
                                        <span className="font-semibold">{Math.min(projectsPage * projectsLimit, projectsMeta.total)}</span> of{' '}
                                        <span className="font-semibold">{projectsMeta.total}</span> entries
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rows per page:</span>
                                        <select
                                            value={projectsLimit}
                                            onChange={(e) => {
                                                setProjectsLimit(Number(e.target.value));
                                                setProjectsPage(1);
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
                                        onClick={() => setProjectsPage(Math.max(1, projectsPage - 1))}
                                        disabled={projectsPage === 1}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: projectsMeta.total_pages }, (_, i) => i + 1)
                                        .filter((p) => Math.abs(p - projectsPage) <= 2 || p === 1 || p === projectsMeta.total_pages)
                                        .map((p, idx, array) => {
                                            const showEllipsis = idx > 0 && p - array[idx - 1] > 1;
                                            return (
                                                <div key={p} className="flex items-center gap-1.5">
                                                    {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                                    <button
                                                        onClick={() => setProjectsPage(p)}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                                            projectsPage === p
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
                                        onClick={() => setProjectsPage(Math.min(projectsMeta.total_pages, projectsPage + 1))}
                                        disabled={projectsPage === projectsMeta.total_pages}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card noPadding>
                    <div className="flex flex-col">
                        <Table
                            data={updates}
                            columns={historyColumns}
                            onRowClick={handleHistoryRowClick}
                            isLoading={historyLoading}
                            emptyMessage="No progress updates submitted yet."
                        />
                        
                        {/* Elegant Pagination Controls */}
                        {meta && meta.total_pages > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{' '}
                                        <span className="font-semibold">{Math.min(page * limit, meta.total)}</span> of{' '}
                                        <span className="font-semibold">{meta.total}</span> entries
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">Rows per page:</span>
                                        <select
                                            value={limit}
                                            onChange={(e) => {
                                                setLimit(Number(e.target.value));
                                                setPage(1);
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
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
                                        .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === meta.total_pages)
                                        .map((p, idx, array) => {
                                            const showEllipsis = idx > 0 && p - array[idx - 1] > 1;
                                            return (
                                                <div key={p} className="flex items-center gap-1.5">
                                                    {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                                    <button
                                                        onClick={() => setPage(p)}
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                                                            page === p
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
                                        onClick={() => setPage(Math.min(meta.total_pages, page + 1))}
                                        disabled={page === meta.total_pages}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {selectedProject && isModalOpen && (
                <ProjectDetailsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    project={selectedProject}
                    onProgressUpdate={handleRefresh}
                />
            )}
        </div>
    );
};

export default UserDashboard;
