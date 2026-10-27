import React, { useEffect, useState } from "react";
import { useLang } from "../i18n/LanguageContext.jsx";

const KEY = "elite_welcome_seen";

// Map-pin illustration painted in the site's teal theme
const PinArt = () => (
  <svg className="wb-art" viewBox="0 0 120 100" aria-hidden="true">
    <ellipse cx="64" cy="90" rx="34" ry="6" fill="#0d3946" opacity=".9" />
    <path d="M26 44 L58 34 L58 82 L26 90 Z" fill="#d9ecf1" stroke="#0d3946" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M58 34 L92 44 L92 90 L58 82 Z" fill="#7fb5c4" stroke="#0d3946" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M60 8c-13 0-23 9.5-23 22 0 15 23 38 23 38s23-23 23-38C83 17.500 73 8 60 8Z" fill="#1b6479" stroke="#0d3946" strokeWidth="2.5" strokeLinejoin="round" />
    <circle cx="60" cy="30" r="8.500" fill="#fff" stroke="#0d3946" strokeWidth="2.500" />
    <path d="M47 20c3-5 8-7 13-7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
    <g fill="#7fb5c4" stroke="#0d3946" strokeWidth="1.800">
      <ellipse cx="22" cy="22" rx="3" ry="4.500" transform="rotate(-35 22 22)" />
      <ellipse cx="14" cy="34" rx="2.200" ry="3.200" transform="rotate(-35 14 34)" />
      <ellipse cx="100" cy="30" rx="3" ry="4.500" transform="rotate(35 100 30)" />
      <ellipse cx="106" cy="44" rx="2.200" ry="3.200" transform="rotate(35 106 44)" />
    </g>
  </svg>
);

export default function WelcomeSnackbar() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Show once per visit (new tab / session), shortly after the page loads
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(KEY) === "1"; } catch { /* storage blocked */ }
    if (seen) return;
    const id = setTimeout(() => setShow(true), 900);
    return () => clearTimeout(id);
  }, []);

  const close = (after) => {
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setLeaving(true);
    setTimeout(() => { setShow(false); setLeaving(false); after?.(); }, 250);
  };

  useEffect(() => {
    if (!show) return;
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  if (!show) return null;

  return (
    <div className={"welcome" + (leaving ? " leaving" : "")} role="dialog" aria-live="polite" aria-labelledby="wb-title">
      <button type="button" className="wb-close" onClick={() => close()} aria-label={t("welcome.close")}>✕</button>
      <PinArt />
      <h4 id="wb-title">{t("welcome.title")}</h4>
      <p>{t("welcome.text")}</p>
      <div className="wb-actions">
        <button type="button" className="wb-btn primary" onClick={() => close()}>{t("welcome.keep")}</button>
        <button
          type="button"
          className="wb-btn ghost"
          onClick={() => close(() => document.getElementById("custom_order")?.scrollIntoView({ behavior: "smooth", block: "center" }))}
        >
          {t("welcome.custom")}
        </button>
      </div>
    </div>
  );
}
