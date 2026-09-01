import { useState } from 'react';
import {
  Search, Plus, Edit2, Trash2,
} from 'lucide-react';
import { useUsers, FlattenedUser } from '../hooks/useUsers';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import NewUserModal from '../components/NewUserModal';
import EditUserModal from '../components/EditUserModal';

function Users() {
  const { profile } = useAuth();
  const { mdas } = useAdmin();
  const {
    users,
    loading,
    error,
    updateUser,
    deleteUser,
    refetch,
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<FlattenedUser | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = (user: FlattenedUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (user: FlattenedUser, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete user ${user.fullName || user.email}?`)) {
      try {
        await deleteUser(user.id);
        refetch();
      } catch (err: any) {
        console.error('Error deleting user:', err);
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleToggleStatus = async (user: FlattenedUser, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = user.isActive ? 'suspend' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} user ${user.fullName || user.email}?`)) {
      try {
        // @ts-ignore
        await toggleUserStatus(user.id, !user.isActive);
        refetch();
      } catch (err: any) {
        console.error(`Error trying to ${action} user:`, err);
        alert(err.response?.data?.message || `Failed to ${action} user.`);
      }
    }
  };

  const filteredUsers = users.filter((user) => user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        || user.email.toLowerCase().includes(searchTerm.toLowerCase())
        || user.mdaName.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      header: 'User',
      accessor: (item: FlattenedUser) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-semibold">
            {(item.fullName || item.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{item.fullName || 'No Name'}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (item: FlattenedUser) => (
        <Badge variant={item.role === 'WEBMASTER_ADMIN' ? 'success' : item.role === 'PPIMU_ADMIN' ? 'info' : 'neutral'}>
          {item.role ? item.role.replace('_', ' ') : 'NO ROLE'}
        </Badge>
      ),
    },
    {
      header: 'MDA',
      accessor: (item: FlattenedUser) => (
        <span className="text-gray-600 font-medium">
          {item.mdaName || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (item: FlattenedUser) => (
        <Badge variant={item.isActive ? 'success' : 'error'}>
          {item.isActive ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      header: 'Last Activity',
      accessor: (item: FlattenedUser) => (
        <span className="text-xs text-gray-500 font-medium">
          {item.lastEditActivityDate
            ? new Date(item.lastEditActivityDate).toLocaleString()
            : 'No recent activity'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (item: FlattenedUser) => (
        <div className="flex items-center gap-2">
          {profile?.id !== item.id && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => handleToggleStatus(item, e)}
              title={item.isActive ? "Suspend User" : "Activate User"}
              className="p-1.5"
            >
              {item.isActive ? 'Suspend' : 'Activate'}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handleEditClick(item, e)}
            title="Edit User"
            className="p-1.5"
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
          </Button>
          {profile?.id !== item.id && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handleDeleteClick(item, e)}
            title="Delete User"
            className="p-1.5 hover:bg-red-50 hover:border-red-200"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          )}
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error loading users:
        {' '}
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-500 mt-1">Manage platform users, roles, and MDA assignments.</p>
        </div>
        {/* User creation is restricted to WEBMASTER_ADMIN on the API. */}
        {profile?.role === 'WEBMASTER_ADMIN' && (
          <Button
            onClick={() => setIsNewModalOpen(true)}
            variant="primary"
            size="md"
            className="self-start sm:self-auto shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        )}
      </div>

      {/* Search Filter Card */}
      <Card className="p-4">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or MDA..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card noPadding>
        <Table
          data={filteredUsers}
          columns={columns}
          isLoading={loading}
          emptyMessage="No users found."
        />
      </Card>

      {/* Modals */}
      {isNewModalOpen && (
        <NewUserModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          mdas={mdas}
          onSuccess={refetch}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          mdas={mdas}
          onSuccess={refetch}
          onUpdate={updateUser}
          currentUserRole={profile?.role}
        />
      )}
    </div>
  );
}

export default Users;
