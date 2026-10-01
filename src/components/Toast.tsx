"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { Check, X, AlertTriangle, Info, Sparkles } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning" | "ai";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  ai: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <Check size={15} />,
  error: <X size={15} />,
  warning: <AlertTriangle size={15} />,
  info: <Info size={15} />,
  ai: <Sparkles size={15} />,
};

const COLORS: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  ai: "#a78bfa",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 3500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-4), { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (m) => addToast(m, "success"),
    error: (m) => addToast(m, "error", 5000),
    info: (m) => addToast(m, "info"),
    warn: (m) => addToast(m, "warning"),
    ai: (m) => addToast(m, "ai"),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div
            key={t.id}
            className="toast animate-slide-up"
            style={{ borderLeft: `3px solid ${COLORS[t.type]}` }}
            role="alert"
          >
            <span className="toast-icon" style={{ color: COLORS[t.type] }}>
              {ICONS[t.type]}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-dismiss" onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        }

        .toast {
          pointer-events: all;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(15, 20, 32, 0.96);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px 14px;
          min-width: 280px;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          backdrop-filter: blur(12px);
        }

        .toast-icon {
          flex-shrink: 0;
          display: flex;
        }

        .toast-message {
          flex: 1;
          font-size: 13.5px;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .toast-dismiss {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 2px;
          display: flex;
          flex-shrink: 0;
          transition: color 0.15s;
        }

        .toast-dismiss:hover { color: var(--text-primary); }

        @keyframes slide-up {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @media (max-width: 480px) {
          .toast-container { bottom: 80px; right: 12px; left: 12px; }
          .toast { min-width: unset; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
