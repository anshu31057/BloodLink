import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { authService } from "../../services/authService";

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('trauma.ops@aiims.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email || !password) {
    setError("Please provide hospital credentials.");
    return;
  }

  setError("");
  setIsLoading(true);

  try {
    const result = await authService.hospitalLogin(email, password);

    if (!result.success) {
      setError(result.error || "Invalid hospital credentials.");
      return;
    }

    console.log("✅ Hospital Login Success", result.session);

    // Redirect to Command Center
    window.location.reload();
  } catch (err: any) {
    setError(err?.message || "Authentication failed.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col justify-between p-6 sm:p-10">
      {/* Top Brand Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#D92D20] text-white flex items-center justify-center font-black text-xl shadow-xs">
            🩸
          </div>
          <div>
            <div className="text-base font-extrabold text-[#101828] tracking-tight">
              BloodLink 8
            </div>
            <div className="text-xs text-[#667085]">8 Blood Groups. One Lifeline.</div>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-semibold border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>National Emergency Network</span>
        </div>
      </div>

      {/* Main Login Card (Apple Health / Material 3 Style) */}
      <div className="max-w-md w-full mx-auto my-8">
        <div className="bg-white rounded-[28px] p-8 border border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
          
          <div className="text-left space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#101828] tracking-tight">
              Hospital Login
            </h2>
            <p className="text-xs text-[#667085]">
              8 Blood Groups. One Lifeline. Access verified hospital command terminal.
            </p>

            {/* 8 Blood Groups Pill Strip */}
            <div className="flex flex-wrap items-center gap-1 pt-2">
              {bloodGroups.map((bg) => (
                <span key={bg} className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-slate-100 text-slate-700">
                  {bg}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-[#D92D20] font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#667085] mb-1.5">
                Medical Officer Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium disabled:opacity-60"
                  placeholder="doctor@hospital.gov.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#667085]">
                  Password
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password recovery: Contact Hospital Blood Bank Administrator at +91 11 2659 8888.'); }} className="text-xs font-semibold text-blue-600 hover:underline">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#101828] focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-2xl bg-[#D92D20] hover:bg-red-700 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Hospital License...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Hospital Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-[#667085] text-center">
              Quick Test Access
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setEmail('trauma.dir@aiims.edu');
                  setPassword('ApexTrauma2026!');
                  setIsLoading(true);
                  setError('');
                  try {
                    await authService.hospitalLogin(
  "trauma.dir@aiims.edu",
  "ApexTrauma2026!"
);
window.location.reload();
                  } catch (e: any) {
                    setError(e?.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 text-center transition-all cursor-pointer"
              >
                Trauma Director
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={async () => {
                  setEmail('emergency.ot@aiims.edu');
                  setPassword('EmergencyOT#99');
                  setIsLoading(true);
                  setError('');
                  try {
                    await authService.hospitalLogin(
  "emergency.ot@aiims.edu",
  "EmergencyOT#99"
);
window.location.reload();
                  } catch (e: any) {
                    setError(e?.message);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 text-center transition-all cursor-pointer"
              >
                Emergency OT Desk
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-[11px] text-[#667085] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>HL7 / FHIR Verified Emergency Network • Supabase Auth</span>
          </div>

        </div>
      </div>

      {/* Footer Support */}
      <div className="max-w-5xl mx-auto w-full pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#667085]">
        <div>
          Emergency Hotline: <strong className="text-slate-800">1800-11-2566</strong>
        </div>
        <div>
          BloodLink 8 • 8 Blood Groups. One Lifeline.
        </div>
      </div>
    </div>
  );
};
