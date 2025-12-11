import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Save, ArrowRight } from 'lucide-react';
import { saveOrder } from '../utils/orderStorage';

export default function ManualOrder() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    itemId: '',
    item_name: '',
    supplier: '',
    quantity: 1,
    order_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('/api/boltic/new-table');
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
            // Normalize data for dropdown
            const mapped = json.data.map((item, idx) => ({
                id: item.Id || item.id || `item-${idx}`,
                item_name: item.Item_name || item.product_name || item.item_name || "Unknown",
                supplier: item.Item_supplier || item.item_supplier || item.supplier || "Unknown Supplier"
            }));
            setItems(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch items", e);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, []);

  const handleItemChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = items.find(i => String(i.id) === String(selectedId));
    
    if (selectedItem) {
        setFormData(prev => ({
            ...prev,
            itemId: selectedId,
            item_name: selectedItem.item_name,
            supplier: selectedItem.supplier
        }));
    } else {
         setFormData(prev => ({
            ...prev,
            itemId: selectedId,
            item_name: '',
            supplier: ''
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name || formData.quantity <= 0) return;

    // Save locally
    saveOrder({
        item_name: formData.item_name,
        supplier: formData.supplier,
        quantity: Number(formData.quantity),
        order_date: formData.order_date,
        reason: "Manual Order"
    });

    // Optionally update Boltic status if needed, but for manual order 
    // maybe we just want to record it. If user wants status update too:
    if (formData.itemId) {
         try {
            await fetch('/api/boltic/update-item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: formData.itemId, status: "OK" })
            });
        } catch(e) { console.error("Update status failed", e); }
    }

    navigate('/'); // Back to dashboard to see the order
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <PackagePlus className="h-8 w-8 text-indigo-600" />
             Place Manual Order
           </h1>
           <p className="mt-2 text-gray-500 dark:text-gray-400">
             Manually record a purchase order for inventory restocking.
           </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
           <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Item</label>
                <select 
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 py-2.5 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    value={formData.itemId}
                    onChange={handleItemChange}
                    disabled={loading}
                >
                    <option value="">-- Choose an Item --</option>
                    {items.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.item_name}
                        </option>
                    ))}
                </select>
              </div>

              {/* Supplier (Read-only or editable) */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier</label>
                 <input 
                    type="text"
                    required
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 py-2 px-3 text-gray-500 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400"
                    value={formData.supplier}
                 />
              </div>

              <div className="grid grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                    <input 
                        type="number"
                        min="1"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={formData.quantity}
                        onChange={e => setFormData({...formData, quantity: e.target.value})}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date Required</label>
                    <input 
                        type="date"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        value={formData.order_date}
                        onChange={e => setFormData({...formData, order_date: e.target.value})}
                    />
                  </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                 <button 
                    type="button" 
                    onClick={() => navigate('/')}
                    className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
                 >
                    Cancel
                 </button>
                 <button 
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                 >
                    <Save className="h-4 w-4" />
                    Place Order
                 </button>
              </div>

           </form>
        </div>
      </div>
    </div>
  );
}
