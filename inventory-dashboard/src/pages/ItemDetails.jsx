import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Box, AlertTriangle, CheckCircle, Brain, Calendar, ShoppingCart, Zap, PackagePlus, History, Plus, Minus, Tag, TrendingUp, Megaphone, Share2, MapPin, Calculator, Info } from 'lucide-react';


// Gemini Client removed as per request
// import { generateOrderPlan, generatePricingStrategy, generateMarketingCampaign, generateAdvancedForecast } from '../utils/geminiClient';
import { shareToLinkedIn } from '../utils/linkedinClient';
import { calculateSafetyStock, calculateROP, calculateTransfers } from '../utils/inventoryMath';
import WorkflowSimulation from '../components/WorkflowSimulation';
import LinkedInCampaign from '../components/LinkedInCampaign';
import DemandForecastChart from '../components/DemandForecastChart';
import { saveOrder } from '../utils/orderStorage';

export default function ItemDetails({ marketSignal }) {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [item, setItem] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
       try {
         const response = await fetch('/api/boltic/new-table');
         const json = await response.json();
         if (json.success && Array.isArray(json.data)) {
             const mappedData = json.data.map((item, index) => ({
                  id: item.Id || item.id || `boltic-${index}`,
                  item_name: item.Item_name || item.product_name || item.item_name || "Unknown Item",
                  supplier: item.Item_supplier || item.item_supplier || item.supplier || "Boltic Supplier",
                  quantity_in_stock: Number(item.Quantity_In_Stock) || Number(item.quantity_in_stock) || 0,
                  reorder_threshold: Number(item.Reorder_Threshold) || Number(item.reorder_threshold) || 10,
                  reorder_status: item.Reorder_Status || item.reorder_status || "OK",
                  price: Number(item.price) || 0,
                  locations: item.locations || []
             }));
             const found = mappedData.find(i => String(i.id) === String(itemId) || i.id === parseInt(itemId));
             setItem(found);
         }
       } catch (e) { console.error(e); }
    }
    fetchData();
  }, [itemId]);
  
  const [viewState, setViewState] = useState('IDLE'); // IDLE, SIMULATING, SHOW_RESULT
  const [orderPlan, setOrderPlan] = useState(null);
  const [error, setError] = useState(null);
  const [stockHistory, setStockHistory] = useState([
    { date: '2023-10-15', change: '+50', reason: 'Restock' },
    { date: '2023-10-10', change: '-5', reason: 'Order #1024' },
    { date: '2023-10-01', change: '+20', reason: 'Correction' }
  ]);

  const handleStockAdj = (amount) => {
      const newLog = {
          date: new Date().toISOString().split('T')[0],
          change: amount > 0 ? `+${amount}` : `${amount}`,
          reason: 'Manual Adjustment'
      };
      setStockHistory([newLog, ...stockHistory]);
      // In a real app we would update `item.quantity_in_stock` here (or in global state)
      // For this demo, we'll just show the log updates.
  };

  // SAFETY STOCK & ROP STATE
  const [ropConfig, setRopConfig] = useState({
      serviceLevel: 0.95, // 95%
      leadTime: 5, // Days
      stdDevDemand: 3 // Mock standard deviation
  });
  const [ropCalc, setRopCalc] = useState({ safetyStock: 0, rop: 0 });

  useEffect(() => {
      // Recalculate whenever inputs change
      const safetyStock = calculateSafetyStock(ropConfig.serviceLevel, ropConfig.stdDevDemand, ropConfig.leadTime);
      const avgDailyDemand = 12; // derived from item history (mock)
      const rop = calculateROP(avgDailyDemand, ropConfig.leadTime, safetyStock);
      setRopCalc({ safetyStock, rop });
  }, [ropConfig]);

  const [priceStrategy, setPriceStrategy] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loadingPremium, setLoadingPremium] = useState(null); // 'PRICE' | 'CAMPAIGN'

  const handlePriceOptimize = async () => {
    setLoadingPremium('PRICE');
    const res = await generatePricingStrategy(item);
    setPriceStrategy(res);
    setLoadingPremium(null);
  };

  const handleGenerateCampaign = async () => {
    setLoadingPremium('CAMPAIGN');
    const res = await generateMarketingCampaign(item);
    setCampaign(res);
    setLoadingPremium(null);
  };

  const [shareStatus, setShareStatus] = useState('IDLE'); // IDLE, POSTING, SUCCESS, ERROR

  const handleLinkedInShare = async () => {
      if (!campaign) return;
      setShareStatus('POSTING');
      
      const LINKEDIN_TOKEN = "AQUCbaC48azpwl2ACOmjVh-M8dETxCEj3s5jCsDtJTqHbyQ44kfH8CUMX68rfEu_psZ4GaPcaWkxRn0oY3G9rYVZ5VYw3n33oQa-iEPoTVFjwCFMh_Jbvp3jxmWVUVujxNg7uE5CuXe-kwtqnlgv7VNeW9Gl-B7XTP9BP93jwFQ3SjPQsZkdmGga3V7Nn3uqZGc-7PpPbalcXx6YZiTEJpAfTes6lOqUxcdXXI6WShDvJuEoq1mN-tUgx7yvgJ1glV2M34ZMtCUjphQkTWuLLslE-rAQxpZpPh7jIxmX_rTylzkTZo-AxmT1oHeoG968r6coAtAiQ_STbxRxWZSCse7EwVfUHA";
      
      const postText = `${campaign.instagram_caption}\n\nCode: ${campaign.discount_code}\n\n#Boltic #Inventory #Deal`;

      try {
          const result = await shareToLinkedIn(LINKEDIN_TOKEN, postText);
          if (result.simulation) {
             setShareStatus('SIMULATED');
          } else {
             setShareStatus('SUCCESS');
          }
          setTimeout(() => setShareStatus('IDLE'), 3000);
      } catch (err) {
          console.log("CORS blocked request (expected on localhost). Simulating success for demo.");
          // Fallback for demo if CORS blocks it (which it usually does on localhost)
          setShareStatus('SIMULATED'); 
          setTimeout(() => setShareStatus('IDLE'), 3000);
      }
  };


  if (!item) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Item Not Found</h2>
          <Link to="/" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleGeneratePlan = async () => {
    setViewState('SIMULATING');
    setError(null);
    setOrderPlan(null);
    
    // NOTE: The WorkflowSimulation component handles the visual simulation.
    // The actual triggering of the Boltic workflow happens inside WorkflowSimulation (on mount).
    
    // We wait for the "simulation" to finish (via callback) before fetching the result.
  };

  const handleSimulationComplete = async () => {
      // Simulation UI finished. Now we wait 10 seconds as requested, then fetch data.
      setTimeout(async () => {
           try {
               const response = await fetch('/api/boltic/response-latest');
               const json = await response.json();
               
               if (json.success && json.data) {
                   const data = json.data;
                   
                   // Map the response format (from user's JSON) to our UI state
                   setOrderPlan({
                       recommended_quantity: data.recommended_quantity || 0,
                       reorder_by_date: data.reorder_by_date,
                       stockout_prediction: data.stockout_prediction,
                       reason: data.executive_summary, // Map executive_summary to reason
                       // We can store other fields if needed
                       actionable_insights: data.actionable_insights,
                       forecast_data: data.forecast_data || [],
                       location_distribution: data.location_distribution
                   });
                   setViewState('SHOW_RESULT');
               } else {
                   throw new Error(json.message || "No data received");
               }
           } catch (e) {
               console.error("Fetch response failed", e);
               setError("Failed to fetch workflow results. Please try again.");
               setViewState('IDLE');
           }
      }, 10000); // 10s delay
  };

  const handlePlaceOrder = async () => {
    if (!orderPlan) return;
    
    // 1. Update status in Boltic
    try {
        await fetch('/api/boltic/update-item', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, status: "OK" })
        });
        console.log("Updated Boltic status to OK");
    } catch (e) {
        console.error("Failed to update status", e);
    }

    // 2. Save local order (Demo logic)
    saveOrder({
      item_name: item.item_name,
      supplier: item.supplier,
      quantity: orderPlan.recommended_quantity,
      order_date: orderPlan.reorder_by_date,
      reason: orderPlan.reason
    });

    // Navigate to dashboard 
    navigate('/');
  };

  const statusColor = {
    'OK': 'bg-green-100 text-green-700 ring-green-600/20',
    'LOW': 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    'REORDER': 'bg-red-100 text-red-700 ring-red-600/10'
  }[item.reorder_status];

  return (
    <div className="py-8">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="mb-6 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Link>

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.item_name}</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Supplier: <span className="font-medium text-gray-900 dark:text-white">{item.supplier}</span></p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${statusColor}`}>
            {item.reorder_status}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Main Details */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Item Overview</h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                            <Box className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity in Stock</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{item.quantity_in_stock} units</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Threshold</span>
                        </div>
                        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{item.reorder_threshold} units</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{item.reorder_threshold} units</p>
                    </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-slate-800">
                     <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2 dark:text-gray-400">
                        <MapPin className="h-4 w-4" /> Location Split & Smart Transfers
                     </h3>
                     <div className="space-y-2">
                        {item.locations && item.locations.map((loc, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">{loc.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-16 bg-gray-100 rounded-full overflow-hidden dark:bg-slate-700">
                                        <div 
                                            className={`h-full ${loc.stock < 5 ? 'bg-red-400' : 'bg-indigo-400'}`} 
                                            style={{ width: `${(loc.stock / item.quantity_in_stock) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-medium text-gray-900 w-6 text-right dark:text-white">{loc.stock}</span>
                                </div>
                            </div>
                        ))}
                     </div>

                     {/* TRANSFER LOGIC */}
                     {item.locations && calculateTransfers(item.locations).length > 0 && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-100 p-3 dark:bg-green-900/10 dark:border-green-800/30">
                            <h4 className="text-xs font-bold text-green-800 uppercase mb-2 flex items-center gap-1 dark:text-green-400">
                                <TrendingUp className="h-3 w-3" /> Recommended Transfers
                            </h4>
                            <div className="space-y-2">
                                {calculateTransfers(item.locations).map((t, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs bg-white rounded p-2 shadow-sm border border-green-100 dark:bg-slate-800 dark:border-slate-700">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-700 dark:text-gray-200">{t.from}</span>
                                            <ArrowLeft className="h-3 w-3 text-gray-400 rotate-180" />
                                            <span className="font-bold text-gray-700">{t.to}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-green-600">{t.qty} units</span>
                                            <span className="text-[10px] text-gray-400 italic">(Save ${t.savings})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                     )}
                </div>

                <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        This is a high-quality {item.item_name.toLowerCase()} sourced from {item.supplier}. 
                        Essential for daily operations and currently tracking at {item.reorder_status} stock levels.
                    </p>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 dark:text-white">
                             <History className="h-4 w-4" /> Stock History
                         </h3>
                         <div className="flex items-center gap-2">
                             <button onClick={() => handleStockAdj(-1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-slate-800 dark:text-gray-400"><Minus className="h-4 w-4"/></button>
                             <button onClick={() => handleStockAdj(1)} className="p-1 rounded hover:bg-gray-100 text-gray-500 dark:hover:bg-slate-800 dark:text-gray-400"><Plus className="h-4 w-4"/></button>
                         </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        {stockHistory.map((log, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">{log.date}</span>
                                <span className="text-gray-900 dark:text-gray-200">{log.reason}</span>
                                <span className={`font-mono font-medium ${log.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {log.change}
                                </span>
                            </div>
                        ))}
                    </div>
                    </div>
                </div>

                {/* FEATURE 3: Inventory Intelligence (ROP & Safety Stock) */}
                <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/30 p-6 dark:bg-slate-800 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-bold text-gray-900 dark:text-white">Probabilistic Inventory Intelligence</h3>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* INPUTS */}
                        <div className="space-y-4">
                            <div>
                                <label className="flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">
                                    Service Level Target 
                                    <span className="text-blue-600 dark:text-blue-400">{(ropConfig.serviceLevel * 100).toFixed(0)}%</span>
                                </label>
                                <input 
                                    type="range" min="0.80" max="0.99" step="0.01" 
                                    value={ropConfig.serviceLevel}
                                    onChange={(e) => setRopConfig({...ropConfig, serviceLevel: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                                />
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Target probability of fulfilling demand without stockout.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">Lead Time (Days)</label>
                                    <input 
                                        type="number" value={ropConfig.leadTime}
                                        onChange={(e) => setRopConfig({...ropConfig, leadTime: parseInt(e.target.value)})}
                                        className="w-full text-sm rounded border border-gray-300 p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1">Demand StdDev</label>
                                    <input 
                                        type="number" value={ropConfig.stdDevDemand}
                                        onChange={(e) => setRopConfig({...ropConfig, stdDevDemand: parseInt(e.target.value)})}
                                        className="w-full text-sm rounded border border-gray-300 p-1.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* OUTPUTS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-white p-4 shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center dark:bg-slate-700 dark:border-slate-600">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide dark:text-gray-300">Safety Stock</span>
                                <span className="text-3xl font-bold text-blue-600 mt-1 dark:text-blue-400">{ropCalc.safetyStock}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-300">units buffer</span>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-sm border border-blue-100 flex flex-col justify-center items-center text-center dark:bg-slate-700 dark:border-slate-600">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide dark:text-gray-300">Reorder Point</span>
                                <span className="text-3xl font-bold text-indigo-600 mt-1 dark:text-indigo-400">{ropCalc.rop}</span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-300">trigger level</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-100 flex gap-2 items-start dark:border-slate-700">
                        <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            <strong>Math Logic:</strong> ROP = (AvgDemand × LeadTime) + (Z-score × σ_demand × √LeadTime). 
                            Adjusting the service level changes the Z-score dynamically.
                        </p>
                    </div>
                </div>

                {/* PREMIUM FEATURES: Pricing & Marketing */}
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    
                    {/* Feature 6: Dynamic Pricing */}
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 dark:bg-slate-800 dark:border-slate-700">
                         <div className="flex items-center gap-2 mb-3">
                             <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                             <h3 className="font-bold text-gray-900 dark:text-white">AI Price Optimizer</h3>
                         </div>
                         <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">Analyze market trends to maximize profit.</p>
                         
                         {!priceStrategy ? (
                            <button 
                                onClick={handlePriceOptimize}
                                disabled={loadingPremium === 'PRICE'}
                                className="w-full py-2 bg-white border border-indigo-200 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                                {loadingPremium === 'PRICE' ? 'Analyzing...' : 'Optimize Price'}
                            </button>
                         ) : (
                             <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100 animate-in fade-in">
                                 <div className="flex justify-between items-end mb-2">
                                     <div>
                                         <span className="text-xs text-gray-500 uppercase">Current</span>
                                         <p className="font-bold text-gray-400 decoration-slate-400 line-through">${item.price}</p>
                                     </div>
                                     <div className="text-right">
                                         <span className="text-xs text-indigo-600 font-bold uppercase">Recommended</span>
                                         <p className="text-2xl font-bold text-indigo-600">${priceStrategy.optimal_price}</p>
                                     </div>
                                 </div>
                                 <div className="flex items-center justify-between text-xs py-2 border-t border-gray-100 mt-2">
                                    <span className="text-green-600 font-bold">{priceStrategy.margin_impact} Margin</span>
                                    <span className="text-gray-400">vs ${priceStrategy.competitor_avg} mkt avg</span>
                                 </div>
                                 <div className="mt-2 pt-2 border-t border-gray-100">
                                     <p className="font-bold text-[10px] text-gray-500 uppercase mb-1">STRATEGY</p>
                                     <p className="text-xs text-gray-600 italic mb-2">"{priceStrategy.strategy_summary}"</p>
                                     
                                     <p className="font-bold text-[10px] text-gray-500 uppercase mb-1">MARKET FACTORS</p>
                                     <ul className="list-disc pl-3 text-[10px] text-gray-500 space-y-0.5">
                                         {priceStrategy.market_drivers && priceStrategy.market_drivers.map((d, i) => (
                                             <li key={i}>{d}</li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                         )}
                    </div>

                    {/* Feature 7: Flash Sale Campaign */}
                    <div className="rounded-xl border border-pink-100 bg-pink-50/30 p-5 dark:bg-slate-800 dark:border-slate-700">
                         <div className="flex items-center gap-2 mb-3">
                             <Megaphone className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                             <h3 className="font-bold text-gray-900 dark:text-white">Ad Campaign Gen</h3>
                         </div>
                         <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">Instantly create copy for dead stock.</p>
                         
                         {!campaign ? (
                            <button 
                                onClick={handleGenerateCampaign}
                                disabled={loadingPremium === 'CAMPAIGN'}
                                className="w-full py-2 bg-white border border-pink-200 rounded-lg text-sm font-medium text-pink-600 hover:bg-pink-50 transition-colors"
                            >
                                {loadingPremium === 'CAMPAIGN' ? 'Generating...' : 'Create Campaign'}
                            </button>
                         ) : (
                             <div className="bg-white rounded-lg p-0 shadow-sm border border-pink-100 animate-in fade-in overflow-hidden dark:bg-slate-900 dark:border-pink-900/30">
                                 <div className="p-4 bg-pink-50/50 border-b border-pink-100 dark:bg-pink-900/10 dark:border-pink-900/30">
                                    <span className="inline-block px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded mb-1 dark:bg-pink-900/30 dark:text-pink-300">{campaign.discount_code}</span>
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{campaign.email_subject}</h4>
                                 </div>
                                 <div className="p-2">
                                    <LinkedInCampaign 
                                        initialText={`${campaign.instagram_caption}\n\nCode: ${campaign.discount_code}\n\n#Boltic #Inventory #Deal`} 
                                    />
                                 </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>

          {/* AI Side Panel */}
          <div>
             <div className="sticky top-8 rounded-2xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/50 p-6 shadow-sm ring-1 ring-indigo-50 dark:bg-slate-900 dark:from-slate-900 dark:to-slate-800 dark:border-slate-700 dark:ring-0">
                <div className="mb-4 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-indigo-600 fill-indigo-100 dark:text-indigo-400 dark:fill-indigo-900" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Boltic AI Ops</h2>
                </div>
                
                {viewState === 'IDLE' && (
                    <>
                        <p className="mb-6 text-sm text-gray-600">
                            Run the Boltic optimization workflow to fetch live data and generate a reorder plan.
                        </p>
                        <button
                            onClick={handleGeneratePlan}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md hover:-translate-y-0.5"
                        >
                            <Zap className="h-4 w-4" />
                            Run Workflow
                        </button>
                    </>
                )}

                {viewState === 'SIMULATING' && (
                    <WorkflowSimulation itemId={item?.id || itemId} onComplete={handleSimulationComplete} />
                )}

                {error && viewState === 'IDLE' && (
                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {viewState === 'SHOW_RESULT' && orderPlan && (
                    <div className="mt-2 animate-in fade-in zoom-in-95 duration-500">
                        <div className="space-y-4 rounded-xl bg-white p-5 shadow-lg ring-1 ring-indigo-100">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <span className="font-bold text-gray-900">Workflow Complete</span>
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>

                            {/* Anomaly Alert */}
                            {orderPlan.anomaly_detection && orderPlan.anomaly_detection.detected && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-red-800">Anomaly Detected: {orderPlan.anomaly_detection.type}</h4>
                                        <p className="text-xs text-red-600 mt-1">
                                            Severity: {orderPlan.anomaly_detection.severity}. Our models detected unusual patterns in sales velocity.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <span className="text-xs font-medium uppercase text-gray-400">Recommended Quantity</span>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-indigo-600">{orderPlan.recommended_quantity}</span>
                                    <span className="text-sm text-gray-500">units</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="flex items-center gap-1 text-xs font-medium uppercase text-gray-400">
                                        <Calendar className="h-3 w-3" /> Reorder By
                                    </span>
                                    <p className="mt-1 font-medium text-gray-900">{orderPlan.reorder_by_date}</p>
                                </div>
                                {orderPlan.stockout_prediction && (
                                    <div>
                                        <span className="flex items-center gap-1 text-xs font-medium uppercase text-gray-400">
                                            <AlertTriangle className="h-3 w-3" /> Stockout
                                        </span>
                                        <p className="mt-1 font-medium text-orange-600">{orderPlan.stockout_prediction}</p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg bg-indigo-50 p-4">
                                <span className="block text-xs font-semibold uppercase text-indigo-800">Boltic Insight</span>
                                
                                {orderPlan.location_distribution && (
                                    <div className="mt-3 mb-3 border-b border-indigo-200 pb-3">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Smart Distribution Plan</p>
                                        <div className="space-y-2">
                                            {orderPlan.location_distribution.map((loc, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded bg-white/60 px-2 py-1.5 shadow-sm">
                                                    <span className="text-xs font-medium text-indigo-900">{loc.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-indigo-400">{loc.reason}</span>
                                                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">+{loc.quantity}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-2 text-indigo-900">
                                    <p className="font-bold text-xs mb-1">ANALYSIS:</p>
                                    <p className="text-xs leading-relaxed mb-2 text-indigo-700">{orderPlan.executive_summary}</p>
                                    
                                    <p className="font-bold text-xs mb-1">KEY DRIVERS:</p>
                                    <ul className="list-disc pl-3 text-[10px] text-indigo-600 space-y-0.5">
                                        {orderPlan.actionable_insights && orderPlan.actionable_insights.map((point, idx) => (
                                            <li key={idx}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Forecast Chart */}
                            {orderPlan.forecast_data && (
                                <DemandForecastChart data={orderPlan.forecast_data} />
                            )}

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handlePlaceOrder}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500"
                                >
                                    <PackagePlus className="h-4 w-4" />
                                    Place Order
                                </button>
                                <button
                                    onClick={() => { setViewState('IDLE'); setOrderPlan(null); }}
                                    className="w-full text-center text-xs font-medium text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                    Reset Workflow
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
