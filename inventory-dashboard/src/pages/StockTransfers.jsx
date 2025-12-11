import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Truck, Store, Warehouse, ArrowRight, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { generateTransferStrategy } from '../utils/geminiClient';

export default function StockTransfers() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [transfers, setTransfers] = useState({}); // itemId -> transferData

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/boltic/new-table');
        const json = await response.json();
        
        if (json.success) {
             // Simulate Multi-Location Data
             const mapped = json.data.slice(0, 10).map(item => {
                 const total = item.quantity_in_stock;
                 // Random skewed distribution simulation
                 const warehouse = Math.floor(total * (0.4 + Math.random() * 0.4)); // 40-80%
                 const remaining = total - warehouse;
                 const downtown = Math.floor(remaining * 0.6);
                 const suburban = remaining - downtown;

                 return {
                     ...item,
                     locations: {
                         warehouse,
                         downtown,
                         suburban
                     }
                 };
             });
             setItems(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const analyzeTransfer = async (item) => {
      setTransfers(prev => ({ ...prev, [item.id]: { loading: true } }));
      const strategy = await generateTransferStrategy(item, item.locations);
      setTransfers(prev => ({ ...prev, [item.id]: strategy }));
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Truck className="h-8 w-8 text-blue-600" />
             Smart Cost Transfers
           </h1>
           <p className="mt-2 text-gray-500 dark:text-gray-400">
             Multi-Warehouse Intelligence: Move stock to where demand is highest.
           </p>
        </div>

        <div className="grid gap-6">
            {items.map(item => (
                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Item Info */}
                        <div className="min-w-[200px]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{item.item_name}</h3>
                            <div className="text-sm text-gray-500">Total Stock: {item.quantity_in_stock}</div>
                        </div>

                        {/* Visualization of Current State */}
                        <div className="flex-1 flex items-center justify-center gap-4 text-center">
                            <div className="flex flex-col items-center">
                                <div className="p-3 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                    <Warehouse className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium mt-1 text-gray-600 dark:text-gray-400">Warehouse</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.locations.warehouse}</span>
                            </div>
                            
                            <div className="h-px w-12 bg-gray-300"></div>

                            <div className="flex flex-col items-center">
                                <div className="p-3 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                    <Store className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium mt-1 text-gray-600 dark:text-gray-400">Downtown</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.locations.downtown}</span>
                            </div>

                            <div className="h-px w-12 bg-gray-300"></div>

                            <div className="flex flex-col items-center">
                                <div className="p-3 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
                                    <Store className="h-5 w-5" />
                                </div>
                                <span className="text-xs font-medium mt-1 text-gray-600 dark:text-gray-400">Suburban</span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.locations.suburban}</span>
                            </div>
                        </div>

                        {/* Action / Result */}
                        <div className="min-w-[300px]">
                            {!transfers[item.id] ? (
                                <button 
                                    onClick={() => analyzeTransfer(item)}
                                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                                >
                                    <ArrowRightLeft className="h-4 w-4" /> Analyze Distribution
                                </button>
                            ) : transfers[item.id].loading ? (
                                <div className="text-center text-sm text-gray-500 animate-pulse">Calculating optimal moves...</div>
                            ) : (
                                <div className={`rounded-lg p-4 border ${transfers[item.id].status === 'BALANCED' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'}`}>
                                    {transfers[item.id].status === 'BALANCED' ? (
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Distribution Balanced</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 text-blue-800 font-bold mb-1">
                                                <Truck className="h-4 w-4" />
                                                Recommended Transfer
                                            </div>
                                            <p className="text-sm text-blue-900 mb-2">
                                                Move <span className="font-bold">{transfers[item.id].quantity}</span> units from <span className="font-bold">{transfers[item.id].from_location}</span> to <span className="font-bold">{transfers[item.id].to_location}</span>.
                                            </p>
                                            <div className="text-xs text-blue-700 italic">
                                                "{transfers[item.id].reason}"
                                            </div>
                                            <button className="mt-3 w-full rounded bg-blue-600 py-1.5 text-xs font-bold text-white hover:bg-blue-700">
                                                Approve Transfer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
