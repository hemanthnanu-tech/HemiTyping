import React from 'react';
import { Icons } from './Icons';

export const StatsModal = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 rounded-[2rem] max-w-md w-full animate-float relative border border-blue-500/30">
                <button onClick={onClose} className="absolute top-5 right-5 text-neutral-400 hover:text-blue-500 transition-colors">
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                        <Icons.Trophy className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-neutral-800 dark:text-neutral-100">Developer Stats</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Highest WPM</div>
                        <div className="text-4xl font-black text-blue-500">{stats.bestWpm}</div>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Avg WPM</div>
                        <div className="text-4xl font-black text-emerald-500">{stats.avgWpm}</div>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Sessions</div>
                        <div className="text-4xl font-black text-neutral-700 dark:text-neutral-200">{stats.totalRuns}</div>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/5 dark:border-white/5">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 dark:text-neutral-400 mb-1">Keystrokes</div>
                        <div className="text-4xl font-black text-neutral-700 dark:text-neutral-200">{stats.totalChars.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
