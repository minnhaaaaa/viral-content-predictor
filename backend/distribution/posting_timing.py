import pytz
from timezonefinder import TimezoneFinder
from functools import lru_cache

GOOD_WINDOWS = [
    (6, 9),    # 6am - 9am
    (19, 22)   # 7pm - 10pm
]


@lru_cache(maxsize=1)
def get_timezone_finder():
    return TimezoneFinder()


def get_timezone_from_coordinates(lat: float, lon: float) -> str:
    """
    Returns the precise IANA timezone for any lat/lon coordinate.
    Fully offline, no API calls, no rate limits.
    """
    tf = get_timezone_finder()
    timezone_name = tf.timezone_at(lat=lat, lng=lon)
    return timezone_name if timezone_name else "UTC"


def score_posting_timing(lat: float, lon: float, intended_posting_time: str, location_label: str = "") -> dict:
    """
    Scores how close the intended posting time is to high-engagement windows
    for the target audience's precise location.
    lat, lon: coordinates of the selected city (from the autocomplete dropdown)
    intended_posting_time: "HH:MM" 24hr format string
    location_label: display name like "Mumbai, India" for messages
    Returns score 0-10 plus the recommended optimal window as text.
    """
    timezone_name = get_timezone_from_coordinates(lat, lon)

    try:
        hour, minute = map(int, intended_posting_time.strip().split(":"))
        intended_minutes = hour * 60 + minute
    except (ValueError, AttributeError):
        return {
            "score": 0.0,
            "timezone_used": timezone_name,
            "reason": f"Could not parse posting time '{intended_posting_time}'. Expected HH:MM format.",
            "recommendation": "Provide posting time in HH:MM 24hr format."
        }

    min_distance = float("inf")
    closest_window = None

    for start_hour, end_hour in GOOD_WINDOWS:
        start_minutes = start_hour * 60
        end_minutes = end_hour * 60

        if start_minutes <= intended_minutes <= end_minutes:
            min_distance = 0
            closest_window = (start_hour, end_hour)
            break

        dist_to_start = abs(intended_minutes - start_minutes)
        dist_to_end = abs(intended_minutes - end_minutes)
        local_min = min(dist_to_start, dist_to_end)

        if local_min < min_distance:
            min_distance = local_min
            closest_window = (start_hour, end_hour)

    if min_distance == 0:
        score = 10.0
        reason = f"Posting time {intended_posting_time} falls directly within a high-engagement window for {location_label}."
    elif min_distance <= 60:
        score = 7.0
        reason = f"Posting time {intended_posting_time} is within 1 hour of a high-engagement window for {location_label}."
    elif min_distance <= 120:
        score = 4.0
        reason = f"Posting time {intended_posting_time} is within 2 hours of a high-engagement window for {location_label}."
    else:
        score = 2.0
        reason = f"Posting time {intended_posting_time} is far from any high-engagement window for {location_label}."

    start_h, end_h = closest_window
    tz_display = timezone_name.split("/")[-1].replace("_", " ")
    recommended = f"Post between {start_h % 24}:00 and {end_h % 24}:00 {tz_display} time"

    return {
        "score": round(score, 2),
        "timezone_used": timezone_name,
        "reason": reason,
        "recommendation": recommended
    }
