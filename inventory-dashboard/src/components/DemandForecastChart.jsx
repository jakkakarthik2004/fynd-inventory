import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function DemandForecastChart({ data }) {
  if (!data || data.length === 0) return null;

  // Find min/max for better axis scaling if needed, or stick to auto
  const hasLowStock = data.some(d => d.stock < 20);

  return (
    <div className="mt-6 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm ring-1 ring-indigo-50 dark:bg-gray-900 dark:border-gray-800 dark:ring-0">
        <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">30-Day Stock Depletion Forecast</h4>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded dark:text-indigo-400 dark:bg-indigo-900/30">AI Projection</span>
        </div>
        
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                        tickLine={false} 
                        axisLine={false}
                        interval={6}
                    />
                    <YAxis 
                        tick={{ fontSize: 11, fill: '#9ca3af' }} 
                        tickLine={false} 
                        axisLine={false} 
                    />
                    <Tooltip 
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '12px'
                        }}
                        labelFormatter={(value) => `Day ${value}`}
                        formatter={(value) => [`${value} Units`, 'Proj. Stock']}
                    />
                    <ReferenceLine y={20} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Reorder', fill: '#ef4444', fontSize: 10 }} />
                    <Area 
                        type="monotone" 
                        dataKey="stock" 
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#colorStock)" 
                        strokeWidth={3}
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
            {hasLowStock ? '⚠️ Projected to hit reorder point soon.' : 'Stock levels look healthy for the next 30 days.'}
        </p>
    </div>
  );
}
