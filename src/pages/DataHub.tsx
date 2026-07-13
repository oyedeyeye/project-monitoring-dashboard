import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Database, Download, Table2, Info, ArrowLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ImportProjectsModal from '../components/ImportProjectsModal';

interface ColumnDefinition {
    name: string;
    type: string;
    isRequired: boolean;
}

interface TableStructure {
    name: string;
    dbName: string;
    columns: ColumnDefinition[];
}

const DataHub = () => {
    const getBaseUrlClean = () => {
        const base = api.defaults.baseURL || window.location.origin;
        return base.endsWith('/') ? base.slice(0, -1) : base;
    };

    const [tables, setTables] = useState<TableStructure[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [sampleData, setSampleData] = useState<any[]>([]);
    const [loadingTables, setLoadingTables] = useState<boolean>(true);
    const [loadingSample, setLoadingSample] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const { profile } = useAuth();
    const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';

    useEffect(() => {
        const fetchTables = async () => {
            try {
                setLoadingTables(true);
                const res = await api.get<TableStructure[]>('/power-bi/tables');
                setTables(res.data);
                if (res.data.length > 0) {
                    setSelectedTable(res.data[0].name);
                }
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError('Failed to load database schema from backend.');
            } finally {
                setLoadingTables(false);
            }
        };
        fetchTables();
    }, []);

    useEffect(() => {
        if (!selectedTable) return;

        const fetchSample = async () => {
            try {
                setLoadingSample(true);
                const res = await api.get<any[]>(`/power-bi/tables/${selectedTable}/sample`);
                setSampleData(res.data);
            } catch (err: any) {
                console.error(err);
                setSampleData([]);
            } finally {
                setLoadingSample(false);
            }
        };
        fetchSample();
    }, [selectedTable]);

    const activeTableStructure = tables.find(t => t.name === selectedTable);

    const handleExport = () => {
        if (!selectedTable) return;
        const url = `${getBaseUrlClean()}/power-bi/tables/${selectedTable}/export`;
        window.open(url, '_blank');
    };

    const schemaColumns = [
        {
            header: 'Column Name',
            accessor: (col: ColumnDefinition) => (
                <span className="font-mono text-xs font-semibold text-gray-800">{col.name}</span>
            )
        },
        {
            header: 'Data Type',
            accessor: (col: ColumnDefinition) => (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {col.type}
                </span>
            )
        },
        {
            header: 'Nullability',
            accessor: (col: ColumnDefinition) => (
                <Badge variant={col.isRequired ? 'neutral' : 'success'}>
                    {col.isRequired ? 'NOT NULL' : 'NULL'}
                </Badge>
            )
        }
    ];

    const sampleColumns = activeTableStructure
        ? activeTableStructure.columns.map(col => ({
              header: col.name,
              accessor: (row: any) => {
                  const val = row[col.name];
                  if (val === null || val === undefined) {
                      return <span className="text-gray-400 italic">null</span>;
                  }
                  if (typeof val === 'boolean') {
                      return val ? 'True' : 'False';
                  }
                  if (typeof val === 'object') {
                      return <span className="text-xs font-mono">{JSON.stringify(val)}</span>;
                  }
                  return <span className="text-xs truncate max-w-xs block">{String(val)}</span>;
              }
          }))
        : [];

    const [activeTab, setActiveTab] = useState<'preview' | 'guide'>('preview');

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            title="Back to Admin Dashboard"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Database className="h-6 w-6 text-brand" />
                                Data Hub
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Inspect database schemas, preview data samples, and access live integration endpoints.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        {isWebmaster && (
                            <Button onClick={() => setIsImportModalOpen(true)} variant="primary" className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Import Projects (CSV)
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'preview'
                                ? 'border-brand text-brand'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Schema & Data Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('guide')}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                            activeTab === 'guide'
                                ? 'border-brand text-brand'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Integration Guide
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {activeTab === 'guide' && (
                    <div className="space-y-6">
                        <Card>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Live Data Ingestion API</h2>
                            <p className="text-sm text-gray-600 mb-6">
                                Power BI can ingest full table data dynamically by connecting to the backend's paginated JSON endpoint. 
                                This endpoint requires a secure API Key to authenticate the request, bypassing the standard dashboard login.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Endpoint Details</h3>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                                        <p><span className="text-blue-400">GET</span> {getBaseUrlClean()}/power-bi/tables/<span className="text-yellow-400">[tableName]</span>/data</p>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Required Headers</h3>
                                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                                        <p>x-api-key: <span className="text-green-400">pb_live_8f3a9d2b1c4e7f6a5d4c3b2a1e0f9d8c</span></p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        * Note: The API key is statically configured in the backend environment variables. Do not expose it publicly.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-gray-700 mb-2">Pagination Parameters (Optional)</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                        <li><code className="bg-gray-100 px-1 rounded">page</code>: Page number to retrieve (default: 1)</li>
                                        <li><code className="bg-gray-100 px-1 rounded">limit</code>: Number of records per page (default: 1000)</li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-lg font-bold text-gray-900 mb-4">How to Configure Power BI Desktop</h2>
                            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-3">
                                <li>Open Power BI Desktop and select <strong>Get Data</strong> &gt; <strong>Web</strong>.</li>
                                <li>Choose the <strong>Advanced</strong> radio button.</li>
                                <li>In the <strong>URL parts</strong>, enter the endpoint URL (e.g., <code className="bg-gray-100 px-1 rounded">{getBaseUrlClean()}/power-bi/tables/Project/data</code>).</li>
                                <li>Under <strong>HTTP request header parameters</strong>, type <code className="bg-gray-100 px-1 rounded">x-api-key</code> in the key box and paste the secret API key in the value box.</li>
                                <li>Click <strong>OK</strong>. Power BI will execute the query and open Power Query Editor.</li>
                                <li>In Power Query Editor, click on the <code className="bg-gray-100 px-1 rounded">Record</code> or <code className="bg-gray-100 px-1 rounded">List</code> returned to expand the JSON <code className="bg-gray-100 px-1 rounded">data</code> array into rows and columns.</li>
                            </ol>
                        </Card>
                    </div>
                )}

                {activeTab === 'preview' && (
                    loadingTables ? (
                    <div className="w-full h-64 flex items-center justify-center text-gray-500">
                        Loading schemas and structure...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar (Tables List) */}
                        <div className="lg:col-span-1 space-y-3">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                                Database Tables ({tables.length})
                            </h2>
                            <div className="flex flex-col gap-1 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                                {tables.map(table => (
                                    <button
                                        key={table.name}
                                        onClick={() => setSelectedTable(table.name)}
                                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                                            selectedTable === table.name
                                                ? 'bg-brand text-brand-foreground shadow-sm'
                                                : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <span className="truncate">{table.name}</span>
                                        <Badge
                                            variant={selectedTable === table.name ? 'neutral' : 'neutral'}
                                            className={selectedTable === table.name ? 'bg-white/20 text-white' : ''}
                                        >
                                            {table.columns.length} cols
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details View */}
                        {activeTableStructure && (
                            <div className="lg:col-span-3 space-y-6">
                                {/* Table Meta & Export Card */}
                                <Card>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2.5 bg-brand/10 text-brand rounded-lg shrink-0">
                                                <Table2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">
                                                    {activeTableStructure.name}
                                                </h2>
                                                <p className="text-gray-500 text-xs mt-0.5">
                                                    Database Table Name:{' '}
                                                    <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">
                                                        {activeTableStructure.dbName}
                                                    </code>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleExport}
                                            variant="primary"
                                            className="flex items-center gap-2 self-start sm:self-auto"
                                        >
                                            <Download className="h-4 w-4" />
                                            Export CSV Sample
                                        </Button>
                                    </div>
                                </Card>

                                {/* Schema Definition */}
                                <Card noPadding>
                                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-gray-400" />
                                        <h3 className="text-sm font-bold text-gray-700">Schema Fields</h3>
                                    </div>
                                    <Table
                                        data={activeTableStructure.columns}
                                        columns={schemaColumns}
                                        keyExtractor={col => col.name}
                                    />
                                </Card>

                                {/* Sample Data Preview */}
                                <Card noPadding>
                                    <div className="p-4 border-b border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-700">
                                            Random Data Sample (Max 10 rows)
                                        </h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <Table
                                            data={sampleData}
                                            columns={sampleColumns}
                                            isLoading={loadingSample}
                                            emptyMessage="No records exist in this table."
                                        />
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isImportModalOpen && (
                <ImportProjectsModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onSuccess={() => {
                        setIsImportModalOpen(false);
                        // Optional: trigger table refresh if needed
                    }}
                />
            )}
        </div>
    );
};

export default DataHub;
