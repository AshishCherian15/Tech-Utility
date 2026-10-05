interface BrandMarkProps {
  size?: number;
}

export default function BrandMark({ size = 40 }: BrandMarkProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="tech-utility-mark" x1="5" y1="4" x2="43" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F7CFF" />
          <stop offset="1" stopColor="#0EA5B7" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="46" height="46" rx="14" fill="url(#tech-utility-mark)" />
      <path
        d="M12 14.5C12 13.12 13.12 12 14.5 12h19a2.5 2.5 0 0 1 0 5H27v17a2.5 2.5 0 0 1-5 0V17h-7.5a2.5 2.5 0 0 1-2.5-2.5Z"
        fill="white"
      />
      <circle cx="35" cy="33" r="3" fill="#B8FFF2" />
    </svg>
  );
}
