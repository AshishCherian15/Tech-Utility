"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { hasPreviousInAppPage } from "@/components/NavigationHistory";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function BackLink({ href, children, className = "btn btn-ghost btn-sm" }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    try {
      const hasSameOriginReferrer =
        document.referrer && new URL(document.referrer).origin === window.location.origin;
      if (hasSameOriginReferrer || hasPreviousInAppPage(window.location.pathname)) {
        event.preventDefault();
        router.back();
      }
    } catch {
      // Keep the fallback link behavior when the referrer cannot be parsed.
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      <ArrowLeft size={15} aria-hidden="true" />
      {children}
    </Link>
  );
}
