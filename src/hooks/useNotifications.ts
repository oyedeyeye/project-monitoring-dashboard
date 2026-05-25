import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export interface AppNotification {
    id: string;
    projectId: string;
    projectTitle: string;
    mdaName: string;
    submittedAt: string;
    physicalProgressPct: number;
    read: boolean;
}

const LOCAL_STORAGE_KEY = 'ppmiu_admin_notifications';

export const useNotifications = () => {
    const { user, profile } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // Load from LocalStorage on mount or when user changes
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }
        const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${user.id}`);
        if (stored) {
            try {
                setNotifications(JSON.parse(stored));
            } catch (e) {
                console.error('Error parsing notifications', e);
            }
        }
    }, [user]);

    // Save to LocalStorage helper
    const saveNotifications = useCallback((newNotifications: AppNotification[]) => {
        if (user) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.id}`, JSON.stringify(newNotifications));
        }
        setNotifications(newNotifications);
    }, [user]);

    // Establish SSE stream
    useEffect(() => {
        const isPpimu = profile?.role === 'PPIMU_ADMIN';
        const isWebmaster = profile?.role === 'WEBMASTER_ADMIN';

        if (!user || (!isPpimu && !isWebmaster)) {
            return;
        }

        const token = localStorage.getItem('access_token');
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const sseUrl = `${baseUrl}/notifications/stream?token=${token}`;

        console.log('Establishing real-time notification stream...');
        const eventSource = new EventSource(sseUrl);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Real-time notification received:', data);

                const newNotif: AppNotification = {
                    id: data.id,
                    projectId: data.projectId,
                    projectTitle: data.projectTitle,
                    mdaName: data.mdaName,
                    submittedAt: data.submittedAt || new Date().toISOString(),
                    physicalProgressPct: Number(data.physicalProgressPct),
                    read: false,
                };

                // Add to list (avoid duplicates)
                setNotifications((prev) => {
                    if (prev.some((n) => n.id === newNotif.id)) {
                        return prev;
                    }
                    const updated = [newNotif, ...prev];
                    if (user) {
                        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${user.id}`, JSON.stringify(updated));
                    }
                    return updated;
                });
            } catch (e) {
                console.error('Error parsing SSE event data:', e);
            }
        };

        eventSource.onerror = (err) => {
            console.error('EventSource connection error:', err);
            // Browser automatically reconnects after a delay
        };

        return () => {
            console.log('Closing real-time notification stream.');
            eventSource.close();
        };
    }, [user, profile]);

    const markAsRead = useCallback((id: string) => {
        const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    const markAllAsRead = useCallback(() => {
        const updated = notifications.map((n) => ({ ...n, read: true }));
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    const deleteNotification = useCallback((id: string) => {
        const updated = notifications.filter((n) => n.id !== id);
        saveNotifications(updated);
    }, [notifications, saveNotifications]);

    const clearAll = useCallback(() => {
        saveNotifications([]);
    }, [saveNotifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
};
