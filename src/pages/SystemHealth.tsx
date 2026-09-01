import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import { Activity, Database, Server, Clock } from 'lucide-react';
import Badge from '../components/ui/Badge';

interface HealthData {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: {
      status: string;
      error?: string | null;
    };
    api: {
      status: string;
      uptime: number;
    };
  };
}

function SystemHealth() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      setData(response.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch system health status.');
      if (err.response?.data) {
        setData(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Poll every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(' ');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="h-6 w-6 text-brand" />
          System Health
        </h1>
        <p className="text-gray-500 mt-1">Monitor live status of API endpoints, database connectivity, and system uptime.</p>
      </div>

      {error && !data && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 border-t-4 border-t-brand">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand/10 rounded-lg">
                  <Database className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Database Connection</h3>
                  <p className="text-sm text-gray-500">MySQL Primary Instance</p>
                </div>
              </div>
              <Badge variant={data.services.database.status === 'connected' ? 'success' : 'error'}>
                {data.services.database.status.toUpperCase()}
              </Badge>
            </div>
            {data.services.database.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-mono">
                {data.services.database.error}
              </div>
            )}
          </Card>

          <Card className="p-6 border-t-4 border-t-blue-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Server className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">API Service</h3>
                  <p className="text-sm text-gray-500">Backend Application</p>
                </div>
              </div>
              <Badge variant={data.services.api.status === 'online' ? 'success' : 'error'}>
                {data.services.api.status.toUpperCase()}
              </Badge>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <Clock className="h-4 w-4" />
              <span>Uptime: <span className="font-semibold">{formatUptime(data.services.api.uptime)}</span></span>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

export default SystemHealth;
