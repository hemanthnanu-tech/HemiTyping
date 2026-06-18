import React, { useEffect, useRef } from 'react';

export const Confetti = () => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        let particles = [];
        for(let i=0; i<100; i++) {
            particles.push({
                x: canvas.width/2,
                y: canvas.height/2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                size: Math.random() * 5 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`,
                life: 100
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles = particles.filter(p => p.life > 0);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // gravity
                p.life--;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
                ctx.fill();
            });
            if(particles.length > 0) requestAnimationFrame(render);
        };
        render();
    }, []);
    
    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};
