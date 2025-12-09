import React from 'react';
import { Search, Filter, ShoppingBag, Package, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Filters({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  supplierFilter, 
  setSupplierFilter,
  suppliers,
  viewMode,
  setViewMode,
  onExport
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between transition-colors">
      
      {/* Search */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder={viewMode === 'ORDERS' ? t('search_orders') : t('search_items')}
          className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 placeholder-gray-500 dark:placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* View Toggle */}
      <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
         <button
            onClick={() => setViewMode('INVENTORY')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === 'INVENTORY' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
         >
            <Package className="h-4 w-4" />
            {t('inventory')}
         </button>
         <button
            onClick={() => setViewMode('ORDERS')}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === 'ORDERS' ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
         >
            <ShoppingBag className="h-4 w-4" />
            {t('placed_orders')}
         </button>
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Download className="h-4 w-4" />
        {t('export')}
      </button>

      {/* Filters (Only show for Inventory view for simplicity, or adapt) */}
      {viewMode === 'INVENTORY' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Filter className="h-4 w-4 text-gray-500" />
                </div>
                <select
                    className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 pl-10 pr-8 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:w-48"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">{t('all_statuses')}</option>
                    <option value="OK">OK</option>
                    <option value="LOW">{t('low_stock_items')}</option>
                    <option value="REORDER">{t('reorder_needed')}</option>
                    <option value="DEAD_STOCK">Dead Stock</option>
                </select>
            </div>

            <select
            className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500 sm:w-48"
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            >
            <option value="ALL">{t('all_suppliers')}</option>
            {suppliers.map(s => (
                <option key={s} value={s}>{s}</option>
            ))}
            </select>
        </div>
      )}
    </div>
  );
}
