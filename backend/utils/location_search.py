import geonamescache
from functools import lru_cache

@lru_cache(maxsize=1)
def get_cities_data():
    """
    Loads the offline city database once and caches it.
    Contains ~25,000 cities worldwide with name, country, lat/lon.
    """
    gc = geonamescache.GeonamesCache()
    return gc.get_cities()


@lru_cache(maxsize=1)
def get_countries_data():
    gc = geonamescache.GeonamesCache()
    return gc.get_countries()


def search_locations(query: str, limit: int = 8) -> list:
    """
    Searches cities by name (fuzzy, case-insensitive, prefix + substring match).
    Returns a list of {city, country, country_code, lat, lon} dicts,
    formatted for a frontend autocomplete dropdown.
    """
    if not query or len(query.strip()) < 2:
        return []

    query_lower = query.strip().lower()
    cities = get_cities_data()
    countries = get_countries_data()

    matches = []

    for city_id, city in cities.items():
        city_name = city["name"]
        if city_name.lower().startswith(query_lower) or query_lower in city_name.lower():
            country_code = city["countrycode"]
            country_name = countries.get(country_code, {}).get("name", country_code)

            matches.append({
                "city": city_name,
                "country": country_name,
                "country_code": country_code,
                "lat": float(city["latitude"]),
                "lon": float(city["longitude"]),
                "population": city.get("population", 0),
                "display_name": f"{city_name}, {country_name}"
            })

    # Prioritise exact prefix matches, then sort by population (bigger cities first)
    matches.sort(key=lambda m: (
        not m["city"].lower().startswith(query_lower),
        -m["population"]
    ))

    return matches[:limit]
