import L from "leaflet";

// ─── Marker Token System ─────────────────────────────────────────────────────

export const MARKER_TOKENS = {
  temple:  { bg: "#FF6B35", glow: "#FF6B3580", emoji: "🛕", label: "Temple"   },
  water:   { bg: "#06B6D4", glow: "#06B6D480", emoji: "💧", label: "Water"    },
  food:    { bg: "#F59E0B", glow: "#F59E0B80", emoji: "🍽️", label: "Food"    },
  rest:    { bg: "#8B5CF6", glow: "#8B5CF680", emoji: "🏠", label: "Rest"     },
  toilet:  { bg: "#6B7280", glow: "#6B728080", emoji: "🚻", label: "Restroom" },
  medical: { bg: "#EF4444", glow: "#EF444480", emoji: "🏥", label: "Medical"  },
  parking: { bg: "#10B981", glow: "#10B98180", emoji: "🅿️", label: "Parking" },
} as const;

export type MarkerType = keyof typeof MARKER_TOKENS;

// ─── SVG Icon Strings ────────────────────────────────────────────────────────

const SVG_ICONS: Record<MarkerType, string> = {
  temple: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20M4 20V10l8-7 8 7v10M10 20v-5h4v5"/></svg>`,
  water:  `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z"/></svg>`,
  food:   `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>`,
  rest:   `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  toilet: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v6m0 0-3 5m3-5 3 5"/></svg>`,
  medical:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  parking:`<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>`,
};

// ─── Premium Landmark Marker ─────────────────────────────────────────────────

export const createPremiumMarker = (
  type: MarkerType,
  options: { selected?: boolean; hovered?: boolean } = {}
): L.DivIcon => {
  const token = MARKER_TOKENS[type];
  const size = 40;

  return L.divIcon({
    className: "pm-wrapper",
    html: `
      <div class="pm-root" data-type="${type}" style="width:${size}px;height:${size}px;">
        <div class="pm-body" style="background:${token.bg};width:${size}px;height:${size}px;">
          <div class="pm-svg">${SVG_ICONS[type]}</div>
        </div>
        <div class="pm-tail" style="background:${token.bg};"></div>
      </div>`,
    iconSize:   [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    popupAnchor:[0, -(size + 4)],
  });
};

// ─── Instagram / Snap Map Photo Card Marker ──────────────────────────────────
// Used when a landmark has an image_url — replaces the drop-pin icon

export const createPhotoMarker = (
  imageUrl: string,
  type: MarkerType,
): L.DivIcon => {
  const token = MARKER_TOKENS[type];
  const W = 64;
  const H = 76;
  const total = H + 10;

  return L.divIcon({
    className: "pmc-wrapper",
    html: `
      <div class="pmc-root" style="--pmc-accent:${token.bg};">
        <div class="pmc-card">
          <img class="pmc-photo" src="${imageUrl}" alt="landmark" />
        </div>
        <div class="pmc-tail"></div>
      </div>`,
    iconSize:   [W + 6, total],
    iconAnchor: [(W + 6) / 2, total],
    popupAnchor:[0, -total],
  });
};

// ─── Popup action helpers (called from inline onclick in Leaflet HTML popups) ──

if (typeof window !== "undefined") {
  (window as any).__gv_directions = (lat: number, lng: number) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  (window as any).__gv_share = async (name: string, lat: number, lng: number, btnEl: HTMLElement) => {
    const mapsUrl = `https://maps.google.com?q=${lat},${lng}`;
    const text = `${name} — Girivalam landmark\n${mapsUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url: mapsUrl });
      } else {
        await navigator.clipboard.writeText(text);
        const orig = btnEl.innerHTML;
        btnEl.textContent = "✓ Copied!";
        setTimeout(() => { btnEl.innerHTML = orig; }, 2000);
      }
    } catch {
      // user cancelled share — ignore
    }
  };
}

// ─── Glassmorphism Popup ─────────────────────────────────────────────────────

export interface PopupData {
  name: string;
  type: MarkerType;
  lat?: number;
  lng?: number;
  description?: string;
  timings?: string;
  direction?: string;
  facilities?: string[];
  distance?: string;
  imageUrl?: string;
}

export const buildGlassPopup = (data: PopupData): string => {
  const token = MARKER_TOKENS[data.type];
  const facilitiesHtml = data.facilities?.length
    ? `<div class="gp-chips">${data.facilities.map(f => `<span class="gp-chip">${f}</span>`).join("")}</div>`
    : "";

  const timingsHtml = data.timings
    ? `<div class="gp-row"><span class="gp-icon">🕐</span><span>${data.timings}</span></div>`
    : "";

  const directionHtml = data.direction
    ? `<div class="gp-row"><span class="gp-icon">🧭</span><span>${data.direction} Direction</span></div>`
    : "";

  const distanceHtml = data.distance
    ? `<div class="gp-distance">${data.distance} away</div>`
    : "";

  const imageHtml = data.imageUrl
    ? `<div class="gp-photo"><img src="${data.imageUrl}" alt="${data.name}" /></div>`
    : "";

  const safeName = (data.name || "").replace(/'/g, "\\'");
  const lat  = data.lat  ?? 0;
  const lng  = data.lng  ?? 0;
  const hasCoords = data.lat != null && data.lng != null;

  const directionsOnclick = hasCoords
    ? `window.__gv_directions(${lat},${lng})`
    : `window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.name)}','_blank','noopener')`;

  const shareOnclick = hasCoords
    ? `window.__gv_share('${safeName}',${lat},${lng},this)`
    : `navigator.clipboard&&navigator.clipboard.writeText('${safeName}')`;

  return `
    <div class="glass-popup" data-type="${data.type}">
      ${imageHtml}
      <div class="gp-header" style="--gp-color:${token.bg};">
        <div class="gp-badge" style="background:${token.bg};">
          <div style="width:18px;height:18px;">${SVG_ICONS[data.type]}</div>
        </div>
        <div class="gp-title-block">
          <div class="gp-title">${data.name}</div>
          <div class="gp-category" style="color:${token.bg};">${token.label}</div>
        </div>
        ${distanceHtml}
      </div>
      ${data.description ? `<div class="gp-desc">${data.description}</div>` : ""}
      ${directionHtml}
      ${timingsHtml}
      ${facilitiesHtml}
      <div class="gp-actions">
        <button class="gp-btn gp-btn-primary" style="background:${token.bg};" onclick="${directionsOnclick}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Directions
        </button>
        <button class="gp-btn gp-btn-ghost" onclick="${shareOnclick}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button>
      </div>
    </div>`;
};

// ─── Instagram/Snap Map User Marker ─────────────────────────────────────────
// Used ONLY in Solo/Group Girivalam modes (LiveGroupMap.tsx)

export interface UserMarkerOptions {
  displayName: string;
  avatarUrl?: string;         // profile photo URL
  initials: string;           // fallback when no photo
  color: string;              // unique hue per user
  isLive: boolean;            // updated < 2 min ago
  lastSeenLabel: string;      // "2m", "15m", "1h"
  isCurrentUser?: boolean;
}

export const createSocialUserMarker = (opts: UserMarkerOptions): L.DivIcon => {
  const size      = opts.isCurrentUser ? 48 : 42;
  const ringColor = opts.isLive ? "#22C55E" : "#9CA3AF";
  const glowClass = opts.isLive ? "sum-live-glow" : "";
  const liveBar   = opts.isLive
    ? `<div class="sum-live-dot"></div>`
    : "";

  const avatar = opts.avatarUrl
    ? `<img class="sum-avatar-img" src="${opts.avatarUrl}" alt="${opts.displayName}" />`
    : `<div class="sum-avatar-initials" style="background:${opts.color};">${opts.initials}</div>`;

  const card = `
    <div class="sum-root ${glowClass} ${opts.isCurrentUser ? "sum-me" : ""}"
         style="--sum-color:${opts.color};--sum-ring:${ringColor};">
      <div class="sum-card">
        <div class="sum-avatar-ring" style="border-color:${ringColor};">
          ${liveBar}
          ${avatar}
        </div>
        <div class="sum-label">
          <span class="sum-name">${opts.displayName}</span>
          <span class="sum-time">${opts.isLive ? "Live" : opts.lastSeenLabel}</span>
        </div>
      </div>
      <div class="sum-tail" style="background:${opts.color};"></div>
    </div>`;

  const totalW = Math.max(120, opts.displayName.length * 8 + 60);

  return L.divIcon({
    className: "sum-wrapper",
    html: card,
    iconSize:   [totalW, size + 28],
    iconAnchor: [totalW / 2, size + 28],
    popupAnchor:[0, -(size + 28)],
  });
};

// Current-user pulsing dot marker (you are here)
export const createMyLocationMarker = (isTracking: boolean): L.DivIcon =>
  L.divIcon({
    className: "myl-wrapper",
    html: `
      <div class="myl-root ${isTracking ? "myl-active" : ""}">
        <div class="myl-accuracy-ring"></div>
        <div class="myl-dot"></div>
      </div>`,
    iconSize:   [24, 24],
    iconAnchor: [12, 12],
  });

// ─── Map Tile Themes ─────────────────────────────────────────────────────────

export const MAP_THEMES = {
  standard: {
    label: "Standard",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors, © CARTO",
  },
  dark: {
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
  },
  spiritual: {
    label: "Spiritual",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO",
  },
  satellite: {
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
} as const;

export type MapTheme = keyof typeof MAP_THEMES;

// ─── Helper ──────────────────────────────────────────────────────────────────

export const getLastSeenLabel = (updatedAt: string): string => {
  const ms = Date.now() - new Date(updatedAt).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1)  return "just now";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

export const isLiveLocation = (updatedAt: string): boolean =>
  Date.now() - new Date(updatedAt).getTime() < 2 * 60 * 1000;

// Deterministic hue from user id string
export const userColor = (userId: string): string => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 48%)`;
};

export const getInitials = (nameOrEmail: string): string => {
  const clean = nameOrEmail.replace(/@.*/, "").replace(/[._-]/g, " ");
  return clean.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";
};
