import Image from "next/image";

interface BrandMarkProps {
  size?: number;
}

export default function BrandMark({ size = 40 }: BrandMarkProps) {
  return (
    <Image
      src="/byteshelf-icon-only-1024.png"
      alt="ByteShelf Logo"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0, borderRadius: "20%" }}
    />
  );
}
