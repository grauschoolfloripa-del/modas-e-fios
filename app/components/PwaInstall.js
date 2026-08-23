"use client";

import { useEffect, useState } from "react";

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (!visible) return null;

  return (
    <div className="pwa-install-bar">
      <span>Instalar o Modas e Fios no seu aparelho?</span>
      <div className="pwa-install-actions">
        <button
          type="button"
          className="btn btn-solid btn-sm"
          onClick={async () => {
            setVisible(false);
            deferredPrompt?.prompt();
            await deferredPrompt?.userChoice;
            setDeferredPrompt(null);
          }}
        >
          Instalar
        </button>
        <button type="button" className="pwa-install-dismiss" onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>
    </div>
  );
}
