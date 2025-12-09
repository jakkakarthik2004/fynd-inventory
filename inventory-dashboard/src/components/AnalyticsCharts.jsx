import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = {
  OK: '#22c55e',      // green-500
  LOW: '#eab308',     // yellow-500
  REORDER: '#ef4444'  // red-500
};

export default function AnalyticsCharts({ inventoryData }) {
  
  // Prepare Data for Pie Chart (Status Distribution)
  const statusData = [
    { name: 'OK', value: inventoryData.filter(i => i.reorder_status === 'OK').length },
    { name: 'Low Stock', value: inventoryData.filter(i => i.reorder_status === 'LOW').length },
    { name: 'Critical', value: inventoryData.filter(i => i.reorder_status === 'REORDER').length }
  ];

  // Prepare Data for Bar Chart (Stock by Supplier)
  // Aggregate stock quantity per supplier
  const stockBySupplier = inventoryData.reduce((acc, item) => {
    acc[item.supplier] = (acc[item.supplier] || 0) + item.quantity_in_stock;
    return acc;
  }, {});
  
  const barData = Object.entries(stockBySupplier).map(([supplier, quantity]) => ({
    supplier,
    quantity
  })).sort((a, b) => b.quantity - a.quantity); // Sort desc


  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      
      {/* CARD 1: Stock Health */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-900">Inventory Health</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.OK} />
                <Cell fill={COLORS.LOW} />
                <Cell fill={COLORS.REORDER} />
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Critical</span>
            </div>
        </div>
      </div>

      {/* CARD 2: Supplier Stock Levels */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-900">Stock Volume by Supplier</h3>
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="supplier" 
                        type="category" 
                        tick={{ fontSize: 12 }} 
                        width={100}
                    />
                    <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="quantity" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
