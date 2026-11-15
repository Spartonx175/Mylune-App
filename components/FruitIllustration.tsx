// In-house illustrations for the size comparisons (SPEC section 7, option a): soft gradients, highlights and leaves.
// Decorative: the text next to it carries the meaning.
const g = (id: string, c1: string, c2: string, cx = "35%", cy = "30%") => (
  <radialGradient id={id} cx={cx} cy={cy} r="75%">
    <stop offset="0%" stopColor={c1} />
    <stop offset="100%" stopColor={c2} />
  </radialGradient>
);

const Leaf = ({ x, y, rot = 0, s = 1 }: { x: number; y: number; rot?: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C6 -14 22 -16 30 -8 C24 4 8 8 0 0Z" fill="url(#leaf)" />
    <path d="M2 -1 C12 -6 20 -8 28 -8" fill="none" stroke="#4d7a3a" strokeWidth="1.2" opacity="0.6" />
  </g>
);

function Shape({ id }: { id: string }) {
  switch (id) {
    case "lentil":
      return (
        <>
          <defs>{g(`${id}f`, "#e8c48a", "#b07f3c")}</defs>
          <ellipse cx="50" cy="55" rx="27" ry="22" fill={`url(#${id}f)`} />
          <ellipse cx="50" cy="55" rx="27" ry="22" fill="none" stroke="#9a6a2c" strokeOpacity="0.5" strokeWidth="2" />
          <path d="M30 52 C38 44 56 42 70 50" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="55" rx="6" ry="1.6" fill="#9a6a2c" opacity="0.35" />
        </>
      );
    case "blueberry":
      return (
        <>
          <defs>{g(`${id}f`, "#8ea2ee", "#2f3d7a")}</defs>
          <circle cx="50" cy="56" r="29" fill={`url(#${id}f)`} />
          <circle cx="50" cy="56" r="29" fill="#fff" opacity="0.1" />
          <path d="M50 36 l3 6 6 -1 -3 5 5 4 -6 1 -1 6 -4 -5 -4 5 -1 -6 -6 -1 5 -4 -3 -5 6 1z" fill="#243063" opacity="0.85" />
          <ellipse cx="38" cy="45" rx="9" ry="5" fill="#fff" opacity="0.4" transform="rotate(-30 38 45)" />
        </>
      );
    case "raspberry":
      return (
        <>
          <defs>{g(`${id}f`, "#ff8fa6", "#c52a4d")}<linearGradient id="leaf" x1="0" x2="1"><stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3d" /></linearGradient></defs>
          {[[38, 44], [50, 41], [62, 44], [32, 56], [44, 54], [56, 54], [68, 56], [38, 67], [50, 66], [62, 67], [44, 78], [56, 78], [50, 88]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y - 4} r="8.5" fill={`url(#${id}f)`} />
          ))}
          {[[36, 38], [48, 35], [60, 38], [30, 50], [42, 48]].map(([x, y]) => (
            <circle key={`h${x}-${y}`} cx={x} cy={y} r="2" fill="#fff" opacity="0.55" />
          ))}
          <Leaf x={50} y={34} rot={-150} />
          <Leaf x={50} y={34} rot={-30} s={0.9} />
        </>
      );
    case "olive":
      return (
        <>
          <defs>{g(`${id}f`, "#c9d46a", "#59661f")}<linearGradient id="leaf" x1="0" x2="1"><stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3d" /></linearGradient></defs>
          <ellipse cx="50" cy="58" rx="20" ry="28" fill={`url(#${id}f)`} transform="rotate(18 50 58)" />
          <ellipse cx="42" cy="46" rx="4.5" ry="10" fill="#fff" opacity="0.4" transform="rotate(18 42 46)" />
          <path d="M57 32 q6 -8 12 -9" fill="none" stroke="#5a4a1c" strokeWidth="3" strokeLinecap="round" />
          <Leaf x={68} y={23} rot={-20} s={0.8} />
        </>
      );
    case "kumquat":
      return (
        <>
          <defs>{g(`${id}f`, "#ffd27a", "#e8820f")}<linearGradient id="leaf" x1="0" x2="1"><stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3d" /></linearGradient></defs>
          <ellipse cx="50" cy="58" rx="22" ry="27" fill={`url(#${id}f)`} />
          {[[40, 52], [58, 48], [50, 64], [60, 70], [40, 72]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="#c4690a" opacity="0.4" />
          ))}
          <ellipse cx="41" cy="46" rx="5" ry="10" fill="#fff" opacity="0.4" transform="rotate(-10 41 46)" />
          <path d="M50 32 v-7" stroke="#6b4a1e" strokeWidth="3" strokeLinecap="round" />
          <Leaf x={50} y={27} rot={-25} s={0.9} />
        </>
      );
    case "fig":
      return (
        <>
          <defs>{g(`${id}f`, "#b98ab6", "#5a2c5a")}<linearGradient id="leaf" x1="0" x2="1"><stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3d" /></linearGradient></defs>
          <path d="M50 26 C72 40 80 64 66 78 C58 88 42 88 34 78 C20 64 28 40 50 26Z" fill={`url(#${id}f)`} />
          <path d="M50 30 C58 46 58 70 50 86" fill="none" stroke="#3f1c40" strokeWidth="2" opacity="0.35" />
          <path d="M40 40 C32 52 33 66 40 76" fill="none" stroke="#3f1c40" strokeWidth="2" opacity="0.25" />
          <ellipse cx="40" cy="50" rx="5" ry="12" fill="#fff" opacity="0.3" transform="rotate(10 40 50)" />
          <path d="M50 26 v-8" stroke="#5a4a1c" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "plum":
      return (
        <>
          <defs>{g(`${id}f`, "#c46aa0", "#6b2250")}<linearGradient id="leaf" x1="0" x2="1"><stop offset="0" stopColor="#8cc063" /><stop offset="1" stopColor="#4f8a3d" /></linearGradient></defs>
          <circle cx="50" cy="58" r="29" fill={`url(#${id}f)`} />
          <path d="M50 30 C42 46 42 70 50 87" fill="none" stroke="#4d1639" strokeWidth="2.5" opacity="0.5" />
          <ellipse cx="37" cy="48" rx="8" ry="12" fill="#fff" opacity="0.3" transform="rotate(-25 37 48)" />
          <path d="M50 30 v-8" stroke="#5a4a1c" strokeWidth="3" strokeLinecap="round" />
          <Leaf x={51} y={24} rot={-20} s={0.9} />
        </>
      );
    default:
      return (
        <>
          <defs>{g(`${id}f`, "#ffd9c2", "#e57d52")}</defs>
          <circle cx="50" cy="56" r="27" fill={`url(#${id}f)`} />
        </>
      );
  }
}

export default function FruitIllustration({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" className={className}>
      <ellipse cx="50" cy="92" rx="24" ry="3.5" fill="#3b2f2b" opacity="0.12" />
      <g className="fruit-float" style={{ transformOrigin: "50% 80%" }}>
        <Shape id={id} />
      </g>
    </svg>
  );
}
