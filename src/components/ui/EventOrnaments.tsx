"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Baby,
  Briefcase,
  Cake,
  Flame,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Music,
  PartyPopper,
  Utensils,
} from "lucide-react";
import type { EventType } from "@/types/event";
import { motifUrl, themeFor } from "@/lib/eventThemes";
import { cn } from "@/lib/utils";

const ICONS = {
  Heart,
  Cake,
  Briefcase,
  Flame,
  Gem,
  Baby,
  PartyPopper,
  Gift,
  Music,
  Utensils,
  Home,
  GraduationCap,
} as const;

export function EventIcon({
  eventType,
  className = "h-5 w-5",
}: {
  eventType: EventType;
  className?: string;
}) {
  const Icon = ICONS[themeFor(eventType).icon];
  return <Icon className={className} aria-hidden />;
}

/**
 * The occasion's motif, tiled. Rendered through a CSS mask so one black SVG
 * picks up whatever the current accent is — one asset per occasion rather
 * than one per occasion × state.
 */
export function Motif({
  eventType,
  className = "",
  opacity = 0.08,
  size = 64,
}: {
  eventType: EventType;
  className?: string;
  opacity?: number;
  size?: number;
}) {
  const url = motifUrl(themeFor(eventType).motif);
  return (
    <div
      aria-hidden
      className={cn("motif absolute inset-0", className)}
      style={{
        opacity,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskSize: `${size}px`,
        maskSize: `${size}px`,
      }}
    />
  );
}

/**
 * Hero decoration: a drawn scene per occasion — balloons and a cake for a
 * birthday, hanging diyas and rangoli for Diwali, a marigold swag for a
 * wedding. Purely decorative, so it is aria-hidden, never sits under the
 * headline, and drops out below `sm` where it would.
 */
export function EventOrnaments({
  eventType,
  className,
}: {
  eventType: EventType;
  className?: string;
}) {
  const theme = themeFor(eventType);
  const a = theme.accent;
  const b = theme.secondary;
  const motif = theme.motifKey;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 hidden sm:block", className)}
    >
      <svg
        viewBox="0 0 600 180"
        preserveAspectRatio="xMaxYMid slice"
        className="h-full w-full"
        role="presentation"
      >
        {motif === "marigold" && (
          <g>
            {/* Marigold swag along the top. */}
            <path
              d="M330 6 Q 420 56 510 6 Q 555 30 600 4"
              fill="none"
              stroke={a}
              strokeOpacity="0.3"
              strokeWidth="2"
            />
            {Array.from({ length: 16 }, (_, i) => {
              const t = i / 15;
              const x = 330 + t * 270;
              const y = 6 + Math.sin(t * Math.PI * 2) * 22 + t * 2;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i % 3 === 0 ? 7 : 5}
                  fill={i % 2 ? b : a}
                  fillOpacity="0.32"
                />
              );
            })}
            {[410, 470, 530].map((x, i) => (
              <g key={x} className="eg-float" style={{ animationDelay: `${i * 0.7}s` }}>
                <path d={`M${x} 40 v${34 + i * 10}`} stroke={a} strokeOpacity="0.22" strokeWidth="1.2" />
                <circle cx={x} cy={78 + i * 10} r="6" fill={b} fillOpacity="0.3" />
                <circle cx={x} cy={78 + i * 10} r="2.5" fill={a} fillOpacity="0.3" />
              </g>
            ))}
          </g>
        )}

        {motif === "balloons" && (
          <g>
            {/* Three balloons with strings. */}
            {[
              { x: 400, y: 48, r: 22, c: a, d: 0 },
              { x: 462, y: 34, r: 17, c: b, d: 0.8 },
              { x: 518, y: 56, r: 20, c: a, d: 1.5 },
            ].map((bl, i) => (
              <g key={i} className="eg-float" style={{ animationDelay: `${bl.d}s` }}>
                <ellipse cx={bl.x} cy={bl.y} rx={bl.r} ry={bl.r * 1.22} fill={bl.c} fillOpacity="0.3" />
                <ellipse
                  cx={bl.x - bl.r * 0.3}
                  cy={bl.y - bl.r * 0.4}
                  rx={bl.r * 0.22}
                  ry={bl.r * 0.3}
                  fill="#fff"
                  fillOpacity="0.5"
                />
                <path
                  d={`M${bl.x} ${bl.y + bl.r * 1.22} q 7 18 -3 34 q -8 15 2 30`}
                  fill="none"
                  stroke={bl.c}
                  strokeOpacity="0.28"
                  strokeWidth="1.3"
                />
              </g>
            ))}
            {/* Cake with candles. */}
            <g transform="translate(556 96)">
              <rect x="-26" y="14" width="52" height="26" rx="4" fill={a} fillOpacity="0.28" />
              <rect x="-26" y="8" width="52" height="9" rx="4" fill={b} fillOpacity="0.34" />
              <rect x="-18" y="-6" width="3" height="14" rx="1.5" fill={a} fillOpacity="0.32" />
              <rect x="-1.5" y="-10" width="3" height="18" rx="1.5" fill={a} fillOpacity="0.32" />
              <rect x="15" y="-6" width="3" height="14" rx="1.5" fill={a} fillOpacity="0.32" />
              <circle cx="-16.5" cy="-9" r="3" fill={b} fillOpacity="0.45" />
              <circle cx="0" cy="-13" r="3" fill={b} fillOpacity="0.45" />
              <circle cx="16.5" cy="-9" r="3" fill={b} fillOpacity="0.45" />
            </g>
            {/* Confetti. */}
            {[
              [360, 110, -25], [432, 128, 40], [488, 112, -60], [540, 24, 18], [392, 20, 55],
            ].map(([x, y, rot], i) => (
              <rect
                key={i}
                x={x}
                y={y}
                width="10"
                height="4"
                rx="2"
                fill={i % 2 ? b : a}
                fillOpacity="0.3"
                transform={`rotate(${rot} ${x + 5} ${y + 2})`}
              />
            ))}
          </g>
        )}

        {motif === "chevrons" && (
          <g fill="none" strokeLinecap="round">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${380 + i * 20} 176 V ${96 - i * 14} A ${100 - i * 16} ${62 - i * 10} 0 0 1 ${580 - i * 20} ${96 - i * 14} V 176`}
                stroke={i % 2 ? b : a}
                strokeOpacity={0.26 - i * 0.04}
                strokeWidth={2.5 - i * 0.4}
              />
            ))}
            {[420, 470, 520].map((x, i) => (
              <rect
                key={x}
                x={x}
                y={140 - i * 18}
                width="18"
                height={36 + i * 18}
                rx="3"
                fill={a}
                fillOpacity="0.14"
                stroke="none"
              />
            ))}
          </g>
        )}

        {motif === "diya" && (
          <g>
            {/* Hanging diyas, each with a flame. */}
            {[
              { x: 398, drop: 34, d: 0 },
              { x: 462, drop: 58, d: 0.9 },
              { x: 526, drop: 28, d: 1.7 },
              { x: 578, drop: 50, d: 2.4 },
            ].map((lamp, i) => (
              <g key={i} className="eg-float" style={{ animationDelay: `${lamp.d}s` }}>
                <path d={`M${lamp.x} 0 v${lamp.drop}`} stroke={a} strokeOpacity="0.22" strokeWidth="1.2" />
                <path
                  d={`M${lamp.x - 15} ${lamp.drop + 12} q 15 14 30 0 z`}
                  fill={a}
                  fillOpacity="0.3"
                />
                <path
                  d={`M${lamp.x} ${lamp.drop + 11} c 0 -6 -4 -7 -4 -11 0 -3 4 -5 4 -5 s 4 2 4 5 c 0 4 -4 5 -4 11 z`}
                  fill={b}
                  fillOpacity="0.5"
                />
                <circle cx={lamp.x} cy={lamp.drop + 2} r="9" fill={b} fillOpacity="0.1" />
              </g>
            ))}
            {/* Rangoli arc. */}
            <g transform="translate(470 168)">
              {Array.from({ length: 11 }, (_, i) => {
                const ang = Math.PI * (i / 10);
                return (
                  <circle
                    key={i}
                    cx={-Math.cos(ang) * 76}
                    cy={-Math.sin(ang) * 30}
                    r={i % 2 ? 3.5 : 5}
                    fill={i % 3 === 0 ? b : a}
                    fillOpacity="0.26"
                  />
                );
              })}
            </g>
            {[[360, 118], [556, 128]].map(([x, y], i) => (
              <path
                key={i}
                d={`M${x} ${y} c 1 4.5 2 5.5 6.5 6.5 -4.5 1 -5.5 2 -6.5 6.5 -1 -4.5 -2 -5.5 -6.5 -6.5 4.5 -1 5.5 -2 6.5 -6.5z`}
                fill={b}
                fillOpacity="0.4"
              />
            ))}
          </g>
        )}

        {motif === "rings" && (
          <g>
            <g fill="none" strokeWidth="3">
              <circle cx="450" cy="66" r="30" stroke={a} strokeOpacity="0.26" />
              <circle cx="492" cy="66" r="30" stroke={b} strokeOpacity="0.3" />
            </g>
            <path
              d="M350 150 Q 450 112 600 148"
              fill="none"
              stroke={a}
              strokeOpacity="0.2"
              strokeWidth="2"
            />
            {[380, 430, 480, 530, 575].map((x, i) => (
              <circle key={x} cx={x} cy={140 - (i % 2) * 8} r={i % 2 ? 3 : 4.5} fill={b} fillOpacity="0.3" />
            ))}
          </g>
        )}

        {motif === "stars" && (
          <g>
            {[
              { x: 408, y: 52, s: 1.1, d: 0 },
              { x: 500, y: 36, s: 0.8, d: 1.1 },
              { x: 562, y: 62, s: 1, d: 2 },
            ].map((c, i) => (
              <g key={i} className="eg-float" style={{ animationDelay: `${c.d}s` }}>
                <g transform={`translate(${c.x} ${c.y}) scale(${c.s})`}>
                  <ellipse cx="0" cy="0" rx="26" ry="13" fill={a} fillOpacity="0.2" />
                  <circle cx="-9" cy="-6" r="11" fill={a} fillOpacity="0.2" />
                  <circle cx="7" cy="-8" r="14" fill={a} fillOpacity="0.2" />
                </g>
              </g>
            ))}
            {[[376, 112], [452, 126], [530, 110], [594, 130]].map(([x, y], i) => (
              <path
                key={i}
                d={`M${x} ${y} c 1.3 5.6 2.7 7 8.3 8.3 -5.6 1.3 -7 2.7 -8.3 8.3 -1.3 -5.6 -2.7 -7 -8.3 -8.3 5.6 -1.3 7 -2.7 8.3 -8.3z`}
                fill={i % 2 ? b : a}
                fillOpacity="0.32"
              />
            ))}
          </g>
        )}

        {motif === "confetti" && (
          <g>
            {/* Streamers. */}
            {[
              { x: 390, c: a },
              { x: 450, c: b },
              { x: 512, c: a },
              { x: 570, c: b },
            ].map((s, i) => (
              <path
                key={i}
                d={`M${s.x} 0 q 14 26 -2 48 q -16 22 2 46 q 14 20 -1 42`}
                fill="none"
                stroke={s.c}
                strokeOpacity="0.24"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ))}
            {Array.from({ length: 12 }, (_, i) => {
              const x = 360 + ((i * 83) % 240);
              const y = 18 + ((i * 47) % 140);
              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width="10"
                  height="4"
                  rx="2"
                  fill={i % 3 === 0 ? b : a}
                  fillOpacity="0.28"
                  transform={`rotate(${(i * 53) % 180} ${x + 5} ${y + 2})`}
                />
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}

/**
 * A short confetti burst when a plan first opens. Uses the validated chart
 * palette rather than new colours, hides itself entirely under
 * prefers-reduced-motion, and unmounts when done.
 */
export function Confetti({ run }: { run: number }) {
  const [alive, setAlive] = useState(false);

  useEffect(() => {
    if (run === 0) return;
    setAlive(true);
    const id = setTimeout(() => setAlive(false), 3400);
    return () => clearTimeout(id);
  }, [run]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        left: (i * 97) % 100,
        color: `var(--series-${(i % 8) + 1})`,
        delay: ((i * 53) % 90) / 100,
        duration: 2.2 + ((i * 31) % 120) / 100,
        drift: ((i * 71) % 160) - 80,
        spin: 360 + ((i * 137) % 540),
        round: i % 3 === 0,
      })),
    [],
  );

  if (!alive) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={`${run}-${i}`}
          className="eg-confetti"
          style={
            {
              left: `${p.left}%`,
              background: p.color,
              borderRadius: p.round ? "50%" : undefined,
              "--delay": `${p.delay}s`,
              "--dur": `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
