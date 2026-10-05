"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

let previousPathname: string | null = null;
let currentPathname: string | null = null;

export function hasPreviousInAppPage(pathname: string): boolean {
  return previousPathname !== null && previousPathname !== pathname;
}

export default function NavigationHistory() {
  const pathname = usePathname();

  useEffect(() => {
    if (currentPathname && currentPathname !== pathname) {
      previousPathname = currentPathname;
    }
    currentPathname = pathname;
  }, [pathname]);

  return null;
}
