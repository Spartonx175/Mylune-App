// In-house flat illustrations for the size comparisons (SPEC section 7, option a). Decorative: text next to it carries the meaning.
const LEAF = "#6f9a55";

function Shape({ id }: { id: string }) {
  switch (id) {
    case "lentil":
      return (
        <>
          <ellipse cx="50" cy="54" rx="24" ry="20" fill="#c99a5b" />
          <ellipse cx="50" cy="54" rx="24" ry="20" fill="none" stroke="#a97a3d" strokeWidth="3" />
          <ellipse cx="42" cy="47" rx="8" ry="4" fill="#e6c18a" opacity="0.8" />
        </>
      );
    case "blueberry":
      return (
        <>
          <circle cx="50" cy="55" r="27" fill="#4f64a8" />
          <path d="M50 38 l5 8 h-10 z M42 42 l8 3 l-4 7 z M58 42 l-8 3 l4 7 z" fill="#3b4c87" />
          <ellipse cx="40" cy="48" rx="7" ry="4" fill="#8aa0e0" opacity="0.6" />
        </>
      );
    case "raspberry":
      return (
        <>
          <g fill="#d94f6a">
            {[[38, 44], [50, 40], [62, 44], [32, 56], [44, 54], [56, 54], [68, 56], [38, 66], [50, 66], [62, 66], [50, 78]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="8" />
            ))}
          </g>
          <g fill="#f08aa0" opacity="0.7">
            <circle cx="36" cy="42" r="2.5" /><circle cx="48" cy="38" r="2.5" /><circle cx="42" cy="52" r="2.5" />
          </g>
          <path d="M50 38 q-10 -14 -18 -8 q8 2 18 8 q10 -6 18 -4 q-8 -8 -18 4z" fill={LEAF} />
        </>
      );
    case "olive":
      return (
        <>
          <ellipse cx="50" cy="56" rx="19" ry="27" fill="#8a9a3c" transform="rotate(20 50 56)" />
          <ellipse cx="44" cy="46" rx="5" ry="9" fill="#b5c45e" opacity="0.7" transform="rotate(20 44 46)" />
          <path d="M58 30 q8 -10 18 -8" fill="none" stroke="#5c6a28" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "kumquat":
      return (
        <>
          <ellipse cx="50" cy="56" rx="21" ry="25" fill="#f0a030" />
          <ellipse cx="42" cy="48" rx="5" ry="9" fill="#ffd27a" opacity="0.7" />
          <path d="M50 32 q4 -10 14 -10 q-2 10 -14 10z" fill={LEAF} />
          <path d="M50 32 v-6" stroke="#6b4a1e" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "fig":
      return (
        <>
          <path d="M50 28 C70 40 78 62 66 76 C58 86 42 86 34 76 C22 62 30 40 50 28z" fill="#7a4a78" />
          <path d="M50 28 C60 44 60 70 50 84" fill="none" stroke="#5a3158" strokeWidth="2.5" opacity="0.6" />
          <ellipse cx="42" cy="56" rx="5" ry="11" fill="#a574a2" opacity="0.6" />
          <path d="M50 28 v-9" stroke="#5c6a28" strokeWidth="4" strokeLinecap="round" />
        </>
      );
    case "plum":
      return (
        <>
          <circle cx="50" cy="56" r="28" fill="#8c3f6b" />
          <path d="M50 30 C42 46 42 66 50 84" fill="none" stroke="#6a2a50" strokeWidth="3" opacity="0.7" />
          <ellipse cx="38" cy="48" rx="7" ry="10" fill="#b8689a" opacity="0.6" transform="rotate(-20 38 48)" />
          <path d="M50 30 q8 -14 20 -12 q-4 12 -20 12z" fill={LEAF} />
          <path d="M50 30 v-8" stroke="#5c6a28" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    default:
      return <circle cx="50" cy="55" r="26" fill="var(--color-accent)" />;
  }
}

export default function FruitIllustration({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 100 100" className={`fruit-float ${className}`}>
      <ellipse cx="50" cy="90" rx="26" ry="4" fill="#3b2f2b" opacity="0.08" />
      <Shape id={id} />
    </svg>
  );
}
