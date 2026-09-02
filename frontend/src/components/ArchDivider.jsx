// A scalloped gopuram-inspired divider used consistently across pages
// as the site's signature visual motif — echoes the tiered arches of a
// South Indian temple tower without being a literal illustration.
export default function ArchDivider({ flip = false, className = "" }) {
  return (
    <svg
      viewBox="0 0 1200 60"
      preserveAspectRatio="none"
      className={`w-full h-[36px] ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,60 L0,30 Q50,0 100,30 Q150,0 200,30 Q250,0 300,30 Q350,0 400,30 Q450,0 500,30 Q550,0 600,30 Q650,0 700,30 Q750,0 800,30 Q850,0 900,30 Q950,0 1000,30 Q1050,0 1100,30 Q1150,0 1200,30 L1200,60 Z"
        fill="currentColor"
      />
    </svg>
  );
}
