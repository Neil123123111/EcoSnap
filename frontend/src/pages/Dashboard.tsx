import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import {
  Activity,
  Camera,
  ChevronRight,
  Clock3,
  CloudSun,
  Flower2,
  HeartPulse,
  ImageIcon,
  Info,
  Layers3,
  RefreshCcw,
  Search,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";

import Navbar from "../components/Navbar";
import Card from "../components/Card";
import Badge from "../components/Badge";
import { fetchAirQuality, fetchAirQualityTimeline, fetchRecentReports } from "../services/api";
import type {
  AirQualityPayload,
  AirQualityTimelinePayload,
  RecentReportPayload,
} from "../services/api";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const aqiScale = [
  { max: 50, label: "Tốt", tone: "success" as const, card: "from-emerald-300 to-emerald-400" },
  { max: 100, label: "Trung bình", tone: "warning" as const, card: "from-yellow-300 to-amber-300" },
  { max: 150, label: "Nhạy cảm", tone: "warning" as const, card: "from-orange-300 to-amber-400" },
  { max: 200, label: "Có hại", tone: "danger" as const, card: "from-red-400 to-rose-500" },
  { max: 300, label: "Rất có hại", tone: "danger" as const, card: "from-fuchsia-500 to-pink-600" },
  { max: Infinity, label: "Nguy hiểm", tone: "danger" as const, card: "from-violet-700 to-purple-700" },
];

const pollutantNames: Record<string, string> = {
  p2: "PM2.5",
  p1: "PM10",
  o3: "Ozone",
  n2: "NO2",
  s2: "SO2",
  co: "CO",
};

const pollutantDescriptions: Record<string, string> = {
  "PM2.5": "Hạt mịn (≤ 2.5 µm)",
  PM10: "Hạt lớn (≤ 10 µm)",
  Ozone: "Ozone tầng thấp",
  NO2: "Nitrogen dioxide",
  SO2: "Sulphur dioxide",
  CO: "Carbon monoxide",
};

function getAqiBand(aqi: number) {
  return aqiScale.find((entry) => aqi <= entry.max) ?? aqiScale[1];
}

function formatTimestamp(value?: string | null) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function shortHour(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function timeAgo(value?: string | null) {
  if (!value) return "Unknown";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return value;
  const diffMinutes = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.round(diffHours / 24)} ngày trước`;
}

function confidenceTone(confidence: number) {
  if (confidence >= 0.85) return "danger" as const;
  if (confidence >= 0.6) return "warning" as const;
  return "info" as const;
}

function healthAdvice(aqi: number) {
  if (aqi <= 50) {
    return [
      "Có thể hoạt động ngoài trời bình thường.",
      "Tiếp tục theo dõi nếu khu vực gần tuyến đường giao thông lớn.",
      "Mở cửa thông thoáng nếu không có mùi khói hoặc bụi bất thường.",
    ];
  }

  if (aqi <= 100) {
    return [
      "Nhóm nhạy cảm nên giảm vận động mạnh ngoài trời.",
      "Cân nhắc đeo khẩu trang khi di chuyển qua khu vực đông xe.",
      "Theo dõi thêm report mới để xác định điểm nóng ô nhiễm.",
    ];
  }

  return [
    "Nhóm nhạy cảm nên hạn chế ra ngoài.",
    "Đóng cửa sổ nếu khu vực có khói hoặc bụi mịn rõ rệt.",
    "Ưu tiên kiểm tra các report độ tin cậy cao quanh khu vực của bạn.",
  ];
}

export default function Dashboard() {
  const [airData, setAirData] = useState<AirQualityPayload | null>(null);
  const [timeline, setTimeline] = useState<AirQualityTimelinePayload | null>(null);
  const [reports, setReports] = useState<RecentReportPayload[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [locationLabel, setLocationLabel] = useState("Đang xác định vị trí...");
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const reportsPromise = fetchRecentReports(8);
        let lat: number | undefined;
        let lon: number | undefined;
        let airResponse: AirQualityPayload;

        if (navigator.geolocation) {
          const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position.coords),
              (error) => reject(new Error(error.message)),
              { enableHighAccuracy: true, timeout: 12000 }
            );
          });

          lat = coords.latitude;
          lon = coords.longitude;
          airResponse = await fetchAirQuality({ lat, lon });
        } else {
          airResponse = await fetchAirQuality({
            city: "Ho Chi Minh City",
            state: "Ho Chi Minh",
            country: "Vietnam",
          });

          const coords = airResponse.location?.coordinates;
          if (coords && coords.length >= 2) {
            lon = coords[0];
            lat = coords[1];
          }
        }

        if (lat === undefined || lon === undefined) {
          throw new Error("Không lấy được tọa độ để tải history/forecast.");
        }

        const [reportsResponse, timelineResponse] = await Promise.all([
          reportsPromise,
          fetchAirQualityTimeline({ lat, lon }),
        ]);

        if (!cancelled) {
          setAirData(airResponse);
          setTimeline(timelineResponse);
          setReports(reportsResponse);
          setLocationLabel(`${airResponse.city}, ${airResponse.state}, ${airResponse.country}`);
        }
      } catch (error) {
        if (!cancelled) {
          setAirData(null);
          setTimeline(null);
          setReports([]);
          setErrorMessage(error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const aqiUS = airData?.current?.pollution?.aqius ?? timeline?.current?.us_aqi ?? 0;
  const weather = airData?.current?.weather;
  const band = getAqiBand(aqiUS);
  const mainPollutant = pollutantNames[airData?.current?.pollution?.mainus ?? ""] ?? "PM2.5";
  const coordinates = airData?.location?.coordinates;
  const position = useMemo<LatLngExpression | null>(() => {
    if (!coordinates || coordinates.length < 2) return null;
    return [coordinates[1], coordinates[0]];
  }, [coordinates]);

  const chartPoints = useMemo(() => {
    const times = timeline?.hourly?.time ?? [];
    const values = timeline?.hourly?.us_aqi ?? [];
    const pairs = times.map((time, index) => ({
      time,
      value: values[index] ?? 0,
    }));

    return pairs.slice(-24);
  }, [timeline]);

  const maxChartValue = Math.max(...chartPoints.map((point) => point.value || 0), 1);

  const forecastCards = useMemo(() => {
    const times = timeline?.hourly?.time ?? [];
    const aqiValues = timeline?.hourly?.us_aqi ?? [];
    const pm25 = timeline?.hourly?.pm2_5 ?? [];

    return times.slice(0, 8).map((time, index) => ({
      time,
      aqi: aqiValues[index],
      pm25: pm25[index],
    }));
  }, [timeline]);

  const pollutantCards = [
    {
      name: "PM2.5",
      description: pollutantDescriptions["PM2.5"],
      value: timeline?.current?.pm2_5,
      tone: "bg-yellow-400",
    },
    {
      name: "PM10",
      description: pollutantDescriptions.PM10,
      value: timeline?.current?.pm10,
      tone: "bg-lime-400",
    },
    {
      name: "SO2",
      description: pollutantDescriptions.SO2,
      value: timeline?.current?.sulphur_dioxide,
      tone: "bg-emerald-400",
    },
    {
      name: "NO2",
      description: pollutantDescriptions.NO2,
      value: timeline?.current?.nitrogen_dioxide,
      tone: "bg-sky-400",
    },
    {
      name: "Ozone",
      description: pollutantDescriptions.Ozone,
      value: timeline?.current?.ozone,
      tone: "bg-orange-400",
    },
    {
      name: "CO",
      description: pollutantDescriptions.CO,
      value: timeline?.current?.carbon_monoxide,
      tone: "bg-rose-400",
    },
  ];

  const dominantLabel = useMemo(() => {
    if (reports.length === 0) return "Chưa có report";
    return (
      Object.entries(
        reports.reduce<Record<string, number>>((acc, report) => {
          acc[report.label] = (acc[report.label] ?? 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown"
    );
  }, [reports]);

  const advice = healthAdvice(aqiUS);
  const highConfidenceCount = reports.filter((report) => report.confidence >= 0.85).length;
  const latestReportTime = reports[0]?.created_at ? timeAgo(reports[0].created_at) : "Chưa có";
  const healthCards = [
    {
      title: "Bảo vệ nhóm nhạy cảm",
      description: advice[0],
      icon: UserRound,
      accent: "from-rose-100 to-pink-100 dark:from-rose-950/60 dark:to-pink-950/40",
      badge: "Ưu tiên",
      emoji: "🫁",
    },
    {
      title: "Giảm phơi nhiễm ngoài trời",
      description: advice[1],
      icon: HeartPulse,
      accent: "from-amber-100 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-950/40",
      badge: "Khuyến nghị",
      emoji: "😷",
    },
    {
      title: "Theo dõi và phản ứng sớm",
      description: advice[2],
      icon: Sparkles,
      accent: "from-sky-100 to-cyan-100 dark:from-sky-950/60 dark:to-cyan-950/40",
      badge: "Hành động",
      emoji: "📡",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,216,102,0.28),_transparent_32%),linear-gradient(180deg,_#fffaf0_0%,_#f8fafc_30%,_#eef4ff_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.1),_transparent_24%),linear-gradient(180deg,_#07111b_0%,_#0f172a_45%,_#111827_100%)] dark:text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-28">
        <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <Search className="h-5 w-5 text-slate-400" />
            <div className="min-w-0">
              <div className="truncate text-sm text-slate-500 dark:text-slate-400">{locationLabel}</div>
              <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                IQAir cho current AQI, Open-Meteo cho history/forecast, EcoSnap cho recent reports
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-600 shadow-sm transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <RefreshCcw className="h-5 w-5" />
            </button>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Info className="h-5 w-5" />
            </div>
          </div>
        </section>

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-200">
            Không thể tải dữ liệu từ API: {errorMessage}
          </div>
        )}

        <section className="mb-10 grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
          <div>
            <div className="mb-4 text-sm text-slate-500 dark:text-slate-400">
              Thế giới / Việt Nam / {airData?.state ?? "..."} /{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{airData?.city ?? "Đang tải"}</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Chất lượng không khí tại {airData?.city ?? "khu vực của bạn"}
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Chỉ số chất lượng không khí hiện tại, lịch sử gần đây, forecast theo giờ và report hệ thống được tổng
              hợp từ nhiều API mở.
            </p>
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Cập nhật lúc {formatTimestamp(airData?.current?.pollution?.ts || timeline?.current?.time)}
            </div>

            <div className="mt-8 inline-flex min-w-[280px] flex-col rounded-3xl border border-slate-200 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
                <div className="text-lg font-semibold text-slate-900 dark:text-white">Nguồn dữ liệu</div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
              <div className="space-y-3 px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">IQAir</span>
                  Current AQI + thời tiết hiện tại
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-sky-100 px-3 py-1 font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">Open-Meteo</span>
                  History/forecast + pollutant detail
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">EcoSnap</span>
                  {reports.length} report gần đây từ DB
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-[28px] bg-gradient-to-br ${band.card} p-4 shadow-[0_24px_60px_rgba(234,179,8,0.22)]`}>
            <div className="rounded-[22px] bg-[#ffd84a]/90 p-5 text-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-[#e8bc13] px-4 py-3 text-center shadow-inner">
                    <div className="text-3xl font-black">{loading ? "--" : aqiUS}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-700">AQI Mỹ</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{loading ? "Đang tải" : band.label}</div>
                    <div className="mt-1 text-sm text-slate-700">
                      Ô nhiễm chính: <span className="font-semibold">{loading ? "--" : mainPollutant}</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-full border border-slate-700/20 bg-white/40 p-3">
                  <Activity className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-5 border-t border-slate-700/15 pt-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="rounded-2xl bg-white/45 px-3 py-3">
                    <div className="text-slate-600">Nhiệt độ</div>
                    <div className="mt-1 text-lg font-bold">{weather?.tp ?? "--"}°</div>
                  </div>
                  <div className="rounded-2xl bg-white/45 px-3 py-3">
                    <div className="text-slate-600">Gió</div>
                    <div className="mt-1 text-lg font-bold">{weather?.ws ?? "--"} km/h</div>
                  </div>
                  <div className="rounded-2xl bg-white/45 px-3 py-3">
                    <div className="text-slate-600">Độ ẩm</div>
                    <div className="mt-1 text-lg font-bold">{weather?.hu ?? "--"}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <Card className="rounded-[28px] border border-rose-100 bg-rose-50/80 p-6 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/30" hover={false}>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-900/60 dark:text-rose-300">
                <TriangleAlert className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">Khuyến nghị sức khỏe</div>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Khuyến nghị được điều chỉnh theo AQI hiện tại và report gần đây.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {healthCards.map((card) => (
                <div
                  key={card.title}
                  className={`group relative overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br ${card.accent} p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-slate-800`}
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/40 blur-2xl dark:bg-white/5" />
                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-slate-800 shadow-sm dark:bg-slate-900/70 dark:text-white">
                        <card.icon className="h-6 w-6" />
                      </div>
                      <div className="text-3xl leading-none">{card.emoji}</div>
                    </div>

                    <div className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
                      {card.badge}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-200">{card.description}</p>

                    <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-xs leading-6 text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
                      {aqiUS <= 50
                        ? "Mức AQI hiện tại tương đối an toàn, nhưng vẫn nên theo dõi biến động nếu khu vực có giao thông dày."
                        : aqiUS <= 100
                          ? "AQI ở vùng trung bình, các khuyến nghị này giúp giảm tiếp xúc bụi mịn và triệu chứng khó chịu."
                          : "AQI đang cao, nên ưu tiên các bước bảo vệ cá nhân và giảm thời gian tiếp xúc ngoài trời."}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
                    <Flower2 className="h-5 w-5" />
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Mức cảnh báo</div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{band.label}</div>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Đánh giá theo AQI hiện tại.</div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300">
                    <CloudSun className="h-5 w-5" />
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Yếu tố chính</div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">{mainPollutant}</div>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Chất ô nhiễm đang nổi bật nhất.</div>
              </div>

              <div className="rounded-3xl border border-white/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300">
                    <Info className="h-5 w-5" />
                  </div>
                  <div className="text-base font-semibold text-slate-900 dark:text-white">Report nổi bật</div>
                </div>
                <div className="text-2xl font-black capitalize text-slate-900 dark:text-white">{dominantLabel}</div>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tổng hợp từ report gần đây trong hệ thống.</div>
              </div>
            </div>
          </Card>
        </section>

        <section className="space-y-6">
            <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
              <div className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Chất gây ô nhiễm không khí</div>
              <p className="mb-6 text-lg text-slate-500 dark:text-slate-400">
                Nồng độ hiện tại từ Open-Meteo tại vị trí người dùng.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {pollutantCards.map((item) => (
                  <div key={item.name} className="rounded-3xl bg-slate-50 p-5 dark:bg-slate-800/70">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.description}</div>
                    <div className="mt-6 flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${item.tone}`} />
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {item.value !== null && item.value !== undefined ? `${item.value} µg/m³` : "--"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
              <div className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Lịch sử gần đây</div>
              <p className="mb-6 text-lg text-slate-500 dark:text-slate-400">
                Biểu đồ AQI theo giờ trong 24 mốc gần nhất từ Open-Meteo tại vị trí hiện tại.
              </p>

              <div className="mb-4 flex items-center gap-3 text-lg text-slate-700 dark:text-slate-200">
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="font-semibold">{loading ? "--" : aqiUS} AQI Mỹ</span>
                <span>{loading ? "Đang tải" : band.label}</span>
              </div>

              <div className="rounded-3xl bg-slate-50/80 p-4 dark:bg-slate-800/60">
                <div className="flex h-56 items-end gap-2 overflow-x-auto">
                  {chartPoints.map((point) => (
                    <div key={point.time} className="flex min-w-[34px] flex-col items-center justify-end gap-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">{point.value}</div>
                      <div
                        className="w-6 rounded-t-xl bg-gradient-to-t from-yellow-400 to-amber-300"
                        style={{ height: `${Math.max(16, (point.value / maxChartValue) * 140)}px` }}
                      />
                      <div className="text-[11px] text-slate-400">{shortHour(point.time)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
              <div className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Bản đồ ô nhiễm theo vị trí</div>
              <p className="mb-6 text-lg text-slate-500 dark:text-slate-400">
                Tâm bản đồ lấy từ vị trí city hiện tại mà IQAir trả về.
              </p>

              {isMapReady && position ? (
                <MapContainer center={position} zoom={11} className="h-[360px] overflow-hidden rounded-3xl">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position}>
                    <Popup>
                      <div className="font-semibold">{airData?.city}</div>
                      <div>AQI Mỹ: {aqiUS}</div>
                      <div>Report nổi bật: {dominantLabel}</div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="flex h-[360px] items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {loading ? "Đang tải bản đồ..." : "Không có dữ liệu vị trí để hiển thị bản đồ."}
                </div>
              )}
            </Card>
        </section>

        <section className="mt-6 space-y-6">
          <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
            <div className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Dự báo theo giờ</div>
            <p className="mb-6 text-lg text-slate-500 dark:text-slate-400">
              8 mốc gần nhất từ Open-Meteo để quan sát biến động AQI và PM2.5.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {forecastCards.map((item) => (
                <div key={item.time} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <div className="text-sm text-slate-400">{shortHour(item.time)}</div>
                  <div className="mt-3 inline-flex rounded-xl bg-yellow-300 px-3 py-1 text-lg font-bold text-slate-900">
                    {item.aqi ?? "--"}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CloudSun className="h-4 w-4 text-amber-500" />
                    PM2.5: {item.pm25 !== null && item.pm25 !== undefined ? `${item.pm25} µg/m³` : "--"}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80" hover={false}>
            <div className="mb-3 text-3xl font-bold text-slate-900 dark:text-white">Report thời gian thực</div>
            <p className="mb-6 text-lg text-slate-500 dark:text-slate-400">
              Các report mới nhất lấy trực tiếp từ database EcoSnap.
            </p>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-white/70 bg-gradient-to-br from-sky-100 to-cyan-100 p-4 shadow-sm dark:border-slate-800 dark:from-sky-950/50 dark:to-cyan-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-800 dark:bg-slate-900/70 dark:text-white">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Tổng report</span>
                </div>
                <div className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{reports.length}</div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-gradient-to-br from-amber-100 to-yellow-100 p-4 shadow-sm dark:border-slate-800 dark:from-amber-950/50 dark:to-yellow-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-800 dark:bg-slate-900/70 dark:text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Confidence cao</span>
                </div>
                <div className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{highConfidenceCount}</div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-gradient-to-br from-emerald-100 to-lime-100 p-4 shadow-sm dark:border-slate-800 dark:from-emerald-950/50 dark:to-lime-950/30">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-slate-800 dark:bg-slate-900/70 dark:text-white">
                    <Camera className="h-5 w-5" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Mới nhất</span>
                </div>
                <div className="mt-5 text-2xl font-black text-slate-900 dark:text-white">{latestReportTime}</div>
              </div>
            </div>

            <div className="space-y-4">
              {reports.length === 0 && !loading && (
                <div className="rounded-3xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Chưa có report nào trong database.
                </div>
              )}

              {reports.map((report) => (
                <div
                  key={report.id}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="relative min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.35),_transparent_32%),linear-gradient(160deg,_#0f172a_0%,_#1e293b_48%,_#334155_100%)]">
                      {report.image_url ? (
                        <img
                          src={report.image_url}
                          alt={report.label}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-white/90">
                          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                          <div className="px-6 text-center">
                            <div className="text-lg font-semibold">Không có ảnh xem trước</div>
                            <div className="mt-2 text-sm text-white/70">Report vẫn đang hiển thị trực tiếp từ database.</div>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 to-transparent p-5 text-white">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-xl font-bold capitalize">{report.label}</div>
                            <div className="mt-1 text-sm text-white/70">Report #{report.id}</div>
                          </div>
                          <Badge variant={confidenceTone(report.confidence)}>
                            {Math.round(report.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-5">
                      <div>
                        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/70">
                            <Clock3 className="h-4 w-4" />
                            {timeAgo(report.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-700/70">
                            <Activity className="h-4 w-4" />
                            {formatTimestamp(report.created_at)}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Loại phát hiện</div>
                            <div className="mt-2 text-lg font-bold capitalize text-slate-900 dark:text-white">
                              {report.label}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/50">
                            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Độ tin cậy</div>
                            <div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                              {Math.round(report.confidence * 100)}%
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-7 text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                          Report này có thể dùng để đối chiếu với AQI hiện tại, nồng độ chất ô nhiễm và các biến động trong lịch sử gần đây.
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                          href={report.image_url || "#"}
                          target={report.image_url ? "_blank" : undefined}
                          rel={report.image_url ? "noreferrer" : undefined}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                            report.image_url
                              ? "bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                              : "cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          <ImageIcon className="h-4 w-4" />
                          {report.image_url ? "Xem ảnh report" : "Không có ảnh"}
                        </a>

                        <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Sparkles className="h-4 w-4" />
                          Đồng bộ thời gian thực
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
