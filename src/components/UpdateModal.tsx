import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { ProgressUpdate } from '../types/api';
import { useProgressUpdates } from '../hooks/useProgressUpdates';
import { useIssues } from '../hooks/useIssues';
import { useAuth } from '../context/AuthContext';
import { ISSUE_CATEGORIES, ISSUE_CATEGORY_OPTIONS } from '../constants/issueCategories';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  projectTitle: string;
  existingUpdate?: ProgressUpdate | null;
  onSuccess: () => void;
}

function UpdateModal({
  isOpen, onClose, projectId, projectTitle, existingUpdate, onSuccess,
}: UpdateModalProps) {
  const {
    createUpdate, updateUpdate, isCreating, isUpdating,
  } = useProgressUpdates();
  const {
    createIssue, updateIssue, deleteIssue, isCreating: isCreatingIssue, isUpdating: isUpdatingIssue, isDeleting: isDeletingIssue,
  } = useIssues();
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'PPIMU_ADMIN' || profile?.role === 'WEBMASTER_ADMIN';

  const loading = isCreating || isUpdating || isCreatingIssue || isUpdatingIssue || isDeletingIssue;

  const [formData, setFormData] = useState({
    reportDate: existingUpdate?.reportDate.split('T')[0] || new Date().toISOString().split('T')[0],
    physicalProgressPct: existingUpdate?.physicalProgressPct || 0,
    stage: existingUpdate?.stage || 'Yet to Start',
    keyUpdate: existingUpdate?.keyUpdate || '',
    evidenceLink: existingUpdate?.evidenceLink || '',
  });

  // Issue state
  const [reportIssue, setReportIssue] = useState(false);
  const [issueCategory, setIssueCategory] = useState('');
  const [issueItem, setIssueItem] = useState('');
  const [issueNotes, setIssueNotes] = useState('');

  const [actionType, setActionType] = useState<'DRAFT' | 'SUBMITTED'>('SUBMITTED');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        reportDate: existingUpdate?.reportDate.split('T')[0] || new Date().toISOString().split('T')[0],
        physicalProgressPct: existingUpdate?.physicalProgressPct || 0,
        stage: existingUpdate?.stage || 'Yet to Start',
        keyUpdate: existingUpdate?.keyUpdate || '',
        evidenceLink: existingUpdate?.evidenceLink || '',
      });

      if (existingUpdate?.issues && existingUpdate.issues.length > 0) {
        const firstIssue = existingUpdate.issues[0];
        setReportIssue(true);
        setIssueCategory(firstIssue.issueCategory);
        setIssueItem(firstIssue.issueItem);
        setIssueNotes(firstIssue.notes);
      } else {
        setReportIssue(false);
        setIssueCategory('');
        setIssueItem('');
        setIssueNotes('');
      }
    }
  }, [isOpen, existingUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setIssueCategory(cat);
    setIssueItem('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    if (reportIssue && (!issueCategory || !issueItem || !issueNotes.trim())) {
      alert(isAdmin ? 'Please fill out all issue details.' : 'Please fill out all issue details or remove the issue report.');
      return;
    }

    try {
      const payload = {
        projectId,
        reportDate: new Date(formData.reportDate).toISOString(),
        physicalProgressPct: Number(formData.physicalProgressPct),
        stage: formData.stage,
        milestoneStatus: actionType === 'SUBMITTED' ? 'Ready for Approval' : 'Draft',
        status: actionType,
        keyUpdate: formData.keyUpdate,
        evidenceLink: formData.evidenceLink || null,
      };

      let savedUpdateRecord: any;
      if (existingUpdate) {
        savedUpdateRecord = await updateUpdate({ id: existingUpdate.id, payload });
      } else {
        savedUpdateRecord = await createUpdate(payload);
      }

      const updateId = existingUpdate ? existingUpdate.id : savedUpdateRecord?.id;

      // Handle integrated issue association
      if (reportIssue) {
        const existingIssue = existingUpdate?.issues?.[0];
        if (existingIssue) {
          // Update existing issue
          await updateIssue({
            id: existingIssue.id,
            payload: {
              issueCategory,
              issueItem,
              notes: issueNotes,
            },
          });
        } else {
          // Create new issue linked to this update
          await createIssue({
            projectId,
            logDate: new Date().toISOString(),
            issueCategory,
            issueItem,
            severity: 3,
            owner: profile?.fullName || 'Unknown User',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'Open',
            notes: issueNotes,
            followUp: null,
            progressUpdateId: updateId,
          });
        }
      } else {
        // If user unchecked or didn't select, but an issue existed previously, delete it
        const existingIssue = existingUpdate?.issues?.[0];
        if (existingIssue) {
          await deleteIssue(existingIssue.id);
        }
      }

      onSuccess();
      onClose();

      if (!existingUpdate) {
        setFormData({
          reportDate: new Date().toISOString().split('T')[0],
          physicalProgressPct: 0,
          stage: 'Yet to Start',
          keyUpdate: '',
          evidenceLink: '',
        });
        setReportIssue(false);
        setIssueCategory('');
        setIssueItem('');
        setIssueNotes('');
      }
    } catch (error) {
      console.error('Error submitting update:', error);
      alert('Failed to submit update. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${existingUpdate ? 'Edit' : 'Submit'} Progress: ${projectTitle}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
          <input
            type="date"
            id="reportDate"
            name="reportDate"
            value={formData.reportDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="physicalProgressPct" className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input
              type="number"
              id="physicalProgressPct"
              name="physicalProgressPct"
              min="0"
              max="100"
              value={formData.physicalProgressPct}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
              required
            />
          </div>
          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
            <select
              id="stage"
              name="stage"
              value={formData.stage}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow bg-white"
            >
              <option value="Yet to Start">Yet to Start</option>
              <option value="In-progress">In-progress</option>
              <option value="Paused">Paused</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="keyUpdate" className="block text-sm font-medium text-gray-700 mb-1">Key Update / Comments</label>
          <textarea
            id="keyUpdate"
            name="keyUpdate"
            rows={3}
            value={formData.keyUpdate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
            placeholder="Describe current achievements or blockers..."
            required
          />
        </div>

        <div>
          <label htmlFor="evidenceLink" className="block text-sm font-medium text-gray-700 mb-1">Evidence Link (Optional)</label>
          <input
            type="url"
            id="evidenceLink"
            name="evidenceLink"
            value={formData.evidenceLink}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
          />
        </div>

        {/* Report Issue Button */}
        {!isAdmin && (
        <div className="border-t border-gray-100 pt-4 flex justify-start">
          <button
            type="button"
            onClick={() => {
              const nextVal = !reportIssue;
              setReportIssue(nextVal);
              if (!nextVal) {
                setIssueCategory('');
                setIssueItem('');
                setIssueNotes('');
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              reportIssue
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border border-red-200 text-red-600 hover:bg-red-50 bg-white'
            }`}
          >
            {reportIssue ? 'Remove Issue Report' : 'Report Issue / Risk'}
          </button>
        </div>
        )}

        {reportIssue && (
        <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl space-y-4 mt-2">
          <h4 className="text-sm font-semibold text-orange-800">
            {isAdmin ? 'Reported Issue / Risk (Officer Selection)' : 'Issue / Risk Details'}
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="issueCategory" className="block text-sm font-medium text-gray-700 mb-1 text-xs">Category</label>
              <select
                id="issueCategory"
                value={issueCategory}
                onChange={handleCategoryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-shadow text-sm"
                required={reportIssue}
              >
                <option value="">Select Category</option>
                {ISSUE_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="issueItem" className="block text-sm font-medium text-gray-700 mb-1 text-xs">Specific Issue</label>
              <select
                id="issueItem"
                value={issueItem}
                onChange={(e) => setIssueItem(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-shadow text-sm"
                disabled={!issueCategory}
                required={reportIssue}
              >
                <option value="">Select Issue</option>
                {issueCategory && ISSUE_CATEGORIES[issueCategory]?.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="issueNotes" className="block text-sm font-medium text-gray-700 mb-1 text-xs">Issue Description / Notes</label>
            <textarea
              id="issueNotes"
              rows={2}
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow text-sm"
              placeholder="Provide specific details about this issue..."
              required={reportIssue}
            />
          </div>
        </div>
        )}

        <div className="flex justify-end pt-4 gap-2 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="outline" onClick={() => setActionType('DRAFT')} isLoading={loading && actionType === 'DRAFT'}>
            Save Draft
          </Button>
          <Button type="submit" variant="primary" onClick={() => setActionType('SUBMITTED')} isLoading={loading && actionType === 'SUBMITTED'}>
            Submit Update
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default UpdateModal;
