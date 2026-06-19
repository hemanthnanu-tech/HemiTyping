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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-10 md:p-12 rounded-[2rem] max-w-lg w-full animate-float relative shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
                
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors z-10">
                    <Icons.X className="w-6 h-6" />
                </button>
                
                <div className="mb-10">
                    <h2 className="text-4xl font-black tracking-tighter text-neutral-900 dark:text-white">
                        Settings
                    </h2>
                    <p className="text-neutral-500 text-sm font-medium mt-2">Personalize your typing environment.</p>
                </div>
                
                <div className="space-y-8 relative z-10">
                    {/* Callsign Input */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Callsign</label>
                        <div className="flex items-center border-b-2 border-neutral-200 dark:border-neutral-800 focus-within:border-blue-500 dark:focus-within:border-blue-500 transition-colors">
                            <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="flex-1 bg-transparent py-3 font-bold text-lg text-neutral-900 dark:text-white focus:outline-none placeholder-neutral-400"
                                placeholder="Enter your name"
                            />
                            <button onClick={handleSave} className="text-blue-500 hover:text-blue-600 font-bold uppercase tracking-widest text-xs px-4 py-2 transition-colors">
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Caret Style */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Caret Style</label>
                        <div className="flex gap-6">
                            {['line', 'block', 'underline'].map((style) => (
                                <button
                                    key={style}
                                    onClick={() => setCaretStyleType(style)}
                                    className={`py-2 text-sm font-bold uppercase tracking-widest transition-all relative ${caretStyleType === style ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                                >
                                    {style}
                                    {caretStyleType === style && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Family */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Font Family</label>
                        <div className="flex gap-6">
                            {['sans', 'mono', 'serif'].map((font) => (
                                <button
                                    key={font}
                                    onClick={() => setFontFamily(font)}
                                    className={`py-2 text-sm font-bold uppercase tracking-widest transition-all relative ${fontFamily === font ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                                >
                                    {font}
                                    {fontFamily === font && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-neutral-100 dark:border-neutral-800/50 flex justify-center">
                    <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
                        Engineered by <span className="text-neutral-800 dark:text-neutral-200">Hemanth Kumar K</span>
                    </p>
                </div>
            </div>
        </div>
    );
};
