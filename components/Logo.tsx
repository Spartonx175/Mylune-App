// Mylune mark: a peach disc with a leaf, in the palette. Decorative; the app name sits next to it.
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" width={size} height={size} className="shrink-0">
      <circle cx="24" cy="24" r="23" fill="var(--color-accent)" />
      <path d="M14 31c0-9 6-16 18-18 0 11-6 18-18 18Z" fill="var(--color-surface)" />
      <path d="M14 31c4-4 7-7 11-10" fill="none" stroke="var(--color-primary-text)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
