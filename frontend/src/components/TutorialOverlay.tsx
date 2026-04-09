import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import "../styles/Tutorial.css";

export type TutorialStep = {
  target: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
};

export type TutorialHandle = {
  start: () => void;
};

type Props = {
  steps: TutorialStep[];
  storageKey: string;
  showTrigger?: boolean;
};

const TOOLTIP_WIDTH = 320;
const SPOTLIGHT_PAD = 8;
const GAP = 12;

function getTooltipStyle(rect: DOMRect, position: string) {
  const style: Record<string, number | string> = {
    position: "fixed",
    zIndex: 10001,
    width: TOOLTIP_WIDTH,
  };

  switch (position) {
    case "bottom":
      style.top = rect.bottom + SPOTLIGHT_PAD + GAP;
      style.left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "top":
      style.bottom = window.innerHeight - rect.top + SPOTLIGHT_PAD + GAP;
      style.left = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
      break;
    case "right":
      style.top = rect.top + rect.height / 2 - 60;
      style.left = rect.right + SPOTLIGHT_PAD + GAP;
      break;
    case "left":
      style.top = rect.top + rect.height / 2 - 60;
      style.left = rect.left - SPOTLIGHT_PAD - GAP - TOOLTIP_WIDTH;
      break;
  }

  if (typeof style.left === "number") {
    style.left = Math.max(10, Math.min(style.left, window.innerWidth - TOOLTIP_WIDTH - 10));
  }
  if (typeof style.top === "number") {
    style.top = Math.max(10, style.top);
  }

  return style;
}

const TutorialOverlay = forwardRef<TutorialHandle, Props>(
  ({ steps, storageKey, showTrigger = true }, ref) => {
    const [active, setActive] = useState(
      () => !localStorage.getItem(storageKey)
    );
    const [step, setStep] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);

    function start() {
      setStep(0);
      setActive(true);
    }

    useImperativeHandle(ref, () => ({ start }));

    const measure = useCallback(() => {
      if (!active) return;
      const el = document.querySelector(steps[step]?.target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        requestAnimationFrame(() => setRect(el.getBoundingClientRect()));
      }
    }, [active, step, steps]);

    useEffect(() => {
      measure();
    }, [measure]);

    useEffect(() => {
      if (!active) return;
      window.addEventListener("resize", measure);
      window.addEventListener("scroll", measure, true);
      return () => {
        window.removeEventListener("resize", measure);
        window.removeEventListener("scroll", measure, true);
      };
    }, [active, measure]);

    function finish() {
      setActive(false);
      localStorage.setItem(storageKey, "done");
    }

    function next() {
      if (step < steps.length - 1) setStep(step + 1);
      else finish();
    }

    function prev() {
      if (step > 0) setStep(step - 1);
    }

    if (!active) {
      if (!showTrigger) return null;
      return (
        <button className="tutorial-trigger" onClick={start} title="Tutoriel">
          ?
        </button>
      );
    }

    if (!rect) return null;

    const current = steps[step];

    return (
      <>
        <div className="tutorial-backdrop" />

        <div
          className="tutorial-spotlight"
          style={{
            top: rect.top - SPOTLIGHT_PAD,
            left: rect.left - SPOTLIGHT_PAD,
            width: rect.width + SPOTLIGHT_PAD * 2,
            height: rect.height + SPOTLIGHT_PAD * 2,
          }}
        />

        <div className="tutorial-tooltip" style={getTooltipStyle(rect, current.position)}>
          <div className="tutorial-step-count">
            {step + 1} / {steps.length}
          </div>
          <h3>{current.title}</h3>
          <p>{current.description}</p>
          <div className="tutorial-buttons">
            {step > 0 && <button onClick={prev}>Précédent</button>}
            <button onClick={finish}>Passer</button>
            <button className="tutorial-next" onClick={next}>
              {step < steps.length - 1 ? "Suivant" : "Terminer"}
            </button>
          </div>
        </div>
      </>
    );
  }
);

export default TutorialOverlay;
