import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const ConfirmationModal: React.FC = () => {
  const { confirmation, hideConfirmation, handleConfirm } = useApp() as any;

  if (!confirmation?.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[99]" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
                <AlertTriangle className="text-red-600" size={24}/>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{confirmation.title}</h3>
          </div>
          <button onClick={hideConfirmation} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="text-gray-600 mb-6">
          {confirmation.message}
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={hideConfirmation}
            className="px-4 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
            Confirm
          </button>
        </div>
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

export default ConfirmationModal;