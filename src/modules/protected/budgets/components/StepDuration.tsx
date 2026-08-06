import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DURATION_OPTIONS } from "../../../../shared/services/budgets/budget.config";

const ITEM_SIZE = 64; // px
const ITEM_GAP = 8;

interface StepDurationProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function StepDuration({
  value,
  onChange,
  disabled,
}: StepDurationProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const isProgrammaticScroll = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sidePad, setSidePad] = useState(0);

  // Padding on the *inner* track (not the overflow box) so scrollWidth
  // includes space to center the last items (6–8).
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const measure = () => {
      setSidePad(Math.max(0, (scroller.clientWidth - ITEM_SIZE) / 2));
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    return () => ro.disconnect();
  }, []);

  const scrollToHours = useCallback(
    (hours: number, behavior: ScrollBehavior) => {
      const scroller = scrollerRef.current;
      const item = itemRefs.current.get(hours);
      if (!scroller || !item) return;

      isProgrammaticScroll.current = true;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const target = itemCenter - scroller.clientWidth / 2;
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      scroller.scrollTo({
        left: Math.min(maxScroll, Math.max(0, target)),
        behavior,
      });

      window.setTimeout(
        () => {
          isProgrammaticScroll.current = false;
        },
        behavior === "smooth" ? 350 : 50,
      );
    },
    [],
  );

  useEffect(() => {
    if (sidePad <= 0) return;
    const id = requestAnimationFrame(() => scrollToHours(value, "auto"));
    return () => cancelAnimationFrame(id);
  }, [value, sidePad, scrollToHours]);

  const pickNearest = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || disabled) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let bestHours = value;
    let bestDist = Infinity;

    for (const hours of DURATION_OPTIONS) {
      const el = itemRefs.current.get(hours);
      if (!el) continue;
      const mid = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestHours = hours;
      }
    }

    if (bestHours !== value) {
      onChange(bestHours);
    } else {
      scrollToHours(bestHours, "smooth");
    }
  }, [disabled, onChange, scrollToHours, value]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current || disabled) return;
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(pickNearest, 80);
  };

  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 w-full select-none">
      <div className="flex flex-col items-center text-indigo-600 dark:text-indigo-400 pointer-events-none">
        <span className="text-sm font-medium tabular-nums">{value}h</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 -mt-0.5"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="relative w-full max-w-sm">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-xl border-2 border-indigo-600 bg-indigo-50/30 dark:bg-indigo-950/30 shadow-md shadow-indigo-500/20"
          aria-hidden
        />

        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="listbox"
          aria-label="Duração em horas"
          aria-disabled={disabled}
        >
          <div
            ref={trackRef}
            className="flex items-center w-max"
            style={{
              gap: ITEM_GAP,
              paddingLeft: sidePad,
              paddingRight: sidePad,
            }}
          >
            {DURATION_OPTIONS.map((hours) => {
              const selected = value === hours;
              return (
                <button
                  key={hours}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  ref={(node) => {
                    if (node) itemRefs.current.set(hours, node);
                    else itemRefs.current.delete(hours);
                  }}
                  onClick={() => {
                    if (disabled) return;
                    onChange(hours);
                  }}
                  className={`snap-center shrink-0 flex items-center justify-center transition-colors duration-150 ${
                    selected
                      ? "text-indigo-700 dark:text-indigo-300 font-bold"
                      : "text-gray-400 dark:text-gray-500 font-semibold"
                  }`}
                  style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
                >
                  <span className="text-2xl tabular-nums">{hours}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
