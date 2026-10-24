import { cn } from "@/lib/utils";

/**
 * Generated artwork.
 *
 * Vendor and inspiration cards need imagery. Rather than hotlink stock photos
 * — which would mean loosening `img-src`, leaking a referrer on every card,
 * and shipping pictures of real venues next to invented names — each card gets
 * a deterministic botanical composition drawn from the palette. It is honest
 * about being decoration, it is sharp at any size, and it costs no requests.
 *
 * To use real photography later: give the record an `imageUrl`, render an
 * <img> when present, fall back to this, and add that host to `img-src`.
 */

type Props = {
  /** Any stable number; the same seed always draws the same picture. */
  seed: number;
  palette?: [string, string];
  className?: string;
  /** Larger compositions get more detail. */
  detail?: "card" | "tile";
};

const DEFAULT_PALETTE: [string, string] = ["#9e2b52", "#b3801a"];

function rng(seed: number) {
  let s = (seed * 9301 + 49297) % 233280;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function Artwork({ seed, palette = DEFAULT_PALETTE, className, detail = "card" }: Props) {
  const [a, b] = palette;
  const next = rng(seed + 7);
  const variant = seed % 5;
  const uid = `art${seed}`;

  const petals = detail === "tile" ? 12 : 8;

  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} stopOpacity="0.14" />
          <stop offset="55%" stopColor={b} stopOpacity="0.1" />
          <stop offset="100%" stopColor={a} stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="34%" r="62%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="200" fill="var(--surface-sunken)" />
      <rect width="320" height="200" fill={`url(#${uid}-bg)`} />
      <rect width="320" height="200" fill={`url(#${uid}-glow)`} />

      {/* 0 — ceremony arch */}
      {variant === 0 && (
        <g>
          <path
            d="M100 190V96a60 60 0 0 1 120 0v94"
            fill="none"
            stroke={a}
            strokeOpacity="0.55"
            strokeWidth="2.5"
          />
          <path
            d="M114 190V98a46 46 0 0 1 92 0v92"
            fill="none"
            stroke={b}
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          {Array.from({ length: petals }, (_, i) => {
            const t = i / (petals - 1);
            const angle = Math.PI * (1 - t);
            const cx = 160 + Math.cos(angle) * 60;
            const cy = 96 - Math.sin(angle) * 60;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={4 + next() * 4}
                fill={i % 2 ? b : a}
                fillOpacity="0.5"
              />
            );
          })}
        </g>
      )}

      {/* 1 — marigold burst */}
      {variant === 1 && (
        <g transform="translate(160 100)">
          {Array.from({ length: petals + 6 }, (_, i) => {
            const angle = (i / (petals + 6)) * Math.PI * 2;
            const r = 44 + next() * 18;
            return (
              <ellipse
                key={i}
                cx={Math.cos(angle) * r}
                cy={Math.sin(angle) * r * 0.62}
                rx={13}
                ry={8}
                fill={i % 3 === 0 ? b : a}
                fillOpacity="0.4"
                transform={`rotate(${(angle * 180) / Math.PI} ${Math.cos(angle) * r} ${Math.sin(angle) * r * 0.62})`}
              />
            );
          })}
          <circle r="20" fill={b} fillOpacity="0.55" />
          <circle r="10" fill={a} fillOpacity="0.5" />
        </g>
      )}

      {/* 2 — botanical sprigs */}
      {variant === 2 && (
        <g>
          {[46, 160, 274].map((x, col) => (
            <g key={x} transform={`translate(${x} 190)`}>
              <path
                d={`M0 0 C ${-8 + col * 6} -50, ${6 - col * 4} -92, 0 -140`}
                fill="none"
                stroke={a}
                strokeOpacity="0.5"
                strokeWidth="2"
              />
              {Array.from({ length: 7 }, (_, i) => {
                const y = -22 - i * 17;
                const side = i % 2 ? 1 : -1;
                return (
                  <ellipse
                    key={i}
                    cx={side * 13}
                    cy={y}
                    rx={13}
                    ry={6}
                    fill={i % 3 === 0 ? b : a}
                    fillOpacity="0.32"
                    transform={`rotate(${side * -28} ${side * 13} ${y})`}
                  />
                );
              })}
            </g>
          ))}
        </g>
      )}

      {/* 3 — layered mandap arcs */}
      {variant === 3 && (
        <g fill="none" strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M${40 + i * 14} 190 V ${118 - i * 10} A ${120 - i * 14} ${74 - i * 10} 0 0 1 ${280 - i * 14} ${118 - i * 10} V 190`}
              stroke={i % 2 ? b : a}
              strokeOpacity={0.5 - i * 0.08}
              strokeWidth={2.5 - i * 0.4}
            />
          ))}
          <circle cx="160" cy="52" r="8" fill={b} fillOpacity="0.5" stroke="none" />
        </g>
      )}

      {/* 4 — drifting petals */}
      {variant === 4 && (
        <g>
          {Array.from({ length: petals + 10 }, (_, i) => {
            const x = next() * 320;
            const y = next() * 200;
            const r = 5 + next() * 11;
            return (
              <ellipse
                key={i}
                cx={x}
                cy={y}
                rx={r}
                ry={r * 0.55}
                fill={i % 3 === 0 ? b : a}
                fillOpacity={0.18 + next() * 0.28}
                transform={`rotate(${next() * 180} ${x} ${y})`}
              />
            );
          })}
          <path
            d="M0 168 C 80 150, 240 186, 320 160"
            fill="none"
            stroke={a}
            strokeOpacity="0.35"
            strokeWidth="2"
          />
        </g>
      )}
    </svg>
  );
}
