import React, { useState, useMemo, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import KPICards from '../components/KPICards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import Filters from '../components/Filters';
import InventoryTable from '../components/InventoryTable';
// import { inventoryItems } from '../data/inventoryData'; // Removed static data
import { getOrders } from '../utils/orderStorage';
import { exportToCSV } from '../utils/exportUtils';
import ChannelSyncWidget from '../components/ChannelSyncWidget';
import MarketPulseWidget from '../components/MarketPulseWidget';
import NotificationCenter from '../components/NotificationCenter';

export default function Dashboard({ marketSignal, setMarketSignal }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [supplierFilter, setSupplierFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // New State for View Mode
  const [viewMode, setViewMode] = useState('INVENTORY'); // 'INVENTORY' | 'ORDERS'
  const [orders, setOrders] = useState([]);

  // Load orders on mount or when view changes
  useEffect(() => {
    if (viewMode === 'ORDERS') {
        setOrders(getOrders());
    }
  }, [viewMode]);

  // Fetch Data from Boltic
  const [bolticData, setBolticData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/boltic/new-table');
        const json = await response.json();
        
        if (json.success && Array.isArray(json.data)) {
           console.log("Fetched Data from Backend:", json.data);
           setBolticData(json.data);
        } else {
           console.error("Failed to fetch Boltic data:", json);
           setError("Failed to load inventory data");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Error connecting to backend");
      } finally {
        setLoading(false);
      }
    }
    
    // Only fetch if in Inventory view
    if (viewMode === 'INVENTORY') {
         fetchData();
    }
  }, [viewMode]);


  // Get unique suppliers for the dropdown
  const suppliers = useMemo(() => {
    // USE bolticData instead of inventoryItems
    return [...new Set(bolticData.map(item => item.supplier))].sort();
  }, [bolticData]);

  // Filter and Sort Data
  const displayedData = useMemo(() => {
    // Decision: Are we filtering Orders or Inventory?
    if (viewMode === 'ORDERS') {
        // Simple search for orders
        if (!searchQuery) return orders;
        return orders.filter(o => o.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Inventory Logic
    let data = [...bolticData];

    // 1. Filter
    if (searchQuery) {
      data = data.filter(item => 
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'DEAD_STOCK') {
          // Logic: High stock (> 40) is considered Dead Stock for this demo
          data = data.filter(item => item.quantity_in_stock > 40 && item.reorder_status !== 'REORDER');
      } else {
          data = data.filter(item => item.reorder_status === statusFilter);
      }
    }

    if (supplierFilter !== 'ALL') {
      data = data.filter(item => item.supplier === supplierFilter);
    }

    // 2. Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [searchQuery, statusFilter, supplierFilter, sortConfig, viewMode, orders, bolticData]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

    const alerts = useMemo(() => {
     return bolticData
        .filter(i => i.reorder_status === 'REORDER')
        .map(i => ({
            title: 'Low Stock Alert',
            message: `${i.item_name} is below threshold (${i.quantity_in_stock} left).`,
            time: 'Just now'
        }));
  }, [bolticData]);

  return (
    <div className="pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <DashboardHeader>
            <MarketPulseWidget currentSignal={marketSignal} onSignalChange={setMarketSignal} />
            <NotificationCenter notifications={alerts} />
        </DashboardHeader>

        {loading && (
            <div className="flex justify-center py-10">
                <div className="text-xl text-gray-500 animate-pulse">Loading Inventory Data...</div>
            </div>
        )}

        {error && (
            <div className="bg-red-50 p-4 border border-red-200 rounded-md text-red-600 mb-6">
                Error: {error}
            </div>
        )}

        {!loading && !error && (
            <>
        
        <KPICards data={bolticData} />

        <Filters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          supplierFilter={supplierFilter}
          setSupplierFilter={setSupplierFilter}
          suppliers={suppliers}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onExport={() => exportToCSV(displayedData, `inventory_export_${new Date().toISOString().split('T')[0]}.csv`)}
        />

        <InventoryTable 
          items={displayedData} 
          sortConfig={sortConfig}
          onSort={handleSort}
          viewMode={viewMode}
        />

        <div className="mt-8">
            <ChannelSyncWidget />
        </div>

        {viewMode === 'INVENTORY' && (
            <AnalyticsCharts inventoryData={bolticData} />
        )}

      </>
        )}
      </div>
    </div>
  );
}
