import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { inventoryItems } from '../data/inventoryData';
import SupplierScorecard from '../components/SupplierScorecard';

export default function SupplierHub() {
  // Aggregate data by supplier
  const suppliersData = inventoryItems.reduce((acc, item) => {
     if (!acc[item.supplier]) {
         acc[item.supplier] = { 
             name: item.supplier, 
             items: 0, 
             totalStock: 0,
             contact: `contact@${item.supplier.toLowerCase()}.com` // Fake data
         };
     }
     acc[item.supplier].items += 1;
     acc[item.supplier].totalStock += item.quantity_in_stock;
     return acc;
  }, {});
  
  const suppliers = Object.values(suppliersData);

  return (
    <div className="py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        

        
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Supplier Hub</h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((supplier) => (
                <div key={supplier.name} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{supplier.name}</h3>
                            <span className="text-xs text-gray-500">Premium Partner</span>
                        </div>
                    </div>
                    
                    <div className="mb-6 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {supplier.contact}
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            +1 (555) 000-0000
                        </div>
                         <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            San Francisco, CA
                        </div>
                    </div>

                    <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Products Supplied</span>
                            <span className="font-bold text-gray-900">{supplier.items} items</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-xs text-gray-500">Total Stock</span>
                            <span className="font-bold text-indigo-600">{supplier.totalStock} units</span>
                        </div>
                    </div>
                    
                    {/* Feature 7: Analytics */}
                    <SupplierScorecard supplierName={supplier.name} />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
