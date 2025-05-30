import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import NotificationService, { Notification } from '@/utils/notificationService';

const ICONS = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const COLORS = {
  success: 'bg-green-50 text-green-800',
  error: 'bg-red-50 text-red-800',
  warning: 'bg-yellow-50 text-yellow-800',
  info: 'bg-blue-50 text-blue-800',
};

export default function NotificationComponent() {
  const [notifications, setNotifications] = useState<(Notification & { id: number })[]>([]);
  let nextId = 0;

  useEffect(() => {
    const unsubscribe = NotificationService.subscribe((notification) => {
      const id = nextId++;
      setNotifications(prev => [...prev, { ...notification, id }]);

      if (notification.duration !== 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, notification.duration || 3000);
      }
    });

    return unsubscribe;
  }, []);

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(({ id, type, message }) => {
        const Icon = ICONS[type];
        const colorClass = COLORS[type];

        return (
          <div
            key={id}
            className={`flex items-center p-4 rounded-lg shadow-lg ${colorClass} transition-all duration-300`}
          >
            <Icon className="h-5 w-5 mr-3" />
            <p className="mr-3">{message}</p>
            <button
              onClick={() => removeNotification(id)}
              className="ml-auto"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
} 