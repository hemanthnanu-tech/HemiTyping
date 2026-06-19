import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const StatsModal = ({ isOpen, onClose, stats, username }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <div className="glass-panel p-10 rounded-[2.5rem] max-w-lg w-full animate-float relative border border-white/10 dark:border-white/5 shadow-2xl shadow-blue-500/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
                
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-blue-500 transition-colors z-10 bg-black/5 dark:bg-white/5 p-2 rounded-full hover:bg-blue-500/10">
                    <Icons.X className="w-5 h-5" />
                </button>
                
                <div className="flex flex-col items-center text-center mb-10 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 transform rotate-3">
                        <Icons.Trophy className="w-8 h-8 text-white -rotate-3" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-neutral-800 dark:text-white">
                        {username ? `${username}'s Career` : 'Career Stats'}
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-1">Your lifetime typing performance.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/60 dark:bg-black/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Top Speed
                        </div>
                        <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">{stats.bestWpm}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-black/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Average
                        </div>
                        <div className="text-5xl font-black text-emerald-500">{stats.avgWpm}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-black/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2">Total Tests</div>
                        <div className="text-3xl font-black text-neutral-700 dark:text-neutral-200">{stats.totalRuns}</div>
                    </div>
                    <div className="bg-white/60 dark:bg-black/40 p-6 rounded-3xl border border-white/20 dark:border-white/5 backdrop-blur-md transition-transform hover:scale-[1.02]">
                        <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 mb-2">Keystrokes</div>
                        <div className="text-3xl font-black text-neutral-700 dark:text-neutral-200">{stats.totalChars.toLocaleString()}</div>
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
            <div className="glass-panel p-12 rounded-[3rem] max-w-lg w-full animate-float relative border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none"></div>
                
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30 transform -rotate-6">
                    <Icons.Keyboard className="w-10 h-10 rotate-6" />
                </div>
                
                <h1 className="text-4xl font-black tracking-tighter text-neutral-800 dark:text-white mb-3 relative z-10">
                    Welcome to Hemi
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 mb-10 text-lg font-medium relative z-10">
                    Enter your callsign to initialize the typing engine.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-white/50 dark:bg-black/40 border-2 border-transparent focus:border-blue-500/50 rounded-2xl px-6 py-5 text-2xl font-black text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all text-neutral-900 dark:text-white shadow-inner"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full bg-neutral-900 dark:bg-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white dark:text-black font-black tracking-[0.2em] uppercase py-5 rounded-2xl transition-all shadow-xl"
                    >
                        Initialize
                    </button>
                </form>
            </div>
        </div>
    );
};

export const AboutModal = ({ isOpen, onClose, username, onUpdateName, caretStyleType, setCaretStyleType, fontFamily, setFontFamily }) => {
    const [editName, setEditName] = useState(username || "");

    useEffect(() => {
        if (isOpen) setEditName(username || "");
    }, [isOpen, username]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (editName.trim()) {
            onUpdateName(editName.trim());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-10 rounded-[2.5rem] max-w-md w-full animate-float relative border border-white/10 dark:border-white/5 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-transparent pointer-events-none"></div>
                
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-blue-500 transition-colors z-10 bg-black/5 dark:bg-white/5 p-2 rounded-full hover:bg-blue-500/10">
                    <Icons.X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-5 mb-8 relative z-10">
                    <div className="p-4 bg-white/60 dark:bg-black/40 text-neutral-800 dark:text-white rounded-2xl shadow-sm border border-white/20 dark:border-white/5">
                        <Icons.Info className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-neutral-800 dark:text-white">
                            Settings
                        </h2>
                        <p className="text-neutral-500 text-sm font-medium mt-1">Configure your engine.</p>
                    </div>
                </div>
                
                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 pl-1">Callsign</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 bg-white/50 dark:bg-black/40 border border-transparent focus:border-blue-500/30 rounded-2xl px-5 py-4 font-bold text-neutral-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                            />
                            <button onClick={handleSave} className="bg-neutral-900 dark:bg-white hover:bg-black text-white dark:text-black dark:hover:bg-neutral-200 px-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-colors shadow-lg">
                                Save
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 pl-1">Caret Style</label>
                        <div className="flex bg-white/40 dark:bg-black/40 p-1.5 rounded-2xl border border-white/20 dark:border-white/5">
                            {['line', 'block', 'underline'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setCaretStyleType(style)}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${caretStyleType === style ? 'bg-white dark:bg-neutral-800 text-blue-500 shadow-md transform scale-[1.02]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 pl-1">Font Family</label>
                        <div className="flex bg-white/40 dark:bg-black/40 p-1.5 rounded-2xl border border-white/20 dark:border-white/5">
                            {['sans', 'mono', 'serif'].map((font) => (
                                <button
                                    key={font}
                                    onClick={() => setFontFamily(font)}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${fontFamily === font ? 'bg-white dark:bg-neutral-800 text-blue-500 shadow-md transform scale-[1.02]' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-white/50 dark:hover:bg-white/5'}`}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex justify-center">
                    <div className="relative group cursor-default">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center gap-4 bg-white dark:bg-neutral-900 px-6 py-4 rounded-xl border border-neutral-200 dark:border-white/10 leading-none shadow-xl">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-500">Engineered By</span>
                            <div className="w-px h-4 bg-neutral-200 dark:bg-white/10"></div>
                            <span className="text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Hemanth Kumar K</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
