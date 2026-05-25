import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { AppNotification } from '../hooks/useNotifications';
import { Bell, Check, Trash2, MailOpen, AlertCircle } from 'lucide-react';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: AppNotification[];
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
    onNotificationClick: (notif: AppNotification) => void;
}

export const NotificationModal = ({
    isOpen,
    onClose,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    onNotificationClick,
}: NotificationModalProps) => {

    const formatTime = (isoString: string) => {
        try {
            const date = new Date(isoString);
            return date.toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return isoString;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submissions & Notifications" maxWidth="md">
            <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-500">
                        {notifications.length} Total Update{notifications.length !== 1 ? 's' : ''}
                    </p>
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-orange-600 hover:text-orange-700">
                                Mark all read
                            </Button>
                            <Button variant="ghost" size="sm" onClick={clearAll} className="text-xs text-red-600 hover:text-red-700">
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-400 space-y-2">
                            <Bell className="w-8 h-8 mx-auto stroke-current opacity-50" />
                            <p className="text-sm italic">No notifications found.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div
                                key={notif.id}
                                className={`p-3 rounded-lg border transition-all flex justify-between items-start gap-3 cursor-pointer ${
                                    notif.read
                                        ? 'bg-gray-50 border-gray-200 opacity-75 hover:bg-gray-100'
                                        : 'bg-orange-50/50 border-orange-100 hover:bg-orange-50'
                                }`}
                                onClick={() => onNotificationClick(notif)}
                            >
                                <div className="space-y-1 flex-1">
                                    <div className="flex items-center gap-1.5">
                                        {!notif.read && (
                                            <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                        )}
                                        <p className="text-xs font-semibold text-orange-800 uppercase tracking-wider">
                                            {notif.mdaName}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                                        {notif.projectTitle}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Progress: <strong className="text-gray-700">{notif.physicalProgressPct}%</strong></span>
                                        <span>•</span>
                                        <span>{formatTime(notif.submittedAt)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {!notif.read && (
                                        <button
                                            onClick={() => markAsRead(notif.id)}
                                            className="p-1 hover:bg-white rounded border border-gray-200 text-gray-500 hover:text-green-600 transition-colors"
                                            title="Mark as Read"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notif.id)}
                                        className="p-1 hover:bg-white rounded border border-gray-200 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Delete Notification"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
