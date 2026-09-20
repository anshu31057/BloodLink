import React, { useState } from 'react';
import { 
  Database, 
  Flame, 
  Map, 
  ShieldCheck, 
  Code2, 
  FileText, 
  FolderTree, 
  Copy, 
  Check, 
  X,
  ExternalLink
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ArchitectureDocsModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'fcm' | 'maplibre' | 'nextjs' | 'overview'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E5E7EB] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111827]">
                BloodLink 8 — System Architecture & Production Specs
              </h3>
              <p className="text-xs text-[#64748B]">
                Supabase Schema • FCM High-Priority Push • MapLibre OSM • Next.js 15
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-[#E5E7EB] flex items-center gap-2 overflow-x-auto bg-[#F8FAFC] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Overview & Flow</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Schema & RLS</span>
          </button>

          <button
            onClick={() => setActiveTab('fcm')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'fcm'
                ? 'border-amber-600 text-amber-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Firebase FCM Push Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('maplibre')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'maplibre'
                ? 'border-purple-600 text-purple-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>MapLibre + OSM Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('nextjs')}
            className={`px-4 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'nextjs'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Next.js 15 Structure</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900">
                <h4 className="font-bold text-sm mb-1">National Emergency Operations Workflow</h4>
                <p className="leading-relaxed">
                  When a hospital initiates an Emergency SOS on BloodLink Command Center, the following sub-second pipeline executes across the network:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-red-100 text-red-600 font-bold flex items-center justify-center">1</div>
                  <div className="font-bold text-slate-900">Hospital Broadcasts SOS</div>
                  <p className="text-[#64748B] text-[11px]">Record persisted into Supabase PostgreSQL table with PostGIS geometry indexing.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 font-bold flex items-center justify-center">2</div>
                  <div className="font-bold text-slate-900">FCM Geo-Target Push</div>
                  <p className="text-[#64748B] text-[11px]">Edge Function dispatches high-priority multicast push to registered mobile devices within radius.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center">3</div>
                  <div className="font-bold text-slate-900">Mobile Donor Accepts</div>
                  <p className="text-[#64748B] text-[11px]">Donor taps ACCEPT in BloodLink mobile app. Realtime WebSocket delivers response to Command Center.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center">4</div>
                  <div className="font-bold text-slate-900">Triage Arrival & Certificate</div>
                  <p className="text-[#64748B] text-[11px]">Phlebotomy confirmed, unit added to inventory, and cryptographically verified digital certificate generated.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'supabase' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">PostgreSQL Schemas & Row Level Security (RLS)</span>
                <button
                  onClick={() => copyToClipboard(`-- Supabase PostgreSQL Schema for BloodLink 8...`, 'sql')}
                  className="flex items-center gap-1 text-xs text-blue-600 font-semibold"
                >
                  {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied === 'sql' ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`-- 1. HOSPITALS TABLE
CREATE TABLE hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOMETRY(Point, 4326),
  license_number TEXT UNIQUE NOT NULL,
  emergency_phone TEXT NOT NULL,
  blood_bank_incharge TEXT NOT NULL,
  accreditations TEXT[] DEFAULT ARRAY['NABH', 'NABL', 'WHO']
);

-- 2. EMERGENCY REQUESTS TABLE
CREATE TABLE emergency_requests (
  id TEXT PRIMARY KEY,
  hospital_id UUID REFERENCES hospitals(id),
  department TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_contact TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  units_required INT NOT NULL,
  units_fulfilled INT DEFAULT 0,
  emergency_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('CODE_RED', 'IMMEDIATE', 'URGENT', 'HIGH')),
  patient_condition TEXT,
  broadcast_radius_km INT DEFAULT 10,
  status TEXT DEFAULT 'BROADCASTING' CHECK (status IN ('BROADCASTING', 'DONORS_DISPATCHED', 'FULFILLED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 3. REALTIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE donar_response;

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public verified donors can view active broadcasts"
ON emergency_requests FOR SELECT
USING (status = 'BROADCASTING' OR status = 'DONORS_DISPATCHED');

CREATE POLICY "Hospitals can insert and update their own broadcasts"
ON emergency_requests FOR ALL
USING (auth.uid() = hospital_id);`}
              </pre>
            </div>
          )}

          {activeTab === 'fcm' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <h4 className="font-bold text-sm mb-1">Firebase Cloud Messaging (FCM) High-Priority Specification</h4>
                <p>Broadcasts use direct device tokens registered via BloodLink Mobile Flutter / React Native clients with Android high priority and APNs alert priority 10.</p>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`// FCM Push Notification Multicast Payload Schema
{
  "message": {
    "topic": "emergency_blood_o_negative_delhi_10km",
    "notification": {
      "title": "🚨 CODE RED: O- Blood Needed Immediately",
      "body": "BloodLink Emergency Network requires 3 units for high-velocity polytrauma. Tap to accept emergency dispatch."
    },
    "data": {
      "requestId": "REQ-7741",
      "bloodGroup": "O-",
      "hospitalName": "BloodLink Emergency Network Node",
      "hospitalLatitude": "29.3909",
      "hospitalLongitude": "76.9635",
      "priority": "CODE_RED",
      "etaTargetMinutes": "15"
    },
    "android": {
      "priority": "high",
      "notification": {
        "channel_id": "emergency_bloodlink_critical",
        "sound": "emergency_trauma_alarm.wav",
        "default_vibrate_timings": true,
        "actions": [
          { "action": "ACCEPT", "title": "🩸 ACCEPT & DISPATCH" },
          { "action": "DECLINE", "title": "Decline" }
        ]
      }
    },
    "apns": {
      "headers": {
        "apns-priority": "10",
        "apns-push-type": "alert"
      }
    }
  }
}`}
              </pre>
            </div>
          )}

          {activeTab === 'maplibre' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900">
                <h4 className="font-bold text-sm mb-1">MapLibre GL + OpenStreetMap Vector Integration</h4>
                <p>Configured with OpenStreetMap vector raster tiles, pulsing GeoJSON marker sources, animated line geometry for donor-to-hospital routing, and dynamic 5km/10km/20km geofencing rings.</p>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`import maplibregl from 'maplibre-gl';

const map = new maplibregl.Map({
  container: 'map-container',
  style: {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors'
      }
    },
    layers: [
      {
        id: 'osm-tiles-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ]
  },
  center: [76.9635, 29.3909], // BloodLink Command Node (Panipat Regional Network)
  zoom: 13
});

// Dynamic Geofence Polygon Source
map.addSource('emergency-radius', {
  type: 'geojson',
  data: generateGeoJsonCircle([76.9635, 29.3909], 10) // 10km radius
});`}
              </pre>
            </div>
          )}

          {activeTab === 'nextjs' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-300 text-slate-900">
                <h4 className="font-bold text-sm mb-1">Next.js 15 App Router Production Folder Architecture</h4>
                <p>Clean structure adhering to Vercel and Apple Health design guidelines.</p>
              </div>

              <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`bloodlink-command-center/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Hospital Terminal Staff Login
│   ├── (dashboard)/
│   │   ├── layout.tsx                # Sidebar + Header + Notification Drawer
│   │   ├── page.tsx                  # Dashboard Home (Hero + Metric Cards)
│   │   ├── create-sos/page.tsx       # Emergency SOS Multi-step Medical Form
│   │   ├── live-requests/page.tsx    # Live Emergency Requests Cards Grid
│   │   ├── donor-center/page.tsx     # Realtime Donor Response & Status Dispatch
│   │   ├── live-map/page.tsx         # MapLibre + OSM Emergency Radar
│   │   ├── inventory/page.tsx        # 8 Blood Group Cards & Restock
│   │   ├── donation-history/page.tsx # Transfusion Ledger & Certificates
│   │   ├── analytics/page.tsx        # Recharts Demand & Lives Saved
│   │   └── profile/page.tsx          # Accreditations & Hospital Profile
│   └── api/
│       ├── sos/broadcast/route.ts    # FCM + Supabase Trigger Handler
│       └── donors/route.ts           # Donor Telemetry Sync
├── components/
│   ├── ui/                           # Badges, Buttons, Modals
│   ├── layout/                       # Header, Sidebar, BottomSheets
│   └── map/                          # MapLibre Canvas, Markers, Routes
├── lib/
│   ├── supabaseClient.ts             # Supabase Realtime Client
│   ├── firebaseAdmin.ts              # FCM Admin Push SDK
│   └── audioChime.ts                 # Web Audio API Emergency Chimes
└── public/
    └── sounds/emergency-alarm.mp3    # Level 1 Trauma Alert Audio`}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#F8FAFC] border-t border-[#E5E7EB] flex items-center justify-between text-xs">
          <span className="text-[#64748B]">
            All 10 pages and 50+ components designed for zero-latency emergency triage.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all"
          >
            Close Specs
          </button>
        </div>

      </div>
    </div>
  );
};
