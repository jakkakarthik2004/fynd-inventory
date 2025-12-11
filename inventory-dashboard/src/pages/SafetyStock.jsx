import React, { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, RefreshCw } from 'lucide-react';
import { calculateSafetyStock } from '../utils/geminiClient';
import { useTranslation } from 'react-i18next';

export default function SafetyStock() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState({}); // itemId -> analysisData

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/boltic/new-table');
        const json = await response.json();
        
        if (json.success) {
             setItems(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const analyzeStock = async (item) => {
      setAnalysis(prev => ({ ...prev, [item.id]: { loading: true } }));
      
      // Simulate Volatility for demo purposes
      const volatility = Math.random() > 0.5 ? "High (Spiky Demand)" : "Low (Stable)";
      
      const result = await calculateSafetyStock(item, volatility);
      
      setAnalysis(prev => ({ ...prev, [item.id]: { ...result, volatility } }));
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <ShieldAlert className="h-8 w-8 text-orange-600" />
             {t('dynamic_safety_stock')}
           </h1>
           <p className="mt-2 text-gray-500 dark:text-gray-400">
             AI calculates the perfect buffer stock based on demand volatility to prevent stockouts.
           </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('item_name')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('current_config')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('ai_recommendation')}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-slate-900">
                    {items.map(item => (
                        <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {item.item_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {item.reorder_threshold} units
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {analysis[item.id] ? (
                                    analysis[item.id].loading ? (
                                        <span className="text-xs animate-pulse">Calculating...</span>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {analysis[item.id].recommended_safety_stock} units
                                                {analysis[item.id].recommended_safety_stock > item.reorder_threshold ? (
                                                    <TrendingUp className="h-3 w-3 text-red-500" />
                                                ) : (
                                                    <TrendingUp className="h-3 w-3 text-green-500 transform rotate-180" />
                                                )}
                                            </span>
                                            <span className="text-xs text-gray-400">{t('risk_assessment')}: {analysis[item.id].risk_assessment}</span>
                                        </div>
                                    )
                                ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {!analysis[item.id] ? (
                                    <button 
                                        onClick={() => analyzeStock(item)}
                                        className="text-indigo-600 hover:text-indigo-900 font-medium text-xs border border-indigo-200 px-2 py-1 rounded"
                                    >
                                        {t('analyze')}
                                    </button>
                                ) : (
                                    <button 
                                        disabled={analysis[item.id].loading}
                                        className="text-green-600 hover:text-green-900 font-medium text-xs flex items-center gap-1"
                                    >
                                        <RefreshCw className="h-3 w-3" /> Update Config
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
