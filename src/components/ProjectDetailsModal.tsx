import React, { useState } from 'react';
import Modal from './ui/Modal';
import { Project, ProgressUpdate } from '../types/api';
import { useProjectDetails } from '../hooks/useProjectDetails';
import Button from './ui/Button';
import { api } from '../lib/api';
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_OPTIONS } from '../constants/issueCategories';
import { useAuth } from '../context/AuthContext';
import UpdateModal from './UpdateModal';
import { useReports } from '../hooks/useReports';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    isApproverView?: boolean;
    onProgressUpdate?: () => void;
}

const ProjectDetailsModal = ({ isOpen, onClose, project, isApproverView, onProgressUpdate }: ProjectDetailsModalProps) => {
    const { updates, issues, loading, refetch } = useProjectDetails(project.project_id);
    const { approveReport, rejectReport } = useReports();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'issues'>('overview');

    // Issue form state
    const [isAddingIssue, setIsAddingIssue] = useState(false);
    const [issueCategory, setIssueCategory] = useState('');
    const [issueItem, setIssueItem] = useState('');
    const [issueNotes, setIssueNotes] = useState('');
    const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);
    const [issueError, setIssueError] = useState('');

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateToEdit, setUpdateToEdit] = useState<ProgressUpdate | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleIssueSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIssueError('');
        if (!issueCategory || !issueItem) {
            setIssueError('Please select both category and item.');
            return;
        }

        setIsSubmittingIssue(true);
        try {
            await api.post('/issues', {
                project_id: project.project_id,
                log_date: new Date().toISOString(),
                issue_category: issueCategory,
                issue_item: issueItem,
                severity: 3, // Default severity
                owner: user?.id || 'Unknown',
                status: 'Open',
                notes: issueNotes,
            });

            setIsAddingIssue(false);
            setIssueCategory('');
            setIssueItem('');
            setIssueNotes('');
            refetch(); // Refresh after adding
        } catch (err: any) {
            setIssueError(err.message || 'Failed to submit issue');
        } finally {
            setIsSubmittingIssue(false);
        }
    };

    const handleApprove = async (reportId: string) => {
        if (!confirm('Are you sure you want to approve this progress update?')) return;
        setActionLoading(reportId);
        try {
            await approveReport(reportId);
            refetch();
            if (onProgressUpdate) onProgressUpdate();
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Failed to approve report.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (reportId: string) => {
        if (!confirm('Are you sure you want to request changes for this progress update?')) return;
        setActionLoading(reportId);
        try {
            await rejectReport(reportId);
            refetch();
            if (onProgressUpdate) onProgressUpdate();
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Failed to request changes.');
        } finally {
            setActionLoading(null);
        }
    };

    const latestUpdate = updates.length > 0 ? updates[0] : null;

    const renderTabs = () => (
        <div className="flex space-x-4 border-b border-gray-200 mb-6">
            {(['overview', 'history', 'issues'] as const).map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-1 text-sm font-medium capitalize ${activeTab === tab
                        ? 'border-b-2 border-primary-600 text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Physical Progress</p>
                    <p className="text-xl font-semibold">{latestUpdate ? `${latestUpdate.physical_progress_pct}%` : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Stage</p>
                    <p className="text-xl font-semibold">{latestUpdate ? latestUpdate.stage : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Milestone Status</p>
                    <p className="text-xl font-semibold">{latestUpdate ? latestUpdate.milestone_status : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Last Report Date</p>
                    <p className="text-xl font-semibold">
                        {latestUpdate ? new Date(latestUpdate.report_date).toLocaleDateString() : 'N/A'}
                    </p>
                </div>
            </div>

            <div className="mt-4 border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-2">Project Info</h4>
                <div className="text-sm space-y-2 text-gray-600">
                    <p><span className="font-semibold w-24 inline-block">Title:</span> {project.title}</p>
                    <p><span className="font-semibold w-24 inline-block">Location:</span> {project.location_text}</p>
                    <p><span className="font-semibold w-24 inline-block">Start Date:</span> {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-semibold w-24 inline-block">Budget:</span> ₦{Number(project.approved_budget).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {!updates.length ? (
                <p className="text-gray-500 italic text-sm">No updates submitted yet.</p>
            ) : (
                updates.map((update) => (
                    <div key={update.id} className="border-l-2 border-primary-200 pl-4 py-2 relative group">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">{new Date(update.report_date).toLocaleDateString()}</p>
                                <p className="font-medium text-gray-800 text-sm">{update.stage} - {update.physical_progress_pct}%</p>
                                <p className="text-sm text-gray-600 mt-1">{update.key_update}</p>
                                {update.milestone_status === 'Changes Required' && (
                                    <span className="mt-1 inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                        Changes Required
                                    </span>
                                )}
                                {update.milestone_status === 'Ready for Approval' && (
                                    <span className="mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        Ready for Approval
                                    </span>
                                )}
                                {update.milestone_status === 'Approved' && (
                                    <span className="mt-1 inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                        Approved
                                    </span>
                                )}
                            </div>

                            {/* Staff Action */}
                            {!isApproverView && update.milestone_status === 'Changes Required' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        setUpdateToEdit(update);
                                        setIsUpdateModalOpen(true);
                                    }}
                                >
                                    Edit & Resubmit
                                </Button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const renderIssues = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Reported Issues</h4>
                {!isAddingIssue && (
                    <Button size="sm" onClick={() => setIsAddingIssue(true)}>
                        Report Issue
                    </Button>
                )}
            </div>

            {isAddingIssue && (
                <form onSubmit={handleIssueSubmit} className="bg-gray-50 p-4 rounded-lg mb-6 shadow-sm border border-gray-200">
                    <h5 className="font-medium text-sm mb-3">New Issue</h5>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Issue Category</label>
                            <select
                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                value={issueCategory}
                                onChange={(e) => {
                                    setIssueCategory(e.target.value);
                                    setIssueItem('');
                                }}
                                required
                            >
                                <option value="">Select Category...</option>
                                {ISSUE_CATEGORY_OPTIONS.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {issueCategory && (
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Specific Issue</label>
                                <select
                                    className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={issueItem}
                                    onChange={(e) => setIssueItem(e.target.value)}
                                    required
                                >
                                    <option value="">Select Issue...</option>
                                    {ISSUE_CATEGORIES[issueCategory].map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
                            <textarea
                                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                rows={2}
                                value={issueNotes}
                                onChange={(e) => setIssueNotes(e.target.value)}
                            />
                        </div>

                        {issueError && <p className="text-red-500 text-xs">{issueError}</p>}

                        <div className="flex space-x-2 pt-2">
                            <Button type="submit" size="sm" isLoading={isSubmittingIssue}>
                                Submit
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingIssue(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-3 max-h-64 overflow-y-auto">
                {!issues.length ? (
                    <p className="text-gray-500 italic text-sm">No issues reported.</p>
                ) : (
                    issues.map((issue) => (
                        <div key={issue.id} className="p-3 border rounded-lg bg-white shadow-sm flex flex-col">
                            <div className="flex justify-between mb-1">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${issue.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {issue.status}
                                </span>
                                <span className="text-xs text-gray-400">{new Date(issue.log_date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-800">{issue.issue_category}</p>
                            <p className="text-sm text-gray-600">{issue.issue_item}</p>
                            {issue.notes && <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">{issue.notes}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <React.Fragment>
            <Modal isOpen={isOpen} onClose={onClose} title="Project Details" maxWidth="lg">
                {loading && !updates.length && !issues.length ? (
                    <div className="h-64 flex justify-center items-center text-gray-500">Loading...</div>
                ) : (
                    <>
                        {renderTabs()}

                        <div className="min-h-[300px]">
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'history' && renderHistory()}
                            {activeTab === 'issues' && renderIssues()}
                        </div>

                        <div className="mt-8 pt-4 border-t flex justify-between">
                            <Button variant="outline" onClick={onClose}>Close</Button>

                            {!isApproverView && (
                                <Button onClick={() => {
                                    setUpdateToEdit(null);
                                    setIsUpdateModalOpen(true);
                                }}>
                                    Add Progress Update
                                </Button>
                            )}

                            {isApproverView && latestUpdate && latestUpdate.milestone_status !== 'Approved' && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setUpdateToEdit(latestUpdate);
                                            setIsUpdateModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="danger"
                                        isLoading={actionLoading === latestUpdate.id}
                                        onClick={() => handleReject(latestUpdate.id)}
                                    >
                                        Request Changes
                                    </Button>
                                    <Button
                                        variant="primary"
                                        isLoading={actionLoading === latestUpdate.id}
                                        onClick={() => handleApprove(latestUpdate.id)}
                                    >
                                        Approve
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <UpdateModal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                projectId={project.project_id}
                projectTitle={project.title}
                existingUpdate={updateToEdit}
                onSuccess={() => {
                    refetch();
                    setIsUpdateModalOpen(false);
                    if (onProgressUpdate) onProgressUpdate();
                }}
            />
        </React.Fragment>
    );
};

export default ProjectDetailsModal;
