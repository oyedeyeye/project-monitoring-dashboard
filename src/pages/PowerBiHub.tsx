import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Database, Download, Table2, Info, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const PowerBiHub = () => {
    const [tables, setTables] = useState<TableStructure[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [sampleData, setSampleData] = useState<any[]>([]);
    const [loadingTables, setLoadingTables] = useState<boolean>(true);
    const [loadingSample, setLoadingSample] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
        const url = `${api.defaults.baseURL || ''}/power-bi/tables/${selectedTable}/export`;
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

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                            title="Back to login/dashboard"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Database className="h-6 w-6 text-brand" />
                                Power BI Developer Hub
                            </h1>
                            <p className="text-gray-500 text-sm mt-0.5">
                                Inspect database schemas, preview data samples, and export CSV files.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                {loadingTables ? (
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
                )}
            </div>
        </div>
    );
};

export default PowerBiHub;
