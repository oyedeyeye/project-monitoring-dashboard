
import { useState } from 'react';
import { useAdmin } from '../hooks/useAdmin'; // Assuming useAdmin handles creation
import Modal from './ui/Modal';
import Button from './ui/Button';
import { MDA } from '../types/api';

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
        role: 'MDA_OFFICER' as 'MDA_OFFICER' | 'PPIMU_ADMIN' | 'WEBMASTER_ADMIN',
        mda_id: '',
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(formData.email, formData.full_name, formData.role, formData.mda_id, formData.password);
            onSuccess();
            onClose();
            // Reset
            setFormData({
                email: '',
                full_name: '',
                role: 'MDA_OFFICER',
                mda_id: '',
                password: '',
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
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Define initial password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                        required
                        minLength={6}
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 outline-none transition-shadow"
                    >
                        <option value="MDA_OFFICER">MDA Officer</option>
                        <option value="PPIMU_ADMIN">PPIMU Admin</option>
                        <option value="WEBMASTER_ADMIN">Webmaster Admin</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="mda_id" className="block text-sm font-medium text-gray-700 mb-1">MDA</label>
                    <select
                        id="mda_id"
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
