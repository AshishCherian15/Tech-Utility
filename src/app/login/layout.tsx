import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your private Tech-Utility knowledge library.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
