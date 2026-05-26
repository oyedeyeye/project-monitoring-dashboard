import { useState } from 'react';
import { api } from '../lib/api';
import Modal from './ui/Modal';
import Button from './ui/Button';

import { ProgressUpdate } from '../types/api';

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
    projectTitle: string;
    existingUpdate?: ProgressUpdate | null;
    onSuccess: () => void;
}

const UpdateModal = ({ isOpen, onClose, projectId, projectTitle, existingUpdate, onSuccess }: UpdateModalProps) => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        report_date: existingUpdate?.report_date.split('T')[0] || new Date().toISOString().split('T')[0],
        physical_progress_pct: existingUpdate?.physical_progress_pct || 0,
        stage: existingUpdate?.stage || 'Execution',
        key_update: existingUpdate?.key_update || '',
        evidence_link: existingUpdate?.evidence_link || '',
    });

    const [actionType, setActionType] = useState<'DRAFT' | 'SUBMITTED'>('SUBMITTED');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        setLoading(true);
        try {
            const payload = {
                projectId: projectId,
                reportDate: new Date(formData.report_date).toISOString(),
                physicalProgressPct: Number(formData.physical_progress_pct),
                stage: formData.stage,
                milestoneStatus: actionType === 'SUBMITTED' ? 'Ready for Approval' : 'Draft',
                status: actionType,
                keyUpdate: formData.key_update,
                evidenceLink: formData.evidence_link || null,
            };

            if (existingUpdate) {
                await api.put(`/progress-updates/${existingUpdate.id}`, payload);
            } else {
                await api.post('/progress-updates', payload);
            }

            onSuccess();
            onClose();
            if (!existingUpdate) {
                setFormData({
                    report_date: new Date().toISOString().split('T')[0],
                    physical_progress_pct: 0,
                    stage: 'Execution',
                    key_update: '',
                    evidence_link: '',
                });
            }

        } catch (error) {
            console.error('Error submitting update:', error);
            alert('Failed to submit update. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${existingUpdate ? 'Edit' : 'Submit'} Progress: ${projectTitle}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="report_date" className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                    <input
                        type="date"
                        id="report_date"
                        name="report_date"
                        value={formData.report_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="physical_progress_pct" className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                        <input
                            type="number"
                            id="physical_progress_pct"
                            name="physical_progress_pct"
                            min="0"
                            max="100"
                            value={formData.physical_progress_pct}
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
                    <label htmlFor="key_update" className="block text-sm font-medium text-gray-700 mb-1">Key Update / Comments</label>
                    <textarea
                        id="key_update"
                        name="key_update"
                        rows={3}
                        value={formData.key_update}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        placeholder="Describe current achievements or blockers..."
                        required
                    />
                </div>

                <div>
                    <label htmlFor="evidence_link" className="block text-sm font-medium text-gray-700 mb-1">Evidence Link (Optional)</label>
                    <input
                        type="url"
                        id="evidence_link"
                        name="evidence_link"
                        value={formData.evidence_link}
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
