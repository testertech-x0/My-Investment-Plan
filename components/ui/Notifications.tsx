import React from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Notification } from '../../types';

const iconMap = {
  success: <CheckCircle className="text-green-500" size={24} />,
  error: <XCircle className="text-red-500" size={24} />,
  info: <Info className="text-blue-500" size={24} />,
};

const Notifications: React.FC = () => {
  const { notifications } = useApp() as any; // Cast to any to access notifications

  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center p-4 pt-20 pointer-events-none z-[100]">
      <div className="w-full max-w-sm space-y-3">
        {notifications.map((notification: Notification) => (
          <div
            key={notification.id}
            className="w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in-up"
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {iconMap[notification.type]}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Notifications;