import React, { useState, useEffect } from 'react';
import { Package, ArrowRight, Tag, Gift, Sparkles } from 'lucide-react';
import { generateBundleStrategy } from '../utils/geminiClient';
import LinkedInCampaign from '../components/LinkedInCampaign';
import { useTranslation } from 'react-i18next';

export default function SmartBundles() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [deadStock, setDeadStock] = useState([]);
  const [fastMovers, setFastMovers] = useState([]);
  const [bundles, setBundles] = useState({}); // itemId -> bundleData
  const [activeCampaign, setActiveCampaign] = useState(null); // itemId for active LinkedIn modal

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/boltic/new-table');
        const json = await response.json();
        
        if (json.success) {
             const data = json.data;
             // Logic: Dead Stock = Stock > 30 AND Status != REORDER (just a heuristic for demo)
             // Fast Movers = Stock < 30 OR Status == REORDER (selling fast)
             
             const ds = data.filter(i => i.quantity_in_stock > 35).slice(0, 3); // Limit to 3 for demo speed
             const fm = data.filter(i => i.quantity_in_stock <= 35).slice(0, 5);
             
             setDeadStock(ds);
             setFastMovers(fm);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const generateBundle = async (item) => {
      setBundles(prev => ({ ...prev, [item.id]: { loading: true } }));
      
      const result = await generateBundleStrategy(item, fastMovers);
      
      setBundles(prev => ({ ...prev, [item.id]: result }));
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Gift className="h-8 w-8 text-pink-600" />
             {t('smart_bundles')}
           </h1>
           <p className="mt-2 text-gray-500 dark:text-gray-400">
             Turn your "{t('dead_stock')}" (Slow Moving) into revenue by pairing it with "{t('fast_movers')}".
           </p>
        </div>

        {loading ? (
            <div className="text-center py-20 animate-pulse text-gray-500">Scanning Inventory for Dead Stock...</div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {deadStock.map(item => (
                    <div key={item.id} className="relative flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                    {t('dead_stock')}
                                </span>
                                <span className="text-sm text-gray-500">{item.quantity_in_stock} Units stuck</span>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.item_name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Price: ${item.price}</p>
                            
                            {/* Bundle Result */}
                            {bundles[item.id] && !bundles[item.id].loading && (
                                <div className="mt-6 rounded-xl bg-gradient-to-br from-pink-50 to-indigo-50 p-4 border border-pink-100 dark:from-slate-800 dark:to-slate-800 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2 text-pink-700 dark:text-pink-400 font-bold text-sm uppercase tracking-wide">
                                        <Sparkles className="h-4 w-4" /> {t('recommended_bundle')}
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{bundles[item.id].bundle_name}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                        {t('pair_with')}: <span className="font-semibold">{bundles[item.id].paired_item}</span>
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm">
                                            <span className="text-gray-400 line-through mr-2">${(item.price * 1.5).toFixed(2)}</span>
                                            <span className="font-bold text-green-600 text-lg">${bundles[item.id].bundle_price}</span>
                                        </div>
                                        <div className="text-xs font-bold text-white bg-green-500 px-2 py-1 rounded">
                                            {bundles[item.id].discount_percentage} OFF
                                        </div>
                                    </div>
                                    <p className="mt-3 text-xs italic text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-2">
                                        "{bundles[item.id].marketing_angle}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            {!bundles[item.id] ? (
                                <button 
                                    onClick={() => generateBundle(item)}
                                    className="w-full rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 flex items-center justify-center gap-2"
                                >
                                    <Sparkles className="h-4 w-4" /> {t('generate_bundle')}
                                </button>
                            ) : bundles[item.id].loading ? (
                                <button disabled className="w-full rounded-lg bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-400 cursor-not-allowed">
                                    {t('analyzing')}
                                </button>
                            ) : (
                                activeCampaign === item.id ? (
                                    <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 dark:bg-slate-800 dark:border-slate-700">
                                            <div className="mb-2 flex items-center justify-between">
                                                <h4 className="text-xs font-bold uppercase text-gray-500">LinkedIn Campaign</h4>
                                                <button onClick={() => setActiveCampaign(null)} className="text-xs text-gray-400 hover:text-gray-600">{t('close')}</button>
                                            </div>
                                            <LinkedInCampaign 
                                                initialText={`🚨 FLASH DEAL! 🚨\n\nGet our ${bundles[item.id].bundle_name} for just $${bundles[item.id].bundle_price}!\n\nIncludes:\n- ${item.item_name}\n- ${bundles[item.id].paired_item}\n\n"${bundles[item.id].marketing_angle}"\n\nLimited time only. #FlashSale #Deal #Inventory`}
                                                onComplete={() => setActiveCampaign(null)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setActiveCampaign(item.id)}
                                        className="w-full rounded-lg border border-indigo-600 text-indigo-600 px-3.5 py-2.5 text-sm font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                    >
                                        {t('create_campaign')}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {deadStock.length === 0 && !loading && (
             <div className="text-center py-20 text-gray-500">
                 Great news! No dead stock detected (Inventory looks healthy).
             </div>
        )}

      </div>
    </div>
  );
}
