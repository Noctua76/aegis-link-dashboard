import { useEffect, useRef, useState } from "react";
import {
  dashboardDemoGuides,
  displayDemoHeading,
  dashboardMenuGuideIds,
  resolveDemoLanguage,
} from "../demoGuides/dashboard";
import "./DemoGuidance.css";

const ui = {
  en: {
    badge: "DEMO · READ ONLY",
    help: "How this page works",
    close: "Close",
    seeing: "What you're seeing",
    works: "How it works",
    value: "Operational value",
    welcomeTitle: "Welcome to Aegis Link",
    welcomeBody: "You are viewing the Aegis Link demonstration environment in read-only mode.",
    welcomeHint: "Explore the platform freely. Look for the ⓘ icon on each page to understand how each operational module works.",
    welcomeLimit: "Actions that modify operational data are disabled in this environment.",
    explore: "Explore Aegis Link",
  },
  gr: {
    badge: "DEMO · ΜΟΝΟ ΑΝΑΓΝΩΣΗ",
    help: "Πώς λειτουργεί αυτή η σελίδα",
    close: "Κλείσιμο",
    seeing: "Τι βλέπετε",
    works: "Πώς λειτουργεί",
    value: "Επιχειρησιακή αξία",
    welcomeTitle: "Καλώς ήρθατε στο Aegis Link",
    welcomeBody: "Βρίσκεστε στο περιβάλλον επίδειξης του Aegis Link με πρόσβαση μόνο για ανάγνωση.",
    welcomeHint: "Μπορείτε να περιηγηθείτε ελεύθερα στην πλατφόρμα. Αναζητήστε το εικονίδιο ⓘ σε κάθε σελίδα για να δείτε πώς λειτουργεί κάθε επιχειρησιακή ενότητα.",
    welcomeLimit: "Οι ενέργειες που μεταβάλλουν επιχειρησιακά δεδομένα είναι απενεργοποιημένες στο περιβάλλον επίδειξης.",
    explore: "Περιήγηση στο Aegis Link",
  },
};

function useAccessibleDialog(open, onClose, returnFocusRef) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const returnFocus = returnFocusRef?.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = () => Array.from(dialog?.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) || []);

    focusable()[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocus?.focus());
    };
  }, [open, onClose, returnFocusRef]);

  return dialogRef;
}

function LanguageSwitch({ language, onChange }) {
  return (
    <div className="demo-guidance-language" aria-label="Guide language">
      <button type="button" className={language === "en" ? "active" : ""} onClick={() => onChange("en")} aria-pressed={language === "en"}>EN</button>
      <button type="button" className={language === "gr" ? "active" : ""} onClick={() => onChange("gr")} aria-pressed={language === "gr"}>ΕΛ</button>
    </div>
  );
}

function GuideHeading({ title, language }) {
  return <h3>{displayDemoHeading(title, language)}</h3>;
}

function BulletSection({ title, items, language }) {
  if (!items?.length) return null;
  return <section><GuideHeading title={title} language={language} /><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

function DialogFrame({ open, onClose, returnFocusRef, labelledBy, className = "", children }) {
  const dialogRef = useAccessibleDialog(open, onClose, returnFocusRef);
  if (!open) return null;
  return (
    <div className="demo-guidance-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside ref={dialogRef} className={`demo-guidance-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        {children}
      </aside>
    </div>
  );
}

export default function DemoGuidance({ preview, activeMenu, sessionIdentity }) {
  const guideId = dashboardMenuGuideIds[activeMenu];
  const guide = dashboardDemoGuides[guideId];
  const [language, setLanguage] = useState(() =>
    resolveDemoLanguage(globalThis.navigator?.language || document.documentElement.lang)
  );
  const [openGuideId, setOpenGuideId] = useState(null);
  const guideButtonRef = useRef(null);
  const copy = ui[language];
  const welcomeKey = `aegis-demo-welcome:dashboard:${sessionIdentity || "active"}`;
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => preview && sessionStorage.getItem(welcomeKey) !== "dismissed"
  );
  const guideOpen = openGuideId === guideId;

  if (!preview) return null;

  const closeWelcome = () => {
    sessionStorage.setItem(welcomeKey, "dismissed");
    setWelcomeOpen(false);
  };

  return (
    <>
      <div className="demo-guidance-toolbar" role="status">
        <span className="demo-mode-badge">{copy.badge}</span>
        {guide && (
          <button ref={guideButtonRef} type="button" className="demo-guide-button" onClick={() => setOpenGuideId(guideId)} aria-label={copy.help}>
            <span aria-hidden="true">ⓘ</span><span>{copy.help}</span>
          </button>
        )}
      </div>

      <DialogFrame open={guideOpen} onClose={() => setOpenGuideId(null)} returnFocusRef={guideButtonRef} labelledBy="demo-guide-title" className="demo-guidance-drawer">
        <header>
          <LanguageSwitch language={language} onChange={setLanguage} />
          <button className="demo-guidance-close" type="button" onClick={() => setOpenGuideId(null)} aria-label={copy.close}>× <span>{copy.close}</span></button>
        </header>
        <div className="demo-guidance-scroll">
          <p className="demo-guidance-eyebrow">AEGIS LINK · DEMO GUIDE</p>
          <h2 id="demo-guide-title">{guide?.title?.[language]}</h2>
          <p className="demo-guidance-intro">{guide?.intro?.[language]}</p>
          <BulletSection language={language} title={copy.seeing} items={guide?.seeing?.[language]} />
          <BulletSection language={language} title={copy.works} items={guide?.howItWorks?.[language]} />
          <BulletSection language={language} title={copy.value} items={guide?.value?.[language]} />
          <section className="demo-guidance-limitations">
            <GuideHeading title={guide?.demoLimitations?.[language]?.title} language={language} />
            <p>{guide?.demoLimitations?.[language]?.body}</p>
          </section>
        </div>
      </DialogFrame>

      <DialogFrame open={welcomeOpen} onClose={closeWelcome} returnFocusRef={guideButtonRef} labelledBy="demo-welcome-title" className="demo-guidance-welcome">
        <header><LanguageSwitch language={language} onChange={setLanguage} /></header>
        <div className="demo-guidance-welcome-mark" aria-hidden="true">ⓘ</div>
        <h2 id="demo-welcome-title">{copy.welcomeTitle}</h2>
        <p>{copy.welcomeBody}</p>
        <p>{copy.welcomeHint}</p>
        <p className="demo-guidance-welcome-limit">{copy.welcomeLimit}</p>
        <button className="demo-guidance-primary" type="button" onClick={closeWelcome}>{copy.explore}</button>
      </DialogFrame>
    </>
  );
}
