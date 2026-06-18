import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

type ConfirmTone = "danger" | "default";
type ToastTone = "success" | "error" | "info";

type ConfirmOptions = {
  title: string;
  message: string;
  details?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ToastOptions = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

type ConfirmState = ConfirmOptions & {
  open: boolean;
};

type ToastItem = ToastOptions & {
  id: number;
};

type UIContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  notify: (options: ToastOptions) => void;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

const initialConfirmState: ConfirmState = {
  open: false,
  title: "",
  message: "",
  details: "",
  confirmLabel: "Aceptar",
  cancelLabel: "Cancelar",
  tone: "default",
};

export function UIProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState>(initialConfirmState);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const toastIdRef = useRef(0);

  const closeConfirm = useCallback((value: boolean) => {
    confirmResolverRef.current?.(value);
    confirmResolverRef.current = null;
    setConfirmState(initialConfirmState);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
    }

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmState({
        open: true,
        title: options.title,
        message: options.message,
        details: options.details ?? "",
        confirmLabel: options.confirmLabel ?? "Aceptar",
        cancelLabel: options.cancelLabel ?? "Cancelar",
        tone: options.tone ?? "default",
      });
    });
  }, []);

  const notify = useCallback((options: ToastOptions) => {
    const id = ++toastIdRef.current;
    const item: ToastItem = {
      id,
      title: options.title,
      message: options.message,
      tone: options.tone ?? "info",
    };

    setToasts((current) => [...current, item]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      confirm,
      notify,
    }),
    [confirm, notify],
  );

  return (
    <UIContext.Provider value={value}>
      {children}

      {confirmState.open && (
        <div className="modal-backdrop" onClick={() => closeConfirm(false)}>
          <div className="modal-card confirm-modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="confirm-modal-copy">
              <p className="eyebrow">Finanzas Claras dice</p>
              <h2>{confirmState.title}</h2>
              <p>{confirmState.message}</p>
              {confirmState.details ? <p className="section-subtitle">{confirmState.details}</p> : null}
            </div>
            <div className="confirm-modal-actions">
              <button className="ghost-button" type="button" onClick={() => closeConfirm(false)}>
                {confirmState.cancelLabel}
              </button>
              <button
                className={`primary-button ${confirmState.tone === "danger" ? "danger-button" : ""}`}
                type="button"
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <article key={toast.id} className={`toast-card ${toast.tone}`}>
            <strong>{toast.title}</strong>
            {toast.message ? <p>{toast.message}</p> : null}
          </article>
        ))}
      </div>
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI debe usarse dentro de UIProvider");
  }
  return context;
}
