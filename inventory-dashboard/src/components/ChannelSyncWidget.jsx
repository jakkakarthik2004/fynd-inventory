import React, { useState, useEffect } from 'react';
import { Globe, ShoppingCart } from 'lucide-react';

const CHANNELS = [
  { name: 'Shopify', color: 'bg-green-500' },
  { name: 'Amazon', color: 'bg-orange-500' },
  { name: 'Instagram', color: 'bg-pink-500' }
];

export default function ChannelSyncWidget() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Simulate incoming orders every few seconds
    const interval = setInterval(() => {
      const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
      const amount = Math.floor(Math.random() * 200) + 20;
      
      const newEvent = {
        id: Date.now(),
        channel: channel.name,
        color: channel.color,
        message: `New order: $${amount}`,
        time: new Date().toLocaleTimeString()
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 5)); // Keep last 5
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                 <Globe className="h-5 w-5 text-indigo-600" />
                 <h3 className="font-bold text-gray-900">Live Multi-Channel Feed</h3>
             </div>
             <div className="flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </span>
                 <span className="text-xs text-gray-500 font-medium">Synced</span>
             </div>
        </div>
        
        <div className="space-y-3">
            {events.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-4">Waiting for incoming signals...</p>
            ) : (
                events.map(event => (
                    <div key={event.id} className="flex items-center justify-between animate-in slide-in-from-right duration-500">
                        <div className="flex items-center gap-3">
                            <span className={`h-2 w-2 rounded-full ${event.color}`} />
                            <span className="text-xs font-bold text-gray-700 w-20">{event.channel}</span>
                            <span className="text-sm text-gray-600">{event.message}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">{event.time}</span>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
