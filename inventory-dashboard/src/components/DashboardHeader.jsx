import React from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader(props) {
  const { t } = useTranslation();
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('overview')}</h1>
           <p className="text-sm text-gray-500 dark:text-gray-400">{t('manage_inventory')}</p>
        </div>
        <div className="flex items-center gap-4">
            {/* Slot for Market Pulse & Notifications */}
            {props.children}
        </div>
    </header>
  );
}
