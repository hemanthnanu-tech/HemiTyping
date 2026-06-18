import React from 'react';
import { Icons } from './Icons';

export const StatsModal = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
            <div className="glass-panel p-8 max-w-md w-full mx-4 border border-white/10 animate-pop">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icons.Activity className="w-6 h-6 text-cyan-400"/> Career Stats
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <Icons.X className="w-6 h-6"/>
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-white/50 uppercase tracking-wider">Total Runs</div>
                        <div className="text-2xl font-bold text-white">{stats.totalRuns}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-white/50 uppercase tracking-wider">Avg WPM</div>
                        <div className="text-2xl font-bold text-cyan-400">{stats.avgWpm}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-white/50 uppercase tracking-wider">Best WPM</div>
                        <div className="text-2xl font-bold text-amber-400">{stats.bestWpm}</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl">
                        <div className="text-xs text-white/50 uppercase tracking-wider">Total Chars</div>
                        <div className="text-2xl font-bold text-purple-400">{stats.totalChars}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DailyModal = ({ isOpen, onClose, dailyTask, onStart }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
            <div className="glass-panel p-8 max-w-md w-full mx-4 border border-white/10 animate-pop relative overflow-hidden">
                {dailyTask.completed && (
                    <div className="absolute inset-0 bg-emerald-500/10 z-0 pointer-events-none"></div>
                )}
                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icons.Calendar className="w-6 h-6 text-amber-400"/> Daily Ops
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <Icons.X className="w-6 h-6"/>
                    </button>
                </div>
                <div className="space-y-4 relative z-10">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-sm text-white/60 mb-1">Objective</div>
                        <div className="text-lg font-medium text-white">
                            Reach <span className="text-cyan-400 font-bold">{dailyTask.targetWpm} WPM</span> in <span className="text-purple-400 font-bold">{dailyTask.mode}</span> mode
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="text-sm text-white/60">Status</div>
                        <div className={`font-bold uppercase tracking-widest ${dailyTask.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {dailyTask.completed ? 'COMPLETED' : 'PENDING'}
                        </div>
                    </div>
                    {!dailyTask.completed ? (
                        <button 
                            onClick={onStart}
                            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
                        >
                            Start Mission
                        </button>
                    ) : (
                        <div className="w-full py-3 text-center text-emerald-400 font-bold bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            Mission Accomplished
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
            <div className="glass-panel p-8 max-w-md w-full mx-4 border border-white/10 animate-pop overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Icons.Info className="w-6 h-6 text-cyan-400"/> System Info
                    </h2>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <Icons.X className="w-6 h-6"/>
                    </button>
                </div>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest border-b border-white/10 pb-2">Metrics</h3>
                        <div className="grid gap-3 text-sm">
                            <div><span className="text-cyan-400 font-bold">WPM (Words Per Minute)</span><p className="text-white/60">Calculated as (Total Characters / 5) divided by time elapsed. Standard measure of typing speed.</p></div>
                            <div><span className="text-emerald-400 font-bold">Accuracy</span><p className="text-white/60">Percentage of keystrokes that were correct. Accuracy = (Correct / Total) * 100.</p></div>
                            <div><span className="text-amber-400 font-bold">Max Streak</span><p className="text-white/60">The highest number of characters typed correctly in a row without a single mistake.</p></div>
                            <div><span className="text-purple-400 font-bold">Raw</span><p className="text-white/60">Total number of keystrokes registered, including backspaces and errors.</p></div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="relative group w-full h-32 perspective-1000">
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-700"></div>
                            <div className="relative h-full w-full bg-black/40 rounded-xl border border-white/10 p-6 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-cyan-500/30 group-hover:transform group-hover:scale-[1.02]">
                                
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>

                                <div className="z-10 text-center space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/40 group-hover:text-cyan-400 transition-colors duration-300">Architect & Engineer</p>
                                    
                                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white bg-[length:200%_auto] animate-gradient-x drop-shadow-lg">
                                        HEMANTH KUMAR K
                                    </h1>
                                    
                                    <div className="flex items-center justify-center gap-3 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-300">v2.0.0</div>
                                        <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-purple-300">Hyper Engine</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
