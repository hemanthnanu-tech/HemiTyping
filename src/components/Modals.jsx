import React from 'react';
import { Icons } from './Icons';

export const StatsModal = ({ isOpen, onClose, stats }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full animate-float relative border border-cyan-500/30">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors">
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg">
                        <Icons.Trophy className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200">Developer Stats</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Highest WPM</div>
                        <div className="text-3xl font-bold text-cyan-400">{stats.bestWpm}</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Avg WPM</div>
                        <div className="text-3xl font-bold text-emerald-400">{stats.avgWpm}</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Sessions</div>
                        <div className="text-3xl font-bold text-slate-200">{stats.totalRuns}</div>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                        <div className="text-xs uppercase tracking-widest text-slate-500 mb-1">Keystrokes</div>
                        <div className="text-3xl font-bold text-slate-200">{stats.totalChars.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const DailyModal = ({ isOpen, onClose, dailyTask, onStart }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full animate-float relative border border-cyan-500/30">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors">
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                        <Icons.Activity className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200">Daily Mission</h2>
                </div>
                
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 mb-6 text-center">
                    <h3 className="text-xl font-bold text-cyan-400 mb-2">{dailyTask.title}</h3>
                    <p className="text-slate-400 mb-4">{dailyTask.description}</p>
                    <div className="inline-block px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300 border border-slate-600">
                        Reward: {dailyTask.reward}
                    </div>
                </div>

                <button 
                    onClick={onStart}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25"
                >
                    Accept Mission
                </button>
            </div>
        </div>
    );
};

export const AboutModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 rounded-3xl max-w-md w-full animate-float relative border border-cyan-500/30">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-cyan-400 transition-colors">
                    <Icons.X className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg">
                        <Icons.Info className="text-white w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200">About HemiTyping</h2>
                </div>
                
                <div className="space-y-4 text-slate-300">
                    <p>HemiTyping is a high-performance typing engine designed specifically for developers.</p>
                    <p>Practice writing real code snippets, master terminal commands, and improve your raw prose speed in a distraction-free, visually stunning environment.</p>
                    <p className="text-xs text-slate-500 mt-6 pt-6 border-t border-slate-800">
                        Designed with modern web technologies: React, Tailwind CSS, and Vite.
                    </p>
                </div>
            </div>
        </div>
    );
};
