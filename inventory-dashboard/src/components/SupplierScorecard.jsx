import React from 'react';
import { Star, Clock, Truck, TrendingDown, Info, Award } from 'lucide-react';

export default function SupplierScorecard({ supplierName }) {
    // Mock performance data (randomized for demo)
    const onTimeRate = 92 + Math.floor(Math.random() * 6); // 92-98%
    const qualityScore = (4.0 + Math.random()).toFixed(1); // 4.0-5.0
    const costEfficiency = Math.random() > 0.5 ? 'High' : 'Medium';
    
    return (
        <div className="mt-4 rounded-lg bg-gray-50 p-4 border border-gray-100">
            <h4 className="mb-3 text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                <Award className="h-4 w-4 text-indigo-500" /> Performance Scorecard
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
                {/* On-Time Delivery */}
                <div>
                     <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Truck className="h-3 w-3" /> On-Time
                     </div>
                     <div className="relative h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${onTimeRate > 95 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                            style={{width: `${onTimeRate}%`}}
                        />
                     </div>
                     <span className="text-[10px] font-bold text-gray-800">{onTimeRate}%</span>
                </div>

                {/* Quality Score */}
                <div>
                     <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Star className="h-3 w-3" /> Quality
                     </div>
                     <div className="flex items-center gap-1">
                         <span className="text-sm font-bold text-gray-900">{qualityScore}</span>
                         <div className="flex text-yellow-400">
                             {[...Array(5)].map((_, i) => (
                                 <Star key={i} className={`h-2 w-2 ${i < Math.round(qualityScore) ? 'fill-current' : 'text-gray-300'}`} />
                             ))}
                         </div>
                     </div>
                </div>
            </div>

            <div className="mt-3 flex items-start gap-2 bg-white p-2 rounded border border-gray-100 shadow-sm">
                <Info className="h-3 w-3 text-blue-500 mt-0.5" />
                <p className="text-[10px] text-gray-500 leading-tight">
                    <strong>AI Insight:</strong> {supplierName} has consistent lead times but higher holding costs. Recommended for urgent stock.
                </p>
            </div>
        </div>
    );
}
