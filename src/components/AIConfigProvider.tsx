"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type AIProvider =
  | "auto"
  | "openai"
  | "anthropic"
  | "gemini"
  | "groq"
  | "openrouter"
  | "deepseek"
  | "mistral"
  | "together"
  | "fireworks"
  | "xai"
  | "cerebras"
  | "custom";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint: string;
}

interface AIConfigContextValue {
  config: AIConfig;
  updateConfig: (updates: Partial<AIConfig>) => void;
  clearApiKey: () => void;
}

const defaultConfig: AIConfig = {
  provider: "auto",
  apiKey: "",
  model: "",
  endpoint: "",
};

function isAIProvider(value: unknown): value is AIProvider {
  return typeof value === "string" && [
    "auto", "openai", "anthropic", "gemini", "groq", "openrouter",
    "deepseek", "mistral", "together", "fireworks", "xai", "cerebras", "custom",
  ].includes(value);
}

const AIConfigContext = createContext<AIConfigContextValue | null>(null);

export function AIConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(defaultConfig);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    for (const legacyKey of ["ash_groq_key", "ash_gemini_key", "ash_ai_provider"]) {
      try {
        localStorage.removeItem(legacyKey);
      } catch {
        // Browser storage may be unavailable; no new key is persisted.
      }
    }
    let preferences: Record<string, unknown> = {};
    try {
      const stored = localStorage.getItem("byteshelf-ai-preferences");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        preferences = typeof parsed === "object" && parsed !== null
          ? parsed as Record<string, unknown>
          : {};
      }
    } catch {
      preferences = {};
    } finally {
      queueMicrotask(() => {
        if (cancelled) return;
        setConfig((current) => ({
          ...current,
          provider: isAIProvider(preferences.provider) ? preferences.provider : current.provider,
          model: typeof preferences.model === "string" ? preferences.model.slice(0, 200) : current.model,
          endpoint: typeof preferences.endpoint === "string" ? preferences.endpoint.slice(0, 2_000) : current.endpoint,
        }));
        setReady(true);
      });
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("byteshelf-ai-preferences", JSON.stringify({
        provider: config.provider,
        model: config.model,
        endpoint: config.endpoint,
      }));
    } catch {
      // Preferences are optional; the API key remains in memory only.
    }
  }, [config.provider, config.model, config.endpoint, ready]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setConfig((current) => ({ ...current, apiKey: "" }));
    });
    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AIConfigContextValue>(() => ({
    config,
    updateConfig: (updates) => setConfig((current) => ({ ...current, ...updates })),
    clearApiKey: () => setConfig((current) => ({ ...current, apiKey: "" })),
  }), [config]);

  return <AIConfigContext.Provider value={value}>{children}</AIConfigContext.Provider>;
}

export function useAIConfig() {
  const context = useContext(AIConfigContext);
  if (!context) throw new Error("useAIConfig must be used inside AIConfigProvider");
  return context;
}
