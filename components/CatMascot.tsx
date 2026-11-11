import { COATS, type CatId } from "@/lib/cats";

// Simple drawn cats in each cat's colours. Decorative only (aria-hidden): the surrounding text carries the meaning.
// Animations live in app/globals.css and stop when the phone asks for reduced motion.

type Variant = "sit" | "peek";

export function CatMascot({ cat, variant = "sit", className = "" }: { cat: CatId; variant?: Variant; className?: string }) {
  const c = COATS[cat];
  const dark = c.mask ? c.shade : c.body;
  const peek = variant === "peek";

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={peek ? "22 4 76 66" : "0 0 120 124"}
      className={`cat-anim ${className}`}
    >
      {!peek && (
        <>
          <path className="cat-tail" d="M86 102 C112 100 118 74 104 64" fill="none" stroke={dark} strokeWidth="10" strokeLinecap="round" />
          <ellipse cx="60" cy="92" rx="30" ry="27" fill={c.body} />
          {c.stripes && (
            <g stroke={c.shade} strokeWidth="3" strokeLinecap="round" opacity="0.55">
              <path d="M34 84 q6 2 8 8" fill="none" />
              <path d="M86 84 q-6 2 -8 8" fill="none" />
              <path d="M36 100 q6 0 9 5" fill="none" />
              <path d="M84 100 q-6 0 -9 5" fill="none" />
            </g>
          )}
          <ellipse cx="60" cy="96" rx="14" ry="19" fill={c.chest} />
          <ellipse cx="49" cy="116" rx="8" ry="5" fill={c.paw} />
          <ellipse cx="71" cy="116" rx="8" ry="5" fill={c.paw} />
        </>
      )}

      {/* ears */}
      <polygon points="34,36 38,8 58,26" fill={c.mask ? c.shade : c.body} />
      <polygon points="86,36 82,8 62,26" fill={c.mask ? c.shade : c.body} />
      <polygon points="39,30 41,16 52,26" fill={c.ear} />
      <polygon points="81,30 79,16 68,26" fill={c.ear} />
      {/* head */}
      <ellipse cx="60" cy="48" rx="28" ry="23" fill={c.body} />
      {c.mask && <ellipse cx="60" cy="52" rx="17" ry="16" fill={c.shade} />}
      {c.stripes && (
        <g stroke={c.shade} strokeWidth="2.5" strokeLinecap="round" opacity="0.6">
          <path d="M60 28 v8" />
          <path d="M52 29 l2 7" />
          <path d="M68 29 l-2 7" />
        </g>
      )}
      <ellipse cx="60" cy="58" rx="11" ry="8" fill={c.mask ? c.chest : c.chest} opacity={c.mask ? 1 : 0.9} />
      {/* eyes */}
      <g className="cat-eye">
        <circle cx="49" cy="47" r="4.6" fill={c.eyes} />
        <circle cx="71" cy="47" r="4.6" fill={c.eyes} />
        <ellipse cx="49" cy="47" rx="1.4" ry="3.4" fill="#2a1f1b" />
        <ellipse cx="71" cy="47" rx="1.4" ry="3.4" fill="#2a1f1b" />
      </g>
      {/* nose, mouth, whiskers */}
      <polygon points="57,55 63,55 60,59" fill={c.mask ? "#2a1f1b" : "#d98a8a"} />
      <path d="M60 59 q-3 4 -7 2 M60 59 q3 4 7 2" fill="none" stroke="#3b2f2b" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <g stroke="#3b2f2b" strokeWidth="1" opacity="0.35" strokeLinecap="round">
        <path d="M44 58 l-14 -3 M44 61 l-14 2" />
        <path d="M76 58 l14 -3 M76 61 l14 2" />
      </g>
      {peek && (
        <>
          <ellipse cx="44" cy="68" rx="9" ry="5" fill={c.paw} />
          <ellipse cx="76" cy="68" rx="9" ry="5" fill={c.paw} />
        </>
      )}
    </svg>
  );
}

/** A small side-view cat trotting in place, for loading states. */
export function CatWalker({ cat, className = "" }: { cat: CatId; className?: string }) {
  const c = COATS[cat];
  const dark = c.mask ? c.shade : c.body;
  const leg = (x: number, which: "a" | "b") => (
    <line
      key={`${x}${which}`}
      className={`cat-leg-${which}`}
      style={{ transformOrigin: `${x}px 54px` }}
      x1={x}
      y1="54"
      x2={x}
      y2="72"
      stroke={c.mask ? c.shade : c.shade}
      strokeWidth="7"
      strokeLinecap="round"
    />
  );
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 150 84" className={`cat-anim ${className}`}>
      <g className="cat-bob">
        <path className="cat-tail" d="M34 38 C10 34 10 12 24 8" fill="none" stroke={dark} strokeWidth="9" strokeLinecap="round" />
        {leg(44, "a")}
        {leg(92, "a")}
        {leg(58, "b")}
        {leg(106, "b")}
        <rect x="30" y="28" width="82" height="30" rx="15" fill={c.body} />
        <ellipse cx="86" cy="50" rx="18" ry="8" fill={c.chest} opacity="0.9" />
        <polygon points="104,22 108,4 120,16" fill={c.mask ? c.shade : c.body} />
        <polygon points="128,22 126,4 114,16" fill={c.mask ? c.shade : c.body} />
        <ellipse cx="118" cy="32" rx="17" ry="15" fill={c.body} />
        {c.mask && <ellipse cx="122" cy="34" rx="10" ry="10" fill={c.shade} />}
        <circle cx="126" cy="29" r="2.8" fill={c.eyes} />
        <ellipse cx="126" cy="29" rx="0.9" ry="2.2" fill="#2a1f1b" />
        <polygon points="132,34 136,34 134,37" fill={c.mask ? "#2a1f1b" : "#d98a8a"} />
      </g>
    </svg>
  );
}
