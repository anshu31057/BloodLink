import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  CheckCircle2, 
  ShieldAlert, 
  Radio, 
  MapPin, 
  QrCode, 
  Award,
  ChevronRight,
  X
} from 'lucide-react';
import { hackathonDemoService } from '../../services/demoService';
import { useCommandCenter } from '../../context/CommandCenterContext';

export const HackathonDemoBar: React.FC = () => {
  const { 
    broadcastSOS, 
    updateDonorStatus, 
    confirmDonorArrival, 
    closeRequest,
    setActivePage
  } = useCommandCenter();

  const [demoState, setDemoState] = useState({
    isRunning: false,
    isPaused: false,
    currentStepIndex: 0,
    elapsedSeconds: 0,
    speed: 1,
    activeRequestId: null as string | null,
    logs: [] as string[]
  });

  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const unsubscribe = hackathonDemoService.subscribe(state => {
      setDemoState(state);
    });
    return unsubscribe;
  }, []);

  const handleStart = () => {
    setIsMinimized(false);
    hackathonDemoService.startSimulation(
      broadcastSOS,
      updateDonorStatus,
      confirmDonorArrival,
      closeRequest
    );
  };

  const handleTogglePause = () => {
    if (demoState.isPaused) {
      hackathonDemoService.resume();
    } else {
      hackathonDemoService.pause();
    }
  };

  const handleCycleSpeed = () => {
    const nextSpeed = demoState.speed === 1 ? 3 : demoState.speed === 3 ? 10 : 1;
    hackathonDemoService.setSpeed(nextSpeed);
  };

  const handleReset = () => {
    hackathonDemoService.reset();
  };

  const currentStep = hackathonDemoService.steps[demoState.currentStepIndex] || hackathonDemoService.steps[0];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // If simulation is not running, show a non-intrusive floating pill in the bottom right corner
  if (!demoState.isRunning && demoState.elapsedSeconds === 0) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="hackathon-demo-trigger-btn"
          onClick={handleStart}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#101828] hover:bg-black text-white text-xs font-semibold shadow-xl border border-slate-700/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D92D20] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D92D20]" />
          </span>
          <span>⚡ Hackathon Demo: Simulate Accident (90s)</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  // If minimized during execution
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#101828] text-white text-xs font-semibold shadow-2xl border border-slate-700"
        >
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <span>Demo Running: {currentStep.phaseTitle} ({formatTime(demoState.elapsedSeconds)} / 01:30)</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono">{demoState.speed}x</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl">
      <div className="bg-[#101828] text-white rounded-[24px] border border-slate-700 shadow-2xl p-4 sm:p-5 backdrop-blur-xl">
        
        {/* Header row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center text-[#D92D20] shrink-0">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Hackathon Live Simulation
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {formatTime(demoState.elapsedSeconds)} / 01:30
                </span>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                  NH-44 Highway Collision
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate mt-0.5">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActivePage('live-map')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D92D20]" />
              <span>Radar Map</span>
            </button>

            <button
              onClick={handleTogglePause}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title={demoState.isPaused ? 'Resume' : 'Pause'}
            >
              {demoState.isPaused ? <Play className="w-3.5 h-3.5 text-green-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleCycleSpeed}
              className="px-2.5 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center transition-colors"
              title="Change Simulation Speed"
            >
              <FastForward className="w-3 h-3 mr-1 text-amber-400" />
              {demoState.speed}x
            </button>

            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              title="Minimize Bar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-step progress timeline */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-2">
          {hackathonDemoService.steps.map((step, idx) => {
            const isDone = demoState.elapsedSeconds >= step.timeSeconds;
            const isCurrent = demoState.currentStepIndex === idx;

            return (
              <div key={step.id} className="flex flex-col gap-1 min-w-0">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isDone 
                      ? 'bg-[#16A34A]' 
                      : isCurrent 
                        ? 'bg-[#D92D20] animate-pulse' 
                        : 'bg-slate-700'
                  }`} 
                />
                <span className={`text-[10px] truncate hidden sm:block font-medium ${
                  isCurrent ? 'text-white font-bold' : isDone ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {step.badge}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
