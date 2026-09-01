import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { Project } from '../types/api';

const ONDO_LGAS = [
  'Akoko North-East',
  'Akoko North-West',
  'Akoko South-East',
  'Akoko South-West',
  'Akure North',
  'Akure South',
  'Ese Odo',
  'Idanre',
  'Ifedore',
  'Ilaje',
  'Ile Oluji/Okeigbo',
  'Irele',
  'Odigbo',
  'Okitipupa',
  'Ondo East',
  'Ondo West',
  'Ose',
  'Owo',
];

function Projects() {
  const { profile } = useAuth();
  const { mdas } = useAdmin();

  const [searchParams, setSearchParams] = useSearchParams();
  const mdaFilter = searchParams.get('mdaId') || '';
  const statusFilter = searchParams.get('status') || '';
  const lgaFilter = searchParams.get('lga') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const {
    projects,
    meta,
    page,
    setPage,
    limit,
    setStatus,
    setLga,
    loading,
    error,
    refetch,
  } = useProjects(mdaFilter || null, pageParam, 25, statusFilter, lgaFilter);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleRowClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleMdaChange = (mdaId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (mdaId) {
      newParams.set('mdaId', mdaId);
    } else {
      newParams.delete('mdaId');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setPage(1);
  };

  const handleStatusChange = (statusVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (statusVal) {
      newParams.set('status', statusVal);
    } else {
      newParams.delete('status');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setStatus(statusVal);
    setPage(1);
  };

  const handleLgaChange = (lgaVal: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (lgaVal) {
      newParams.set('lga', lgaVal);
    } else {
      newParams.delete('lga');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setLga(lgaVal);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    setPage(newPage);
  };

  // Filter local projects if searchTerm exists (in addition to API limits)
  const filteredProjects = projects.filter((p) => (p.title || '').toLowerCase().includes(searchTerm.toLowerCase())
        || (p.contractor || '').toLowerCase().includes(searchTerm.toLowerCase())
        || (p.locationText || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      header: '#',
      accessor: (_: Project, index: number) => (page - 1) * limit + index + 1,
      className: 'w-12 text-gray-400 font-medium',
    },
    {
      header: 'Project Title',
      accessor: 'title' as keyof Project,
      className: 'w-1/3 font-semibold text-gray-800',
    },
    {
      header: 'MDA',
      accessor: (item: Project) => item.mda?.name || 'N/A',
      className: 'text-gray-600',
    },
    {
      header: 'Location',
      accessor: 'locationText' as keyof Project,
      className: 'text-gray-600',
    },
    {
      header: 'Budget',
      accessor: (item: Project) => `₦${Number(item.approvedBudget).toLocaleString()}`,
      className: 'font-mono text-gray-700',
    },
    {
      header: 'Status',
      accessor: (item: Project) => {
        const status = item.status || 'Not Started';
        const variant = status === 'Completed' ? 'success'
          : status === 'Ongoing' ? 'warning'
            : status === 'Stalled' ? 'error' : 'neutral';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading projects:
        {' '}
        {error}
      </div>
    );
  }

  const isAdmin = profile?.role === 'WEBMASTER_ADMIN' || profile?.role === 'PPIMU_ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? 'View and track development projects across all state MDAs.' : 'View and track projects assigned to your MDA.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button 
            onClick={() => refetch()} 
            variant="ghost" 
            size="sm"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 flex-1 w-full`}>
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by title, contractor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="">All Statuses</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Stalled">Stalled</option>
                <option value="Not Started">Not Started</option>
              </select>
            </div>

            {/* LGA Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">LGA</label>
              <select
                value={lgaFilter}
                onChange={(e) => handleLgaChange(e.target.value)}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="">All LGAs</option>
                {ONDO_LGAS.map((lgaName) => (
                  <option key={lgaName} value={lgaName}>
                    {lgaName}
                  </option>
                ))}
              </select>
            </div>

            {/* MDA Filter (Admins only) */}
            {isAdmin && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">MDA</label>
              <select
                value={mdaFilter}
                onChange={(e) => handleMdaChange(e.target.value)}
                className="px-3 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
              >
                <option value="">All MDAs</option>
                {mdas.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            )}
          </div>
        </div>
      </Card>

      {/* Projects Table */}
      <Card noPadding>
        <div className="flex flex-col">
          <Table
            data={filteredProjects}
            columns={columns}
            onRowClick={handleRowClick}
            isLoading={loading}
            emptyMessage="No projects found matching the selected filters."
          />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <span className="text-sm text-gray-600">
                Showing
                {' '}
                <span className="font-semibold">{(page - 1) * limit + 1}</span>
                {' '}
                to
                {' '}
                <span className="font-semibold">{Math.min(page * limit, meta.total)}</span>
                {' '}
                of
                {' '}
                <span className="font-semibold">{meta.total}</span>
                {' '}
                entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Previous
                </button>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages)
                  .map((p, idx, array) => {
                    const showEllipsis = idx > 0 && p - array[idx - 1] > 1;
                    return (
                      <div key={p} className="flex items-center gap-1.5">
                        {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                        <button
                          onClick={() => handlePageChange(p)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                            page === p
                              ? 'bg-brand border-brand text-brand-foreground shadow-sm font-bold'
                              : 'border-gray-200 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(Math.min(meta.totalPages, page + 1))}
                  disabled={page === meta.totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {selectedProject && isModalOpen && (
        <ProjectDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          isApproverView={profile?.role === 'WEBMASTER_ADMIN' || profile?.role === 'PPIMU_ADMIN'}
          onProgressUpdate={refetch}
        />
      )}
    </div>
  );
}

export default Projects;
