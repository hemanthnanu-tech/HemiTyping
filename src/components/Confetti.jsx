import React, { useEffect, useState } from 'react';

export const Confetti = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const colors = ['#22d3ee', '#10b981', '#0ea5e9']; // Cyan, Emerald, Sky Blue
        const newParticles = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // vw
            y: -10 - Math.random() * 20, // vh
            size: Math.random() * 4 + 2, // px
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 1.5 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.5
        }));
        
        setParticles(newParticles);

        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                y: p.y + p.speedY,
                x: p.x + p.speedX,
                opacity: p.y > 90 ? p.opacity - 0.05 : p.opacity
            })).filter(p => p.opacity > 0));
        }, 16); // ~60fps

        return () => clearInterval(interval);
    }, []);

    if (particles.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        left: `${p.x}vw`,
                        top: `${p.y}vh`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        opacity: p.opacity,
                        borderRadius: '50%',
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                    }}
                />
            ))}
        </div>
    );
};
