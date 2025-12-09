/**
 * Inventory Management Math Utilities
 * Implements probabilistic models for Safety Stock and ROP.
 */

// Standard Normal Distribution Z-score lookup (approximate for common service levels)
export const getZScore = (serviceLevel) => {
    // Service Level % -> Z-score
    const table = {
        0.50: 0.00,
        0.80: 0.84,
        0.90: 1.28,
        0.95: 1.645,
        0.97: 1.88,
        0.98: 2.05,
        0.99: 2.33,
        0.999: 3.09
    };
    return table[serviceLevel] || 1.645; // Default to 95%
};

/**
 * Calculate Safety Stock
 * Formula: Z * σ_demand * √LeadTime
 * @param {number} serviceLevel - Target service level (e.g., 0.95)
 * @param {number} stdDevDemand - Standard Deviation of daily demand
 * @param {number} leadTime - Lead time in days
 */
export const calculateSafetyStock = (serviceLevel, stdDevDemand, leadTime) => {
    const z = getZScore(serviceLevel);
    // Assuming Lead Time is constant for this simple model. 
    // If Lead Time varies, formula is: Z * sqrt( (AvgLeadTime * σ_demand^2) + (AvgDemand^2 * σ_leadTime^2) )
    return Math.ceil(z * stdDevDemand * Math.sqrt(leadTime));
};

/**
 * Calculate Reorder Point (ROP)
 * Formula: (Avg Demand * LeadTime) + Safety Stock
 * @param {number} avgDailyDemand 
 * @param {number} leadTime 
 * @param {number} safetyStock 
 */
export const calculateROP = (avgDailyDemand, leadTime, safetyStock) => {
    return Math.ceil((avgDailyDemand * leadTime) + safetyStock);
};

/**
 * Calculate Economic Order Quantity (EOQ)
 * Formula: √ (2 * AnnualDemand * OrderCost / HoldingCost)
 */
export const calculateEOQ = (annualDemand, orderCost, holdingCost) => {
    if (holdingCost === 0) return annualDemand; // Avoid infinity
    return Math.ceil(Math.sqrt((2 * annualDemand * orderCost) / holdingCost));
};

/**
 * Multi-Location Balance Logic
 * @param {Array} locations - [{ name: 'NY', stock: 50, demand: 10 }, { name: 'LA', stock: 5, demand: 20 }]
 * @returns {Array} transfers - [{ from: 'NY', to: 'LA', qty: 15 }]
 */
export const calculateTransfers = (locations) => {
    const transfers = [];
    
    // 1. Identify Excess and Shortage
    // Simple logic: Threshold = 20 days of coverage? Or simply a hard number?
    // Let's use: Target = 15 units.
    const TARGET_STOCK = 30; // Simply for demo
    
    let givers = [];
    let receivers = [];

    locations.forEach(loc => {
        if (loc.stock > TARGET_STOCK + 10) { // Excess buffer
            givers.push({ ...loc, excess: loc.stock - TARGET_STOCK });
        } else if (loc.stock < TARGET_STOCK - 10) { // Shortage buffer
            receivers.push({ ...loc, shortage: TARGET_STOCK - loc.stock });
        }
    });

    // 2. Match Givers to Receivers
    givers.forEach(giver => {
        receivers.forEach(receiver => {
            if (giver.excess > 0 && receiver.shortage > 0) {
                const qty = Math.min(giver.excess, receiver.shortage);
                transfers.push({
                    from: giver.name,
                    to: receiver.name,
                    qty: qty,
                    reason: `Balancing inventory levels`,
                    savings: qty * 5 // Mock cost saving calc
                });
                
                giver.excess -= qty;
                receiver.shortage -= qty;
            }
        });
    });

    return transfers;
};
