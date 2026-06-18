import React from 'react';

export const WpmChart = ({ history }) => {
    if (!history || history.length < 2) return null;
    const maxWpm = Math.max(...history, 60);
    const minWpm = Math.min(...history, 0);
    const height = 120;
    const width = 300;
    
    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((val - minWpm) / (maxWpm - minWpm || 1)) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full max-w-sm h-[140px] flex items-end justify-center mb-6 relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                </defs>
                <path d={`M0,${height} ${points} V${height} Z`} fill="url(#chartGradient)" />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-0 right-0 text-[10px] text-blue-500 font-mono bg-blue-500/10 px-1 rounded">
                Peak: {Math.max(...history)}
            </div>
        </div>
    );
};
