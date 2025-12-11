import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Sector, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = {
  OK: '#10b981',      // emerald-500
  LOW: '#f59e0b',     // amber-500
  REORDER: '#ef4444'  // red-500
};

// Render active shape for Pie Chart hover effect
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={-2} textAnchor="middle" height={30} fill={fill} className="text-xl font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={18} textAnchor="middle" fill="#9ca3af" className="text-sm">
        {value} Items
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
    </g>
  );
};

export default function AnalyticsCharts({ inventoryData }) {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  // Prepare Data for Pie Chart (Status Distribution)
  const statusData = [
    { name: 'Healthy', value: inventoryData.filter(i => i.reorder_status === 'OK').length, key: 'OK' },
    { name: 'Low Stock', value: inventoryData.filter(i => i.reorder_status === 'LOW').length, key: 'LOW' },
    { name: 'Critical', value: inventoryData.filter(i => i.reorder_status === 'REORDER').length, key: 'REORDER' }
  ];

  // Prepare Data for Bar Chart (Stock by Supplier)
  const stockBySupplier = inventoryData.reduce((acc, item) => {
    acc[item.supplier] = (acc[item.supplier] || 0) + item.quantity_in_stock;
    return acc;
  }, {});
  
  const barData = Object.entries(stockBySupplier).map(([supplier, quantity]) => ({
    supplier,
    quantity
  })).sort((a, b) => b.quantity - a.quantity).slice(0, 7); // Top 7 Suppliers

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-2">
      
      {/* CARD 1: Stock Health (Interactive Pie) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Inventory Health</h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={onPieEnter}
                cursor="pointer"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.key]} strokeWidth={0} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: Supplier Stock Levels (Gradient Bar) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h3 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Top Suppliers by Volume</h3>
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <defs>
                        <linearGradient id="colorQuantity" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6}/>
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="supplier" 
                        type="category" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        width={100}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                            borderRadius: '12px', 
                            border: 'none', 
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '12px'
                        }}
                    />
                    <Bar 
                        dataKey="quantity" 
                        fill="url(#colorQuantity)" 
                        radius={[0, 6, 6, 0]} 
                        barSize={24}
                        animationDuration={1500}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
