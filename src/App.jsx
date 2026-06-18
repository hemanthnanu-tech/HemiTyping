import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { Confetti } from './components/Confetti';
import { WpmChart } from './components/WpmChart';
import { StatsModal, DailyModal, AboutModal } from './components/Modals';
import { NORMAL_DATA, LOVE_DATA } from './data/constants';
import { playSound } from './utils/audio';

function App() {
    const [isLoveMode, setIsLoveMode] = useState(false);
    const [isZenMode, setIsZenMode] = useState(false);
    const [transitionState, setTransitionState] = useState('idle');
    const [transitionDirection, setTransitionDirection] = useState('toLove');
    const [mode, setMode] = useState('cruise');
    const [duration, setDuration] = useState(30);
    const [userInput, setUserInput] = useState("");
    const [text, setText] = useState("");
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [shake, setShake] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [lastTextIndex, setLastTextIndex] = useState(-1);
    const [wpmHistory, setWpmHistory] = useState([]);
    const [stats, setStats] = useState({ totalRuns: 0, avgWpm: 0, bestWpm: 0, totalChars: 0, history: [] });
    const [dailyTask, setDailyTask] = useState({ mode: 'cruise', targetWpm: 60, completed: false });
    
    const [showStats, setShowStats] = useState(false);
    const [showDaily, setShowDaily] = useState(false);
    const [showAbout, setShowAbout] = useState(false);

    const inputRef = useRef(null);

    // Init and load stats
    useEffect(() => {
        const savedStats = localStorage.getItem('hemiStats');
        if (savedStats) setStats(JSON.parse(savedStats));
        
        const savedSettings = localStorage.getItem('hemiSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
            if (settings.isZenMode !== undefined) setIsZenMode(settings.isZenMode);
        }

        generateText(mode);
    }, []);

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            finishTest();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Keep focus on input unless finished
    useEffect(() => {
        const handleKeyDown = () => {
            if (!isFinished && inputRef.current) {
                inputRef.current.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isFinished]);

    const generateText = (currentMode) => {
        const dataSource = isLoveMode ? LOVE_DATA : NORMAL_DATA;
        const dataArray = dataSource[currentMode] || dataSource['cruise'];
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * dataArray.length);
        } while (newIndex === lastTextIndex && dataArray.length > 1);
        setLastTextIndex(newIndex);
        setText(dataArray[newIndex]);
    };

    const handleInput = (e) => {
        if (!isActive && !isFinished && e.target.value.length > 0) {
            setIsActive(true);
        }
        
        const value = e.target.value;
        if (value.length > text.length) return;
        
        const isBackspace = value.length < userInput.length;
        
        if (!isBackspace && value.length > 0) {
            const lastCharIndex = value.length - 1;
            if (value[lastCharIndex] !== text[lastCharIndex]) {
                if (soundEnabled) playSound('error');
                setShake(true);
                setTimeout(() => setShake(false), 300);
                setStreak(0);
            } else {
                if (soundEnabled) playSound('click');
                setStreak(s => {
                    const newStreak = s + 1;
                    if (newStreak % 10 === 0 && soundEnabled) playSound('streak');
                    setMaxStreak(m => Math.max(m, newStreak));
                    return newStreak;
                });
            }
        }
        
        setUserInput(value);
        calculateMetrics(value);

        if (value.length === text.length) {
            finishTest(value);
        }
    };

    const calculateMetrics = (currentInput) => {
        let correctChars = 0;
        for (let i = 0; i < currentInput.length; i++) {
            if (currentInput[i] === text[i]) correctChars++;
        }
        
        const currentAccuracy = currentInput.length > 0 ? Math.round((correctChars / currentInput.length) * 100) : 100;
        setAccuracy(currentAccuracy);
        
        const timeElapsed = duration - timeLeft;
        if (timeElapsed > 0) {
            const currentWpm = Math.round((correctChars / 5) / (timeElapsed / 60));
            setWpm(currentWpm);
            if (timeElapsed % 2 === 0) {
                setWpmHistory(prev => [...prev, currentWpm].slice(-20));
            }
        }
    };

    const finishTest = (finalInput = userInput) => {
        setIsActive(false);
        setIsFinished(true);
        if (soundEnabled) playSound('finish');
        
        let correctChars = 0;
        for (let i = 0; i < finalInput.length; i++) {
            if (finalInput[i] === text[i]) correctChars++;
        }
        
        const timeElapsed = duration - timeLeft || 1;
        const finalWpm = Math.round((correctChars / 5) / (timeElapsed / 60));
        setWpm(finalWpm);
        
        const newStats = {
            totalRuns: stats.totalRuns + 1,
            avgWpm: Math.round(((stats.avgWpm * stats.totalRuns) + finalWpm) / (stats.totalRuns + 1)),
            bestWpm: Math.max(stats.bestWpm, finalWpm),
            totalChars: stats.totalChars + finalInput.length,
            history: [...stats.history, finalWpm].slice(-100)
        };
        setStats(newStats);
        localStorage.setItem('hemiStats', JSON.stringify(newStats));
        setHighScore(Math.max(highScore, finalWpm));

        if (!dailyTask.completed && mode === dailyTask.mode && finalWpm >= dailyTask.targetWpm) {
            setDailyTask({ ...dailyTask, completed: true });
        }
    };

    const restartTest = () => {
        setUserInput("");
        setTimeLeft(duration);
        setIsActive(false);
        setIsFinished(false);
        setWpm(0);
        setAccuracy(100);
        setStreak(0);
        setMaxStreak(0);
        setWpmHistory([]);
        generateText(mode);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        restartTest();
    };

    const handleDurationChange = (newDuration) => {
        setDuration(newDuration);
        restartTest();
    };

    const toggleTheme = () => {
        setTransitionDirection(isLoveMode ? 'toNormal' : 'toLove');
        setTransitionState('active');
        
        setTimeout(() => {
            setIsLoveMode(!isLoveMode);
            setMode(!isLoveMode ? 'flirty' : 'cruise'); 
            restartTest();
        }, 400);

        setTimeout(() => {
            setTransitionState('exit');
            setTimeout(() => {
                setTransitionState('idle');
            }, 800);
        }, 1200);
    };

    const toggleZenMode = () => {
        setIsZenMode(!isZenMode);
        localStorage.setItem('hemiSettings', JSON.stringify({ soundEnabled, isZenMode: !isZenMode }));
    };

    const toggleSound = () => {
        setSoundEnabled(!soundEnabled);
        localStorage.setItem('hemiSettings', JSON.stringify({ soundEnabled: !soundEnabled, isZenMode }));
    };

    const renderCharacters = () => {
        return text.split('').map((char, index) => {
            let colorClass = "text-white/40";
            let bgClass = "";
            let animClass = "";
            
            if (index < userInput.length) {
                if (char === userInput[index]) {
                    colorClass = isLoveMode ? "text-rose-400" : "text-cyan-400";
                } else {
                    colorClass = "text-red-500";
                    bgClass = "bg-red-500/20";
                }
            } else if (index === userInput.length && (isActive || !isFinished)) {
                colorClass = "text-white";
                animClass = "cursor-blink";
                bgClass = isLoveMode ? "border-b-2 border-rose-400" : "border-b-2 border-cyan-400";
            }

            return (
                <span key={index} className={`${colorClass} ${bgClass} ${animClass} transition-colors duration-100 font-mono text-2xl lg:text-3xl`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-1000 ${isLoveMode ? 'bg-[#1a0f14]' : 'bg-[#030712]'}`}>
            
            <div className={`absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none transition-opacity duration-1000`}>
                <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] animate-blob ${isLoveMode ? 'bg-rose-600/30' : 'bg-cyan-600/30'}`}></div>
                <div className={`absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] animate-blob animation-delay-2000 ${isLoveMode ? 'bg-purple-600/20' : 'bg-blue-600/20'}`}></div>
            </div>

            {(transitionState === 'active' || transitionState === 'exit') && (
                <div className={`curtain-overlay ${transitionDirection === 'toLove' ? 'love-transition' : 'normal-transition'} ${transitionState}`}>
                    <div className="curtain-layer layer-1"></div>
                    <div className="curtain-layer layer-2"></div>
                    <div className="curtain-layer layer-3">
                        {transitionDirection === 'toLove' ? 
                            <Icons.Heart className="w-16 h-16 text-rose-400 heart-pulse" /> : 
                            <Icons.Zap className="w-16 h-16 text-cyan-400 electric-pulse" />
                        }
                    </div>
                </div>
            )}

            <nav className={`w-full max-w-5xl px-6 py-4 flex justify-between items-center z-10 transition-opacity duration-500 ${isZenMode && isActive ? 'opacity-0' : 'opacity-100'}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isLoveMode ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {isLoveMode ? <Icons.Heart className="w-6 h-6" /> : <Icons.Zap className="w-6 h-6" />}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            HemiTyping 
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest ${isLoveMode ? 'bg-rose-500/20 text-rose-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                {isLoveMode ? 'LUST' : 'HYPER'}
                            </span>
                        </h1>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={() => setShowDaily(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Daily Task">
                        <Icons.Calendar className="w-5 h-5" />
                    </button>
                    <button onClick={() => setShowStats(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Stats">
                        <Icons.Stats className="w-5 h-5" />
                    </button>
                    <button onClick={toggleSound} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Toggle Sound">
                        {soundEnabled ? <Icons.Volume2 className="w-5 h-5" /> : <Icons.VolumeX className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleZenMode} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors" title="Toggle Zen Mode">
                        {isZenMode ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                    </button>
                    <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors ${isLoveMode ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'}`} title="Change Theme">
                        {isLoveMode ? <Icons.Heart className="w-5 h-5" /> : <Icons.Flame className="w-5 h-5" />}
                    </button>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-4xl px-6 flex flex-col justify-center relative z-10">
                <div className={`flex justify-between items-end mb-6 transition-opacity duration-500 ${isZenMode && isActive ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                        {Object.keys(isLoveMode ? LOVE_DATA : NORMAL_DATA).map(m => (
                            <button 
                                key={m}
                                onClick={() => handleModeChange(m)}
                                className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-all ${mode === m ? (isLoveMode ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30') : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                        {[15, 30, 60].map(t => (
                            <button 
                                key={t}
                                onClick={() => handleDurationChange(t)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-all ${duration === t ? (isLoveMode ? 'text-rose-400 bg-rose-500/20' : 'text-cyan-400 bg-cyan-500/20') : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                            >
                                <Icons.Clock className="w-3.5 h-3.5" /> {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`glass-panel p-8 md:p-12 transition-transform duration-300 ${shake ? 'shake-anim' : ''} ${isLoveMode ? 'love-border' : 'normal-border'}`}>
                    <div className="flex justify-between mb-8">
                        <div className="flex gap-6">
                            <div>
                                <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">WPM</div>
                                <div className={`text-4xl font-black font-mono transition-colors ${wpm > 80 ? (isLoveMode ? 'text-rose-400' : 'text-amber-400') : 'text-white'}`}>{wpm}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Accuracy</div>
                                <div className="text-4xl font-black font-mono text-white/90">{accuracy}%</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Time</div>
                            <div className={`text-4xl font-black font-mono ${timeLeft < 10 && isActive ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
                        </div>
                    </div>

                    <input 
                        ref={inputRef}
                        type="text" 
                        value={userInput}
                        onChange={handleInput}
                        disabled={isFinished}
                        className="absolute opacity-0 w-0 h-0"
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                    />

                    {!isFinished ? (
                        <div 
                            className="text-left leading-relaxed cursor-text select-none" 
                            onClick={() => inputRef.current && inputRef.current.focus()}
                        >
                            {renderCharacters()}
                        </div>
                    ) : (
                        <div className="animate-enter flex flex-col items-center py-4">
                            {wpm > highScore && highScore > 0 && (
                                <div className="mb-4 px-4 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-bold flex items-center gap-2 border border-amber-500/30 animate-pop">
                                    <Icons.Trophy className="w-4 h-4" /> New High Score!
                                </div>
                            )}
                            <WpmChart history={wpmHistory} />
                            
                            <div className="grid grid-cols-3 gap-6 w-full max-w-lg mt-6">
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Max Streak</div>
                                    <div className="text-2xl font-bold text-white">{maxStreak}</div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Raw WPM</div>
                                    <div className="text-2xl font-bold text-white">{Math.round((userInput.length / 5) / ((duration - timeLeft || 1) / 60))}</div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Characters</div>
                                    <div className="text-2xl font-bold text-white">{userInput.length}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`mt-8 flex justify-between items-center transition-opacity duration-500 ${isZenMode && isActive ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-xs text-white/40 flex items-center gap-2 font-mono">
                        <Icons.Keyboard className="w-4 h-4" /> Start typing to begin
                    </div>
                    
                    <button 
                        onClick={restartTest}
                        className={`group p-4 rounded-full shadow-lg transition-all active:scale-90 ${isLoveMode ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-600/30'}`}
                        title="Restart"
                    >
                        <Icons.RotateCcw className="w-5 h-5 text-white group-hover:-rotate-90 transition-transform duration-300" />
                    </button>
                    
                    <button onClick={() => setShowAbout(true)} className="text-xs text-white/40 hover:text-white/80 transition-colors font-mono">
                        v2.0.0
                    </button>
                </div>
            </main>

            {isFinished && <Confetti />}

            <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} />
            <DailyModal isOpen={showDaily} onClose={() => setShowDaily(false)} dailyTask={dailyTask} onStart={() => { setShowDaily(false); handleModeChange(dailyTask.mode); }} />
            <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
        </div>
    );
}

export default App;
