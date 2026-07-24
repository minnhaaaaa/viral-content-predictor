CITY_INDEX = [
    ("Mumbai", "India", "IN", 19.0760, 72.8777, 20411000),
    ("Delhi", "India", "IN", 28.6139, 77.2090, 32941000),
    ("Bengaluru", "India", "IN", 12.9716, 77.5946, 13608000),
    ("Bangalore", "India", "IN", 12.9716, 77.5946, 13608000),
    ("Hyderabad", "India", "IN", 17.3850, 78.4867, 10494000),
    ("Ahmedabad", "India", "IN", 23.0225, 72.5714, 8450000),
    ("Chennai", "India", "IN", 13.0827, 80.2707, 11503000),
    ("Kolkata", "India", "IN", 22.5726, 88.3639, 15134000),
    ("Pune", "India", "IN", 18.5204, 73.8567, 6987000),
    ("Jaipur", "India", "IN", 26.9124, 75.7873, 4070000),
    ("Surat", "India", "IN", 21.1702, 72.8311, 8076000),
    ("Lucknow", "India", "IN", 26.8467, 80.9462, 3900000),
    ("Kanpur", "India", "IN", 26.4499, 80.3319, 3160000),
    ("Nagpur", "India", "IN", 21.1458, 79.0882, 3000000),
    ("Indore", "India", "IN", 22.7196, 75.8577, 3200000),
    ("Thane", "India", "IN", 19.2183, 72.9781, 2600000),
    ("Bhopal", "India", "IN", 23.2599, 77.4126, 2400000),
    ("Visakhapatnam", "India", "IN", 17.6868, 83.2185, 2350000),
    ("Patna", "India", "IN", 25.5941, 85.1376, 2500000),
    ("Vadodara", "India", "IN", 22.3072, 73.1812, 2200000),
    ("Ghaziabad", "India", "IN", 28.6692, 77.4538, 2400000),
    ("Ludhiana", "India", "IN", 30.9010, 75.8573, 1900000),
    ("Agra", "India", "IN", 27.1767, 78.0081, 2300000),
    ("Nashik", "India", "IN", 19.9975, 73.7898, 2100000),
    ("Faridabad", "India", "IN", 28.4089, 77.3178, 1900000),
    ("Meerut", "India", "IN", 28.9845, 77.7064, 1800000),
    ("Rajkot", "India", "IN", 22.3039, 70.8022, 1800000),
    ("Varanasi", "India", "IN", 25.3176, 82.9739, 1700000),
    ("Srinagar", "India", "IN", 34.0837, 74.7973, 1500000),
    ("Aurangabad", "India", "IN", 19.8762, 75.3433, 1600000),
    ("Dhanbad", "India", "IN", 23.7957, 86.4304, 1400000),
    ("Amritsar", "India", "IN", 31.6340, 74.8723, 1400000),
    ("Navi Mumbai", "India", "IN", 19.0330, 73.0297, 1200000),
    ("Prayagraj", "India", "IN", 25.4358, 81.8463, 1500000),
    ("Ranchi", "India", "IN", 23.3441, 85.3096, 1400000),
    ("Howrah", "India", "IN", 22.5958, 88.2636, 1100000),
    ("Coimbatore", "India", "IN", 11.0168, 76.9558, 2900000),
    ("Jabalpur", "India", "IN", 23.1815, 79.9864, 1300000),
    ("Gwalior", "India", "IN", 26.2183, 78.1828, 1200000),
    ("Vijayawada", "India", "IN", 16.5062, 80.6480, 1500000),
    ("Jodhpur", "India", "IN", 26.2389, 73.0243, 1200000),
    ("Madurai", "India", "IN", 9.9252, 78.1198, 1700000),
    ("Raipur", "India", "IN", 21.2514, 81.6296, 1400000),
    ("Kota", "India", "IN", 25.2138, 75.8648, 1200000),
    ("Guwahati", "India", "IN", 26.1445, 91.7362, 1100000),
    ("Chandigarh", "India", "IN", 30.7333, 76.7794, 1200000),
    ("New York", "United States", "US", 40.7128, -74.0060, 18867000),
    ("Los Angeles", "United States", "US", 34.0522, -118.2437, 11920000),
    ("Chicago", "United States", "US", 41.8781, -87.6298, 8499000),
    ("San Francisco", "United States", "US", 37.7749, -122.4194, 3318000),
    ("London", "United Kingdom", "GB", 51.5072, -0.1276, 9541000),
    ("Dubai", "United Arab Emirates", "AE", 25.2048, 55.2708, 3331000),
    ("Singapore", "Singapore", "SG", 1.3521, 103.8198, 5917000),
    ("Toronto", "Canada", "CA", 43.6532, -79.3832, 6313000),
    ("Sydney", "Australia", "AU", -33.8688, 151.2093, 5297000),
]


def search_locations(query: str, limit: int = 8) -> list:
    """
    Lightweight city autocomplete for the hosted API.

    The previous implementation loaded geonamescache's full city database into
    memory on first search. That is useful locally, but it can exceed Render
    free tier's 512MB memory limit. This index is intentionally small and keeps
    /locations/search cheap enough for the deployed service.
    """
    cleaned_query = query.strip().lower() if query else ""
    if len(cleaned_query) < 2:
        return []

    matches = []
    for city, country, country_code, lat, lon, population in CITY_INDEX:
        city_lower = city.lower()
        if city_lower.startswith(cleaned_query) or cleaned_query in city_lower:
            matches.append(
                {
                    "city": city,
                    "country": country,
                    "country_code": country_code,
                    "lat": lat,
                    "lon": lon,
                    "population": population,
                    "display_name": f"{city}, {country}",
                }
            )

    matches.sort(
        key=lambda match: (
            not match["city"].lower().startswith(cleaned_query),
            -match["population"],
        )
    )
    return matches[:limit]
