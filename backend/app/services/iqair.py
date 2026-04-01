import json
import urllib.parse
import urllib.request

from fastapi import HTTPException

from app.core.config import settings


def _fetch_iqair(path: str, query: dict[str, str]) -> dict:
    if not settings.IQAIR_API_KEY:
        raise HTTPException(status_code=503, detail="IQAIR_API_KEY is not configured on the backend")

    params = urllib.parse.urlencode({**query, "key": settings.IQAIR_API_KEY})
    url = f"{settings.IQAIR_BASE_URL}{path}?{params}"

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
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"IQAir request failed: {exc}") from exc

    status = payload.get("status")
    if status != "success":
        message = payload.get("data", {}).get("message") if isinstance(payload.get("data"), dict) else None
        raise HTTPException(status_code=502, detail=message or "IQAir returned an unexpected response")

    return payload.get("data", {})


async def get_nearest_city_air_quality(lat: str, lon: str) -> dict:
    return _fetch_iqair("/nearest_city", {"lat": lat, "lon": lon})


async def get_city_air_quality(city: str, state: str, country: str) -> dict:
    return _fetch_iqair("/city", {"city": city, "state": state, "country": country})
