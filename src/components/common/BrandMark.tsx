interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span
      className={`grid h-6.25 w-6.25 shrink-0 rotate-[-7deg] grid-cols-2 gap-0.75 ${className}`}
      aria-hidden="true"
    >
      <span className="rounded-xs bg-[#fb8057]" />
      <span className="rounded-xs bg-[#7bc6a5]" />
      <span className="rounded-xs bg-[#7bc6a5]" />
      <span className="rounded-xs bg-[#fb8057]" />
    </span>
  );
}