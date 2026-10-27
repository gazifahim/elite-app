import React from "react";
import { useLang } from "../i18n/LanguageContext.jsx";

// EN | বাং toggle. English by default; clicking flips the whole site.
export default function LanguageSwitch() {
  const { lang, toggle, t } = useLang();
  const isBn = lang === "bn";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isBn}
      aria-label={t("nav.language")}
      className={"lang-switch" + (isBn ? " bn" : "")}
      onClick={toggle}
    >
      <span className="ls-thumb" />
      <span className="ls-opt">EN</span>
      <span className="ls-opt">বাং</span>
    </button>
  );
}
