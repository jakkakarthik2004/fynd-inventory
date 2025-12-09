import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpDown, AlertCircle, CheckCircle, AlertTriangle, Calendar, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InventoryTable({ items, sortConfig, onSort, viewMode }) {
  const { t } = useTranslation();
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'OK': return 'bg-green-100 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-400/20';
      case 'LOW': return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-900/30 dark:text-yellow-400 dark:ring-yellow-400/20';
      case 'REORDER': return 'bg-red-100 text-red-700 ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20';
      case 'PLACED': return 'bg-indigo-100 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-900/30 dark:text-indigo-400 dark:ring-indigo-400/20'; // For orders
      default: return 'bg-gray-100 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
        case 'OK': return <CheckCircle className="mr-1.5 h-3.5 w-3.5" />;
        case 'LOW': return <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />;
        case 'REORDER': return <AlertCircle className="mr-1.5 h-3.5 w-3.5" />;
        case 'PLACED': return <Package className="mr-1.5 h-3.5 w-3.5" />;
        default: return null;
    }
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />;
    return <ArrowUpDown className={`ml-2 h-4 w-4 ${sortConfig.direction ? 'text-indigo-600' : 'text-gray-400'}`} />;
  };

  if (viewMode === 'ORDERS') {
      return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">{t('item_name')}</th>
                <th className="px-6 py-4 font-semibold">{t('supplier')}</th>
                <th className="px-6 py-4 font-semibold">{t('quantity_in_stock')}</th>
                <th className="px-6 py-4 font-semibold">{t('order_by')}</th>
                <th className="px-6 py-4 font-semibold">{t('status')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-t border-gray-200 dark:divide-slate-700 dark:border-slate-700">
                {items.length > 0 ? (
                items.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{order.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.item_name}</td>
                    <td className="px-6 py-4">{order.supplier}</td>
                    <td className="px-6 py-4 font-medium">{order.quantity}</td>
                    <td className="px-6 py-4">{order.date_placed}</td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                        </span>
                    </td>
                    </tr>
                ))
                ) : (
                    <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                            No orders placed yet.
                        </td>
                    </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>
      );
  }

  // Default Inventory View
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm transition-colors">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase text-gray-700 dark:text-gray-300">
            <tr>
              <th 
                className="group cursor-pointer px-6 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onSort('item_name')}
              >
                <div className="flex items-center">
                  {t('item_name')}
                  <SortIcon column="item_name" />
                </div>
              </th>
              <th 
                className="group cursor-pointer px-6 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onSort('supplier')}
              >
                <div className="flex items-center">
                  {t('supplier')}
                  <SortIcon column="supplier" />
                </div>
              </th>
              <th 
                className="group cursor-pointer px-6 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onSort('quantity_in_stock')}
              >
                <div className="flex items-center">
                  {t('in_stock')}
                  <SortIcon column="quantity_in_stock" />
                </div>
              </th>
              <th 
                className="group cursor-pointer px-6 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onSort('reorder_threshold')}
              >
                <div className="flex items-center">
                  {t('threshold')}
                  <SortIcon column="reorder_threshold" />
                </div>
              </th>
              <th 
                className="group cursor-pointer px-6 py-4 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => onSort('reorder_status')}
              >
                <div className="flex items-center">
                  {t('status')}
                  <SortIcon column="reorder_status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 border-t border-gray-200 dark:border-gray-700">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <Link to={`/item/${item.id}`} className="block hover:text-indigo-600 dark:hover:text-indigo-400">
                      {item.item_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/item/${item.id}`} className="block">
                      {item.supplier}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    <Link to={`/item/${item.id}`} className="block">
                      {item.quantity_in_stock}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/item/${item.id}`} className="block">
                      {item.reorder_threshold}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/item/${item.id}`} className="block">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(item.reorder_status)}`}>
                          {getStatusIcon(item.reorder_status)}
                        {item.reorder_status}
                      </span>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
                <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        No items found matching your filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('showing_items', { count: items.length })}</p>
      </div>
    </div>
  );
}
