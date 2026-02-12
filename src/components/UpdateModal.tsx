
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Modal from './ui/Modal';
import Button from './ui/Button';

interface UpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
    projectTitle: string;
    onSuccess: () => void;
}

const UpdateModal = ({ isOpen, onClose, projectId, projectTitle, onSuccess }: UpdateModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        report_date: new Date().toISOString().split('T')[0],
        physical_progress_pct: 0,
        stage: 'Execution',
        milestone_status: 'On Track',
        key_update: '',
        evidence_link: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('progress_updates').insert({
                project_id: projectId,
                report_date: formData.report_date,
                physical_progress_pct: Number(formData.physical_progress_pct),
                stage: formData.stage,
                milestone_status: formData.milestone_status,
                key_update: formData.key_update,
                evidence_link: formData.evidence_link || null,
            });

            if (error) throw error;

            onSuccess();
            onClose();
            // Reset form
            setFormData({
                report_date: new Date().toISOString().split('T')[0],
                physical_progress_pct: 0,
                stage: 'Execution',
                milestone_status: 'On Track',
                key_update: '',
                evidence_link: '',
            });

        } catch (error) {
            console.error('Error submitting update:', error);
            alert('Failed to submit update. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Update Progress: ${projectTitle}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                    <input
                        type="date"
                        name="report_date"
                        value={formData.report_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                        <input
                            type="number"
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key Update / Comments</label>
                    <textarea
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Evidence Link (Optional)</label>
                    <input
                        type="url"
                        name="evidence_link"
                        value={formData.evidence_link}
                        onChange={handleChange}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button type="submit" isLoading={loading}>Submit Update</Button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateModal;
