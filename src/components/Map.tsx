import React, { useEffect, useRef, useState, useCallback } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./map/AshtaLingamStyles.css";
import "./map/PremiumMapStyles.css";
import { girivalamPath } from "@/data/girivalam-path";
import ashtaLingamImage from "@/assets/ashta-lingam-marker.png?w=64&format=webp";
import MapControlButton from "./map/MapControlButton";
import {
  createPremiumMarker,
  createPhotoMarker,
  buildGlassPopup,
  createMyLocationMarker,
  createTileLayer,
  trimAttributionPrefix,
  type MapTheme,
  type MarkerType,
  type PopupData,
} from "./map/MarkerSystem";
import { Landmark } from "@/data/landmarks";

// Fix for default marker icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const defaultCenter: [number, number] = [12.2307, 79.0628]; // Tiruvannamalai
const defaultZoom = 14;

interface MapProps {
  userLocation?: { lat: number; lng: number };
  isTracking?: boolean;
  className?: string;
  selectedTypes?: Landmark["type"][];
  focusTypes?: Landmark["type"][] | null;
  centerOnUserTrigger?: number;
  userPath?: { lat: number; lng: number }[];
  completionPercentage?: number;
  allLandmarks: Landmark[];
  nearestAshtaLingamId?: number;
}

// Get Aṣṭa Lingam marker size based on zoom level
const getAshtaLingamSize = (zoom: number, iconSize: string = 'medium'): number => {
  const baseSizes: Record<string, number> = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const baseSize = baseSizes[iconSize] || 48;

  if (zoom >= 17) return baseSize * 1.4;
  if (zoom >= 16) return baseSize * 1.2;
  if (zoom >= 15) return baseSize;
  if (zoom >= 14) return baseSize * 0.8;
  if (zoom >= 13) return baseSize * 0.65;
  return baseSize * 0.5;
};

// Create Aṣṭa Lingam icon with admin-controlled effects
const createAshtaLingamIcon = (
  size: number,
  enableGlow: boolean = true,
  enablePulse: boolean = true,
  glowColor: string = '#FFDFA3',
  auraColor: string = '#FFF2CC',
  premiumGlow: boolean = false
): L.DivIcon => {
  const glowStyles = enableGlow
    ? `
      box-shadow: 
        0 0 ${size * 0.25}px ${glowColor},
        0 0 ${size * 0.4}px ${glowColor}80,
        0 0 ${size * 0.6}px ${auraColor}40;
    `
    : '';

  const animationClass = enablePulse ? 'ashta-glow-animation' : '';
  const premiumClass = premiumGlow ? 'premium-glow' : '';

  const html = `
    <div class="ashta-lingam-marker ${animationClass} ${premiumClass}" style="
      width: ${size}px;
      height: ${size}px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;
        ${glowStyles}
      ">
        <img 
          src="${ashtaLingamImage}" 
          alt="Aṣṭa Lingam"
          style="
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
          "
        />
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'ashta-lingam-icon',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const Map: React.FC<MapProps> = ({
  allLandmarks,
  userLocation,
  isTracking,
  className = "",
  selectedTypes = [],
  centerOnUserTrigger,
  focusTypes,
  userPath = [],
  completionPercentage = 0,
  nearestAshtaLingamId,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const landmarkMarkersRef = useRef<L.Marker[]>([]);
  const girivalamPathRef = useRef<L.Polyline | null>(null);
  const completedPathRef = useRef<L.Polyline | null>(null);
  const userPathRef = useRef<L.Polyline | null>(null);
  const previousCenterTrigger = useRef(centerOnUserTrigger);

  // Lookup map for ashta lingam markers by landmark id — used for targeted icon updates
  const ashtaMarkerMapRef = useRef<globalThis.Map<number, { marker: L.Marker; landmark: Landmark }>>(new globalThis.Map());
  // Ref so zoom handler and nearest-icon effect always read the latest id without triggering marker rebuild
  const nearestAshtaLingamIdRef = useRef<number | undefined>(nearestAshtaLingamId);

  // Content-derived stable keys for the marker effect.
  // Using string primitives instead of array references means the marker layer is
  // only rebuilt when the actual content changes, not every time a parent re-render
  // passes a new array literal with the same values.
  const selectedTypesKey = [...(selectedTypes ?? [])].sort().join(',');
  const landmarksKey = `${allLandmarks.length}:${allLandmarks.map(l => l.id).join(',')}`;

  // Map theme state
  const [mapTheme, setMapTheme] = useState<MapTheme>("standard");
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Map dragging control state - disabled by default for mobile usability
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isFullscreenRef = useRef(false);         // kept for unmount cleanup
  const fullscreenLockRef = useRef(false);        // prevents double-fire on mobile

  // Toggle — debounced 500ms so Leaflet touch + browser synthetic click can't double-trigger
  const toggleFullscreen = useCallback(() => {
    if (fullscreenLockRef.current) return;
    fullscreenLockRef.current = true;
    setTimeout(() => { fullscreenLockRef.current = false; }, 500);
    setIsFullscreen(prev => !prev);
  }, []);

  // Apply/remove fullscreen DOM side-effects reactively after state settles
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    isFullscreenRef.current = isFullscreen;

    const siteHeader = document.querySelector('header') as HTMLElement | null;
    const siteFooter = document.querySelector('footer') as HTMLElement | null;

    if (isFullscreen) {
      wrapper.style.position = 'fixed';
      wrapper.style.inset = '0';
      wrapper.style.zIndex = '2000';
      wrapper.style.background = 'white';
      wrapper.style.borderRadius = '0';
      if (siteHeader) siteHeader.style.display = 'none';
      if (siteFooter) siteFooter.style.display = 'none';
      document.body.style.overflow = 'hidden';
    } else {
      wrapper.style.position = '';
      wrapper.style.inset = '';
      wrapper.style.zIndex = '';
      wrapper.style.background = '';
      wrapper.style.borderRadius = '';
      if (siteHeader) siteHeader.style.display = '';
      if (siteFooter) siteFooter.style.display = '';
      document.body.style.overflow = '';
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mapInstance.current?.invalidateSize({ animate: false });
      });
    });
  }, [isFullscreen]);

  // Toggle map dragging
  const toggleMapDragging = useCallback(() => {
    if (!mapInstance.current) return;

    setIsDraggingEnabled(prev => {
      const newState = !prev;
      if (newState) {
        mapInstance.current?.dragging.enable();
        mapInstance.current?.touchZoom.enable();
      } else {
        mapInstance.current?.dragging.disable();
        mapInstance.current?.touchZoom.disable();
      }
      return newState;
    });
  }, []);

  // Distance measurement state
  const [measurementMode, setMeasurementMode] = useState(false);
  const measurementModeRef = useRef(false);
  const [measurementPoints, setMeasurementPoints] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const measurementMarkersRef = useRef<L.Marker[]>([]);
  const measurementLineRef = useRef<L.Polyline | null>(null);
  const measurementPopupRef = useRef<L.Popup | null>(null);

  // Keep the ref in sync so the click handler always reads the latest value
  useEffect(() => {
    measurementModeRef.current = measurementMode;
  }, [measurementMode]);

  // Initialize map — runs once only (empty deps)
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Create map with dragging disabled by default
    mapInstance.current = L.map(mapContainer.current, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: true,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: true,
    });

    // OpenStreetMap / provider credit is required — keep the control, drop the
    // "Leaflet" prefix so it stays a single unobtrusive line.
    trimAttributionPrefix(mapInstance.current);

    // Add themed tile layer
    tileLayerRef.current = createTileLayer("standard").addTo(mapInstance.current);

    // Add Girivalam path
    const pathCoords: [number, number][] = girivalamPath.map((p) => [p.lat, p.lng]);
    girivalamPathRef.current = L.polyline(pathCoords, {
      color: "#FF6B35",
      weight: 4,
      opacity: 0.8,
    }).addTo(mapInstance.current);

    // Use ref so this handler never captures stale measurementMode state
    mapInstance.current.on("click", (e: L.LeafletMouseEvent) => {
      if (measurementModeRef.current) {
        const newPoint: [number, number] = [e.latlng.lat, e.latlng.lng];
        setMeasurementPoints((prev) => {
          if (prev.length >= 2) return [newPoint];
          return [...prev, newPoint];
        });
      }
    });

    return () => {
      // Restore page state if unmounted while fullscreen
      if (isFullscreenRef.current) {
        const h = document.querySelector('header') as HTMLElement | null;
        const f = document.querySelector('footer') as HTMLElement | null;
        if (h) h.style.display = '';
        if (f) f.style.display = '';
        document.body.style.overflow = '';
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Resize observer — calls invalidateSize when the container changes dimensions
  useEffect(() => {
    if (!mapContainer.current) return;
    const ro = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize({ animate: false });
    });
    ro.observe(mapContainer.current);
    return () => ro.disconnect();
  }, []);

  // Update measurement visualization
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear previous measurement markers and line
    measurementMarkersRef.current.forEach((marker) => marker.remove());
    measurementMarkersRef.current = [];
    if (measurementLineRef.current) {
      measurementLineRef.current.remove();
      measurementLineRef.current = null;
    }
    if (measurementPopupRef.current) {
      measurementPopupRef.current.remove();
      measurementPopupRef.current = null;
    }

    if (measurementPoints.length === 0) {
      setDistance(null);
      return;
    }

    // Create marker icon for measurement points
    const measurementIcon = L.divIcon({
      className: "measurement-marker",
      html: `<div style="
        background-color: #3B82F6;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    // Add markers for each point
    measurementPoints.forEach((point, index) => {
      const marker = L.marker(point, { icon: measurementIcon }).addTo(mapInstance.current!);
      measurementMarkersRef.current.push(marker);
    });

    // If we have 2 points, draw line and calculate distance
    if (measurementPoints.length === 2) {
      const [point1, point2] = measurementPoints;

      // Draw line
      measurementLineRef.current = L.polyline(measurementPoints, {
        color: "#3B82F6",
        weight: 3,
        opacity: 0.7,
        dashArray: "10, 10",
      }).addTo(mapInstance.current);

      // Calculate distance
      const latLng1 = L.latLng(point1[0], point1[1]);
      const latLng2 = L.latLng(point2[0], point2[1]);
      const distanceMeters = latLng1.distanceTo(latLng2);
      const distanceKm = distanceMeters / 1000;

      setDistance(distanceKm);

      // Show popup with distance at midpoint
      const midPoint: [number, number] = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];

      const popupContent = `
        <div style="text-align: center; padding: 4px;">
          <strong>Distance</strong><br/>
          ${distanceKm >= 1 ? `${distanceKm.toFixed(2)} km` : `${distanceMeters.toFixed(0)} m`}
        </div>
      `;

      measurementPopupRef.current = L.popup({
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
      })
        .setLatLng(midPoint)
        .setContent(popupContent)
        .openOn(mapInstance.current);
    }
  }, [measurementPoints]);

  // Clear measurement when mode is disabled
  useEffect(() => {
    if (!measurementMode) {
      setMeasurementPoints([]);
      setDistance(null);
    }
  }, [measurementMode]);

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapInstance.current) return;
    if (tileLayerRef.current) {
      mapInstance.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = createTileLayer(mapTheme).addTo(mapInstance.current);

    // Apply dark class for Leaflet container styling
    const container = mapInstance.current.getContainer();
    container.classList.toggle("map-dark", mapTheme === "dark");
  }, [mapTheme]);

  // Toggle measurement mode
  const toggleMeasurementMode = () => {
    setMeasurementMode((prev) => !prev);
  };

  // Clear measurement
  const clearMeasurement = () => {
    setMeasurementPoints([]);
    setDistance(null);
  };

  // Build Aṣṭa Lingam tooltip (kept as tooltip for hover; popup on click)
  const buildAshtaLingamTooltip = (landmark: Landmark) => `
    <div class="ashta-lingam-tooltip-content">
      <div style="font-weight:700;font-size:14px;color:#FF6B35;margin-bottom:4px;">${landmark.name}</div>
      ${landmark.direction ? `<div style="font-size:12px;color:#666;margin-bottom:2px;">📍 ${landmark.direction} Direction</div>` : ''}
      ${landmark.timings ? `<div style="font-size:11px;color:#FF6B35;margin-top:4px;">🕐 ${landmark.timings}</div>` : ''}
    </div>
  `;

  // Store zoom handler ref for cleanup
  const zoomHandlerRef = useRef<(() => void) | null>(null);

  // Sync nearest id ref — used by marker effect and zoom handler without causing rebuild
  useEffect(() => {
    nearestAshtaLingamIdRef.current = nearestAshtaLingamId;
  }, [nearestAshtaLingamId]);

  // ── Add / remove markers when landmark list or filter changes ────────────────
  // nearestAshtaLingamId is intentionally NOT in deps — icon updates are handled
  // by the separate effect below so we never remove/re-add all 34+ markers on
  // every GPS position update.
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing markers
    landmarkMarkersRef.current.forEach((marker) => marker.remove());
    landmarkMarkersRef.current = [];
    ashtaMarkerMapRef.current.clear();

    // Remove previous zoom handler
    if (zoomHandlerRef.current) {
      mapInstance.current.off('zoomend', zoomHandlerRef.current);
    }

    // Filter landmarks by selected types
    const filteredLandmarks =
      selectedTypes && selectedTypes.length > 0
        ? allLandmarks.filter((l) => selectedTypes.includes(l.type))
        : allLandmarks;

    const ashtaLingamLandmarks = filteredLandmarks.filter(l => l.isAshtaLingam);
    const regularLandmarks = filteredLandmarks.filter(l => !l.isAshtaLingam);

    const currentZoom = mapInstance.current.getZoom();
    const currentNearest = nearestAshtaLingamIdRef.current;

    // ➕ Aṣṭa Lingam markers
    ashtaLingamLandmarks.forEach((landmark) => {
      const isNearest = currentNearest === landmark.id;

      if (landmark.imageUrl) {
        const markerType = landmark.type as MarkerType;
        const icon = createPhotoMarker(landmark.imageUrl, markerType);
        const marker = L.marker([landmark.lat, landmark.lng], { icon });

        marker.bindPopup(buildGlassPopup({
          name: landmark.name, type: markerType,
          lat: landmark.lat, lng: landmark.lng,
          description: landmark.description, timings: landmark.timings,
          direction: landmark.direction, imageUrl: landmark.imageUrl,
        }), { className: "glass-popup-leaf", maxWidth: 310, closeButton: true, autoPan: true });

        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());
        marker.addTo(mapInstance.current!);
        landmarkMarkersRef.current.push(marker);
        ashtaMarkerMapRef.current.set(landmark.id, { marker, landmark });
        return;
      }

      const size = getAshtaLingamSize(currentZoom, landmark.iconSize);
      const icon = createAshtaLingamIcon(
        isNearest ? size * 1.15 : size,
        landmark.enableGlow ?? true,
        landmark.enableAuraPulse ?? true,
        isNearest ? '#FFD700' : (landmark.glowColor ?? '#FFDFA3'),
        isNearest ? '#FFF8DC' : (landmark.auraColor ?? '#FFF2CC'),
        isNearest || (landmark.premiumGlow ?? false)
      );

      const marker = L.marker([landmark.lat, landmark.lng], { icon });

      marker.bindTooltip(buildAshtaLingamTooltip(landmark), {
        direction: "top", offset: L.point(0, -size / 2),
        opacity: 1, sticky: true,
        className: isNearest ? "ashta-lingam-tooltip nearest-linga" : "ashta-lingam-tooltip",
      });

      marker.on("mouseover", () => marker.openPopup());
      marker.on("mouseout", () => marker.closePopup());
      marker.addTo(mapInstance.current!);
      landmarkMarkersRef.current.push(marker);
      ashtaMarkerMapRef.current.set(landmark.id, { marker, landmark });
    });

    // ➕ Regular landmark markers
    regularLandmarks.forEach((landmark) => {
      const markerType = landmark.type as MarkerType;
      const icon = landmark.imageUrl
        ? createPhotoMarker(landmark.imageUrl, markerType)
        : createPremiumMarker(markerType);
      const marker = L.marker([landmark.lat, landmark.lng], { icon });

      marker.bindPopup(buildGlassPopup({
        name: landmark.name, type: markerType,
        lat: landmark.lat, lng: landmark.lng,
        description: landmark.description, timings: landmark.timings,
        direction: landmark.direction, facilities: landmark.facilities,
        imageUrl: landmark.imageUrl,
      }), { className: "glass-popup-leaf", maxWidth: 310, closeButton: true, autoPan: true });

      marker.on("mouseover", () => marker.openPopup());
      marker.on("mouseout", () => marker.closePopup());
      marker.addTo(mapInstance.current!);
      landmarkMarkersRef.current.push(marker);
    });

    // 📐 Zoom handler — resizes ashta lingam icons, reads nearest from ref (no stale closure)
    const handleZoom = () => {
      if (!mapInstance.current) return;
      const newZoom = mapInstance.current.getZoom();
      const nearest = nearestAshtaLingamIdRef.current;

      ashtaMarkerMapRef.current.forEach(({ marker, landmark }) => {
        if (landmark.imageUrl) return;
        const isNearest = nearest === landmark.id;
        const newSize = getAshtaLingamSize(newZoom, landmark.iconSize);
        marker.setIcon(createAshtaLingamIcon(
          isNearest ? newSize * 1.15 : newSize,
          landmark.enableGlow ?? true,
          landmark.enableAuraPulse ?? true,
          isNearest ? '#FFD700' : (landmark.glowColor ?? '#FFDFA3'),
          isNearest ? '#FFF8DC' : (landmark.auraColor ?? '#FFF2CC'),
          isNearest || (landmark.premiumGlow ?? false)
        ));
      });
    };

    zoomHandlerRef.current = handleZoom;
    mapInstance.current.on('zoomend', handleZoom);

    return () => {
      if (mapInstance.current && zoomHandlerRef.current) {
        mapInstance.current.off('zoomend', zoomHandlerRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypesKey, landmarksKey]);

  // ── Update nearest-lingam icon without touching any other marker ─────────────
  useEffect(() => {
    if (!mapInstance.current || ashtaMarkerMapRef.current.size === 0) return;
    const zoom = mapInstance.current.getZoom();

    ashtaMarkerMapRef.current.forEach(({ marker, landmark }) => {
      if (landmark.imageUrl) return;
      const isNearest = nearestAshtaLingamId === landmark.id;
      const size = getAshtaLingamSize(zoom, landmark.iconSize);
      marker.setIcon(createAshtaLingamIcon(
        isNearest ? size * 1.15 : size,
        landmark.enableGlow ?? true,
        landmark.enableAuraPulse ?? true,
        isNearest ? '#FFD700' : (landmark.glowColor ?? '#FFDFA3'),
        isNearest ? '#FFF8DC' : (landmark.auraColor ?? '#FFF2CC'),
        isNearest || (landmark.premiumGlow ?? false)
      ));
    });
  }, [nearestAshtaLingamId]);

  // Update user location marker (premium pulsing dot)
  useEffect(() => {
    if (!mapInstance.current) return;

    if (userLocation) {
      const icon = createMyLocationMarker(isTracking ?? false);
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        userMarkerRef.current.setIcon(icon);
      } else {
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon })
          .bindPopup('<div style="font-family:Inter,system-ui;font-size:13px;font-weight:600;padding:4px 8px;">📍 Your Location</div>')
          .addTo(mapInstance.current);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, isTracking]);

  // Center on user when trigger changes
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return;

    if (centerOnUserTrigger !== previousCenterTrigger.current) {
      mapInstance.current.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
      previousCenterTrigger.current = centerOnUserTrigger;
    }
  }, [userLocation, centerOnUserTrigger]);

  // Focus on specific types
  useEffect(() => {
    if (!mapInstance.current || !focusTypes || focusTypes.length === 0) return;

    const filtered = allLandmarks.filter((l) => focusTypes.includes(l.type));
    if (filtered.length === 0) return;

    const bounds = L.latLngBounds(filtered.map((l) => [l.lat, l.lng]));
    mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
  }, [focusTypes, allLandmarks]);

  // Update completed path
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing completed path
    if (completedPathRef.current) {
      completedPathRef.current.remove();
      completedPathRef.current = null;
    }

    // Add new completed path
    if (completionPercentage > 0) {
      const completedPathLength = Math.floor((girivalamPath.length * completionPercentage) / 100);
      const completedPathCoords: [number, number][] = girivalamPath
        .slice(0, completedPathLength)
        .map((p) => [p.lat, p.lng]);

      if (completedPathCoords.length > 1) {
        completedPathRef.current = L.polyline(completedPathCoords, {
          color: "#22c55e",
          weight: 6,
          opacity: 1,
        }).addTo(mapInstance.current);
      }
    }
  }, [completionPercentage]);

  // Update user path
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove existing user path
    if (userPathRef.current) {
      userPathRef.current.remove();
      userPathRef.current = null;
    }

    // Add new user path
    if (userPath.length > 1 && isTracking) {
      const userPathCoords: [number, number][] = userPath.map((p) => [p.lat, p.lng]);
      userPathRef.current = L.polyline(userPathCoords, {
        color: "#10b981",
        weight: 3,
        opacity: 0.9,
      }).addTo(mapInstance.current);
    }
  }, [userPath, isTracking]);

  // Rotate map to specific direction
  const rotateToDirection = (direction: 'N' | 'E' | 'S' | 'W') => {
    if (!mapInstance.current) return;

    const center = mapInstance.current.getCenter();
    const zoom = mapInstance.current.getZoom();

    // Calculate offset based on direction to pan the view
    const offset = 0.01 * (15 / zoom); // Adjust offset based on zoom level

    let newCenter: [number, number];
    switch (direction) {
      case 'N':
        newCenter = [center.lat + offset, center.lng];
        break;
      case 'S':
        newCenter = [center.lat - offset, center.lng];
        break;
      case 'E':
        newCenter = [center.lat, center.lng + offset];
        break;
      case 'W':
        newCenter = [center.lat, center.lng - offset];
        break;
      default:
        return;
    }

    mapInstance.current.panTo(newCenter, { animate: true, duration: 0.3 });
  };

  const THEME_LABELS: Record<MapTheme, string> = {
    standard:  "Map",
    dark:      "Dark",
    spiritual: "Light",
    satellite: "Sat",
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full h-full ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: "400px" }}
      />

      {/* Fullscreen Toggle Button */}
      <button
        onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); toggleFullscreen(); }}
        className="absolute top-3 right-3 z-[800] bg-white/90 rounded-lg p-2 shadow-md hover:bg-white transition-colors"
        title={isFullscreen ? "Minimize map" : "Expand to fullscreen"}
      >
        {isFullscreen
          ? <Minimize2 className="h-4 w-4 text-gray-700" />
          : <Maximize2 className="h-4 w-4 text-gray-700" />
        }
      </button>

      {/* Map Dragging Control Button */}
      <MapControlButton
        isDraggingEnabled={isDraggingEnabled}
        onToggle={toggleMapDragging}
        className="bg-black hover:bg-gray-800"
      />
    </div>
  );
};

export default Map;
