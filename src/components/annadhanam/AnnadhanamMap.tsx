import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ListingOccurrence } from "@/types/annadhanam";

interface Props {
  occurrences: ListingOccurrence[];
  userLocation: { lat: number; lng: number } | null;
  onSelect?: (id: string) => void;
}

const COLORS: Record<string, string> = {
  live: "#10b981",
  upcoming: "#f59e0b",
  completed: "#6b7280",
  cancelled: "#ef4444",
};

function makeIcon(status: string): L.DivIcon {
  const color = COLORS[status] || COLORS.upcoming;
  return L.divIcon({
    className: "annadhanam-marker",
    html: `<div style="background:${color};width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:12px;">🍚</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function AnnadhanamMap({ occurrences, userLocation, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [12.2253, 79.0747]; // Arunachala
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
  }, [userLocation]);

  useEffect(() => {
    if (!mapRef.current || !layerRef.current) return;
    layerRef.current.clearLayers();

    // Dedupe by listing id — one marker per listing (use the most "live" status).
    const priority: Record<string, number> = { live: 0, upcoming: 1, completed: 2, cancelled: 3 };
    const byListing = new Map<string, ListingOccurrence>();
    for (const o of occurrences) {
      const prev = byListing.get(o.listing.id);
      if (!prev || priority[o.status] < priority[prev.status]) byListing.set(o.listing.id, o);
    }

    for (const o of byListing.values()) {
      const m = L.marker([o.listing.latitude, o.listing.longitude], { icon: makeIcon(o.status) });
      const distTxt = o.distanceKm != null ? `<div style="font-size:11px;color:#666">${o.distanceKm.toFixed(1)} km away</div>` : "";
      const timeTxt =
        o.status === "live"
          ? `<div style="color:#10b981;font-weight:600">LIVE • ends ${o.end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>`
          : o.status === "upcoming"
          ? `<div style="color:#f59e0b;font-weight:600">Starts ${o.start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>`
          : `<div style="color:#6b7280">Completed</div>`;
      m.bindPopup(
        `<div style="min-width:180px">
          <div style="font-weight:600;margin-bottom:4px">${o.listing.title}</div>
          <div style="font-size:12px;color:#555;margin-bottom:4px">${o.listing.trust?.trust_name ?? ""}</div>
          ${timeTxt}${distTxt}
          <a href="https://www.google.com/maps/dir/?api=1&destination=${o.listing.latitude},${o.listing.longitude}" target="_blank" rel="noreferrer" style="display:inline-block;margin-top:6px;color:#2563eb">Navigate →</a>
        </div>`
      );
      m.on("click", () => onSelect?.(o.listing.id));
      m.addTo(layerRef.current!);
    }

    if (userLocation) {
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 6,
        color: "#2563eb",
        fillColor: "#2563eb",
        fillOpacity: 0.9,
      })
        .bindPopup("You are here")
        .addTo(layerRef.current);
    }
  }, [occurrences, userLocation, onSelect]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full rounded-xl overflow-hidden" />;
}
