import React from 'react';
import { Box, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function KPICards({ data }) {
  const { t } = useTranslation();
  const totalSKUs = data.length;
  const lowStock = data.filter(item => item.reorder_status === 'LOW').length;
  const reorderNow = data.filter(item => item.reorder_status === 'REORDER').length;
  
  // Example "Out of Stock" if quantity is 0 (assuming reorder implies low but maybe not 0)
  // For strict "Out of Stock", let's say quantity === 0.
  const outOfStock = data.filter(item => item.quantity_in_stock === 0).length;

  const stats = [
    {
      label: t('total_skus'),
      value: totalSKUs,
      icon: Box,
      color: 'bg-blue-500',
      textColor: 'text-blue-500 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: t('low_stock_items'),
      value: lowStock,
      icon: TrendingDown,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      label: t('reorder_needed'),
      value: reorderNow,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600 dark:text-red-400',
      bgLight: 'bg-red-50 dark:bg-red-900/20'
    },
    {
      label: t('out_of_stock'),
      value: outOfStock,
      icon: XCircle,
      color: 'bg-gray-500',
      textColor: 'text-gray-600 dark:text-gray-400',
      bgLight: 'bg-gray-50 dark:bg-gray-800'
    }
  ];

  return (
    <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`rounded-lg ${stat.bgLight} p-3`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
