import { useState } from 'react';
import { useIssues } from '../hooks/useIssues';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ui/ConfirmModal';
import { AlertTriangle, Search, CheckCircle, Trash2, Edit2, Calendar, User, Info } from 'lucide-react';
import { Issue } from '../types/api';

const SEVERITY_MAP: Record<number, { label: string; variant: 'neutral' | 'info' | 'warning' | 'error' }> = {
    1: { label: 'Low', variant: 'neutral' },
    2: { label: 'Medium', variant: 'info' },
    3: { label: 'High', variant: 'warning' },
    4: { label: 'Critical', variant: 'error' },
};

const Issues = () => {
    const {
        issues,
        loading,
        queryError,
        refetch,
        resolveIssue,
        updateIssue,
        deleteIssue
    } = useIssues();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        issueCategory: '',
        issueItem: '',
        severity: 1,
        owner: '',
        status: 'Open',
        notes: '',
    });

    const handleRowClick = (issue: Issue) => {
        setSelectedIssue(issue);
        setIsDetailModalOpen(true);
        setIsEditMode(false);
        setEditForm({
            issueCategory: issue.issueCategory || '',
            issueItem: issue.issueItem || '',
            severity: issue.severity || 1,
            owner: issue.owner || '',
            status: issue.status || 'Open',
            notes: issue.notes || '',
        });
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'delete' | 'resolve' | null;
        title: string;
        message: string;
        confirmText: string;
        confirmType: 'danger' | 'primary';
        issueId: string | null;
    }>({
        isOpen: false,
        type: null,
        title: '',
        message: '',
        confirmText: '',
        confirmType: 'primary',
        issueId: null,
    });

    const [confirmLoading, setConfirmLoading] = useState(false);

    const handleResolveClick = (id: string) => {
        setConfirmModal({
            isOpen: true,
            type: 'resolve',
            title: 'Resolve Issue',
            message: 'Are you sure you want to mark this issue as resolved?',
            confirmText: 'Resolve',
            confirmType: 'primary',
            issueId: id,
        });
    };

    const handleDeleteClick = (id: string) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            title: 'Delete Issue',
            message: 'Are you sure you want to permanently delete this issue? This action cannot be undone.',
            confirmText: 'Delete',
            confirmType: 'danger',
            issueId: id,
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.issueId || !confirmModal.type) return;
        setConfirmLoading(true);
        try {
            if (confirmModal.type === 'delete') {
                await deleteIssue(confirmModal.issueId);
            } else if (confirmModal.type === 'resolve') {
                await resolveIssue(confirmModal.issueId);
            }
            setIsDetailModalOpen(false);
            setConfirmModal(prev => ({ ...prev, isOpen: false, issueId: null, type: null }));
            refetch();
        } catch (err) {
            console.error(`Failed to ${confirmModal.type} issue:`, err);
            alert(`Failed to ${confirmModal.type} issue.`);
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedIssue) return;
        try {
            await updateIssue({
                id: selectedIssue.id,
                payload: editForm
            });
            setIsDetailModalOpen(false);
            refetch();
        } catch (err) {
            console.error('Failed to update issue:', err);
            alert('Failed to update issue.');
        }
    };

    const filteredIssues = issues.filter(issue =>
        issue.issueItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.issueCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((issue as any).project?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Date Logged',
            accessor: (item: Issue) => new Date(item.logDate || item.dueDate).toLocaleDateString(),
            className: 'w-28 text-xs text-gray-500 font-medium'
        },
        {
            header: 'Issue / Category',
            accessor: (item: Issue) => (
                <div>
                    <div className="font-semibold text-gray-800">{item.issueItem}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.issueCategory}</div>
                </div>
            )
        },
        {
            header: 'Project / MDA',
            accessor: (item: any) => (
                <div>
                    <div className="text-sm font-medium text-gray-700">{item.project?.title || 'N/A'}</div>
                    <div className="text-xs text-gray-400">{item.project?.mda?.name || 'N/A'}</div>
                </div>
            )
        },
        {
            header: 'Severity',
            accessor: (item: Issue) => {
                const config = SEVERITY_MAP[item.severity] || { label: 'Unknown', variant: 'neutral' };
                return <Badge variant={config.variant}>{config.label}</Badge>;
            }
        },
        {
            header: 'Owner',
            accessor: 'owner' as keyof Issue,
            className: 'text-sm text-gray-600 font-medium'
        },
        {
            header: 'Status',
            accessor: (item: Issue) => (
                <Badge variant={item.status === 'Resolved' || item.status === 'Closed' ? 'success' : 'error'}>
                    {item.status}
                </Badge>
            )
        }
    ];

    if (queryError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Error loading issues: {String(queryError)}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                        Issues & Risks
                    </h1>
                    <p className="text-gray-500 mt-1">Monitor, assign, and resolve project risks and bottlenecks.</p>
                </div>
                <Button onClick={() => refetch()} variant="ghost" size="sm" className="self-start sm:self-auto">
                    Refresh
                </Button>
            </div>

            {/* Search Filter Card */}
            <Card className="p-4">
                <div className="max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by issue description, project, owner..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all shadow-sm bg-white"
                        />
                    </div>
                </div>
            </Card>

            {/* Issues Table */}
            <Card noPadding>
                <Table
                    data={filteredIssues}
                    columns={columns}
                    isLoading={loading}
                    onRowClick={handleRowClick}
                    emptyMessage="No issues or risks currently logged."
                />
            </Card>

            {/* Issue Detail & Edit Modal */}
            {isDetailModalOpen && selectedIssue && (
                <Modal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    title={isEditMode ? "Edit Issue" : "Issue Details"}
                    maxWidth="md"
                >
                    {isEditMode ? (
                        <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue / Item</label>
                                <input
                                    type="text"
                                    value={editForm.issueItem}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, issueItem: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category (What is it affecting)</label>
                                <input
                                    type="text"
                                    value={editForm.issueCategory}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, issueCategory: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                                    <select
                                        value={editForm.severity}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, severity: Number(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand"
                                    >
                                        <option value={1}>Low</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>High</option>
                                        <option value={4}>Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-brand"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Owner / Handler</label>
                                <input
                                    type="text"
                                    value={editForm.owner}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, owner: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Additional Details</label>
                                <textarea
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end pt-4 gap-2">
                                <Button type="button" variant="ghost" onClick={() => setIsEditMode(false)}>Cancel</Button>
                                <Button type="submit" variant="primary">Save Changes</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{(selectedIssue as any).project?.title || 'Project Issue'}</h3>
                                <p className="text-sm text-gray-500 mt-1">MDA: {(selectedIssue as any).project?.mda?.name || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Severity</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {SEVERITY_MAP[selectedIssue.severity]?.label || 'Low'}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                    <Info className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedIssue.status}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Who is Handling It</p>
                                        <p className="text-sm font-bold text-gray-800">{selectedIssue.owner}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Due Date</p>
                                        <p className="text-sm font-bold text-gray-800">
                                            {selectedIssue.dueDate ? new Date(selectedIssue.dueDate).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">What is it affecting</h4>
                                <div className="p-3 bg-red-50/50 border border-red-100 rounded-lg text-sm text-gray-700">
                                    <strong>Category: </strong>{selectedIssue.issueCategory}
                                    <p className="mt-1"><strong>Details: </strong>{selectedIssue.issueItem}</p>
                                </div>
                            </div>

                            {selectedIssue.notes && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Additional Notes</h4>
                                    <p className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 whitespace-pre-wrap">
                                        {selectedIssue.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsEditMode(true)}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" onClick={() => handleDeleteClick(selectedIssue.id)} className="hover:bg-red-50 hover:border-red-200 text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                        Delete
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                                    {selectedIssue.status !== 'Resolved' && selectedIssue.status !== 'Closed' && (
                                        <Button variant="primary" onClick={() => handleResolveClick(selectedIssue.id)}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Resolve Issue
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </Modal>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false, issueId: null, type: null }))}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.confirmType}
                isLoading={confirmLoading}
            />
        </div>
    );
};

export default Issues;
