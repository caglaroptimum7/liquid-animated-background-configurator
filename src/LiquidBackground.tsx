import { useRef, useEffect, useCallback } from 'react';
import type { Config } from './types';

interface Props {
  config: Config;
}

export default function LiquidBackground({ config }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });
  const hasMouseRef = useRef(false);
  const timeRef = useRef(0);
  const rafRef = useRef<number>(0);
  const configRef = useRef(config);

  configRef.current = config;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;
    canvas.width = 128;
    canvas.height = 128;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      hasMouseRef.current = true;
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
      targetMouseRef.current.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    };

    const handleMouseLeave = () => {
      hasMouseRef.current = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    function animate() {
      const c = configRef.current;
      const speed = c.speed * 0.002;
      timeRef.current += speed;
      const t = timeRef.current;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.globalCompositeOperation = c.blendMode as GlobalCompositeOperation;

      if (c.interactive) {
        mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.05;
        mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.05;
      }

      c.blobs.forEach((b) => {
        const movementX = Math.sin(t + b.t) * 0.5 + Math.sin(t * 0.5 + b.t * 2) * 0.5;
        const movementY = Math.cos(t + b.t) * 0.5 + Math.cos(t * 0.6 + b.t * 2) * 0.5;

        let x = canvas!.width / 2 + movementX * (canvas!.width * 0.3);
        let y = canvas!.height / 2 + movementY * (canvas!.height * 0.3);

        if (c.interactive && hasMouseRef.current) {
          const dx = mouseRef.current.x - x;
          const dy = mouseRef.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = canvas!.width * 0.6;

          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist;
            x += dx * force * 0.2;
            y += dy * force * 0.2;
          }
        }

        const radius = canvas!.width * c.blobRadius;

        const g = ctx!.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0, b.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');

        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(x, y, radius, 0, Math.PI * 2);
        ctx!.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const gradients = config.blobs
    .map((b, i) => {
      const positions = ['0% 0%', '100% 0%', '100% 100%', '0% 100%'];
      const pos = positions[i % positions.length];
      return `radial-gradient(circle at ${pos}, ${b.color}, transparent 80%)`;
    })
    .join(', ');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: config.backgroundColor,
        backgroundImage: gradients,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          filter: `blur(${config.blur}px)`,
          opacity: config.opacity,
          mixBlendMode: config.blendMode as React.CSSProperties['mixBlendMode'],
        }}
      />
    </div>
  );
}
