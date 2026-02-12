
import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin'; // Assuming useAdmin handles creation
import Modal from './ui/Modal';
import Button from './ui/Button';
import { MDA } from '../types/supabase';

interface NewUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    mdas: MDA[];
    onSuccess: () => void;
}

const NewUserModal = ({ isOpen, onClose, mdas, onSuccess }: NewUserModalProps) => {
    const { createUser, loading: adminLoading } = useAdmin();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        role: 'user' as 'user' | 'approver' | 'super_user',
        mda_id: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(formData.email, formData.full_name, formData.role, formData.mda_id);
            onSuccess();
            onClose();
            // Reset
            setFormData({
                email: '',
                full_name: '',
                role: 'user',
                mda_id: '',
            });
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user. Please ensure you are an admin and service is reachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    >
                        <option value="user">User (Engineer)</option>
                        <option value="approver">Approver (Chairman)</option>
                        <option value="super_user">Super User (Admin)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MDA</label>
                    <select
                        name="mda_id"
                        value={formData.mda_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    >
                        <option value="">Select MDA</option>
                        {mdas.map(mda => (
                            <option key={mda.id} value={mda.id}>
                                {mda.name} ({mda.code})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button type="submit" isLoading={loading || adminLoading}>Create User</Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewUserModal;
