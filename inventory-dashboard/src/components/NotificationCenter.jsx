import React, { useState } from 'react';
import { Bell, AlertTriangle } from 'lucide-react';

export default function NotificationCenter({ notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] items-center justify-center flex font-bold text-white border-2 border-white dark:border-gray-900">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900 dark:text-white">Notifications</span>
                <span className="text-xs text-gray-400 cursor-pointer hover:text-indigo-500">Mark all read</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">
                        No new alerts
                    </div>
                ) : (
                    notifications.map((note, idx) => (
                        <div key={idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-start gap-3 border-b border-gray-50 dark:border-gray-800 last:border-0 transition-colors">
                            <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{note.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{note.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">{note.time}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
}
