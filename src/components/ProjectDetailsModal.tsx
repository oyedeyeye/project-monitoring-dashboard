import { useState } from 'react';
import {
  Pencil, FileText, Briefcase, AlertTriangle,
} from 'lucide-react';
import Modal from './ui/Modal';
import { Project, ProgressUpdate } from '../types/api';
import { useProjectDetails } from '../hooks/useProjectDetails';
import Button from './ui/Button';
import UpdateModal from './UpdateModal';
import { useReports } from '../hooks/useReports';
import ConfirmModal from './ui/ConfirmModal';
import EditProjectModal from './EditProjectModal';
import { useAuth } from '../context/AuthContext';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  selectedUpdate?: ProgressUpdate | null;
  isApproverView?: boolean;
  onProgressUpdate?: () => void;
}

function ProjectDetailsModal({
  isOpen, onClose, project, selectedUpdate, isApproverView, onProgressUpdate,
}: ProjectDetailsModalProps) {
  const {
    updates, issues, loading, refetch,
  } = useProjectDetails(project.projectId);
  const { approveReport } = useReports();
  const { profile } = useAuth();
  const isWebmasterView = profile?.role === 'WEBMASTER_ADMIN';
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [updateToEdit, setUpdateToEdit] = useState<ProgressUpdate | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Confirm modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reportIdToApprove, setReportIdToApprove] = useState<string | null>(null);

  const [localApprovedStatus, setLocalApprovedStatus] = useState(false);

  const handleApproveClick = (reportId: string) => {
    setReportIdToApprove(reportId);
    setIsConfirmOpen(true);
  };

  const handleApproveConfirm = async () => {
    if (!reportIdToApprove) return;
    setIsConfirmOpen(false);
    setActionLoading(reportIdToApprove);
    try {
      await approveReport(reportIdToApprove);
      setLocalApprovedStatus(true);
      refetch();
      if (onProgressUpdate) onProgressUpdate();
    } catch (error) {
      console.error('Approval failed:', error);
      alert('Failed to approve report.');
    } finally {
      setActionLoading(null);
      setReportIdToApprove(null);
    }
  };

  const latestUpdate = selectedUpdate || (updates.length > 0 ? updates[0] : null);

  const renderTabs = () => (
    <div className="flex space-x-4 border-b border-gray-200 mb-6">
      {(['overview', 'history'] as const).map((tab) => (
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
          <p className="text-xl font-semibold">{latestUpdate ? `${latestUpdate.physicalProgressPct}%` : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Stage</p>
          <p className="text-xl font-semibold">{latestUpdate ? latestUpdate.stage : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Milestone Status</p>
          <p className="text-xl font-semibold">{latestUpdate ? latestUpdate.milestoneStatus : 'N/A'}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500">Last Report Date</p>
          <p className="text-xl font-semibold">
            {latestUpdate ? new Date(latestUpdate.reportDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {latestUpdate && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Update Notes (Submitted by Officer)
          </h4>
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-lg space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Key Progress Update</p>
              <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{latestUpdate.keyUpdate || 'No update notes provided.'}</p>
            </div>
            {latestUpdate.evidenceLink && (
            <div className="pt-2 border-t border-orange-100">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Evidence / Attachment Link</p>
              <a
                href={latestUpdate.evidenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline mt-1 inline-block"
              >
                {latestUpdate.evidenceLink}
              </a>
            </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Project Info
          </h4>
          {isWebmasterView && (
            <button
              type="button"
              onClick={() => setIsEditProjectModalOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 px-6 h-[50px] rounded-[14px] border-2 border-blue-600 text-blue-600 font-medium text-[19px] bg-transparent hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-all"
              aria-label="Edit Project"
            >
              <Pencil className="w-[22px] h-[22px]" />
              <span>Edit Project</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
          <p>
            <span className="font-semibold w-32 inline-block text-gray-700">Sen. District:</span>
            {' '}
            {project.senatorialDistrict || 'N/A'}
          </p>
          <p>
            <span className="font-semibold w-32 inline-block text-gray-700">Start Date:</span>
            {' '}
            {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
          </p>
          <p>
            <span className="font-semibold w-32 inline-block text-gray-700">Budget:</span>
            {' '}
            ₦
            {Number(project.approvedBudget).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold w-32 inline-block text-gray-700">Funding:</span>
            {' '}
            {project.fundingSource || 'N/A'}
          </p>
          <p className="md:col-span-2">
            <span className="font-semibold w-32 inline-block text-gray-700">Contractor:</span>
            {' '}
            {project.contractor || 'N/A'}
          </p>
        </div>
      </div>

      {/* Merged Issues List under Overview Tab */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Active Issues & Risks
        </h4>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
          {!issues.length ? (
            <p className="text-gray-500 italic text-sm">No active issues reported for this project.</p>
          ) : (
            issues.map((issue) => (
              <div key={issue.id} className="p-3 border border-orange-100 rounded-lg bg-orange-50/20 shadow-sm flex flex-col">
                <div className="flex justify-between mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${issue.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {issue.status}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(issue.logDate).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{issue.issueCategory}</p>
                <p className="text-xs text-gray-600 mt-0.5">{issue.issueItem}</p>
                {issue.notes && <p className="text-xs text-gray-500 mt-2 bg-white/80 border border-orange-100 p-2 rounded">{issue.notes}</p>}
              </div>
            ))
          )}
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
              <div className="w-full">
                <p className="text-xs text-gray-400 mb-1">{new Date(update.reportDate).toLocaleDateString()}</p>
                <p className="font-medium text-gray-800 text-sm">
                  {update.stage}
                  {' '}
                  -
                  {' '}
                  {update.physicalProgressPct}
                  %
                </p>
                <p className="text-sm text-gray-600 mt-1">{update.keyUpdate}</p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {update.milestoneStatus === 'Changes Required' && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                      Changes Required
                    </span>
                  )}
                  {update.milestoneStatus === 'Ready for Approval' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Ready for Approval
                    </span>
                  )}
                  {update.milestoneStatus === 'Approved' && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                      Approved
                    </span>
                  )}
                </div>

                {/* Chronological association of issues inside update card */}
                {update.issues && update.issues.length > 0 && (
                <div className="mt-3 pl-3 border-l-2 border-orange-300 bg-orange-50/40 p-2.5 rounded-r-lg space-y-2">
                  <p className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Associated Issue Reported:</p>
                  {update.issues.map((issue) => (
                    <div key={issue.id} className="text-xs text-gray-700">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-800">{issue.issueCategory}</span>
                        <span className="text-gray-400">|</span>
                        <span>{issue.issueItem}</span>
                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium ${issue.status === 'Open' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-gray-600 italic bg-white p-1.5 rounded border border-gray-100 mt-1">{issue.notes}</p>
                    </div>
                  ))}
                </div>
                )}
              </div>

              {/* Staff Action */}
              {!isApproverView && update.milestoneStatus === 'Changes Required' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity ml-2"
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Project Details" maxWidth="lg">
        {loading && !updates.length && !issues.length ? (
          <div className="h-64 flex justify-center items-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="mb-4 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{project.title}</h3>
            </div>
            {renderTabs()}

            <div className="min-h-[300px]">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'history' && renderHistory()}
            </div>

            <div className="mt-8 pt-4 border-t flex justify-between">
              <Button variant="outline" onClick={onClose}>Close</Button>

              {!isApproverView && (
                <Button onClick={() => {
                  setUpdateToEdit(null);
                  setIsUpdateModalOpen(true);
                }}
                >
                  Add Progress Update
                </Button>
              )}

              {isApproverView && latestUpdate && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!!actionLoading || latestUpdate.milestoneStatus === 'Approved' || localApprovedStatus}
                    onClick={() => {
                      setUpdateToEdit(latestUpdate);
                      setIsUpdateModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!!actionLoading || latestUpdate.milestoneStatus === 'Approved' || localApprovedStatus}
                    isLoading={actionLoading === latestUpdate.id}
                    onClick={() => handleApproveClick(latestUpdate.id)}
                  >
                    {latestUpdate.milestoneStatus === 'Approved' || localApprovedStatus ? 'Approved' : 'Approve'}
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
        projectId={project.projectId}
        projectTitle={project.title}
        existingUpdate={updateToEdit}
        onSuccess={() => {
          refetch();
          setIsUpdateModalOpen(false);
          if (onProgressUpdate) onProgressUpdate();
        }}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setReportIdToApprove(null);
        }}
        onConfirm={handleApproveConfirm}
        title="Approve Update"
        message="Are you sure you want to approve this progress update?"
        confirmText="Approve"
      />

      {isEditProjectModalOpen && (
        <EditProjectModal
          isOpen={isEditProjectModalOpen}
          onClose={() => setIsEditProjectModalOpen(false)}
          project={project}
          onSuccess={() => {
            setIsEditProjectModalOpen(false);
            if (onProgressUpdate) onProgressUpdate(); // trigger parent refresh
            onClose(); // Alternatively, close the project details modal to show updated data on reopening
          }}
        />
      )}
    </>
  );
}

export default ProjectDetailsModal;
