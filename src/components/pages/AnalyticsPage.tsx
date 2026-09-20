import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid, 
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Heart, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  Download,
  Users,
  Droplet,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useCommandCenter } from '../../context/CommandCenterContext';

const HOURLY_SOS_DATA = [
  { hour: '00:00', requests: 1, donors: 4 },
  { hour: '03:00', requests: 0, donors: 2 },
  { hour: '06:00', requests: 2, donors: 7 },
  { hour: '09:00', requests: 6, donors: 18 },
  { hour: '12:00', requests: 8, donors: 24 },
  { hour: '15:00', requests: 7, donors: 21 },
  { hour: '18:00', requests: 9, donors: 29 },
  { hour: '21:00', requests: 4, donors: 14 },
];

const WEEKLY_DEMAND_DATA = [
  { day: 'Mon', required: 28, fulfilled: 26 },
  { day: 'Tue', required: 34, fulfilled: 32 },
  { day: 'Wed', required: 22, fulfilled: 22 },
  { day: 'Thu', required: 41, fulfilled: 38 },
  { day: 'Fri', required: 39, fulfilled: 37 },
  { day: 'Sat', required: 46, fulfilled: 42 },
  { day: 'Sun', required: 31, fulfilled: 30 },
];

const SHORTAGE_TRENDS_DATA = [
  { group: 'O-', demand: 48, stock: 12, deficit: 36 },
  { group: 'O+', demand: 62, stock: 45, deficit: 17 },
  { group: 'A-', demand: 22, stock: 9, deficit: 13 },
  { group: 'A+', demand: 38, stock: 32, deficit: 6 },
  { group: 'B-', demand: 18, stock: 6, deficit: 12 },
  { group: 'B+', demand: 42, stock: 38, deficit: 4 },
  { group: 'AB-', demand: 14, stock: 4, deficit: 10 },
  { group: 'AB+', demand: 16, stock: 19, deficit: 0 },
];

const SLA_DONUT_DATA = [
  { name: '< 10 mins (Optimal)', value: 68, color: '#16A34A' },
  { name: '10-20 mins (Standard)', value: 24, color: '#2563EB' },
  { name: '20-30 mins (Extended)', value: 6, color: '#F59E0B' },
  { name: '> 30 mins (Breached)', value: 2, color: '#DC2626' },
];

export const AnalyticsPage: React.FC = () => {
  const { hospital } = useCommandCenter();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  return (
    <div id="analytics-operations-view" className="space-y-6 lg:space-y-8 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 lg:p-6 rounded-[28px] border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#101828] tracking-tight">
              Hospital Transfusion Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              NABH Audit Logged
            </span>
          </div>
          <p className="text-xs text-[#667085] mt-0.5">
            Clinical SLA compliance, volunteer turnout rates, and regional blood deficit forecasting.
          </p>
        </div>

        {/* Time Range Filter (44px height pills) */}
        <div className="flex items-center bg-[#F8FAFC] border border-[#E5E7EB] rounded-2xl p-1 text-xs font-semibold shrink-0">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`h-9 px-3.5 rounded-xl transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-slate-900 ${
                timeRange === range
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Equal-Height Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        
        {/* Metric 1: Verified Transfusions */}
        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Verified Transfusions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-emerald-600" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-3xl lg:text-4xl font-mono font-bold text-[#101828] tabular-nums">
              1,428
            </div>
            <p className="text-xs text-[#667085] mt-1 truncate">
              Lives saved across {hospital.name}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>+28 patients stabilized today</span>
          </div>
        </div>

        {/* Metric 2: Average Dispatch SLA */}
        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Average Dispatch SLA</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-3xl lg:text-4xl font-mono font-bold text-[#101828] tabular-nums">
              11.4 <span className="text-xs font-normal text-slate-500">mins</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1 truncate">
              ↓ 3.8m faster than standard dispatch
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
            <span>SLA Target: &lt; 15 mins</span>
          </div>
        </div>

        {/* Metric 3: FCM Donor Acceptance */}
        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>FCM Donor Acceptance</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-3xl lg:text-4xl font-mono font-bold text-[#101828] tabular-nums">
              92.4%
            </div>
            <p className="text-xs text-[#667085] mt-1 truncate">
              Within 180s of emergency broadcast
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-purple-700 flex items-center gap-1 font-semibold">
            <span>High volunteer engagement rate</span>
          </div>
        </div>

        {/* Metric 4: Cold-Chain Integrity */}
        <div className="bg-white rounded-[28px] p-5 sm:p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] h-full flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Cold-Chain Integrity</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="py-2">
            <div className="text-3xl lg:text-4xl font-mono font-bold text-[#101828] tabular-nums">
              99.8%
            </div>
            <p className="text-xs text-[#667085] mt-1 truncate">
              Continuous temperature tracking
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
            <span>Safe range: 2°C – 6°C</span>
          </div>
        </div>

      </div>

      {/* MOBILE CHARTS CAROUSEL (lg:hidden) */}
      <div className="block lg:hidden space-y-4">
        {/* Active Carousel Card Container */}
        <div className="overflow-hidden">
          {activeChartIndex === 0 && (
            <div className="bg-white rounded-[28px] p-5 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart 1 of 4</span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-[#D92D20]">
                      <span className="w-2 h-2 rounded-full bg-[#D92D20]" /> SOS
                    </span>
                    <span className="inline-flex items-center gap-1 text-blue-600">
                      <span className="w-2 h-2 rounded-full bg-blue-600" /> Donors
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#101828]">
                  Hourly SOS Broadcasts & Turnout
                </h3>
                <p className="text-xs text-[#667085]">
                  Peak emergency windows throughout 24-hour cycle
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_SOS_DATA}>
                    <defs>
                      <linearGradient id="colorReqM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D92D20" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#D92D20" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDnrM" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#D92D20" strokeWidth={2} fillOpacity={1} fill="url(#colorReqM)" name="SOS" />
                    <Area type="monotone" dataKey="donors" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorDnrM)" name="Donors" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartIndex === 1 && (
            <div className="bg-white rounded-[28px] p-5 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart 2 of 4</span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-slate-300" /> Need
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" /> Fulfilled
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#101828]">
                  Weekly Demand vs. Fulfilled Units
                </h3>
                <p className="text-xs text-[#667085]">
                  Hospital units requested vs completed transfusions
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_DEMAND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
                    <YAxis stroke="#94A3B8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '11px' }}
                    />
                    <Bar dataKey="required" fill="#E2E8F0" radius={[4, 4, 0, 0]} name="Required" />
                    <Bar dataKey="fulfilled" fill="#16A34A" radius={[4, 4, 0, 0]} name="Fulfilled" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartIndex === 2 && (
            <div className="bg-white rounded-[28px] p-5 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart 3 of 4</span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 text-blue-600">Stock</span>
                    <span className="inline-flex items-center gap-1 text-[#D92D20]">Deficit</span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#101828]">
                  Regional Blood Deficit Index
                </h3>
                <p className="text-xs text-[#667085]">
                  Variance between emergency calls and cold vault
                </p>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SHORTAGE_TRENDS_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                    <YAxis dataKey="group" type="category" stroke="#94A3B8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '11px' }}
                    />
                    <Bar dataKey="stock" fill="#3B82F6" stackId="a" name="Stock" />
                    <Bar dataKey="deficit" fill="#D92D20" stackId="a" name="Deficit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartIndex === 3 && (
            <div className="bg-white rounded-[28px] p-5 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chart 4 of 4</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    94% SLA
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#101828]">
                  Donor Arrival SLA Distribution
                </h3>
                <p className="text-xs text-[#667085]">
                  Transfusions meeting national 15-minute SLA
                </p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SLA_DONUT_DATA}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {SLA_DONUT_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                {SLA_DONUT_DATA.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-slate-600 truncate">{d.name}:</span>
                    <span className="font-bold text-[#101828] font-mono tabular-nums">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setActiveChartIndex((prev) => (prev > 0 ? prev - 1 : 3))}
            className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95"
            aria-label="Previous chart"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveChartIndex(idx)}
                className={`transition-all rounded-full ${
                  activeChartIndex === idx 
                    ? 'w-6 h-2 bg-[#101828]' 
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Go to chart ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveChartIndex((prev) => (prev < 3 ? prev + 1 : 0))}
            className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] text-slate-700 flex items-center justify-center shadow-2xs hover:bg-slate-50 active:scale-95"
            aria-label="Next chart"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DESKTOP CHARTS GRID (hidden lg:grid) */}
      <div className="hidden lg:grid grid-cols-2 gap-6">
        
        {/* Chart 1: Hourly SOS Graph */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Hourly SOS Broadcasts & Donor Turnout
              </h3>
              <p className="text-xs text-[#667085]">
                Peak emergency windows throughout 24-hour cycle
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-[#D92D20]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D92D20]" /> SOS Requests
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Donors Arrived
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_SOS_DATA}>
                <defs>
                  <linearGradient id="colorReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D92D20" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#D92D20" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDnr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="requests" stroke="#D92D20" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReq)" name="SOS Broadcasts" />
                <Area type="monotone" dataKey="donors" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDnr)" name="Arrived Donors" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weekly Blood Demand vs Fulfillment */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#101828]">
                Weekly Demand vs. Fulfilled Units
              </h3>
              <p className="text-xs text-[#667085]">
                Hospital units requested vs completed transfusions
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="inline-flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Required
              </span>
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Fulfilled
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DEMAND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="required" fill="#E2E8F0" radius={[6, 6, 0, 0]} name="Units Required" />
                <Bar dataKey="fulfilled" fill="#16A34A" radius={[6, 6, 0, 0]} name="Units Fulfilled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Blood Group Deficit Analysis */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">
              Regional Blood Shortage & Deficit Index
            </h3>
            <p className="text-xs text-[#667085]">
              Discrepancy between emergency requests and cold storage
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SHORTAGE_TRENDS_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="group" type="category" stroke="#94A3B8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="stock" fill="#3B82F6" stackId="a" name="Vault Stock" />
                <Bar dataKey="deficit" fill="#D92D20" stackId="a" name="Corridor Deficit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Donor SLA Response Times */}
        <div className="bg-white rounded-[28px] p-6 border border-[#E5E7EB] shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#101828]">
              Donor Arrival SLA Distribution
            </h3>
            <p className="text-xs text-[#667085]">
              Transfusions meeting national 15-minute SLA
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SLA_DONUT_DATA}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SLA_DONUT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '16px', border: 'none', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {SLA_DONUT_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-600 truncate">{d.name}:</span>
                <span className="font-bold text-[#101828] font-mono tabular-nums">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
