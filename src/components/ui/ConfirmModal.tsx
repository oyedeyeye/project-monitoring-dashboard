
import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    type?: 'danger' | 'primary';
}

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
    type = 'primary'
}: ConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">{message}</p>
                <div className="flex justify-end space-x-3 pt-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={type === 'danger' ? 'danger' : 'primary'}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
