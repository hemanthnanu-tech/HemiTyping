import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { Confetti } from './components/Confetti';
import { WpmChart } from './components/WpmChart';
import { StatsModal } from './components/Modals';
import { DATA_SETS } from './data/constants';
import { playSound } from './utils/audio';

export default function App() {
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [missedChars, setMissedChars] = useState({});
    
    // High-level mode: 'prose' or 'code'
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [mode, setMode] = useState("prose");
    
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [wpmHistory, setWpmHistory] = useState([]);
    
    // UI State
    const [showStats, setShowStats] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [soundProfile, setSoundProfile] = useState('mechanical'); // 'mechanical' or 'thock'
    const [isZenMode, setIsZenMode] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [errorShake, setErrorShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [iconAnim, setIconAnim] = useState(false);

    // Persistent Stats
    const [stats, setStats] = useState({ totalRuns: 0, avgWpm: 0, bestWpm: 0, totalChars: 0, history: [] });

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const textContainerRef = useRef(null);

    // Ghost Caret State
    const [ghostIndex, setGhostIndex] = useState(0);

    // Init and load settings
    useEffect(() => {
        const savedStats = localStorage.getItem('hemiStats_v4');
        if (savedStats) setStats(JSON.parse(savedStats));
        
        const savedSettings = localStorage.getItem('hemiSettings_v4');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
            if (settings.soundProfile !== undefined) setSoundProfile(settings.soundProfile);
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
        localStorage.setItem('hemiStats_v4', JSON.stringify(newStats));
    };

    const saveSettings = (updates) => {
        const current = { soundEnabled, soundProfile, isZenMode, isDarkMode, ...updates };
        localStorage.setItem('hemiSettings_v4', JSON.stringify(current));
    };

    const toggleTheme = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        saveSettings({ isDarkMode: next });
    };

    const toggleSoundProfile = () => {
        const next = soundProfile === 'mechanical' ? 'thock' : 'mechanical';
        setSoundProfile(next);
        saveSettings({ soundProfile: next });
        if (soundEnabled) playSound('click', next);
    };

    const toggleMode = () => {
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
        // Limit to approx 15-20 words so it easily fits in 2 lines
        const sentence = data[Math.floor(Math.random() * data.length)];
        const words = sentence.split(' ').slice(0, 20).join(' ');
        setText(words);
        resetState();
    };

    const resetState = () => {
        setUserInput("");
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setMissedChars({});
        setTimeLeft(duration);
        setIsActive(false);
        setIsFinished(false);
        setWpmHistory([]);
        setShowConfetti(false);
        setGhostIndex(0);
        clearInterval(timerRef.current);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInput = (e) => {
        if (isFinished) return;
        
        const value = e.target.value;
        // Prevent typing beyond text length
        if (value.length > text.length) return;

        if (!isActive && value.length === 1) {
            setIsActive(true);
            setStartTime(Date.now());
            
            // Start main timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endTest(value);
                        return 0;
                    }
                    return prev - 1;
                });
                
                // Track history
                const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000;
                if (timeElapsed > 0) {
                    const words = userInput.length / 5;
                    setWpmHistory(prev => [...prev, Math.round(words / timeElapsed)]);
                }

                // Move ghost caret based on avgWpm or default 60
                const targetWpm = stats.avgWpm > 0 ? stats.avgWpm : 60;
                const charsPerSec = (targetWpm * 5) / 60;
                setGhostIndex(prev => Math.min(text.length, prev + charsPerSec));
                
            }, 1000);
        }

        // Check the newly typed character
        if (value.length > userInput.length) {
            const newCharIndex = value.length - 1;
            const expectedChar = text[newCharIndex];
            const typedChar = value[newCharIndex];
            
            if (typedChar === expectedChar) {
                if (soundEnabled) playSound('click', soundProfile);
            } else {
                setErrorShake(true);
                if (soundEnabled) playSound('error');
                setTimeout(() => setErrorShake(false), 300);
                
                // Track missed character
                setMissedChars(prev => ({
                    ...prev,
                    [expectedChar]: (prev[expectedChar] || 0) + 1
                }));
            }
        } else {
            // Backspace
            if (soundEnabled) playSound('click', soundProfile);
        }

        setUserInput(value);
        
        // Calculate Accuracy
        let correctCount = 0;
        for(let i=0; i<value.length; i++) {
            if (value[i] === text[i]) correctCount++;
        }
        setAccuracy(value.length > 0 ? Math.floor((correctCount / value.length) * 100) : 100);

        if (value.length === text.length) {
            endTest(value);
        }
    };

    const endTest = (finalInput = userInput) => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(true);
        const finalTime = Date.now();
        setEndTime(finalTime);

        const timeElapsed = (finalTime - startTime) / 60000;
        let correctCount = 0;
        for(let i=0; i<finalInput.length; i++) {
            if (finalInput[i] === text[i]) correctCount++;
        }
        
        const words = correctCount / 5;
        const finalWpm = timeElapsed > 0 ? Math.round(words / timeElapsed) : 0;
        
        setWpm(finalWpm);

        const newRuns = stats.totalRuns + 1;
        const newAvg = Math.round(((stats.avgWpm * stats.totalRuns) + finalWpm) / newRuns);
        const newBest = Math.max(stats.bestWpm, finalWpm);
        
        saveStats({
            totalRuns: newRuns,
            avgWpm: newAvg,
            bestWpm: newBest,
            totalChars: stats.totalChars + finalInput.length,
            history: [...stats.history, { date: Date.now(), wpm: finalWpm, acc: accuracy, mode }].slice(-50)
        });

        if (finalWpm > stats.bestWpm && finalWpm > 0) {
            setShowConfetti(true);
            if (soundEnabled) playSound('finish');
        }
    };

    // Calculate Caret Positions
    const [caretStyle, setCaretStyle] = useState({});
    const [ghostStyle, setGhostStyle] = useState({});

    useEffect(() => {
        if (!textContainerRef.current) return;
        const spans = textContainerRef.current.children;
        
        // Main Caret
        if (userInput.length < spans.length) {
            const activeSpan = spans[userInput.length];
            if (activeSpan) {
                setCaretStyle({
                    left: activeSpan.offsetLeft,
                    top: activeSpan.offsetTop,
                    height: activeSpan.offsetHeight
                });
            }
        }

        // Ghost Caret
        const ghostInt = Math.min(Math.floor(ghostIndex), spans.length - 1);
        if (ghostInt >= 0 && ghostInt < spans.length) {
            const ghostSpan = spans[ghostInt];
            if (ghostSpan) {
                setGhostStyle({
                    left: ghostSpan.offsetLeft,
                    top: ghostSpan.offsetTop,
                    height: ghostSpan.offsetHeight
                });
            }
        }
    }, [userInput, ghostIndex, text]);

    // Top Missed Keys
    const topMissed = Object.entries(missedChars)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    // Render text with Zen Mode logic
    const currentWordIndex = text.slice(0, userInput.length).split(' ').length - 1;

    const renderText = () => {
        const words = text.split(' ');
        let globalCharIndex = 0;

        return words.map((word, wIdx) => {
            const isCurrentWord = wIdx === currentWordIndex;
            const zenClass = (isZenMode && !isCurrentWord && isActive) ? 'word-unfocused' : '';
            
            const renderedWord = word.split('').map((char, cIdx) => {
                const idx = globalCharIndex++;
                let statusClass = 'char-untyped';
                
                if (idx < userInput.length) {
                    statusClass = userInput[idx] === text[idx] ? 'char-correct' : 'char-incorrect';
                }

                return (
                    <span key={idx} className={`${statusClass} transition-colors duration-150 relative`}>
                        {/* Display the correct char, but if they typed wrong, we could show what they typed above, 
                            but keeping it clean: red text means mistake. */}
                        {char}
                    </span>
                );
            });

            // Add space
            if (wIdx < words.length - 1) {
                const spaceIdx = globalCharIndex++;
                let spaceClass = 'char-untyped';
                if (spaceIdx < userInput.length) {
                    spaceClass = userInput[spaceIdx] === ' ' ? 'char-correct' : 'char-incorrect bg-red-500/20';
                }
                renderedWord.push(
                    <span key={spaceIdx} className={`${spaceClass} transition-colors duration-150 relative inline-block w-[0.3em]`}>
                        &nbsp;
                    </span>
                );
            }

            return <span key={wIdx} className={`inline-block ${zenClass}`}>{renderedWord}</span>;
        });
    };

    return (
        <div className={`h-screen overflow-hidden relative flex flex-col items-center justify-center p-4 selection:bg-blue-500/30 font-sans ${isZenMode && isActive ? 'zen-active' : ''}`}>
            <div className="bg-aura"></div>
            {showConfetti && <Confetti />}

            <div className="z-10 w-full max-w-6xl flex flex-col justify-center h-full pb-10">
                
                {/* Premium Minimal Header */}
                <header className={`flex justify-between items-center mb-6 md:mb-10 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                    
                    <button onClick={toggleMode} className="group flex items-center gap-4 hover:opacity-80 transition-opacity focus:outline-none">
                        <div className={`p-3 rounded-2xl shadow-xl transition-all duration-500 ${isCodeMode ? 'bg-indigo-600 text-white shadow-indigo-500/30' : 'bg-neutral-900 text-white shadow-black/20 dark:bg-white dark:text-neutral-900'} ${iconAnim ? 'scale-75 rotate-[360deg]' : 'scale-100 rotate-0'}`}>
                            {isCodeMode ? <Icons.Terminal className="w-7 h-7" /> : <Icons.Book className="w-7 h-7" />}
                        </div>
                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl font-black tracking-tighter">
                                Hemi<span className="font-light text-neutral-400">Typing</span>
                            </h1>
                            <span className="text-[11px] uppercase tracking-[0.2em] text-blue-500 font-bold mt-0.5">
                                {isCodeMode ? 'Code Evolution' : 'Prose Evolution'}
                            </span>
                        </div>
                    </button>

                    <div className="flex gap-2 bg-white/5 dark:bg-black/20 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/20 dark:border-white/5">
                        <button onClick={toggleSoundProfile} className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                            {soundProfile === 'mechanical' ? 'Mech' : 'Thock'}
                        </button>
                        <div className="w-px bg-neutral-200/20 dark:bg-white/10 my-1"></div>
                        <button onClick={() => setShowStats(true)} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <Icons.Stats className="w-5 h-5" />
                        </button>
                        <button onClick={() => {const z = !isZenMode; setIsZenMode(z); saveSettings({isZenMode: z});}} className={`p-2.5 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/10 ${isZenMode ? 'text-blue-500' : 'text-neutral-500 hover:text-blue-500'}`}>
                            {isZenMode ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            {isDarkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Sub-modes */}
                <div className={`transition-all duration-700 transform ${isFinished ? '-translate-y-4 opacity-0 pointer-events-none absolute' : 'translate-y-0'}`}>
                    
                    <div className={`flex justify-between items-center mb-4 px-4 transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="flex gap-2">
                            {(isCodeMode ? ['javascript'] : ['prose']).map(m => (
                                <div key={m} className="px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500">
                                    {m} Format
                                </div>
                            ))}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                            Avg Pace: <span className="text-blue-500">{stats.avgWpm} WPM</span>
                        </div>
                    </div>

                    {/* Main Glass Typing Container */}
                    <div 
                        className={`relative glass-panel rounded-[2rem] p-6 md:p-10 mb-4 ${isActive ? 'typing-active' : ''} ${errorShake ? 'error-glow' : ''}`}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Live Stats Header */}
                        <div className={`flex justify-between items-end mb-8 font-mono transition-opacity duration-300 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                            <div className="flex gap-12">
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Live WPM</div>
                                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">
                                        {isActive ? Math.round((userInput.length / 5) / ((Date.now() - startTime) / 60000)) || 0 : wpm}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Accuracy</div>
                                    <div className="text-5xl font-light">{accuracy}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Time Remaining</div>
                                <div className={`text-5xl font-light ${timeLeft <= 10 && isActive ? 'text-red-500' : ''}`}>{timeLeft}s</div>
                            </div>
                        </div>

                        {/* BIG BOLD Text Display */}
                        <div className="relative">
                            <div 
                                ref={textContainerRef}
                                className={`relative ${isCodeMode ? 'font-mono tracking-normal' : 'font-sans tracking-tight'} text-3xl md:text-5xl leading-[1.4] font-black break-words pointer-events-none select-none`}
                            >
                                {renderText()}
                            </div>
                            
                            {/* Smooth Caret */}
                            {!isFinished && (
                                <div className="smooth-caret" style={caretStyle}></div>
                            )}

                            {/* Ghost Caret */}
                            {!isFinished && isActive && (
                                <div className="ghost-caret" style={ghostStyle}></div>
                            )}
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

                    <div className={`text-center transition-opacity duration-500 ${isActive && isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                        <button 
                            onClick={resetState}
                            className={`p-5 rounded-2xl bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:scale-105 transition-all duration-300 shadow-lg border border-neutral-200 dark:border-neutral-700 ${isActive ? 'rotate-180' : ''}`}
                            title="Restart"
                        >
                            <Icons.RotateCcw className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Results View */}
                {isFinished && (
                    <div className="animate-float w-full">
                        <div className="glass-panel p-6 md:p-10 rounded-[2rem]">
                            <h2 className="text-3xl font-black mb-6 text-center tracking-tight">Mission Accomplished</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 text-center">
                                    <div className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Final WPM</div>
                                    <div className="text-6xl font-black text-blue-500">{wpm}</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 text-center">
                                    <div className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Accuracy</div>
                                    <div className="text-6xl font-black">{accuracy}%</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 text-center">
                                    <div className="text-sm uppercase tracking-widest text-neutral-400 mb-4">Missed Characters</div>
                                    <div className="flex justify-center gap-3">
                                        {topMissed.length > 0 ? topMissed.map(([char, count], i) => (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-mono text-xl font-bold border border-red-500/20">
                                                    {char === ' ' ? 'SPC' : char}
                                                </div>
                                                <div className="text-xs mt-1 text-neutral-500">{count}x</div>
                                            </div>
                                        )) : (
                                            <div className="text-emerald-500 font-bold tracking-widest uppercase">Flawless</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="h-40 mb-6">
                                <WpmChart history={wpmHistory} />
                            </div>

                            <div className="text-center">
                                <button 
                                    onClick={() => generateText(mode)}
                                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase transition-all duration-300 shadow-xl shadow-blue-500/20"
                                >
                                    Next Challenge
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Animated Credits Footer */}
            <footer className="absolute bottom-4 w-full text-center z-10 transition-opacity duration-500 pointer-events-none">
                <div className="inline-block p-2 px-6 rounded-full glass-panel shadow-2xl">
                    <p className="text-xs font-bold tracking-[0.2em] uppercase text-neutral-500 dark:text-neutral-400">
                        Crafted by <span className="animate-gradient-text font-black text-sm">Hemanth Kumar K</span>
                    </p>
                </div>
            </footer>

            {/* Modals */}
            <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} />
        </div>
    );
}
