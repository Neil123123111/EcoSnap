const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";

// ─── Auth types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data as AuthResponse;
};

export const registerUser = async (
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Registration failed");
  return data as AuthResponse;
};


export interface TopPredictionPayload {
  label: string;
  confidence: number;
}

export interface TrashClassificationPayload {
  image_url: string;
  label: string;
  confidence: number;
  top_predictions: TopPredictionPayload[];
  model_path: string;
}

export interface SubmitReportPayload {
  id: number;
  image_url: string;
  label: string;
  confidence: number;
  transcript?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string | null;
}

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
  transcript?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

export const analyzeTrashImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/report/classify`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Trash analysis failed");
  }

  return data as TrashClassificationPayload;
};

export const submitReport = async (params: {
  imageUrl: string;
  label: string;
  confidence: number;
  transcript?: string;
  latitude?: number;
  longitude?: number;
}) => {
  const formData = new FormData();
  formData.append("image_url", params.imageUrl);
  formData.append("label", params.label);
  formData.append("confidence", params.confidence.toString());

  if (params.transcript?.trim()) {
    formData.append("transcript", params.transcript.trim());
  }

  if (params.latitude !== undefined) {
    formData.append("latitude", params.latitude.toString());
  }

  if (params.longitude !== undefined) {
    formData.append("longitude", params.longitude.toString());
  }

  const res = await fetch(`${API_URL}/report/submit`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Unable to submit report");
  }

  return data as SubmitReportPayload;
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

// ─── Community ────────────────────────────────────────────────────────────────

export interface CommunityComment {
  id: number;
  post_id: number;
  username: string;
  content: string;
  created_at?: string | null;
}

export interface CommunityPost {
  id: number;
  username: string;
  content: string;
  image_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  likes: number;
  created_at?: string | null;
  comments: CommunityComment[];
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const fetchCommunityPosts = async (limit = 20, offset = 0): Promise<CommunityPost[]> => {
  const res = await fetch(`${API_URL}/community/posts?limit=${limit}&offset=${offset}`);
  const data = await res.json().catch(() => []);
  if (!res.ok) throw new Error("Unable to fetch community posts");
  return data as CommunityPost[];
};

export const createCommunityPost = async (
  token: string,
  params: { content: string; latitude?: number; longitude?: number; image?: File | null }
): Promise<CommunityPost> => {
  const formData = new FormData();
  formData.append("content", params.content);
  if (params.latitude !== undefined && params.latitude !== null)
    formData.append("latitude", params.latitude.toString());
  if (params.longitude !== undefined && params.longitude !== null)
    formData.append("longitude", params.longitude.toString());
  if (params.image) formData.append("image", params.image);

  const res = await fetch(`${API_URL}/community/posts`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Unable to create post");
  return data as CommunityPost;
};

export const likeCommunityPost = async (token: string, postId: number): Promise<{ likes: number }> => {
  const res = await fetch(`${API_URL}/community/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Unable to like post");
  return data as { likes: number };
};

export const deleteCommunityPost = async (token: string, postId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/community/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Unable to delete post");
  }
};

export const addCommunityComment = async (
  token: string,
  postId: number,
  content: string
): Promise<CommunityComment> => {
  const formData = new FormData();
  formData.append("content", content);
  const res = await fetch(`${API_URL}/community/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Unable to add comment");
  return data as CommunityComment;
};

export const deleteCommunityComment = async (
  token: string,
  postId: number,
  commentId: number
): Promise<void> => {
  const res = await fetch(`${API_URL}/community/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Unable to delete comment");
  }
};

export const updateProfile = async (
  token: string,
  params: {
    display_name?: string;
    current_password?: string;
    new_password?: string;
    avatar?: File | null;
  }
): Promise<{ id: number; email: string; username: string; display_name?: string; avatar_url?: string }> => {
  const formData = new FormData();
  if (params.display_name !== undefined) formData.append("display_name", params.display_name);
  if (params.current_password) formData.append("current_password", params.current_password);
  if (params.new_password) formData.append("new_password", params.new_password);
  if (params.avatar) formData.append("avatar", params.avatar);
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Update failed");
  return data;
};
