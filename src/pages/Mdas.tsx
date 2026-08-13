import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function Mdas() {
  const navigate = useNavigate();
  const {
    mdas, loading, error, refetch,
  } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');

  const handleStatClick = (mdaId: string, status: string) => {
    navigate(`/projects?mdaId=${mdaId}&status=${status}`);
  };

  const filteredMdas = mdas.filter((mda) => mda.name.toLowerCase().includes(searchTerm.toLowerCase())
        || (mda.code && mda.code.toLowerCase().includes(searchTerm.toLowerCase())));

  const columns = [
    {
      header: 'MDA Name',
      accessor: (item: any) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(`/projects?mdaId=${item.id}`)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 border border-gray-150 text-gray-500 group-hover:border-brand group-hover:text-brand transition-colors">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-gray-800 group-hover:text-brand transition-colors">{item.name}</div>
            {item.code && <div className="text-xs text-gray-400 font-mono group-hover:text-brand/70 transition-colors">{item.code}</div>}
          </div>
        </div>
      ),
    },
    {
      header: 'Users',
      accessor: (item: any) => (
        <Badge variant="neutral">
          {item.usersCount || 0}
          {' '}
          user
          {(item.usersCount !== 1) ? 's' : ''}
        </Badge>
      ),
    },
    {
      header: 'Yet to Begin',
      accessor: (item: any) => (
        <button
          onClick={() => handleStatClick(item.id, 'Not Started')}
          className="px-3 py-1 text-sm font-semibold rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm"
        >
          {item.projectsYetToBegin || 0}
          {' '}
          projects
        </button>
      ),
    },
    {
      header: 'In Progress',
      accessor: (item: any) => (
        <button
          onClick={() => handleStatClick(item.id, 'Ongoing')}
          className="px-3 py-1 text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-all hover:shadow-sm"
        >
          {item.projectsInProgress || 0}
          {' '}
          projects
        </button>
      ),
    },
    {
      header: 'Stalled',
      accessor: (item: any) => (
        <button
          onClick={() => handleStatClick(item.id, 'Stalled')}
          className="px-3 py-1 text-sm font-semibold rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 transition-all hover:shadow-sm"
        >
          {item.projectsStalled || 0}
          {' '}
          projects
        </button>
      ),
    },
    {
      header: 'Completed',
      accessor: (item: any) => (
        <button
          onClick={() => handleStatClick(item.id, 'Completed')}
          className="px-3 py-1 text-sm font-semibold rounded-lg bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 transition-all hover:shadow-sm"
        >
          {item.projectsCompleted || 0}
          {' '}
          projects
        </button>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading MDAs:
        {' '}
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ministries, Departments & Agencies (MDAs)</h1>
          <p className="text-gray-500 mt-1">Monitor and analyze performance stats across different government MDAs.</p>
        </div>
        <Button onClick={() => refetch()} variant="ghost" size="sm" className="self-start sm:self-auto">
          Refresh Stats
        </Button>
      </div>

      {/* Search Card */}
      <Card className="p-4">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by MDA name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
            />
          </div>
        </div>
      </Card>

      {/* MDAs Table */}
      <Card noPadding>
        <Table
          data={filteredMdas}
          columns={columns}
          isLoading={loading}
          emptyMessage="No MDAs found."
        />
      </Card>
    </div>
  );
}

export default Mdas;
