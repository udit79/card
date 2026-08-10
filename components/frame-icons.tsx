import React from "react";

export function ClassicIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
      <circle cx="20" cy="20" r="16" />
    </svg>
  );
}

export function OrbitIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
      <ellipse cx="20" cy="20" rx="18" ry="6" stroke="currentColor" strokeWidth="1.5" transform="rotate(-15 20 20)" />
      <ellipse cx="20" cy="20" rx="6" ry="18" stroke="currentColor" strokeWidth="1.5" transform="rotate(15 20 20)" />
      <circle cx="34" cy="14" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function SunburstIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="20" r="10" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * Math.PI) / 6;
        const inner = 13;
        const outer = i % 2 === 0 ? 19 : 16;
        const x1 = 20 + Math.cos(angle) * inner;
        const y1 = 20 + Math.sin(angle) * inner;
        const x2 = 20 + Math.cos(angle) * outer;
        const y2 = 20 + Math.sin(angle) * outer;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2" strokeLinecap="round" />;
      })}
    </svg>
  );
}
