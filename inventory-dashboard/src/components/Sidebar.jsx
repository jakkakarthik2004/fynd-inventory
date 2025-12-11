import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Building2, Settings, LogOut, Package, Moon, Sun, PackagePlus, Sparkles, Gift, ShieldAlert, Truck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const navItems = [
    { name: t('dashboard'), icon: LayoutGrid, path: '/' },
    { name: t('manual_order'), icon: PackagePlus, path: '/manual-order' },
    { name: t('predict_sales'), icon: Sparkles, path: '/predict-sales' },
    { name: t('smart_bundles'), icon: Gift, path: '/smart-bundles' },
    { name: t('safety_stock'), icon: ShieldAlert, path: '/safety-stock' },
    { name: t('stock_transfers'), icon: Truck, path: '/stock-transfers' },
    { name: t('suppliers'), icon: Building2, path: '/suppliers' },
    // { name: 'Analytics', icon: BarChart3, path: '/analytics' }, // Future
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 overflow-y-auto transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none shadow-md">
          <Package className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Boltic Inventory Manager</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-1">
        <button 
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        
        {/* Language Selector */}
        <div className="px-3 py-2">
            <select 
                className="w-full text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                defaultValue={i18n.language}
            >
                <option value="en">🇺🇸 English</option>
                <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
            </select>
        </div>

        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white">
          <Settings className="h-5 w-5" />
          {t('settings')}
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="h-5 w-5" />
          {t('logout')}
        </button>
      </div>
      
      {/* User Mini Profile */}
      <div className="px-4 pb-6 pt-2">
           <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                    JS
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">John Smith</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Admin</span>
                </div>
           </div>
      </div>
    </div>
  );
}
