import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { Confetti } from './components/Confetti';
import { WpmChart } from './components/WpmChart';
import { StatsModal, DailyModal, AboutModal } from './components/Modals';
import { DATA_SETS } from './data/constants';
import { playSound } from './utils/audio';

export default function App() {
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    
    // High-level mode: 'prose' or 'code'
    const [isCodeMode, setIsCodeMode] = useState(false);
    // Specific mode for text generation
    const [mode, setMode] = useState("prose");
    
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [streak, setStreak] = useState(0);
    const [wpmHistory, setWpmHistory] = useState([]);
    
    // UI State
    const [showStats, setShowStats] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isZenMode, setIsZenMode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [errorShake, setErrorShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [iconAnim, setIconAnim] = useState(false);

    // Persistent Stats
    const [stats, setStats] = useState({ totalRuns: 0, avgWpm: 0, bestWpm: 0, totalChars: 0, history: [] });

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const typingContainerRef = useRef(null);

    // Init and load settings
    useEffect(() => {
        const savedStats = localStorage.getItem('hemiStats_v3');
        if (savedStats) setStats(JSON.parse(savedStats));
        
        const savedSettings = localStorage.getItem('hemiSettings_v3');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
            if (settings.isZenMode !== undefined) setIsZenMode(settings.isZenMode);
            if (settings.isDarkMode !== undefined) setIsDarkMode(settings.isDarkMode);
        }

        generateText(isCodeMode ? 'javascript' : 'prose');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Apply dark mode to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const saveStats = (newStats) => {
        setStats(newStats);
        localStorage.setItem('hemiStats_v3', JSON.stringify(newStats));
    };

    const saveSettings = (updates) => {
        const current = { soundEnabled, isZenMode, isDarkMode, ...updates };
        localStorage.setItem('hemiSettings_v3', JSON.stringify(current));
    };

    const toggleTheme = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        saveSettings({ isDarkMode: next });
    };

    const toggleMode = () => {
        // Trigger spin animation
        setIconAnim(true);
        setTimeout(() => setIconAnim(false), 500);

        const nextIsCode = !isCodeMode;
        setIsCodeMode(nextIsCode);
        const nextMode = nextIsCode ? 'javascript' : 'prose';
        setMode(nextMode);
        generateText(nextMode);
    };

    const generateText = (currentMode) => {
        const data = DATA_SETS[currentMode] || DATA_SETS.prose;
        // Limit to 4 sentences/snippets for cleaner UI
        const randomSentences = Array.from({length: 4}, () => data[Math.floor(Math.random() * data.length)]).join(' ');
        setText(randomSentences);
        resetState();
    };

    const resetState = () => {
        setUserInput("");
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setTimeLeft(duration);
        setIsActive(false);
        setIsFinished(false);
        setWpmHistory([]);
        setShowConfetti(false);
        clearInterval(timerRef.current);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInput = (e) => {
        if (isFinished) return;
        
        const value = e.target.value;
        const isCorrect = text.startsWith(value);

        if (!isActive && value.length === 1) {
            setIsActive(true);
            setStartTime(Date.now());
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endTest();
                        return 0;
                    }
                    return prev - 1;
                });
                
                const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000;
                if (timeElapsed > 0) {
                    const words = userInput.length / 5;
                    setWpmHistory(prev => [...prev, Math.round(words / timeElapsed)]);
                }
            }, 1000);
        }

        if (isCorrect) {
            setUserInput(value);
            if (soundEnabled) playSound(140 + value.length * 2, 'sine', 0.01);
            if (value === text) {
                endTest();
            }
        } else {
            // Trigger red error glow & shake
            setErrorShake(true);
            setStreak(0);
            if (soundEnabled) playSound(100, 'sawtooth', 0.1);
            setTimeout(() => setErrorShake(false), 400);
            
            const correctChars = userInput.length;
            const totalAttempts = correctChars + 1;
            setAccuracy(Math.max(0, Math.floor((correctChars / totalAttempts) * 100)));
        }
    };

    const endTest = () => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(true);
        const finalTime = Date.now();
        setEndTime(finalTime);

        const timeElapsed = (finalTime - startTime) / 60000;
        const words = userInput.length / 5;
        const finalWpm = Math.round(words / timeElapsed);
        
        setWpm(finalWpm || 0);

        const newRuns = stats.totalRuns + 1;
        const newAvg = Math.round(((stats.avgWpm * stats.totalRuns) + finalWpm) / newRuns);
        const newBest = Math.max(stats.bestWpm, finalWpm);
        
        saveStats({
            totalRuns: newRuns,
            avgWpm: newAvg,
            bestWpm: newBest,
            totalChars: stats.totalChars + userInput.length,
            history: [...stats.history, { date: Date.now(), wpm: finalWpm, acc: accuracy, mode }].slice(-50)
        });

        if (finalWpm > stats.bestWpm && finalWpm > 0) {
            setShowConfetti(true);
            if (soundEnabled) playSound(440, 'sine', 0.5);
        }
    };

    const renderCharacters = () => {
        return text.split('').map((char, index) => {
            let color = isDarkMode ? 'text-neutral-500' : 'text-neutral-300';
            let isCurrent = false;

            if (index < userInput.length) {
                color = isDarkMode ? 'text-neutral-100 font-medium' : 'text-neutral-900 font-semibold';
            } else if (index === userInput.length) {
                color = isDarkMode ? 'text-neutral-400' : 'text-neutral-400';
                isCurrent = true;
            }

            return (
                <span key={index} className={`${color} ${isCurrent ? 'caret' : ''} transition-colors duration-100`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 selection:bg-blue-500/30 overflow-hidden font-sans">
            <div className="bg-aura"></div>
            {showConfetti && <Confetti />}

            <div className="z-10 w-full max-w-5xl">
                
                {/* Premium Minimal Header */}
                <header className={`flex justify-between items-center mb-12 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                    
                    {/* Animated Logo Toggle */}
                    <button 
                        onClick={toggleMode}
                        className="group flex items-center gap-4 hover:opacity-80 transition-opacity focus:outline-none"
                        title="Switch between Text and Code"
                    >
                        <div className={`p-2.5 rounded-xl shadow-lg transition-all duration-500 ${isCodeMode ? 'bg-indigo-600 text-white shadow-indigo-500/25' : 'bg-neutral-900 text-white shadow-black/20 dark:bg-white dark:text-neutral-900'} ${iconAnim ? 'scale-90 rotate-180' : 'scale-100 rotate-0'}`}>
                            {isCodeMode ? <Icons.Terminal className="w-6 h-6" /> : <Icons.Book className="w-6 h-6" />}
                        </div>
                        <div className="flex flex-col items-start">
                            <h1 className="text-xl font-bold tracking-tight">
                                Hemi<span className="font-light">Typing</span>
                            </h1>
                            <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
                                {isCodeMode ? 'Developer Mode' : 'Prose Mode'}
                            </span>
                        </div>
                    </button>

                    {/* Controls */}
                    <div className="flex gap-1 bg-white/10 dark:bg-black/20 p-1.5 rounded-2xl backdrop-blur-md border border-neutral-200/20 dark:border-white/10">
                        <button onClick={() => setShowStats(true)} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Statistics">
                            <Icons.Stats className="w-5 h-5" />
                        </button>
                        <button onClick={() => {const z = !isZenMode; setIsZenMode(z); saveSettings({isZenMode: z});}} className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${isZenMode ? 'text-blue-500' : 'text-neutral-500 hover:text-blue-500'}`} title="Zen Mode">
                            {isZenMode ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" title="Toggle Theme">
                            {isDarkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Sub-modes & Durations */}
                <div className={`transition-all duration-700 transform ${isFinished ? '-translate-y-4' : 'translate-y-0'}`}>
                    
                    <div className={`flex flex-wrap justify-between items-center mb-6 gap-4 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex gap-1">
                            {(isCodeMode ? ['javascript', 'python', 'terminal'] : ['prose']).map(m => (
                                <button 
                                    key={m}
                                    onClick={() => {setMode(m); generateText(m);}}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${mode === m ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1">
                            {[15, 30, 60].map(d => (
                                <button 
                                    key={d}
                                    onClick={() => {setDuration(d); setTimeLeft(d); resetState();}}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${duration === d ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'}`}
                                >
                                    <Icons.Clock className="w-3.5 h-3.5" /> {d}s
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Glass Typing Container */}
                    <div 
                        ref={typingContainerRef}
                        className={`relative glass-panel rounded-3xl p-8 md:p-12 mb-8 ${isActive ? 'typing-active' : ''} ${errorShake ? 'error-glow' : ''}`}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Live Stats Header */}
                        <div className={`flex justify-between items-end mb-8 font-mono transition-opacity duration-300 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="flex gap-10">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">WPM</div>
                                    <div className="text-4xl font-light text-blue-500">{isActive ? Math.round((userInput.length / 5) / ((Date.now() - startTime) / 60000)) || 0 : wpm}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Accuracy</div>
                                    <div className="text-4xl font-light">{accuracy}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1">Time</div>
                                <div className={`text-4xl font-light ${timeLeft <= 10 && isActive ? 'text-red-500' : ''}`}>{timeLeft}s</div>
                            </div>
                        </div>

                        {/* Text Display */}
                        <div className={`relative ${isCodeMode ? 'font-mono' : 'font-sans'} text-2xl md:text-3xl leading-relaxed tracking-wide h-48 overflow-hidden break-words pointer-events-none select-none`}>
                            {renderCharacters()}
                        </div>

                        {/* Hidden Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={handleInput}
                            disabled={isFinished}
                            className="absolute opacity-0 -z-10"
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>

                    {/* Footer Controls */}
                    <div className={`flex justify-between items-center transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="text-xs text-neutral-400 font-mono flex items-center gap-2">
                            <Icons.Keyboard className="w-4 h-4" /> Start typing to begin
                        </div>
                        <button 
                            onClick={resetState}
                            className={`p-4 rounded-full bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all duration-300 shadow-sm border border-neutral-200 dark:border-neutral-700 ${isActive ? 'rotate-180' : ''}`}
                            title="Restart (Tab + Enter)"
                        >
                            <Icons.RotateCcw className="w-5 h-5" />
                        </button>
                        <div className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">Premium Edition</div>
                    </div>
                </div>

                {/* Results View */}
                {isFinished && (
                    <div className="mt-8 animate-float">
                        <div className="glass-panel p-8 rounded-3xl text-center">
                            <h2 className="text-2xl font-light mb-8">Session Complete</h2>
                            <div className="flex justify-center">
                                <WpmChart history={wpmHistory} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} />
        </div>
    );
}
