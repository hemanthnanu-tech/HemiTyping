import React, { useState } from 'react';
import { Icons } from './Icons';

export const StatsModal = ({ isOpen, onClose, stats, username }) => {
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
                    <h2 className="text-2xl font-black tracking-tight text-neutral-800 dark:text-neutral-100">
                        {username ? `${username}'s Progress` : 'User Progress'}
                    </h2>
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

export const OnboardingModal = ({ isOpen, onComplete }) => {
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onComplete(name.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <div className="glass-panel p-10 rounded-[2rem] max-w-md w-full animate-float relative border border-blue-500/50 shadow-2xl shadow-blue-500/20 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/50">
                    <Icons.Keyboard className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-neutral-800 dark:text-white mb-2">
                    Welcome to HemiTyping
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mb-8 font-medium">
                    Please enter your name to personalize your typing experience.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-xl font-bold text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all text-neutral-900 dark:text-white"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black tracking-widest uppercase py-4 rounded-xl transition-all shadow-xl shadow-blue-500/25"
                    >
                        Start Evolution
                    </button>
                </form>
            </div>
        </div>
    );
};
