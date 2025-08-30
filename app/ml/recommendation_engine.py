import numpy as np
from typing import Dict, List, Tuple
import random
from datetime import datetime, timedelta

class RecommendationEngine:
    def __init__(self):
        self.version = "1.0.0"

        # Mock supplier database for demo
        self.supplier_database = [
            {"name": "BuildCorp Supplies", "rating": 4.5, "price_factor": 1.0, "reliability": 0.9},
            {"name": "QuickMaterials Ltd", "rating": 4.2, "price_factor": 0.85, "reliability": 0.85},
            {"name": "Premium Construction", "rating": 4.8, "price_factor": 1.15, "reliability": 0.95},
            {"name": "Economy Builders", "rating": 3.8, "price_factor": 0.75, "reliability": 0.75},
            {"name": "Reliable Resources", "rating": 4.6, "price_factor": 1.05, "reliability": 0.92}
        ]

    def recommend_suppliers(self, material_info: Dict, historical_orders: List[Dict], 
                          required_quantity: float) -> List[Dict]:
        recommendations = []

        for supplier in self.supplier_database:
            # Calculate score based on multiple factors
            price_score = self._calculate_price_score(
                supplier["price_factor"], material_info["current_price"]
            )
            reliability_score = supplier["reliability"]
            rating_score = supplier["rating"] / 5.0

            # Check historical performance if available
            historical_score = self._calculate_historical_score(
                supplier["name"], historical_orders
            )

            # Combine scores with weights
            overall_score = (
                price_score * 0.3 +
                reliability_score * 0.4 +
                rating_score * 0.2 +
                historical_score * 0.1
            )

            estimated_price = material_info["current_price"] * supplier["price_factor"]
            estimated_delivery = self._estimate_delivery_time(supplier, required_quantity)

            recommendations.append({
                "supplier_name": supplier["name"],
                "overall_score": round(overall_score, 2),
                "estimated_price_per_unit": round(estimated_price, 2),
                "estimated_total_cost": round(estimated_price * required_quantity, 2),
                "estimated_delivery_days": estimated_delivery,
                "reliability_rating": supplier["reliability"],
                "supplier_rating": supplier["rating"],
                "recommendation_reason": self._generate_recommendation_reason(
                    supplier, price_score, reliability_score
                )
            })

        # Sort by overall score
        recommendations.sort(key=lambda x: x["overall_score"], reverse=True)
        return recommendations[:3]  # Return top 3

    def optimize_manpower_allocation(self, workers: List[Dict], 
                                   unassigned_tasks: List[Dict]) -> List[Dict]:
        recommendations = []

        # Sort workers by current workload (ascending)
        sorted_workers = sorted(workers, key=lambda w: w["current_hours"])

        for task in unassigned_tasks:
            best_matches = []

            for worker in sorted_workers:
                # Calculate suitability score
                workload_score = self._calculate_workload_score(worker["current_hours"])
                skill_match_score = self._calculate_skill_match(
                    worker["skill_category"], task.get("required_skill", "general")
                )

                suitability = (workload_score * 0.6) + (skill_match_score * 0.4)

                best_matches.append({
                    "worker_id": worker["worker_id"],
                    "worker_name": worker["name"],
                    "suitability_score": round(suitability, 2),
                    "current_workload": worker["current_hours"],
                    "skill_match": skill_match_score
                })

            # Sort by suitability
            best_matches.sort(key=lambda x: x["suitability_score"], reverse=True)

            recommendations.append({
                "task_id": task["task_id"],
                "task_title": task["title"],
                "estimated_hours": task["estimated_hours"],
                "priority": task["priority"],
                "recommended_workers": best_matches[:3]  # Top 3 matches
            })

        return recommendations

    def forecast_material_demand(self, material_info: Dict, 
                               historical_consumption: List[Dict], 
                               forecast_days: int) -> Dict:
        if not historical_consumption:
            # No historical data, use simple estimation
            daily_consumption = material_info.get("average_consumption", 5.0)
        else:
            # Calculate average daily consumption from historical data
            total_consumption = sum([entry["quantity"] for entry in historical_consumption])
            days_span = len(set([entry["date"][:10] for entry in historical_consumption]))
            daily_consumption = total_consumption / max(days_span, 1)

        # Apply seasonal factors and trend analysis (simplified)
        seasonal_factor = self._get_seasonal_factor()
        trend_factor = self._calculate_trend_factor(historical_consumption)

        adjusted_consumption = daily_consumption * seasonal_factor * trend_factor

        # Generate daily forecast
        forecast_data = []
        current_stock = material_info["current_stock"]

        for day in range(forecast_days):
            # Add some random variation
            daily_variation = random.uniform(0.8, 1.2)
            predicted_consumption = adjusted_consumption * daily_variation

            current_stock -= predicted_consumption

            forecast_data.append({
                "day": day + 1,
                "predicted_consumption": round(predicted_consumption, 2),
                "remaining_stock": round(max(0, current_stock), 2),
                "stockout_risk": "High" if current_stock <= 0 else "Low" if current_stock <= material_info["minimum_stock"] else "Normal"
            })

        # Calculate when reorder is needed
        reorder_day = next(
            (d["day"] for d in forecast_data if d["remaining_stock"] <= material_info["minimum_stock"]),
            forecast_days + 1
        )

        return {
            "daily_consumption_avg": round(adjusted_consumption, 2),
            "reorder_recommended_day": reorder_day,
            "forecast_accuracy": "Medium",  # This would be calculated from model performance
            "seasonal_factor": seasonal_factor,
            "trend_factor": trend_factor,
            "daily_forecast": forecast_data
        }

    def _calculate_price_score(self, price_factor: float, current_price: float) -> float:
        # Lower price factor = higher score
        if price_factor <= 0.8:
            return 1.0
        elif price_factor <= 1.0:
            return 0.8
        elif price_factor <= 1.2:
            return 0.6
        else:
            return 0.4

    def _calculate_historical_score(self, supplier_name: str, historical_orders: List[Dict]) -> float:
        supplier_orders = [order for order in historical_orders if order["supplier"] == supplier_name]

        if not supplier_orders:
            return 0.5  # Neutral score for new suppliers

        # Calculate performance based on delivery and pricing
        on_time_deliveries = sum(1 for order in supplier_orders if order["delivery_performance"] == "on_time")
        performance_ratio = on_time_deliveries / len(supplier_orders)

        return performance_ratio

    def _estimate_delivery_time(self, supplier: Dict, quantity: float) -> int:
        base_delivery = 7  # Base 7 days

        # Adjust based on supplier reliability
        reliability_adjustment = int((1 - supplier["reliability"]) * 5)

        # Adjust based on quantity (larger orders take longer)
        quantity_adjustment = int(quantity / 1000)  # 1 extra day per 1000 units

        return base_delivery + reliability_adjustment + quantity_adjustment

    def _generate_recommendation_reason(self, supplier: Dict, price_score: float, 
                                      reliability_score: float) -> str:
        reasons = []

        if price_score >= 0.8:
            reasons.append("competitive pricing")
        if reliability_score >= 0.9:
            reasons.append("high reliability")
        if supplier["rating"] >= 4.5:
            reasons.append("excellent customer rating")

        if not reasons:
            reasons.append("balanced option")

        return f"Recommended for: {', '.join(reasons)}"

    def _calculate_workload_score(self, current_hours: float) -> float:
        # Lower workload = higher score
        if current_hours <= 20:
            return 1.0
        elif current_hours <= 40:
            return 0.8
        elif current_hours <= 60:
            return 0.6
        else:
            return 0.4

    def _calculate_skill_match(self, worker_skill: str, required_skill: str) -> float:
        skill_matches = {
            ("electrician", "electrical"): 1.0,
            ("plumber", "plumbing"): 1.0,
            ("mason", "masonry"): 1.0,
            ("carpenter", "carpentry"): 1.0,
            ("general", "general"): 0.8,
        }

        # Direct match
        match_key = (worker_skill.lower(), required_skill.lower())
        if match_key in skill_matches:
            return skill_matches[match_key]

        # General workers can do general tasks
        if worker_skill.lower() == "general" or required_skill.lower() == "general":
            return 0.7

        return 0.5  # Partial match for cross-training

    def _get_seasonal_factor(self) -> float:
        # Simple seasonal adjustment based on current month
        current_month = datetime.now().month

        # Construction typically slower in winter months
        winter_months = [12, 1, 2]
        summer_months = [6, 7, 8]

        if current_month in winter_months:
            return 0.8  # 20% reduction
        elif current_month in summer_months:
            return 1.2  # 20% increase
        else:
            return 1.0  # Normal

    def _calculate_trend_factor(self, historical_data: List[Dict]) -> float:
        if len(historical_data) < 2:
            return 1.0

        # Simple trend calculation (last half vs first half)
        mid_point = len(historical_data) // 2
        first_half_avg = np.mean([entry["quantity"] for entry in historical_data[:mid_point]])
        second_half_avg = np.mean([entry["quantity"] for entry in historical_data[mid_point:]])

        if first_half_avg == 0:
            return 1.0

        trend = second_half_avg / first_half_avg
        return max(0.5, min(2.0, trend))  # Cap between 0.5 and 2.0
