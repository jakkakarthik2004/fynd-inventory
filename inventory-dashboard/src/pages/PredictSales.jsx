import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Save, ArrowLeft } from 'lucide-react';
import { generateSalesForecast } from '../utils/geminiClient';
import { saveOrder } from '../utils/orderStorage';
import { useTranslation } from 'react-i18next';

export default function PredictSales() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [orders, setOrders] = useState({}); // { itemName: qty }

  const handlePredict = async () => {
    setLoading(true);
    try {
        // 1. Fetch Past Sales
        const res = await fetch('/api/boltic/past-sales');
        const json = await res.json();
        
        if (json.success) {
            const pastData = json.data;
            if (!pastData || pastData.length === 0) {
                alert("No past data found to predict from.");
                setLoading(false);
                return;
            }

            // 2. Call Gemini
            const result = await generateSalesForecast(pastData);
            setPrediction(result);
        } else {
            console.error("Failed to fetch past sales");
        }

    } catch (err) {
        console.error(err);
        alert("Prediction failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleOrderChange = (itemName, val) => {
      setOrders(prev => ({ ...prev, [itemName]: val }));
  };

  const placeOrder = async (recItem) => {
      const qty = orders[recItem.item_name] || recItem.suggested_order_qty;
      
      saveOrder({
          item_name: recItem.item_name,
          supplier: "AI Recommended", // Could look up real supplier if we had item map
          quantity: Number(qty),
          order_date: new Date().toISOString().split('T')[0],
          reason: `AI Prediction: ${recItem.reason}`
      });

      // Optional: Update Boltic if this was a known item ID. 
      // Since prediction might return generic names, we skip 'update-item' call unless we match it.
      // For now, simple save.
      
      alert(`Order placed for ${qty} units of ${recItem.item_name}`);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex items-center justify-between">
           <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                 <Brain className="h-8 w-8 text-indigo-600" />
                 {t('predict_upcoming_sales')}
               </h1>
               <p className="mt-2 text-gray-500 dark:text-gray-400">
                 Analyze past sales data (5 Years) to forecast future demand using Boltic AI.
               </p>
           </div>
           {!prediction && (
               <button 
                  onClick={handlePredict}
                  disabled={loading}
                  className="rounded-md bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 flex items-center gap-2"
               >
                  {loading ? (
                      <>Analyzing Data...</> 
                  ) : (
                      <><Sparkles className="h-4 w-4" /> {t('generate_prediction')}</>
                  )}
               </button>
           )}
        </div>

        {prediction && (
            <div className="space-y-6">
                {/* Summary Card */}
                <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-6 text-white shadow-xl">
                    <h2 className="text-2xl font-bold">{prediction.season_name} Forecast</h2>
                    <p className="mt-2 text-indigo-200">{t('growth_prediction')}: <span className="text-white font-bold">{prediction.overall_growth_prediction}</span></p>
                </div>

                {/* Recommendations Table */}
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Recommended Restock List</h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-slate-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('item_name')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('reason')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{t('recommended_order')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-900 dark:divide-gray-800">
                            {prediction.recommended_items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {item.item_name}
                                        <div className="text-xs text-gray-500 font-normal">{item.current_stock_context} Stock</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                                        {item.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <input 
                                            type="number" 
                                            defaultValue={item.suggested_order_qty}
                                            onChange={(e) => handleOrderChange(item.item_name, e.target.value)}
                                            className="w-20 rounded border-gray-300 py-1 px-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button 
                                            onClick={() => placeOrder(item)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                                        >
                                            <Save className="h-4 w-4" /> {t('place_order')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end">
                    <button onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                        {t('back_to_dashboard')}
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
