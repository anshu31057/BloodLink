import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from '../../services/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  Users, 
  Clock, 
  ExternalLink, 
  ShieldAlert, 
  ZoomIn, 
  ZoomOut, 
  Locate,
  CheckCircle2,
  Car,
  Bike,
  Footprints,
  Layers,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';
import { BloodGroupBadge } from '../common/BloodGroupBadge';
import { Donor } from '../../types';
import { EmergencyRequest, HospitalProfile } from '../../types';
import { fetchBloodRequests, fetchHospitalProfile } from '../../services/supabaseQueries';
import { isLiveSupabaseConfigured, supabase } from '../../services/supabaseClient';

interface DonorRow {
  donor_id: string;
  full_name?: string | null;
  name?: string | null;
  blood_group: Donor['bloodGroup'];
  latitude: number;
  longitude: number;
  availability: boolean;
  phone?: string | null;
  vehicle_type?: string | null;
}

const isCoordinate = (value: number): boolean => Number.isFinite(value);

const toMapDonor = (row: DonorRow): Donor => ({
  id: row.donor_id,
  name: row.full_name || row.name || 'Available Donor',
  avatar: '',
  bloodGroup: row.blood_group,
  phone: row.phone || '',
  emergencyContact: '',
  distanceKm: 0,
  etaMinutes: 0,
  status: 'RESPONDED',
  statusUpdatedMinutesAgo: 0,
  vehicleType: row.vehicle_type === 'Car' || row.vehicle_type === 'Metro/Walk' ? row.vehicle_type : 'Bike',
  latitude: row.latitude,
  longitude: row.longitude,
  totalDonations: 0,
  verifiedDonor: true,
  requestId: ''
});

const priorityColor = (priority: string): string => {
  if (priority === 'URGENT') return '#F97316';
  if (priority === 'NORMAL') return '#2563EB';
  return '#DC2626';
};

const distanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadiusKm = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface LineFeature {
  type: 'Feature';
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  properties: Record<string, never>;
}

const routeFeature = (donor: Donor | undefined, hospitalCoords: [number, number]): LineFeature => ({
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: donor
      ? [[donor.longitude, donor.latitude], hospitalCoords]
      : [hospitalCoords, hospitalCoords]
  },
  properties: {}
});

const hospitalPopup = (hospital: HospitalProfile): string => `
  <strong>${hospital.name}</strong><br />
  Verified Emergency Network Node<br />
  ${hospital.city}<br />
  Emergency Hotline: ${hospital.emergencyHotline}
`;

const donorPopup = (donor: Donor, hospital: HospitalProfile): string => `
  <strong>${donor.name}</strong><br />
  Blood Group: ${donor.bloodGroup}<br />
  Distance from hospital: ${donor.distanceKm || 'Live route'} km<br />
  Availability: Available<br />
  ETA: ${donor.etaMinutes || 'Calculating'} min
`;

const sosPopup = (request: EmergencyRequest): string => `
  <strong>Emergency SOS</strong><br />
  ${request.hospitalName}<br />
  Priority: ${request.priority}<br />
  Radius: ${request.broadcastRadiusKm} km<br />
  Status: ${request.status}
`;

// Helper to generate a circle GeoJSON polygon for geofence visual
function createGeoJSONCircle(center: [number, number], radiusInKm: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0]
  };

  const km = radiusInKm;
  const ret: [number, number][] = [];
  const distanceX = km / (111.320 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret]
    },
    properties: {}
  };
}

export const LiveMapPage: React.FC = () => {
  const { 
    hospital, 
    donors, 
    requests, 
    selectedRequestId, 
    closeRequest
  } = useCommandCenter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const sosMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const donorMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const geofenceIdsRef = useRef<Set<string>>(new Set());

  const [radiusKm, setRadiusKm] = useState<5 | 10 | 20>(10);
  const [selectedDonorId, setSelectedDonorId] = useState<string>('DNR-8821');
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(true);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callStatus, setCallStatus] = useState<'IDLE' | 'CALLING' | 'CONNECTED'>('IDLE');

  const [mapHospital, setMapHospital] = useState<HospitalProfile>(hospital);
  const [liveRequests, setLiveRequests] = useState<EmergencyRequest[]>(requests);
  const [liveDonors, setLiveDonors] = useState<Donor[]>(donors);

  const activeRequests = liveRequests.filter((request) =>
    request.status === 'BROADCASTING' ||
    request.status === 'ACCEPTED' ||
    request.status === 'DONORS_DISPATCHED'
  );
  const activeDonors = liveDonors
    .filter((donor) => donor.status !== 'CANCELLED' && donor.status !== 'COMPLETED')
    .map((donor) => ({
      ...donor,
      distanceKm: donor.distanceKm || Number(distanceKm(donor.latitude, donor.longitude, mapHospital.latitude, mapHospital.longitude).toFixed(1)),
      etaMinutes: donor.etaMinutes || Math.max(1, Math.round(distanceKm(donor.latitude, donor.longitude, mapHospital.latitude, mapHospital.longitude) / 0.5))
    }));
  const selectedDonor = liveDonors.find(d => d.id === selectedDonorId) || activeDonors[0] || liveDonors[0];
  const linkedRequest = activeRequests.find(r => r.id === (selectedRequestId || selectedDonor?.requestId)) || activeRequests[0];

  const hospitalCoords: [number, number] = [mapHospital.longitude, mapHospital.latitude];

  useEffect(() => {
    let mounted = true;
    void fetchHospitalProfile(hospital.id).then((profile) => {
      if (mounted && profile) setMapHospital(profile);
    });
    return () => {
      mounted = false;
    };
  }, [hospital.id]);

  useEffect(() => {
    setLiveRequests(requests);
  }, [requests]);

  useEffect(() => {
    setLiveDonors(donors);
  }, [donors]);

  useEffect(() => {
    let mounted = true;
    const refreshRequests = async () => {
      const nextRequests = await fetchBloodRequests(mapHospital.id);
      if (mounted && isLiveSupabaseConfigured) setLiveRequests(nextRequests);
    };
    const refreshDonors = async () => {
      const { data, error } = await supabase
        .from('donors')
        .select('*');
      if (error) {
        console.error('[LiveMap] Donor realtime refresh failed:', error);
        return;
      }
      if (!mounted || !data) return;
      const nextDonors: Donor[] = (data as DonorRow[])
        .filter((row) => row.availability === true && isCoordinate(row.latitude) && isCoordinate(row.longitude))
        .map(toMapDonor);
      setLiveDonors(nextDonors);
    };

    const channel = supabase
      .channel(`live-map-${mapHospital.id || 'hospital'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, () => { void refreshRequests(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donors' }, () => { void refreshDonors(); })
      .subscribe();

    void refreshRequests();
    void refreshDonors();
    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [mapHospital.id]);

  // Initialize Mapbox GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: hospitalCoords,
      zoom: 12.8,
      attributionControl: false
    });

    mapRef.current = map;

    map.on('load', () => {
      map.addSource('donor-route', {
        type: 'geojson',
        data: routeFeature(selectedDonor, hospitalCoords)
      });
      map.addLayer({
        id: 'donor-route-line',
        type: 'line',
        source: 'donor-route',
        paint: { 'line-color': '#2563EB', 'line-width': 3, 'line-dasharray': [2, 1] }
      });
      updateMarkers(map);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      sosMarkersRef.current.clear();
      donorMarkersRef.current.clear();
      map.remove();
    };
  }, [mapHospital.id]);

  const updateMarkers = (map: mapboxgl.Map) => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    sosMarkersRef.current.clear();
    donorMarkersRef.current.clear();

    // Hospital Beacon Marker
    const hospitalEl = document.createElement('div');
    hospitalEl.className = 'relative flex items-center justify-center cursor-pointer';
    hospitalEl.innerHTML = `
      <div class="absolute w-12 h-12 rounded-full bg-red-600/20 animate-pulse-beacon pointer-events-none"></div>
      <div class="w-10 h-10 rounded-2xl bg-red-600 text-white font-black flex items-center justify-center shadow-lg border-2 border-white text-base">
        🏥
      </div>
      <div class="absolute -top-7 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md">
        ${hospital.name.split(' ')[0]} HQ
      </div>
    `;

    const hospitalMarker = new mapboxgl.Marker({ element: hospitalEl })
      .setLngLat(hospitalCoords)
      .setPopup(new mapboxgl.Popup({ offset: 24 }).setHTML(hospitalPopup(mapHospital)))
      .addTo(map);
    markersRef.current.push(hospitalMarker);

    // Donors Markers
    activeDonors.forEach((donor) => {
      const isSelected = donor.id === selectedDonor?.id;
      const donorEl = document.createElement('div');
      donorEl.className = `relative flex flex-col items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-20'}`;

      donorEl.innerHTML = `
        <div class="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-md border ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-slate-300'} mb-1">
          <span class="w-2 h-2 rounded-full ${donor.status === 'ARRIVED_TRIAGE' ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}"></span>
          <span class="text-[10px] font-extrabold text-slate-800">${donor.bloodGroup}</span>
          <span class="text-[9px] font-mono font-bold text-slate-500">${donor.etaMinutes}m</span>
        </div>
        <div class="w-8 h-8 rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'} flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">
          ${donor.vehicleType === 'Car' ? '🚗' : donor.vehicleType === 'Bike' ? '🏍️' : '🚶'}
        </div>
      `;

      donorEl.addEventListener('click', () => {
        setSelectedDonorId(donor.id);
        map.flyTo({
          center: [donor.longitude, donor.latitude],
          zoom: 13.8,
          essential: true
        });
      });

      const marker = new mapboxgl.Marker({ element: donorEl })
        .setLngLat([donor.longitude, donor.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(donorPopup(donor, mapHospital)))
        .addTo(map);
      markersRef.current.push(marker);
      donorMarkersRef.current.set(donor.id, marker);
    });

    activeRequests.forEach((request) => {
      const color = priorityColor(request.priority);
      const requestEl = document.createElement('div');
      requestEl.className = 'w-8 h-8 rounded-full flex items-center justify-center text-white font-black border-2 border-white shadow-lg animate-pulse';
      requestEl.style.backgroundColor = color;
      requestEl.textContent = 'SOS';
      const marker = new mapboxgl.Marker({ element: requestEl })
        .setLngLat([request.longitude, request.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 18 }).setHTML(sosPopup(request)))
        .addTo(map);
      markersRef.current.push(marker);
      sosMarkersRef.current.set(request.id, marker);

      const sourceId = `sos-geofence-${request.id}`;
      const fillId = `${sourceId}-fill`;
      const lineId = `${sourceId}-line`;
      const geojson = createGeoJSONCircle([request.longitude, request.latitude], request.broadcastRadiusKm);
      if (map.getSource(sourceId)) {
        (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource(sourceId, { type: 'geojson', data: geojson });
        map.addLayer({ id: fillId, type: 'fill', source: sourceId, paint: { 'fill-color': color, 'fill-opacity': 0.14 } });
        map.addLayer({ id: lineId, type: 'line', source: sourceId, paint: { 'line-color': color, 'line-width': 1.6, 'line-dasharray': [3, 2] } });
      }
      geofenceIdsRef.current.add(request.id);
    });

    geofenceIdsRef.current.forEach((requestId) => {
      if (activeRequests.some((request) => request.id === requestId)) return;
      const sourceId = `sos-geofence-${requestId}`;
      const fillId = `${sourceId}-fill`;
      const lineId = `${sourceId}-line`;
      if (map.getLayer(fillId)) map.removeLayer(fillId);
      if (map.getLayer(lineId)) map.removeLayer(lineId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
      geofenceIdsRef.current.delete(requestId);
    });

    const nearestDonor = activeDonors.reduce<Donor | undefined>((nearest, donor) => {
      if (!nearest) return donor;
      return distanceKm(donor.latitude, donor.longitude, hospitalCoords[1], hospitalCoords[0]) <
        distanceKm(nearest.latitude, nearest.longitude, hospitalCoords[1], hospitalCoords[0]) ? donor : nearest;
    }, undefined);
    if (activeRequests.length > 0) {
      const bounds = new mapboxgl.LngLatBounds(hospitalCoords, hospitalCoords);
      activeRequests.forEach((request) => bounds.extend([request.longitude, request.latitude]));
      if (nearestDonor) bounds.extend([nearestDonor.longitude, nearestDonor.latitude]);
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 600 });
    }
  };

  // Synchronize route and radius updates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map.isStyleLoaded()) return;

    const routeSource = map.getSource('donor-route') as mapboxgl.GeoJSONSource;
    if (routeSource && selectedDonor) {
      routeSource.setData(routeFeature(selectedDonor, hospitalCoords));
    }

    updateMarkers(map);
  }, [radiusKm, selectedDonorId, activeDonors, activeRequests, mapHospital]);

  useEffect(() => {
    if (!selectedDonor || !mapboxgl.accessToken) return;
    const controller = new AbortController();
    const loadRoute = async () => {
      const coordinates = `${selectedDonor.longitude},${selectedDonor.latitude};${mapHospital.longitude},${mapHospital.latitude}`;
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`,
        { signal: controller.signal }
      );
      if (!response.ok) {
        console.warn('[LiveMap] Mapbox route request failed:', response.status);
        return;
      }
      const result = await response.json() as {
        routes?: Array<{ geometry?: { coordinates?: [number, number][] } }>;
      };
      const routeCoordinates = result.routes?.[0]?.geometry?.coordinates;
      const routeSource = mapRef.current?.getSource('donor-route') as mapboxgl.GeoJSONSource | undefined;
      if (routeSource && routeCoordinates && routeCoordinates.length > 1) {
        routeSource.setData({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: routeCoordinates },
          properties: {}
        });
      }
    };
    void loadRoute().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('[LiveMap] Mapbox route error:', error);
    });
    return () => controller.abort();
  }, [selectedDonor?.id, selectedDonor?.latitude, selectedDonor?.longitude, mapHospital.latitude, mapHospital.longitude]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleLocateHospital = () => {
    mapRef.current?.flyTo({
      center: hospitalCoords,
      zoom: 13.5,
      essential: true
    });
  };

  const handleCallDonor = () => {
    setCallModalOpen(true);
    setCallStatus('CALLING');
    setTimeout(() => setCallStatus('CONNECTED'), 1200);
  };

  return (
    <div id="live-map-real-operations" className="relative space-y-4 lg:space-y-6 animate-in fade-in duration-200">
      
      {/* Top Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 lg:p-5 rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#101828] text-white flex items-center justify-center shadow-xs shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#101828]">
                Live Map Radar
              </h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-[#667085] mt-0.5">
              Real-time volunteer routes, ETA vectors, and emergency geofence corridor.
            </p>
          </div>
        </div>

        {/* Floating Radius Selector Pill */}
        <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-1 text-xs font-semibold shrink-0">
          <span className="px-2.5 text-slate-500 text-[11px] uppercase font-bold">Corridor:</span>
          {([5, 10, 20] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRadiusKm(r)}
              className={`h-8 px-3 rounded-xl transition-all font-mono tabular-nums ${
                radiusKm === r
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* REAL MAP CANVAS CONTAINER */}
      <div className="relative rounded-[28px] border border-[#E5E7EB] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.02)] bg-slate-100 h-[60vh] lg:h-[70vh]">
        
        {/* Mapbox DOM Node */}
        <div 
          ref={mapContainerRef} 
          id="mapbox-canvas"
          className="w-full h-full"
        />

        {/* Map Controls Top Right */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5E7EB] text-slate-800 shadow-sm flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-11 h-11 rounded-2xl bg-white/90 hover:bg-white backdrop-blur-md border border-[#E5E7EB] text-slate-800 shadow-sm flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleLocateHospital}
            className="w-11 h-11 rounded-2xl bg-[#101828] text-white shadow-sm flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-slate-900 active:scale-95"
            title="Recenter on Hospital"
            aria-label="Recenter on Hospital"
          >
            <Locate className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Donor Quick Selector (Top Left HUD) */}
        <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-[#E5E7EB] shadow-sm text-xs">
          <span className="font-bold text-slate-700 text-[11px]">En Route:</span>
          {activeDonors.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDonorId(d.id)}
              className={`px-2.5 py-1 rounded-xl font-bold transition-all text-xs ${
                d.id === selectedDonor?.id 
                  ? 'bg-[#101828] text-white shadow-xs' 
                  : 'bg-[#F8FAFC] text-slate-700 hover:bg-slate-200'
              }`}
            >
              {d.name.split(' ')[0]} ({d.bloodGroup})
            </button>
          ))}
        </div>

        {/* Legend Bottom Left */}
        <div className="absolute bottom-24 lg:bottom-28 left-4 z-10 hidden md:flex flex-col gap-1.5 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-[#E5E7EB] shadow-sm text-[11px]">
          <div className="font-bold text-[#101828] text-[10px] uppercase tracking-wide">Corridor Legend</div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D92D20]"></span>
            <span>Hospital Trauma Center</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span>En Route Volunteer</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2.5 h-0.5 bg-[#D92D20] border border-dashed border-[#D92D20]"></span>
            <span>{radiusKm}km Corridor</span>
          </div>
        </div>

        {/* LIVE MAP BOTTOM SHEET (Apple Maps Style Overlay) */}
        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 max-w-2xl mx-auto">
          <div className="bg-white/98 backdrop-blur-lg border border-[#E5E7EB] rounded-[28px] shadow-lg overflow-hidden transition-all">
            
            {/* Sheet Handle */}
            <button 
              type="button"
              onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
              className="w-full py-2 flex items-center justify-center cursor-pointer hover:bg-slate-50"
              aria-label="Toggle Bottom Sheet Details"
            >
              <div className="w-10 h-1 rounded-full bg-slate-300" />
            </button>

            {/* Main Sheet Header */}
            <div className="px-5 pb-3 pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <BloodGroupBadge group={selectedDonor?.bloodGroup || 'O-'} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#101828]">{hospital.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#D92D20]">
                      {linkedRequest?.priority || 'CODE_RED'}
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] flex items-center gap-2 mt-0.5">
                    <span>Donor: <strong className="text-[#101828]">{selectedDonor?.name}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-blue-600 font-bold tabular-nums">{selectedDonor?.distanceKm} km away</span>
                    <span>•</span>
                    <span className="font-mono text-emerald-600 font-bold tabular-nums">{linkedRequest?.acceptedDonorsCount || 3} accepted</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right justify-between sm:justify-end">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated ETA</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-emerald-600 flex items-center justify-end gap-1 tabular-nums">
                    <Clock className="w-4 h-4" />
                    <span>{selectedDonor?.etaMinutes || 12} mins</span>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-4">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Units Needed</div>
                  <div className="text-lg sm:text-xl font-mono font-black text-[#D92D20] tabular-nums">
                    {linkedRequest?.unitsRequired || 3} Units
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sheet Action Buttons */}
            {isBottomSheetExpanded && (
              <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[11px] text-[#667085] font-medium">
                  <span>Transit: <strong>{selectedDonor?.vehicleType}</strong></span>
                  <span className="mx-1.5">•</span>
                  <span>Triage: Trauma OT</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCallDonor}
                    className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>Call Donor</span>
                  </button>

                  <a
                    href={`https://www.openstreetmap.org/directions?from=${selectedDonor?.latitude}%2C${selectedDonor?.longitude}&to=${hospital.latitude}%2C${hospital.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E7EB] text-[#101828] font-bold transition-all shadow-2xs"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Directions</span>
                  </a>

                  {linkedRequest && (
                    <button
                      onClick={() => closeRequest(linkedRequest.id)}
                      className="w-full sm:w-auto h-11 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#101828] hover:bg-slate-800 text-white font-bold transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Close SOS</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Interactive Call Donor Dialog Modal */}
      {callModalOpen && selectedDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] p-6 max-w-sm w-full border border-[#E5E7EB] shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
              <PhoneCall className={`w-7 h-7 ${callStatus === 'CALLING' ? 'animate-bounce' : ''}`} />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#101828]">{selectedDonor.name}</h3>
              <p className="text-xs text-[#667085] font-mono mt-0.5 tabular-nums">{selectedDonor.phone}</p>
              <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {callStatus === 'CALLING' ? 'Dialing volunteer...' : 'Connected • Emergency Transfusion Line'}
              </div>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">
              Volunteer is navigating via <strong>{selectedDonor.vehicleType}</strong> and is {selectedDonor.distanceKm} km from hospital.
            </p>

            <button
              onClick={() => setCallModalOpen(false)}
              className="w-full h-11 rounded-xl bg-[#D92D20] hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
