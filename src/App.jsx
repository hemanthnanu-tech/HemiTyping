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
    
    // Additional Settings
    const [caretStyleType, setCaretStyleType] = useState('line');
    const [fontFamily, setFontFamily] = useState('sans');

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
            if (settings.caretStyleType !== undefined) setCaretStyleType(settings.caretStyleType);
            if (settings.fontFamily !== undefined) setFontFamily(settings.fontFamily);
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

    const cycleDifficulty = () => {
        const levels = ['beginner', 'middle', 'expert'];
        const nextIndex = (levels.indexOf(difficulty) + 1) % levels.length;
        handleSetDifficulty(levels[nextIndex]);
    };

    const cycleTime = () => {
        const times = [15, 30, 60];
        const nextIndex = (times.indexOf(duration) + 1) % times.length;
        const newD = times[nextIndex];
        setDuration(newD);
        resetState(newD);
    };

    const saveStats = (newStats) => {
        setStats(newStats);
        localStorage.setItem('hemiStats_v4', JSON.stringify(newStats));
    };

    const saveSettings = (updates) => {
        const current = { soundEnabled, soundProfile, isDarkMode, difficulty, caretStyleType, fontFamily, ...updates };
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
    const fontClass = fontFamily === 'mono' ? 'font-mono' : fontFamily === 'serif' ? 'font-serif' : 'font-sans';

    return (
        <div className={`h-screen overflow-hidden relative flex flex-col items-center p-4 md:p-8 selection:bg-blue-500/30 ${fontClass} ${isCodeMode ? 'code-mode-aura' : ''}`}>
            <div className="bg-aura"></div>
            {showConfetti && <Confetti />}

            <div className="z-10 w-full max-w-6xl flex-1 flex flex-col min-h-0 py-2 md:py-4">
                
                {/* Premium Minimal Header with Game Modes */}
                <header className={`w-full flex items-center justify-between gap-4 mb-4 md:mb-8 transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 transform -rotate-2 hidden sm:block">
                            <Icons.Keyboard className="w-5 h-5 rotate-2" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tighter text-neutral-800 dark:text-white">
                            Hemi<span className="font-light text-neutral-400">Typing</span>
                        </h1>
                    </div>

                    {/* Game Modes (Nav Bar) */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button 
                            onClick={() => { setIsCodeMode(false); setMode('prose'); generateText('prose'); }}
                            className={`bg-black/5 dark:bg-white/5 p-2 px-3 md:px-4 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none ${!isCodeMode ? 'text-blue-500' : 'text-neutral-500 hover:text-blue-500'}`}
                        >
                            Prose
                        </button>
                        
                        <button 
                            onClick={() => { setIsCodeMode(true); setMode('javascript'); generateText('javascript'); }}
                            className={`bg-black/5 dark:bg-white/5 p-2 px-3 md:px-4 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors focus:outline-none ${isCodeMode ? 'text-indigo-400' : 'text-neutral-500 hover:text-indigo-400'}`}
                        >
                            Code
                        </button>
                        
                        <button
                            onClick={cycleDifficulty}
                            className="bg-black/5 dark:bg-white/5 p-2 px-3 md:px-4 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-500 transition-colors focus:outline-none"
                            title="Click to change difficulty"
                        >
                            {difficulty}
                        </button>

                        <button 
                            onClick={cycleTime}
                            className="bg-black/5 dark:bg-white/5 p-2 px-3 md:px-4 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-blue-500 transition-colors focus:outline-none"
                        >
                            {duration}s
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <button onClick={toggleSoundProfile} className="bg-black/5 dark:bg-white/5 p-2 px-3 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] md:text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-blue-500 transition-colors">
                            {soundProfile === 'mechanical' ? 'Mech' : 'Thock'}
                        </button>
                        <button onClick={() => setShowStats(true)} className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-neutral-500 hover:text-blue-500 transition-colors">
                            <Icons.Stats className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button onClick={() => setShowAbout(true)} className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-neutral-500 hover:text-blue-500 transition-colors">
                            <Icons.Info className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button onClick={toggleTheme} className="bg-black/5 dark:bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-neutral-500 hover:text-blue-500 transition-colors">
                            {isDarkMode ? <Icons.Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Icons.Moon className="w-4 h-4 md:w-5 md:h-5" />}
                        </button>
                        <button 
                            onClick={() => generateText(mode, username, difficulty)}
                            className={`bg-white/50 dark:bg-white/10 p-2 rounded-2xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-neutral-500 hover:text-blue-500 transition-all focus:outline-none ${isActive ? 'rotate-180' : ''}`}
                            title="Regenerate & Restart"
                        >
                            <Icons.RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </header>

                {/* Mobile Game Modes (shown only on smaller screens) */}
                <div className={`lg:hidden flex flex-wrap justify-center items-center gap-2 mb-6 transition-opacity duration-500 ${isActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <button 
                        onClick={() => { setIsCodeMode(false); setMode('prose'); generateText('prose'); }}
                        className={`bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${!isCodeMode ? 'text-blue-500' : 'text-neutral-500 hover:text-blue-500'}`}
                    >
                        Prose
                    </button>
                    <button 
                        onClick={() => { setIsCodeMode(true); setMode('javascript'); generateText('javascript'); }}
                        className={`bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] font-bold uppercase tracking-[0.1em] transition-all ${isCodeMode ? 'text-indigo-400' : 'text-neutral-500 hover:text-indigo-400'}`}
                    >
                        Code
                    </button>
                    
                    <button
                        onClick={cycleDifficulty}
                        className={`bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] font-bold uppercase tracking-[0.1em] transition-all text-neutral-500 hover:text-blue-500 active:scale-95`}
                    >
                        {difficulty}
                    </button>

                    <button 
                        onClick={cycleTime}
                        className={`bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl backdrop-blur-xl border border-neutral-200/50 dark:border-white/5 shadow-sm text-[10px] font-bold uppercase tracking-[0.1em] transition-all text-neutral-500 hover:text-blue-500 active:scale-95`}
                    >
                        {duration}s
                    </button>
                </div>

                {/* Typing Area Layout */}
                <div className={`transition-all flex-1 flex flex-col min-h-0 justify-center duration-700 transform w-full max-w-5xl mx-auto ${isFinished ? '-translate-y-4 opacity-0 pointer-events-none absolute' : 'translate-y-0'}`}>
                    
                    {/* Main Glass Typing Container */}
                    <div 
                        className={`relative glass-panel rounded-[2rem] p-6 md:p-10 shadow-2xl dark:shadow-[0_20px_80px_-20px_rgba(0,0,0,0.5)] border border-white/20 dark:border-white/10 flex flex-col flex-1 min-h-0 w-full ${isActive ? 'typing-active' : ''} ${errorShake ? 'error-glow' : ''} ${isFullSpeed ? 'speed-glow' : ''}`}
                        onClick={() => inputRef.current?.focus()}
                    >
                        {/* Live Stats Header */}
                        <div className={`flex justify-between items-start font-mono transition-all duration-300 z-10 ${isActive ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="flex gap-8 md:gap-16">
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Live Speed</div>
                                    <div className={`text-4xl font-black transition-colors ${isFullSpeed ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500' : 'text-blue-500'}`}>
                                        {currentWpm} <span className="text-sm font-bold text-blue-500/50">WPM</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Accuracy</div>
                                    <div className="text-4xl font-light text-neutral-800 dark:text-neutral-200">{accuracy}<span className="text-sm font-bold text-neutral-500/50">%</span></div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Timer</div>
                                <div className={`text-4xl font-light ${timeLeft <= 10 && isActive ? 'text-red-500 animate-pulse' : 'text-neutral-800 dark:text-neutral-200'}`}>{timeLeft}<span className="text-sm font-bold text-neutral-500/50">s</span></div>
                            </div>
                        </div>

                        {/* BIG BOLD Text Display */}
                        <div className="relative flex-1 flex flex-col justify-center w-full">
                            <div 
                                ref={textContainerRef}
                                className={`${isCodeMode || fontFamily === 'mono' ? 'font-mono tracking-normal' : ''} text-2xl md:text-3xl lg:text-4xl leading-[1.6] font-black break-words pointer-events-none select-none`}
                            >
                                {renderText()}
                            </div>
                            
                            {/* Smooth Caret */}
                            {!isFinished && (
                                <div className={`smooth-caret ${caretStyleType}`} style={caretStyle}></div>
                            )}

                            {/* Ghost Caret */}
                            {!isFinished && isActive && (
                                <div className={`ghost-caret ${caretStyleType}`} style={ghostStyle}></div>
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
                caretStyleType={caretStyleType}
                setCaretStyleType={(val) => { setCaretStyleType(val); saveSettings({ caretStyleType: val }); }}
                fontFamily={fontFamily}
                setFontFamily={(val) => { setFontFamily(val); saveSettings({ fontFamily: val }); }}
            />
        </div>
    );
}
