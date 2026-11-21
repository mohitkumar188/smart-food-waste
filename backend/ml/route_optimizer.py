import math
from typing import List, Dict

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees). Returns kilometers.
    """
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

class SmartRedistributionMatcher:
    def match_best_receivers(self, source_entity: dict, surplus_qty_kg: float, 
                             safe_hours: float, category: str, available_receivers: List[dict]) -> List[dict]:
        """
        Multi-criteria matching algorithm ranking receivers:
        - Distance (Haversine)
        - Urgency fit vs Transit Time
        - Receiver Capacity
        - Acceptance Type (Cooked / Raw / Packaged / Byproduct)
        """
        scored_receivers = []
        source_lat = source_entity["lat"]
        source_lng = source_entity["lng"]

        for rec in available_receivers:
            dist_km = haversine_distance(source_lat, source_lng, rec["lat"], rec["lng"])
            
            # Estimated transit time at 28 km/h average Delhi-NCR traffic speed + 15 min buffer
            transit_hours = (dist_km / 28.0) + 0.25
            
            # Eligibility checks
            category_allowed = True
            if category == "Cooked Food" and not rec.get("accepts_cooked", 1):
                category_allowed = False
            elif category == "Raw Produce" and not rec.get("accepts_raw", 1):
                category_allowed = False
            elif category == "Packaged Food" and not rec.get("accepts_packaged", 1):
                category_allowed = False
            elif category == "Processing Byproduct" and rec["type"] not in ["b2b_buyer", "community_kitchen"]:
                category_allowed = False

            if not category_allowed:
                continue

            # Capacity suitability (1.0 if fits full batch, scaled down if small)
            cap = rec.get("capacity_kg", 200)
            capacity_score = min(1.0, cap / max(surplus_qty_kg, 1.0)) * 100

            # Distance proximity score (within 35 km max radius)
            dist_score = max(0.0, 100.0 - (dist_km * 2.8))

            # Urgency risk score: safe_hours remaining vs transit time
            time_margin = safe_hours - transit_hours
            if time_margin < 0:
                urgency_score = 0.0  # Cannot make it in time safely!
            elif time_margin < 1.5:
                urgency_score = 40.0
            else:
                urgency_score = 100.0

            # FSSAI compliance verification bonus
            fssai_bonus = 10.0 if rec.get("fssai_verified", 1) else 0.0

            # Weighted composite match score
            total_score = (
                (dist_score * 0.40) +
                (urgency_score * 0.30) +
                (capacity_score * 0.20) +
                (fssai_bonus * 0.10)
            )

            scored_receivers.append({
                **rec,
                "distance_km": dist_km,
                "transit_time_minutes": round(transit_hours * 60, 0),
                "match_score": round(min(99.0, max(20.0, total_score)), 1),
                "safe_margin_hours": round(time_margin, 1),
                "status_badge": "Optimal Match" if total_score > 75 else "Secondary Option"
            })

        # Sort descending by match score
        scored_receivers.sort(key=lambda x: x["match_score"], reverse=True)
        return scored_receivers

class SmartRouteOptimizer:
    def optimize_dispatch_route(self, origin: dict, stops: List[dict]) -> dict:
        """
        Nearest-neighbor heuristic solving Vehicle Routing Problem (VRP)
        from origin to one or multiple redistribution stops.
        Returns optimized waypoint order, coordinates polyline, distance and carbon savings.
        """
        if not stops:
            return {
                "route_waypoints": [origin],
                "polyline": [[origin["lat"], origin["lng"]]],
                "total_distance_km": 0.0,
                "estimated_minutes": 0,
                "fuel_saved_liters": 0.0,
                "carbon_saved_kg": 0.0
            }

        unvisited = list(stops)
        current = origin
        ordered_stops = [origin]
        total_dist = 0.0

        while unvisited:
            # Pick nearest stop
            nearest_idx = 0
            best_dist = float("inf")
            for i, stop in enumerate(unvisited):
                d = haversine_distance(current["lat"], current["lng"], stop["lat"], stop["lng"])
                if d < best_dist:
                    best_dist = d
                    nearest_idx = i
            
            chosen_stop = unvisited.pop(nearest_idx)
            ordered_stops.append(chosen_stop)
            total_dist += best_dist
            current = chosen_stop

        # Est. driving duration: 28 km/h city speed + 10 mins loading/unloading per stop
        est_minutes = int((total_dist / 28.0) * 60) + (len(stops) * 10)

        # Baseline comparison: unoptimized individual return trips to each stop
        unoptimized_dist = 0.0
        for s in stops:
            unoptimized_dist += haversine_distance(origin["lat"], origin["lng"], s["lat"], s["lng"]) * 2.0
            
        distance_saved_km = max(0.0, round(unoptimized_dist - total_dist, 1))
        # Light commercial van consumption ~0.11 L diesel/km
        fuel_saved_liters = round(distance_saved_km * 0.11, 2)
        # 1L diesel ≈ 2.68 kg CO2
        carbon_saved_kg = round(fuel_saved_liters * 2.68, 2)

        polyline = [[s["lat"], s["lng"]] for s in ordered_stops]

        return {
            "route_waypoints": ordered_stops,
            "polyline": polyline,
            "total_distance_km": round(total_dist, 1),
            "estimated_minutes": est_minutes,
            "distance_saved_km": distance_saved_km,
            "fuel_saved_liters": fuel_saved_liters,
            "carbon_saved_kg": carbon_saved_kg,
            "stops_count": len(stops)
        }

redistribution_matcher = SmartRedistributionMatcher()
route_optimizer = SmartRouteOptimizer()
