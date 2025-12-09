import React, { useState } from 'react';
import { CloudRain, Sun, ShoppingBag, Calendar } from 'lucide-react';

export const SIGNALS = [
    { id: 'neutral', label: 'Neutral', icon: Calendar, color: 'text-gray-500' },
    { id: 'holiday', label: 'Holiday Season', icon: ShoppingBag, color: 'text-red-500' },
    { id: 'summer', label: 'Summer Heat', icon: Sun, color: 'text-orange-500' },
    { id: 'rainy', label: 'Monsoon', icon: CloudRain, color: 'text-blue-500' },
];

export default function MarketPulseWidget({ currentSignal, onSignalChange }) {
    const activeSignal = SIGNALS.find(s => s.id === currentSignal) || SIGNALS[0];
    const Icon = activeSignal.icon;

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Market Pulse:</span>
            <div className="relative group">
                <button className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                    <Icon className={`h-4 w-4 ${activeSignal.color}`} />
                    {activeSignal.label}
                </button>
                
                {/* Dropdown */}
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg hidden group-hover:block z-50">
                    {SIGNALS.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => onSignalChange(s.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-left text-gray-700 dark:text-gray-200"
                        >
                            <s.icon className={`h-4 w-4 ${s.color}`} />
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
