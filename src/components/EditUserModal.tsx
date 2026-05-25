import { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { MDA, UserProfile } from '../types/api';
import { FlattenedUser } from '../hooks/useUsers';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: FlattenedUser | null;
    mdas: MDA[];
    onSuccess: () => void;
    onUpdate: (id: string, data: { email: string; fullName: string; role: string; mdaId: string | null; password?: string }) => Promise<void>;
    currentUserRole: string | null | undefined;
}

const EditUserModal = ({ isOpen, onClose, user, mdas, onSuccess, onUpdate, currentUserRole }: EditUserModalProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'MDA_OFFICER' as 'MDA_OFFICER' | 'PPIMU_ADMIN' | 'WEBMASTER_ADMIN',
        mdaId: '',
        password: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                fullName: user.fullName || '',
                role: (user.role || 'MDA_OFFICER') as 'MDA_OFFICER' | 'PPIMU_ADMIN' | 'WEBMASTER_ADMIN',
                mdaId: user.mdaId || '',
                password: '',
            });
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        try {
            await onUpdate(user.id, {
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                mdaId: formData.role === 'WEBMASTER_ADMIN' ? null : formData.mdaId || null,
                password: formData.password || undefined,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating user:', error);
            alert(error.response?.data?.message || 'Failed to update user. Please check permissions.');
        } finally {
            setLoading(false);
        }
    };

    const isPPIMUAdmin = currentUserRole === 'PPIMU_ADMIN';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit User Details">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password (Leave blank to keep unchanged)</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Define new password (min 6 characters)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        minLength={6}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        disabled={isPPIMUAdmin} // Locked for PPIMU Admin since they can only manage MDA Officers
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:bg-gray-100 focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    >
                        <option value="MDA_OFFICER">MDA Officer</option>
                        <option value="PPIMU_ADMIN">PPIMU Admin</option>
                        <option value="WEBMASTER_ADMIN">Webmaster Admin</option>
                    </select>
                </div>

                {formData.role !== 'WEBMASTER_ADMIN' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">MDA</label>
                        <select
                            name="mdaId"
                            value={formData.mdaId}
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
                )}

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
                    <Button type="submit" isLoading={loading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
};

export default EditUserModal;
