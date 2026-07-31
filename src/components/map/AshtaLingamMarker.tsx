import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Landmark } from '@/data/landmarks';
import ashtaLingamImage from '@/assets/ashta-lingam-marker.png?w=64&format=webp';

interface AshtaLingamMarkerProps {
  landmark: Landmark;
  map: L.Map;
  onMarkerClick?: (landmark: Landmark) => void;
}

// Get marker size based on zoom level and admin-configured size
const getMarkerSize = (zoom: number, iconSize: string = 'medium'): number => {
  const baseSizes: Record<string, number> = {
    small: 28,
    medium: 40,
    large: 56,
  };

  const baseSize = baseSizes[iconSize] || 40;

  // Scale based on zoom level (more visible at higher zoom)
  if (zoom >= 17) return baseSize * 1.4;
  if (zoom >= 16) return baseSize * 1.2;
  if (zoom >= 15) return baseSize;
  if (zoom >= 14) return baseSize * 0.85;
  if (zoom >= 13) return baseSize * 0.7;
  return baseSize * 0.55;
};

export const AshtaLingamMarker: React.FC<AshtaLingamMarkerProps> = ({
  landmark,
  map,
  onMarkerClick,
}) => {
  const markerRef = useRef<L.Marker | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create marker with initial size
    const currentZoom = map.getZoom();
    const size = getMarkerSize(currentZoom, landmark.iconSize);

    const icon = createAshtaLingamIcon(
      size,
      landmark.enableGlow ?? true,
      landmark.enableAuraPulse ?? true,
      landmark.glowColor,
      landmark.auraColor
    );

    markerRef.current = L.marker([landmark.lat, landmark.lng], { icon });

    // Bind tooltip
    markerRef.current.bindTooltip(buildTooltip(landmark), {
      direction: 'top',
      offset: L.point(0, -size / 2),
      opacity: 1,
      sticky: true,
      className: 'ashta-lingam-tooltip',
    });

    markerRef.current.on('click', () => {
      onMarkerClick?.(landmark);
    });

    markerRef.current.addTo(map);

    // Update marker size on zoom
    const handleZoom = () => {
      if (!markerRef.current) return;
      const newZoom = map.getZoom();
      const newSize = getMarkerSize(newZoom, landmark.iconSize);

      const newIcon = createAshtaLingamIcon(
        newSize,
        landmark.enableGlow ?? true,
        landmark.enableAuraPulse ?? true,
        landmark.glowColor,
        landmark.auraColor
      );

      markerRef.current.setIcon(newIcon);
    };

    map.on('zoomend', handleZoom);

    // Set up IntersectionObserver for animation optimization
    const setupVisibilityObserver = () => {
      const markerElement = markerRef.current?.getElement();
      if (!markerElement) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting);
            const animatedEl = markerElement.querySelector('.ashta-glow-animation');
            if (animatedEl) {
              (animatedEl as HTMLElement).style.animationPlayState =
                entry.isIntersecting ? 'running' : 'paused';
            }
          });
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(markerElement);
    };

    // Small delay to ensure marker is rendered
    const timeoutId = setTimeout(setupVisibilityObserver, 100);

    return () => {
      clearTimeout(timeoutId);
      map.off('zoomend', handleZoom);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, landmark, onMarkerClick]);

  return null; // This is a Leaflet-managed component
};

// Create the custom icon for Aṣṭa Lingam
const createAshtaLingamIcon = (
  size: number,
  enableGlow: boolean,
  enablePulse: boolean,
  glowColor: string = '#FFDFA3',
  auraColor: string = '#FFF2CC'
): L.DivIcon => {
  const glowStyles = enableGlow
    ? `
      box-shadow: 
        0 0 ${size * 0.3}px ${glowColor},
        0 0 ${size * 0.5}px ${glowColor}80,
        0 0 ${size * 0.8}px ${auraColor}40;
    `
    : '';

  const pulseAnimation = enablePulse
    ? 'ashta-glow-animation'
    : '';

  const html = `
    <div class="ashta-lingam-marker ${pulseAnimation}" style="
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

// Build tooltip content
const buildTooltip = (landmark: Landmark): string => `
  <div class="ashta-lingam-tooltip-content">
    <div class="tooltip-title" style="
      font-weight: 700;
      font-size: 14px;
      color: #FF6B35;
      margin-bottom: 4px;
    ">${landmark.name}</div>
    ${landmark.direction ? `
      <div class="tooltip-direction" style="
        font-size: 12px;
        color: #666;
        margin-bottom: 2px;
      ">📍 ${landmark.direction} Direction</div>
    ` : ''}
    ${landmark.description ? `
      <div class="tooltip-desc" style="
        font-size: 11px;
        color: #888;
        max-width: 200px;
      ">${landmark.description}</div>
    ` : ''}
    ${landmark.timings ? `
      <div class="tooltip-timings" style="
        font-size: 11px;
        color: #FF6B35;
        margin-top: 4px;
      ">🕐 ${landmark.timings}</div>
    ` : ''}
  </div>
`;

export default AshtaLingamMarker;
