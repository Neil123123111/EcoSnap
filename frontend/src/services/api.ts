const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

export interface AirQualityPayload {
  city: string;
  state: string;
  country: string;
  location?: {
    coordinates?: [number, number];
  };
  current?: {
    pollution?: {
      aqius?: number;
      aqicn?: number;
      mainus?: string;
      maincn?: string;
      ts?: string;
    };
    weather?: {
      tp?: number;
      hu?: number;
      ws?: number;
      wd?: number;
      ic?: string;
      ts?: string;
    };
  };
}

export interface RecentReportPayload {
  id: number;
  image_url?: string;
  label: string;
  confidence: number;
  created_at?: string | null;
}

export interface AirQualityTimelinePayload {
  latitude: number;
  longitude: number;
  timezone?: string;
  current?: {
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
    carbon_monoxide?: number;
    nitrogen_dioxide?: number;
    sulphur_dioxide?: number;
    ozone?: number;
    time?: string;
  };
  hourly?: {
    time?: string[];
    us_aqi?: Array<number | null>;
    pm2_5?: Array<number | null>;
    pm10?: Array<number | null>;
    carbon_monoxide?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
    sulphur_dioxide?: Array<number | null>;
    ozone?: Array<number | null>;
  };
}

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/report/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
};

export const fetchAirQuality = async (params: {
  lat?: number;
  lon?: number;
  city?: string;
  state?: string;
  country?: string;
}) => {
  const search = new URLSearchParams();

  if (params.lat !== undefined && params.lon !== undefined) {
    search.set("lat", params.lat.toString());
    search.set("lon", params.lon.toString());
  } else if (params.city && params.state && params.country) {
    search.set("city", params.city);
    search.set("state", params.state);
    search.set("country", params.country);
  }

  const res = await fetch(`${API_URL}/report/air-quality?${search.toString()}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Unable to fetch air quality data");
  }

  return data as AirQualityPayload;
};

export const fetchRecentReports = async (limit = 10) => {
  const res = await fetch(`${API_URL}/report/recent?limit=${limit}`);
  const data = await res.json().catch(() => []);

  if (!res.ok) {
    throw new Error("Unable to fetch recent reports");
  }

  return data as RecentReportPayload[];
};

export const fetchAirQualityTimeline = async (params: { lat: number; lon: number }) => {
  const search = new URLSearchParams({
    lat: params.lat.toString(),
    lon: params.lon.toString(),
  });

  const res = await fetch(`${API_URL}/report/air-quality-timeline?${search.toString()}`);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Unable to fetch air quality timeline");
  }

  return data as AirQualityTimelinePayload;
};

export const translateText = async (
  text: string,
  targetLang = "en",
  sourceLang = "auto"
) => {
  if (!text.trim()) {
    return "";
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: sourceLang,
    tl: targetLang,
    dt: "t",
    q: text,
  });

  const res = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Translation failed");
  }

  const data = await res.json();
  return Array.isArray(data?.[0])
    ? data[0].map((item: unknown[]) => item?.[0] ?? "").join("")
    : "";
};
