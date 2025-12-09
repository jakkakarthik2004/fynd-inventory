import React, { useState, useMemo, useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import KPICards from '../components/KPICards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import Filters from '../components/Filters';
import InventoryTable from '../components/InventoryTable';
import { inventoryItems } from '../data/inventoryData';
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

  // Get unique suppliers for the dropdown
  const suppliers = useMemo(() => {
    return [...new Set(inventoryItems.map(item => item.supplier))].sort();
  }, []);

  // Filter and Sort Data
  const displayedData = useMemo(() => {
    // Decision: Are we filtering Orders or Inventory?
    if (viewMode === 'ORDERS') {
        // Simple search for orders
        if (!searchQuery) return orders;
        return orders.filter(o => o.item_name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Inventory Logic
    let data = [...inventoryItems];

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
  }, [searchQuery, statusFilter, supplierFilter, sortConfig, viewMode, orders]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const alerts = useMemo(() => {
     return inventoryItems
        .filter(i => i.reorder_status === 'REORDER')
        .map(i => ({
            title: 'Low Stock Alert',
            message: `${i.item_name} is below threshold (${i.quantity_in_stock} left).`,
            time: 'Just now'
        }));
  }, []);

  return (
    <div className="pb-20 pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <DashboardHeader>
            <MarketPulseWidget currentSignal={marketSignal} onSignalChange={setMarketSignal} />
            <NotificationCenter notifications={alerts} />
        </DashboardHeader>
        
        <KPICards data={inventoryItems} />

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
            <AnalyticsCharts inventoryData={inventoryItems} />
        )}
        
      </div>
    </div>
  );
}
