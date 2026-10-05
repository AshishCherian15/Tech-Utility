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
        {/* Main gradient - vibrant blue-purple */}
        <linearGradient id="brand-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4361ee" />
          <stop offset="0.35" stopColor="#3f37c9" />
          <stop offset="0.7" stopColor="#7209b7" />
          <stop offset="1" stopColor="#4cc9f0" />
        </linearGradient>
        
        {/* Diagonal shine effect */}
        <linearGradient id="brand-shine" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(255,255,255,0.5)" />
          <stop offset="0.4" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="0.7" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        
        {/* Inner glow for the icon */}
        <linearGradient id="icon-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="1" stopColor="#e0e7ff" />
        </linearGradient>
        
        {/* Accent gradient for decorative elements */}
        <linearGradient id="accent-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4cc9f0" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        
        {/* Outer glow filter */}
        <filter id="outer-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Inner glow filter */}
        <filter id="inner-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Drop shadow */}
        <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4361ee" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Main background with rounded corners */}
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="16"
        fill="url(#brand-gradient)"
        filter="url(#outer-glow)"
      />
      
      {/* Shine overlay */}
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx="16"
        fill="url(#brand-shine)"
      />
      
      {/* Main T letter - stylized */}
      <path
        d="M13 13H18C18.5523 13 19 13.4477 19 14V18C19 18.5523 18.5523 19 18 19H13V13ZM13 21H18C18.5523 21 19 21.4477 19 22V28C19 28.5523 18.5523 29 18 29H13V21ZM13 31H18C18.5523 31 19 31.4477 19 32V35C19 35.5523 18.5523 36 18 36H13V31Z"
        fill="url(#icon-gradient)"
        filter="url(#inner-glow)"
      />
      
      {/* Decorative tech element - brackets/brackets */}
      <path
        d="M21 16H26C26.5523 16 27 16.4477 27 17V20C27 20.5523 26.5523 21 26 21H21V16ZM21 22H26C26.5523 22 27 22.4477 27 23V26C27 26.5523 26.5523 27 26 27H21V22Z"
        fill="rgba(255,255,255,0.7)"
        filter="url(#inner-glow)"
      />
      
      {/* Decorative dots - representing data/tech */}
      <circle cx="32" cy="18" r="2" fill="url(#accent-gradient)" filter="url(#inner-glow)" />
      <circle cx="37" cy="24" r="1.5" fill="url(#accent-gradient)" filter="url(#inner-glow)" />
      <circle cx="34" cy="30" r="2" fill="url(#accent-gradient)" filter="url(#inner-glow)" />
      
      {/* Decorative circuit lines */}
      <path
        d="M30 15L32 17M29 21L31 23M31 29L33 31"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Bottom accent line */}
      <rect
        x="10"
        y="39"
        width="28"
        height="2"
        rx="1"
        fill="rgba(255,255,255,0.3)"
      />
    </svg>
  );
}
