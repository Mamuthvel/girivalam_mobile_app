import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map/PremiumMapStyles.css';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  createSocialUserMarker,
  createMyLocationMarker,
  createTileLayer,
  trimAttributionPrefix,
  MAP_THEMES,
  type MapTheme,
  getLastSeenLabel,
  isLiveLocation,
  userColor,
  getInitials,
} from './map/MarkerSystem';

interface LiveGroupMapProps {
  groupId: string;
  userLocation?: { lat: number; lng: number };
  isTracking: boolean;
  className?: string;
  locationSharingEnabled?: boolean;
}

interface GroupMember {
  user_id: string;
  user_email?: string;
  avatar_url?: string;
  display_name?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  updated_at: string;
}

const LiveGroupMap: React.FC<LiveGroupMapProps> = ({
  groupId,
  userLocation,
  isTracking,
  className = '',
  locationSharingEnabled = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map          = useRef<L.Map | null>(null);
  const myMarker     = useRef<L.Marker | null>(null);
  const memberMarkers= useRef<Map<string, L.Marker>>(new Map());
  const tileRef      = useRef<L.TileLayer | null>(null);

  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [mapTheme, setMapTheme]         = useState<MapTheme>('standard');
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Initialize map ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center:           [12.2307, 79.0628],
      zoom:             15,
      zoomControl:      true,
      attributionControl: true,
    });

    // Provider + OpenStreetMap credit is required by the tile licences.
    trimAttributionPrefix(map.current);

    tileRef.current = createTileLayer('standard').addTo(map.current);

    // Sacred Girivalam path ring
    L.circle([12.2307, 79.0628], {
      color:       '#FF6B35',
      fillColor:   '#FF6B35',
      fillOpacity: 0.06,
      radius:      7000,
      weight:      3,
      dashArray:   '10, 6',
    }).addTo(map.current);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // ── Swap tile layer when theme changes ────────────────────────────
  useEffect(() => {
    if (!map.current) return;
    if (tileRef.current) map.current.removeLayer(tileRef.current);
    tileRef.current = createTileLayer(mapTheme).addTo(map.current);
    map.current.getContainer().classList.toggle('map-dark', mapTheme === 'dark');
  }, [mapTheme]);

  // ── My location marker (premium pulsing dot) ──────────────────────
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const icon = createMyLocationMarker(isTracking);
    if (myMarker.current) {
      myMarker.current.setLatLng([userLocation.lat, userLocation.lng]);
      myMarker.current.setIcon(icon);
    } else {
      myMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon })
        .bindPopup('<div style="font-family:Inter,system-ui;font-size:13px;font-weight:600;padding:4px 8px;">📍 You are here</div>')
        .addTo(map.current);
    }

    if (isTracking) map.current.panTo([userLocation.lat, userLocation.lng]);
  }, [userLocation, isTracking]);

  // ── Push my location to DB ────────────────────────────────────────
  useEffect(() => {
    if (!user || !userLocation || !isTracking) return;

    const push = async () => {
      await supabase.from('live_locations').upsert(
        {
          user_id:    user.id,
          group_id:   groupId,
          latitude:   userLocation.lat,
          longitude:  userLocation.lng,
          accuracy:   10,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,group_id' }
      );
    };

    push();
    const interval = setInterval(push, 10_000);
    return () => clearInterval(interval);
  }, [user, groupId, userLocation, isTracking]);

  // ── Fetch group member locations ──────────────────────────────────
  useEffect(() => {
    if (!groupId) return;

    const fetchMembers = async () => {
      const { data: locs, error } = await supabase
        .from('live_locations')
        .select('user_id, latitude, longitude, accuracy, updated_at')
        .eq('group_id', groupId)
        .neq('user_id', user?.id ?? '');

      if (error || !locs) return;

      const ids = locs.map(l => l.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email, display_name')
        .in('user_id', ids);

      const profileMap = new Map((profiles ?? []).map(p => [p.user_id, p]));

      setGroupMembers(locs.map(loc => ({
        ...loc,
        user_email:   profileMap.get(loc.user_id)?.email ?? undefined,
        avatar_url:   undefined,
        display_name: profileMap.get(loc.user_id)?.display_name ?? undefined,
      })));
    };

    fetchMembers();

    const channel = supabase
      .channel(`live_locations_${groupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_locations', filter: `group_id=eq.${groupId}` }, fetchMembers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [groupId, user?.id]);

  // ── Render Instagram/Snap Map style member markers ────────────────
  useEffect(() => {
    if (!map.current) return;

    // Remove stale markers
    memberMarkers.current.forEach(m => map.current?.removeLayer(m));
    memberMarkers.current.clear();

    groupMembers.forEach(member => {
      const rawName    = member.display_name || member.user_email?.replace(/@.*/, '') || 'Pilgrim';
      const displayName = rawName.length > 10 ? rawName.slice(0, 10) + '…' : rawName;
      const live       = isLiveLocation(member.updated_at);
      const lastSeen   = getLastSeenLabel(member.updated_at);
      const color      = userColor(member.user_id);
      const initials   = getInitials(rawName);

      const icon = createSocialUserMarker({
        displayName,
        avatarUrl:  member.avatar_url,
        initials,
        color,
        isLive:     live,
        lastSeenLabel: lastSeen,
      });

      // Build member popup
      const statusLine = live
        ? `<span style="color:#16A34A;font-weight:600;">🟢 Live</span>`
        : `<span style="color:#6B7280;">Last seen ${lastSeen}</span>`;

      const popup = L.popup({ closeButton: false, className: 'glass-popup-leaf' }).setContent(`
        <div style="font-family:Inter,system-ui;padding:10px 14px;min-width:160px;">
          <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:4px;">${rawName}</div>
          <div style="font-size:12px;">${statusLine}</div>
          ${member.accuracy ? `<div style="font-size:11px;color:#9CA3AF;margin-top:3px;">Accuracy ~${Math.round(member.accuracy)}m</div>` : ''}
        </div>
      `);

      const marker = L.marker([member.latitude, member.longitude], { icon })
        .bindPopup(popup)
        .addTo(map.current!);

      marker.on('click', () => marker.openPopup());

      memberMarkers.current.set(member.user_id, marker);
    });
  }, [groupMembers]);

  const THEME_LABELS: Record<MapTheme, string> = {
    standard: 'Map', dark: 'Dark', spiritual: 'Light', satellite: 'Sat',
  };

  return (
    <div className="relative w-full h-full">
      {!locationSharingEnabled && (
        <Alert className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location sharing is off. Enable it to appear on the map for group members.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative w-full h-full">
        <div ref={mapContainer} className={`w-full h-full rounded-xl shadow-lg ${className}`} />

        {/* Map Theme Toggle */}
        <div className="mt-toggle">
          {(Object.keys(MAP_THEMES) as MapTheme[]).map(key => (
            <button
              key={key}
              className={`mt-btn ${mapTheme === key ? 'mt-active' : ''}`}
              onClick={() => setMapTheme(key)}
            >
              {THEME_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveGroupMap;
