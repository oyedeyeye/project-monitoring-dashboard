import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { User, Mail, Shield, Building2 } from 'lucide-react';
import Badge from '../components/ui/Badge';

function Settings() {
  const { profile, user, mdaName } = useAuth();

  const getRoleBadge = (role?: string | null) => {
    switch (role) {
      case 'WEBMASTER_ADMIN':
        return <Badge variant="success">Webmaster Admin</Badge>;
      case 'PPIMU_ADMIN':
        return <Badge variant="info">PPIMU Admin</Badge>;
      case 'MDA_OFFICER':
      default:
        return <Badge variant="neutral">MDA Officer</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-500 mt-1">View and manage your account details.</p>
      </div>

      <Card className="p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10 text-brand text-3xl font-bold">
            {(profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{profile?.fullName || 'No Name Provided'}</h2>
            <p className="text-gray-500">{getRoleBadge(profile?.role)}</p>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-900 font-medium">
                {profile?.fullName || 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-900 font-medium">
                {user?.email || 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Shield className="h-4 w-4" /> Access Level
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-900 font-medium">
                {profile?.role ? profile.role.replace('_', ' ') : 'Unknown'}
              </div>
            </div>

            {profile?.role === 'MDA_OFFICER' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Assigned MDA
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-900 font-medium">
                  {mdaName || 'No MDA Assigned'}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
