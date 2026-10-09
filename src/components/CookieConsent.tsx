"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "byteshelf-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setVisible(localStorage.getItem(CONSENT_KEY) !== "accepted");
    });
  }, []);

  if (!visible) return null;

  return (
    <div className="cookie-consent" role="region" aria-label="Cookie consent">
      <div>
        <strong>Cookie notice</strong>
        <p>
          ByteShelf uses essential authentication cookies and local browser storage for app preferences.
          Optional analytics are not enabled.
        </p>
      </div>
      <div className="cookie-consent-actions">
        <Link href="/cookies" className="btn btn-secondary btn-sm">Learn more</Link>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            localStorage.setItem(CONSENT_KEY, "accepted");
            setVisible(false);
          }}
        >
          Accept essentials
        </button>
      </div>
    </div>
  );
}
