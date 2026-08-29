import math
from typing import Dict, Any, List

def calculate_sourcing_metrics(
    rates: List[Dict[str, Any]],
    volume_discount_percent: float = 12.0,
    mse_allocation_percent: float = 28.0
) -> Dict[str, Any]:
    """
    Agent 3 Strategic Sourcing Simulation Algorithm:
    Evaluates price dispersion across CPSEs, calculates econometric bulk volume savings,
    and applies statutory quotas under the Public Procurement Policy for MSEs Order 2012.
    """
    if not rates:
        return {}

    prices = [r["rate"] for r in rates]
    quantities = [r["annualQty"] for r in rates]

    min_price = min(prices)
    max_price = max(prices)
    total_qty = sum(quantities)
    
    # Baseline dispersed expenditure
    baseline_spend = sum(r["rate"] * r["annualQty"] for r in rates)

    # Target unit rate after unified tender negotiation
    target_unit_rate = round(min_price * (1 - volume_discount_percent / 100.0), 2)
    projected_spend = round(target_unit_rate * total_qty, 2)
    
    total_savings_inr = round(baseline_spend - projected_spend, 2)
    net_savings_percent = round((total_savings_inr / baseline_spend) * 100.0, 2) if baseline_spend > 0 else 0.0
    price_variance_percent = round(((max_price - min_price) / min_price) * 100.0, 2) if min_price > 0 else 0.0

    # Statutory MSEs Order 2012 Allocations
    mse_units = math.ceil((total_qty * mse_allocation_percent) / 100.0)
    sc_st_mse_units = math.ceil(total_qty * 0.04)
    women_mse_units = math.ceil(total_qty * 0.03)

    # Executive memo generation
    executive_memo = (
        f"EXECUTIVE MEMORANDUM // MoPNG Strategic Sourcing: "
        f"Historical unit rates vary by {price_variance_percent}% across CPSE plants. "
        f"Aggregating {total_qty:,} total annual units unlocks a target rate of ₹{target_unit_rate:,.2f}/unit, "
        f"yielding group fiscal savings of ₹{(total_savings_inr/100000):.2f} Lakh ({net_savings_percent}%). "
        f"Statutory MSE allocation is secured at {mse_allocation_percent}% ({mse_units:,} units)."
    )

    return {
        "minPrice": min_price,
        "maxPrice": max_price,
        "priceVariancePercent": price_variance_percent,
        "totalPooledQuantity": total_qty,
        "baselineSpendINR": baseline_spend,
        "targetUnitRateINR": target_unit_rate,
        "projectedUnifiedSpendINR": projected_spend,
        "totalSavingsINR": total_savings_inr,
        "netSavingsPercent": net_savings_percent,
        "mseAllocations": {
            "totalMSEUnits": mse_units,
            "totalMSEPercent": mse_allocation_percent,
            "scStMSEUnits": sc_st_mse_units,
            "womenMSEUnits": women_mse_units,
            "isCompliant": mse_allocation_percent >= 25.0
        },
        "executiveBriefing": executive_memo
    }
