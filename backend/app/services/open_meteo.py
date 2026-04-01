import json
import urllib.parse
import urllib.request

from fastapi import HTTPException

from app.core.config import settings


def _fetch_open_meteo(query: dict[str, str]) -> dict:
    params = urllib.parse.urlencode(query)
    url = f"{settings.OPEN_METEO_AIR_QUALITY_BASE_URL}/air-quality?{params}"

    request = urllib.request.Request(
        url,
        method="GET",
        headers={
            "Accept": "application/json",
            "User-Agent": "EcoSnap/1.0",
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Open-Meteo request failed: {exc}") from exc


async def get_air_quality_timeline(lat: str, lon: str) -> dict:
    hourly_fields = ",".join(
        [
            "us_aqi",
            "pm2_5",
            "pm10",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
        ]
    )

    current_fields = ",".join(
        [
            "us_aqi",
            "pm2_5",
            "pm10",
            "carbon_monoxide",
            "nitrogen_dioxide",
            "sulphur_dioxide",
            "ozone",
        ]
    )

    return _fetch_open_meteo(
        {
            "latitude": lat,
            "longitude": lon,
            "timezone": "auto",
            "current": current_fields,
            "hourly": hourly_fields,
            "forecast_days": "2",
            "past_days": "2",
        }
    )
