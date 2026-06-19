import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { Confetti } from './components/Confetti';
import { WpmChart } from './components/WpmChart';
import { StatsModal, OnboardingModal, AboutModal } from './components/Modals';
import { DATA_SETS } from './data/constants';
import { playSound } from './utils/audio';

export default function App() {
    const [username, setUsername] = useState("");
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [difficulty, setDifficulty] = useState('middle');
    
    const [text, setText] = useState("");
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [missedChars, setMissedChars] = useState({});
    
    // Raw Accuracy Tracking
    const [totalKeystrokes, setTotalKeystrokes] = useState(0);
    const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
    
    // High-level mode: 'prose' or 'code'
    const [isCodeMode, setIsCodeMode] = useState(false);
    const [mode, setMode] = useState("prose");
    
    const [duration, setDuration] = useState(30);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [finishState, setFinishState] = useState('none'); // 'success' or 'timeout'
    const [wpmHistory, setWpmHistory] = useState([]);
    
    // UI State
    const [showStats, setShowStats] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [soundProfile, setSoundProfile] = useState('mechanical'); // 'mechanical' or 'thock'
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [errorShake, setErrorShake] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Persistent Stats
    const [stats, setStats] = useState({ totalRuns: 0, avgWpm: 0, bestWpm: 0, totalChars: 0, history: [] });

    const inputRef = useRef(null);
    const timerRef = useRef(null);
    const textContainerRef = useRef(null);

    // Ghost Caret State
    const [ghostIndex, setGhostIndex] = useState(0);

    // Init and load settings
    useEffect(() => {
        const savedName = localStorage.getItem('hemiName');
        if (savedName) {
            setUsername(savedName);
        } else {
            setShowOnboarding(true);
        }

        const savedStats = localStorage.getItem('hemiStats_v4');
        if (savedStats) setStats(JSON.parse(savedStats));
        
        const savedSettings = localStorage.getItem('hemiSettings_v4');
        let initialDiff = 'middle';
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            if (settings.soundEnabled !== undefined) setSoundEnabled(settings.soundEnabled);
            if (settings.soundProfile !== undefined) setSoundProfile(settings.soundProfile);
            if (settings.isDarkMode !== undefined) setIsDarkMode(settings.isDarkMode);
            if (settings.difficulty !== undefined) initialDiff = settings.difficulty;
        }
        
        setDifficulty(initialDiff);

        // Generate initial text
        generateText(isCodeMode ? 'javascript' : 'prose', savedName || "", initialDiff);
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

    // Global Keydown for Auto-Focus
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            // Do not steal focus if user is typing in a modal input
            if (e.target.tagName === 'INPUT' && e.target !== inputRef.current) return;
            // Do not steal focus if modals are open or test is finished
            if (showOnboarding || showAbout || showStats || isFinished) return;
            
            if (inputRef.current && document.activeElement !== inputRef.current) {
                inputRef.current.focus();
            }
        };
        
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [showOnboarding, showAbout, showStats, isFinished]);

    const handleOnboardingComplete = (name) => {
        setUsername(name);
        localStorage.setItem('hemiName', name);
        setShowOnboarding(false);
        generateText(mode, name, difficulty);
    };

    const handleUpdateName = (name) => {
        setUsername(name);
        localStorage.setItem('hemiName', name);
    };

    const handleSetDifficulty = (level) => {
        setDifficulty(level);
        saveSettings({ difficulty: level });
        generateText(mode, username, level);
    };

    const saveStats = (newStats) => {
        setStats(newStats);
        localStorage.setItem('hemiStats_v4', JSON.stringify(newStats));
    };

    const saveSettings = (updates) => {
        const current = { soundEnabled, soundProfile, isDarkMode, difficulty, ...updates };
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

    const generateText = (currentMode, currentName = username, currentDiff = difficulty) => {
        const dataSet = DATA_SETS[currentMode] || DATA_SETS.prose;
        const diffData = dataSet[currentDiff] || dataSet.middle;
        const sentenceTemplate = diffData[Math.floor(Math.random() * diffData.length)];
        
        // Personalize and limit to ~15-20 words
        const sentence = sentenceTemplate.replace(/\[Name\]/g, currentName || 'Developer');
        const words = sentence.split(' ').slice(0, 20).join(' ');
        
        setText(words);
        resetState();
    };

    const resetState = (newDuration) => {
        setUserInput("");
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(100);
        setTotalKeystrokes(0);
        setCorrectKeystrokes(0);
        setMissedChars({});
        setTimeLeft(newDuration || duration);
        setIsActive(false);
        setIsFinished(false);
        setFinishState('none');
        setWpmHistory([]);
        setShowConfetti(false);
        setGhostIndex(0);
        clearInterval(timerRef.current);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInput = (e) => {
        if (isFinished) return;
        
        const value = e.target.value;
        if (value.length > text.length) return;

        // Start Timer
        if (!isActive && value.length === 1) {
            setIsActive(true);
            setStartTime(Date.now());
            
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        endTest('timeout', value);
                        return 0;
                    }
                    return prev - 1;
                });
                
                const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000;
                if (timeElapsed > 0) {
                    const words = userInput.length / 5;
                    setWpmHistory(prev => [...prev, Math.round(words / timeElapsed)]);
                }

                const targetWpm = stats.avgWpm > 0 ? stats.avgWpm : 60;
                const charsPerSec = (targetWpm * 5) / 60;
                setGhostIndex(prev => Math.min(text.length, prev + charsPerSec));
                
            }, 1000);
        }

        // Logic for Accuracy & Sound
        let newTotalKeys = totalKeystrokes;
        let newCorrectKeys = correctKeystrokes;

        if (value.length > userInput.length) {
            newTotalKeys++;
            const newCharIndex = value.length - 1;
            const expectedChar = text[newCharIndex];
            const typedChar = value[newCharIndex];
            
            if (typedChar === expectedChar) {
                newCorrectKeys++;
                if (soundEnabled) playSound('click', soundProfile);
            } else {
                setErrorShake(true);
                if (soundEnabled) playSound('error');
                setTimeout(() => setErrorShake(false), 300);
                
                setMissedChars(prev => ({
                    ...prev,
                    [expectedChar]: (prev[expectedChar] || 0) + 1
                }));
            }
        } else {
            // Backspace
            if (soundEnabled) playSound('click', soundProfile);
        }

        setTotalKeystrokes(newTotalKeys);
        setCorrectKeystrokes(newCorrectKeys);
        setUserInput(value);
        
        // Raw Accuracy
        setAccuracy(newTotalKeys > 0 ? Math.floor((newCorrectKeys / newTotalKeys) * 100) : 100);

        if (value.length === text.length) {
            endTest('success', value);
        }
    };

    const endTest = (state, finalInput) => {
        clearInterval(timerRef.current);
        setIsActive(false);
        setIsFinished(true);
        setFinishState(state);
        
        const finalTime = Date.now();
        setEndTime(finalTime);

        const timeElapsed = (finalTime - startTime) / 60000;
        
        // Calculate WPM based on correct characters typed in the final string
        let strictCorrectCount = 0;
        for(let i=0; i<finalInput.length; i++) {
            if (finalInput[i] === text[i]) strictCorrectCount++;
        }
        
        const words = strictCorrectCount / 5;
        const finalWpm = timeElapsed > 0 ? Math.round(words / timeElapsed) : 0;
        
        setWpm(finalWpm);

        if (state === 'success') {
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

            setShowConfetti(true);
            if (soundEnabled) playSound('finish');
        } else {
            // Failure sound
            if (soundEnabled) playSound('error');
        }
    };

    // Calculate Caret Positions
    const [caretStyle, setCaretStyle] = useState({});
    const [ghostStyle, setGhostStyle] = useState({});

    useEffect(() => {
        if (!textContainerRef.current) return;
        const chars = textContainerRef.current.querySelectorAll('.char-element');
        
        if (userInput.length < chars.length) {
            const activeSpan = chars[userInput.length];
            if (activeSpan) {
                setCaretStyle({ left: activeSpan.offsetLeft, top: activeSpan.offsetTop, height: activeSpan.offsetHeight || 40 });
            }
        } else if (chars.length > 0) {
             const lastSpan = chars[chars.length - 1];
             setCaretStyle({ left: lastSpan.offsetLeft + lastSpan.offsetWidth, top: lastSpan.offsetTop, height: lastSpan.offsetHeight || 40 });
        }

        const ghostInt = Math.min(Math.floor(ghostIndex), chars.length - 1);
        if (ghostInt >= 0 && ghostInt < chars.length) {
            const ghostSpan = chars[ghostInt];
            if (ghostSpan) {
                setGhostStyle({ left: ghostSpan.offsetLeft, top: ghostSpan.offsetTop, height: ghostSpan.offsetHeight || 40 });
            }
        }
    }, [userInput, ghostIndex, text]);

    // Top Missed Keys
    const topMissed = Object.entries(missedChars)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const renderText = () => {
        const words = text.split(' ');
        let globalCharIndex = 0;

        return words.map((word, wIdx) => {
            const renderedWord = word.split('').map((char, cIdx) => {
                const idx = globalCharIndex++;
                let statusClass = 'char-untyped';
                
                if (idx < userInput.length) {
                    statusClass = userInput[idx] === text[idx] ? 'char-correct' : 'char-incorrect';
                }

                return (
                    <span key={idx} className={`char-element ${statusClass} transition-colors duration-150 relative`}>
                        {char}
                    </span>
                );
            });

            if (wIdx < words.length - 1) {
                const spaceIdx = globalCharIndex++;
                let spaceClass = 'char-untyped';
                if (spaceIdx < userInput.length) {
                    spaceClass = userInput[spaceIdx] === ' ' ? 'char-correct' : 'char-incorrect bg-red-500/20';
                }
                renderedWord.push(
                    <span key={spaceIdx} className={`char-element ${spaceClass} transition-colors duration-150 relative inline-block w-[0.3em]`}>
                        &nbsp;
                    </span>
                );
            }

            return <span key={wIdx} className="inline-block">{renderedWord}</span>;
        });
    };

    const currentWpm = isActive ? Math.round((userInput.length / 5) / ((Date.now() - startTime) / 60000)) || 0 : wpm;
    const isFullSpeed = isActive && currentWpm > 60;

    return (
        <div className={`h-screen overflow-hidden relative flex flex-col items-center justify-center p-4 selection:bg-blue-500/30 font-sans ${isCodeMode ? 'code-mode-aura' : ''}`}>
            <div className="bg-aura"></div>
            {showConfetti && <Confetti />}

            <div className="z-10 w-full max-w-6xl flex flex-col justify-center h-full pb-10">
                
                {/* Premium Minimal Header */}
                <header className={`flex justify-between items-center mb-6 md:mb-10 transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-black dark:bg-white text-white dark:text-black shadow-xl">
                            <Icons.Keyboard className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col items-start">
                            <h1 className="text-2xl font-black tracking-tighter">
                                Hemi<span className="font-light text-neutral-400">Typing</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-2 bg-white/5 dark:bg-black/20 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/20 dark:border-white/5">
                        <button onClick={toggleSoundProfile} className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-2">
                            {soundProfile === 'mechanical' ? 'Mech' : 'Thock'}
                        </button>
                        <div className="w-px bg-neutral-200/20 dark:bg-white/10 my-1"></div>
                        <button onClick={() => setShowStats(true)} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <Icons.Stats className="w-5 h-5" />
                        </button>
                        <button onClick={() => setShowAbout(true)} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <Icons.Info className="w-5 h-5" />
                        </button>
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            {isDarkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
                        </button>
                    </div>
                </header>

                {/* Sub-modes & Layout */}
                <div className={`transition-all duration-700 transform ${isFinished ? '-translate-y-4 opacity-0 pointer-events-none absolute' : 'translate-y-0'}`}>
                    
                    <div className={`flex flex-wrap gap-4 justify-between items-center mb-4 px-4 transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setIsCodeMode(false); setMode('prose'); generateText('prose'); }}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${!isCodeMode ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <Icons.Book className="w-4 h-4" /> Prose
                            </button>
                            <button 
                                onClick={() => { setIsCodeMode(true); setMode('javascript'); generateText('javascript'); }}
                                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${isCodeMode ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'text-neutral-500 hover:bg-black/5 dark:hover:bg-white/5'}`}
                            >
                                <Icons.Terminal className="w-4 h-4" /> Code
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            {/* Time Options */}
                            <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                                {[15, 30, 60].map(d => (
                                    <button 
                                        key={d}
                                        onClick={() => {setDuration(d); resetState(d);}}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${duration === d ? 'bg-white dark:bg-neutral-800 text-blue-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
                                    >
                                        {d}s
                                    </button>
                                ))}
                            </div>
                            
                            <div className="w-px h-6 bg-neutral-200/50 dark:bg-white/10"></div>
                            
                            {/* Small Reset Button */}
                            <button 
                                onClick={() => resetState()}
                                className={`p-2 rounded-xl text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors focus:outline-none ${isActive ? 'rotate-180' : ''}`}
                                title="Restart"
                            >
                                <Icons.RotateCcw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main Glass Typing Container */}
                    <div 
                        className={`relative glass-panel rounded-[2rem] p-6 md:p-10 mb-4 ${isActive ? 'typing-active' : ''} ${errorShake ? 'error-glow' : ''} ${isFullSpeed ? 'speed-glow' : ''}`}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Live Stats Header */}
                        <div className={`flex justify-between items-end mb-8 font-mono transition-all duration-300`}>
                            <div className="flex gap-12">
                                <div>
                                    <div className={`text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-blue-500/50' : 'text-neutral-400'} mb-2`}>Live WPM</div>
                                    <div className={`text-5xl font-black transition-colors ${isFullSpeed ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-lg' : 'text-blue-500'}`}>
                                        {currentWpm}
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-neutral-500/50' : 'text-neutral-400'} mb-2`}>Accuracy</div>
                                    <div className="text-5xl font-light text-neutral-800 dark:text-neutral-200">{accuracy}%</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-xs uppercase tracking-widest transition-colors ${isActive ? 'text-neutral-500/50' : 'text-neutral-400'} mb-2`}>Time Remaining</div>
                                <div className={`text-5xl font-light ${timeLeft <= 10 && isActive ? 'text-red-500 animate-pulse' : 'text-neutral-800 dark:text-neutral-200'}`}>{timeLeft}s</div>
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
                            disabled={isFinished || showOnboarding || showAbout || showStats}
                            className="absolute opacity-0 -z-10"
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                        />
                    </div>
                </div>

                {/* Results View */}
                {isFinished && (
                    <div className="animate-float w-full relative z-20">
                        {finishState === 'success' ? (
                            <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-blue-500/30 shadow-[0_0_80px_rgba(59,130,246,0.15)] dark:shadow-[0_0_80px_rgba(59,130,246,0.25)] relative overflow-hidden max-w-4xl mx-auto">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 pointer-events-none"></div>
                                
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                                            <Icons.Trophy className="w-8 h-8" />
                                        </div>
                                        <div className="text-center md:text-left">
                                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-800 dark:text-white">
                                                Mission Accomplished
                                            </h2>
                                            <p className="text-neutral-500 text-sm font-medium">Exceptional performance, {username}.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => generateText(mode, username, difficulty)}
                                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase transition-all shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 whitespace-nowrap"
                                    >
                                        Next Challenge
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
                                    <div className="p-5 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 text-center backdrop-blur-md shadow-sm">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1">Final WPM</div>
                                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{wpm}</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 text-center backdrop-blur-md shadow-sm">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1">Accuracy</div>
                                        <div className="text-4xl font-black text-neutral-800 dark:text-neutral-100">{accuracy}%</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 text-center backdrop-blur-md shadow-sm flex flex-col justify-center">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-2">Missed Characters</div>
                                        <div className="flex justify-center gap-2">
                                            {topMissed.length > 0 ? topMissed.map(([char, count], i) => (
                                                <div key={i} className="flex flex-col items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center font-mono text-sm font-bold border border-red-500/20">
                                                        {char === ' ' ? 'SPC' : char}
                                                    </div>
                                                    <div className="text-[10px] mt-1 text-neutral-500 font-bold">{count}x</div>
                                                </div>
                                            )) : (
                                                <div className="text-blue-500 text-sm font-black tracking-widest uppercase mt-1">Flawless</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {wpmHistory.length > 1 && (
                                    <div className="h-32 relative z-10 bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 backdrop-blur-md">
                                        <WpmChart history={wpmHistory} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="glass-panel p-10 md:p-16 rounded-[2.5rem] border-red-500/30 shadow-[0_0_100px_rgba(239,68,68,0.1)] dark:shadow-[0_0_100px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>
                                <div className="mx-auto w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8 relative z-10">
                                    <Icons.Clock className="w-12 h-12" />
                                </div>
                                <h2 className="text-6xl font-black mb-4 tracking-tighter text-red-500 relative z-10">
                                    Time Out
                                </h2>
                                <p className="text-neutral-500 dark:text-neutral-400 mb-12 text-xl font-medium relative z-10">
                                    You didn't complete the text before the clock ran out.
                                </p>
                                <button 
                                    onClick={() => resetState()}
                                    className="px-10 py-5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black tracking-[0.2em] uppercase transition-all duration-300 shadow-2xl shadow-red-500/40 hover:-translate-y-1 relative z-10"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            <StatsModal isOpen={showStats} onClose={() => setShowStats(false)} stats={stats} username={username} />
            <OnboardingModal isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
            <AboutModal 
                isOpen={showAbout} 
                onClose={() => setShowAbout(false)} 
                username={username}
                onUpdateName={handleUpdateName}
                difficulty={difficulty}
                setDifficulty={handleSetDifficulty}
            />
        </div>
    );
}
