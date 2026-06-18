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
    const [mode, setMode] = useState("javascript");
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [streak, setStreak] = useState(0);
    const [wpmHistory, setWpmHistory] = useState([]);
    
    // UI State
    const [showStats, setShowStats] = useState(false);
    const [showDaily, setShowDaily] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isZenMode, setIsZenMode] = useState(false);
    const [errorShake, setErrorShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Persistent Stats
    const [stats, setStats] = useState({ totalRuns: 0, avgWpm: 0, bestWpm: 0, totalChars: 0, history: [] });

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const typingContainerRef = useRef(null);

    // Init and load stats
    useEffect(() => {
        const savedStats = localStorage.getItem('hemiStats_v2');
        if (savedStats) setStats(JSON.parse(savedStats));
        
        const savedSettings = localStorage.getItem('hemiSettings_v2');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
            if (settings.isZenMode !== undefined) setIsZenMode(settings.isZenMode);
        }

        generateText(mode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const saveStats = (newStats) => {
        setStats(newStats);
        localStorage.setItem('hemiStats_v2', JSON.stringify(newStats));
    };

    const toggleSound = () => {
        const newSound = !soundEnabled;
        setSoundEnabled(newSound);
        localStorage.setItem('hemiSettings_v2', JSON.stringify({ soundEnabled: newSound, isZenMode }));
    };

    const toggleZen = () => {
        const newZen = !isZenMode;
        setIsZenMode(newZen);
        localStorage.setItem('hemiSettings_v2', JSON.stringify({ soundEnabled, isZenMode: newZen }));
    };

    const generateText = (currentMode) => {
        const data = DATA_SETS[currentMode] || DATA_SETS.javascript;
        const randomSentences = Array.from({length: 5}, () => data[Math.floor(Math.random() * data.length)]).join(' ');
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
                
                // Real-time WPM calc
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
            setErrorShake(true);
            setStreak(0);
            if (soundEnabled) playSound(100, 'sawtooth', 0.1);
            setTimeout(() => setErrorShake(false), 400);
            
            // Calculate accuracy drop
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

        const timeElapsed = (finalTime - startTime) / 60000; // in minutes
        const words = userInput.length / 5;
        const finalWpm = Math.round(words / timeElapsed);
        
        setWpm(finalWpm || 0);

        // Update Global Stats
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
            if (soundEnabled) playSound(440, 'sine', 0.5); // Success chime
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        generateText(newMode);
    };

    const handleDurationChange = (newDuration) => {
        setDuration(newDuration);
        setTimeLeft(newDuration);
        resetState();
    };

    const renderCharacters = () => {
        return text.split('').map((char, index) => {
            let color = 'text-slate-500'; // Default gray
            let isCurrent = false;

            if (index < userInput.length) {
                color = 'text-cyan-400 font-semibold'; // Correctly typed
            } else if (index === userInput.length) {
                color = 'text-slate-300';
                isCurrent = true;
            }

            return (
                <span key={index} className={`${color} ${isCurrent ? 'caret' : ''} transition-colors duration-75`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 selection:bg-cyan-500/30 overflow-hidden font-sans text-slate-200">
            {showConfetti && <Confetti />}
            
            {/* Minimal Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow bg-cyan-600/10 z-0"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse-glow bg-emerald-600/10 z-0" style={{ animationDelay: '2s' }}></div>

            <div className="z-10 w-full max-w-5xl">
                
                {/* Header */}
                <header className={`flex justify-between items-center mb-12 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                            <Icons.Terminal className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight">HemiTyping <span className="text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded-full ml-2 border border-slate-700">DEV</span></h1>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => setShowDaily(true)} className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors" title="Daily Tasks">
                            <Icons.Calendar className="w-5 h-5" />
                        </button>
                        <button onClick={() => setShowStats(true)} className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors" title="Statistics">
                            <Icons.Stats className="w-5 h-5" />
                        </button>
                        <button onClick={toggleSound} className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors" title="Toggle Sound">
                            {soundEnabled ? <Icons.Volume2 className="w-5 h-5" /> : <Icons.VolumeX className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleZen} className={`p-2.5 rounded-lg hover:bg-slate-800 transition-colors ${isZenMode ? 'text-cyan-400' : 'text-slate-400'}`} title="Zen Mode">
                            {isZenMode ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Main Typing Area */}
                <div className={`transition-all duration-700 transform ${isFinished ? '-translate-y-4' : 'translate-y-0'}`}>
                    
                    {/* Controls */}
                    <div className={`flex flex-wrap justify-between items-center mb-6 gap-4 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="flex gap-2 p-1.5 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                            {['prose', 'javascript', 'python', 'terminal'].map(m => (
                                <button 
                                    key={m}
                                    onClick={() => handleModeChange(m)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${mode === m ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 p-1.5 bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700/50">
                            {[15, 30, 60].map(d => (
                                <button 
                                    key={d}
                                    onClick={() => handleDurationChange(d)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 ${duration === d ? 'text-cyan-400 bg-slate-700/50' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Icons.Clock className="w-4 h-4" /> {d}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Typing Container */}
                    <div 
                        ref={typingContainerRef}
                        className={`relative glass-panel rounded-3xl p-8 md:p-12 mb-8 ${isActive ? 'typing-active' : ''} ${errorShake ? 'animate-error-shake border-red-500/50' : ''}`}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Live Stats Header inside Glass */}
                        <div className="flex justify-between items-end mb-8 font-mono">
                            <div className="flex gap-8">
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">WPM</div>
                                    <div className="text-4xl font-bold text-cyan-400">{isActive ? Math.round((userInput.length / 5) / ((Date.now() - startTime) / 60000)) || 0 : wpm}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Accuracy</div>
                                    <div className="text-4xl font-bold text-slate-200">{accuracy}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Time</div>
                                <div className={`text-4xl font-bold ${timeLeft <= 10 && isActive ? 'text-red-400' : 'text-slate-200'}`}>{timeLeft}s</div>
                            </div>
                        </div>

                        {/* Text Display */}
                        <div className="relative font-mono text-2xl md:text-3xl leading-relaxed tracking-wide h-48 overflow-hidden break-words pointer-events-none select-none">
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

                    {/* Status/Restart Footer */}
                    <div className={`flex justify-between items-center transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="text-sm text-slate-500 font-mono flex items-center gap-2">
                            <Icons.Keyboard className="w-4 h-4" /> Start typing to begin
                        </div>
                        <button 
                            onClick={resetState}
                            className={`p-4 rounded-full bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 ${isActive ? 'rotate-180' : ''}`}
                            title="Restart (Tab + Enter)"
                        >
                            <Icons.RotateCcw className="w-6 h-6" />
                        </button>
                        <div className="text-xs text-slate-600 font-mono">v3.0.0</div>
                    </div>
                </div>

                {/* Results View */}
                {isFinished && (
                    <div className="mt-8 animate-float">
                        <div className="glass-panel p-8 rounded-3xl">
                            <h2 className="text-2xl font-bold mb-6 text-center text-gradient">Session Complete</h2>
                            <WpmChart data={wpmHistory} />
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} />
            <DailyModal isOpen={showDaily} onClose={() => setShowDaily(false)} onStart={() => {setShowDaily(false); resetState();}} dailyTask={{title: "Code 100 WPM", description: "Hit 100 WPM in Javascript mode", reward: "Hacker Badge"}} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
            
        </div>
    );
}
