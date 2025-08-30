import numpy as np
from typing import Dict, List
import random
from datetime import datetime, timedelta

class DelayPredictor:
    def __init__(self):
        # In a real implementation, this would load a trained ML model
        # For demo purposes, we'll use rule-based predictions
        self.model_version = "1.0.0"
        self.features = [
            "material_availability",
            "weather_conditions", 
            "labour_productivity",
            "task_complexity"
        ]

    def predict_delay(self, materials_data: List[Dict], tasks_data: List[Dict], weather_data: Dict) -> Dict:
        # Calculate material impact
        material_impact = self._calculate_material_impact(materials_data)

        # Calculate weather impact
        weather_impact = self._calculate_weather_impact(weather_data)

        # Calculate labour impact
        labour_impact = self._calculate_labour_impact(tasks_data)

        # Combine impacts to get overall delay risk
        delay_risk_score = self._combine_impacts(material_impact, weather_impact, labour_impact)

        # Generate contributing factors
        contributing_factors = self._identify_contributing_factors(
            material_impact, weather_impact, labour_impact
        )

        # Generate recommendations
        recommended_actions = self._generate_recommendations(
            material_impact, weather_impact, labour_impact, delay_risk_score
        )

        return {
            "delay_risk_score": delay_risk_score,
            "material_impact": material_impact,
            "weather_impact": weather_impact,
            "labour_impact": labour_impact,
            "contributing_factors": contributing_factors,
            "recommended_actions": recommended_actions,
            "prediction_confidence": 0.85,
            "model_version": self.model_version
        }

    def _calculate_material_impact(self, materials_data: List[Dict]) -> float:
        if not materials_data:
            return 0.0

        low_stock_count = 0
        total_materials = len(materials_data)

        for material in materials_data:
            current = material.get("current_stock", 0)
            minimum = material.get("minimum_stock", 0)
            if current <= minimum:
                low_stock_count += 1

        # Higher percentage of low stock = higher impact
        low_stock_ratio = low_stock_count / total_materials
        return min(low_stock_ratio * 0.8, 0.8)  # Cap at 0.8

    def _calculate_weather_impact(self, weather_data: Dict) -> float:
        precipitation = weather_data.get("precipitation_chance", 0)
        wind_speed = weather_data.get("wind_speed", 0)
        temperature = weather_data.get("temperature", 25)

        # High precipitation or extreme temperatures increase delay risk
        precip_impact = min(precipitation / 100.0, 0.6)
        wind_impact = min(wind_speed / 50.0, 0.3)  # Assume 50+ mph is problematic

        # Extreme temperatures (below 0 or above 40 Celsius)
        temp_impact = 0.0
        if temperature < 0 or temperature > 40:
            temp_impact = 0.4
        elif temperature < 5 or temperature > 35:
            temp_impact = 0.2

        return min(precip_impact + wind_impact + temp_impact, 0.7)

    def _calculate_labour_impact(self, tasks_data: List[Dict]) -> float:
        if not tasks_data:
            return 0.0

        behind_schedule_count = 0
        total_tasks = len(tasks_data)

        for task in tasks_data:
            progress = task.get("progress", 0)
            status = task.get("status", "not_started")

            # Tasks that are in progress but significantly behind
            if status == "in_progress" and progress < 0.5:
                behind_schedule_count += 1
            elif status == "not_started":
                behind_schedule_count += 0.5  # Partial impact for not started

        behind_ratio = behind_schedule_count / total_tasks
        return min(behind_ratio * 0.6, 0.6)

    def _combine_impacts(self, material_impact: float, weather_impact: float, labour_impact: float) -> float:
        # Weighted combination of impacts
        weights = {"material": 0.4, "weather": 0.3, "labour": 0.3}

        combined_score = (
            material_impact * weights["material"] +
            weather_impact * weights["weather"] +
            labour_impact * weights["labour"]
        )

        # Add some random variation to simulate model uncertainty
        variation = random.uniform(-0.05, 0.05)
        final_score = max(0.0, min(1.0, combined_score + variation))

        return round(final_score, 3)

    def _identify_contributing_factors(self, material_impact: float, weather_impact: float, labour_impact: float) -> List[str]:
        factors = []

        if material_impact > 0.3:
            factors.append("Material shortages detected")
        if weather_impact > 0.3:
            factors.append("Adverse weather conditions")
        if labour_impact > 0.3:
            factors.append("Labour productivity concerns")
        if material_impact > 0.5:
            factors.append("Critical material stockouts")
        if weather_impact > 0.5:
            factors.append("Severe weather warnings")

        return factors

    def _generate_recommendations(self, material_impact: float, weather_impact: float, 
                                labour_impact: float, overall_risk: float) -> List[str]:
        recommendations = []

        if material_impact > 0.3:
            recommendations.append("Expedite material orders for low-stock items")
            recommendations.append("Contact alternative suppliers for critical materials")

        if weather_impact > 0.3:
            recommendations.append("Schedule weather-dependent tasks for better conditions")
            recommendations.append("Prepare protective measures for equipment and materials")

        if labour_impact > 0.3:
            recommendations.append("Reassign workers to balance workload")
            recommendations.append("Consider hiring additional temporary workers")

        if overall_risk > 0.6:
            recommendations.append("Consider adjusting project timeline")
            recommendations.append("Increase management oversight and daily check-ins")

        return recommendations
