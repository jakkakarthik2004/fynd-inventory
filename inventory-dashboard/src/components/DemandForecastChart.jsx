import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DemandForecastChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm ring-1 ring-indigo-50">
        <h4 className="mb-4 text-sm font-semibold text-gray-900">30-Day Stock Depletion Forecast</h4>
        <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 10 }} 
                        tickLine={false} 
                        axisLine={false}
                        interval={4}
                    />
                    <YAxis 
                        tick={{ fontSize: 10 }} 
                        tickLine={false} 
                        axisLine={false} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(value) => `Day ${value}`}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="stock" 
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#colorStock)" 
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">AI-Simulated Projection</p>
    </div>
  );
}
