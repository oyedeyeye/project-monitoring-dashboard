import { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { ProgressUpdate } from '../types/api';
import { useProgressUpdates } from '../hooks/useProgressUpdates';

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
    projectTitle: string;
    existingUpdate?: ProgressUpdate | null;
    onSuccess: () => void;
}

const UpdateModal = ({ isOpen, onClose, projectId, projectTitle, existingUpdate, onSuccess }: UpdateModalProps) => {
    const { createUpdate, updateUpdate, isCreating, isUpdating } = useProgressUpdates();
    const loading = isCreating || isUpdating;

    const [formData, setFormData] = useState({
        reportDate: existingUpdate?.reportDate.split('T')[0] || new Date().toISOString().split('T')[0],
        physicalProgressPct: existingUpdate?.physicalProgressPct || 0,
        stage: existingUpdate?.stage || 'Execution',
        keyUpdate: existingUpdate?.keyUpdate || '',
        evidenceLink: existingUpdate?.evidenceLink || '',
    });

    const [actionType, setActionType] = useState<'DRAFT' | 'SUBMITTED'>('SUBMITTED');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        try {
            const payload = {
                projectId: projectId,
                reportDate: new Date(formData.reportDate).toISOString(),
                physicalProgressPct: Number(formData.physicalProgressPct),
                stage: formData.stage,
                milestoneStatus: actionType === 'SUBMITTED' ? 'Ready for Approval' : 'Draft',
                status: actionType,
                keyUpdate: formData.keyUpdate,
                evidenceLink: formData.evidenceLink || null,
            };

            if (existingUpdate) {
                await updateUpdate({ id: existingUpdate.id, payload });
            } else {
                await createUpdate(payload);
            }

            onSuccess();
            onClose();
            if (!existingUpdate) {
                setFormData({
                    reportDate: new Date().toISOString().split('T')[0],
                    physicalProgressPct: 0,
                    stage: 'Execution',
                    keyUpdate: '',
                    evidenceLink: '',
                });
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        >
                            <option value="Planning">Planning</option>
                            <option value="Execution">Execution</option>
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

                <div className="flex justify-end pt-4 gap-2">
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
};

export default UpdateModal;
