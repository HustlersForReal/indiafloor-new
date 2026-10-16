/**
 * Custom dropdown used across the forms.
 *
 * A native <select> cannot render grouped options or a checkbox multi-select,
 * so both modes are hand-rolled. Multi-value fields store their selection as a
 * single comma-space-joined string — read it back with
 * `value.split(', ').filter(Boolean)`.
 */
"use client";

import { useEffect, useRef, useState } from "react";

export type OptionItem = string | { group: string; options: string[] };

type Props = {
  value: string;
  onChange: (v: string) => void;
  options: OptionItem[];
  placeholder: string;
  compact?: boolean;
  multiple?: boolean;
};

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  multiple = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [open]);

  const selected = value ? value.split(", ").filter(Boolean) : [];

  const pick = (opt: string) => {
    if (!multiple) {
      onChange(opt);
      setOpen(false);
      return;
    }
    const next = selected.includes(opt)
      ? selected.filter((o) => o !== opt)
      : [...selected, opt];
    onChange(next.join(", "));
    // multi-select keeps the panel open so several options can be picked
  };

  // Only the OPEN panel needs to out-rank its siblings. Closed selects get
  // z-0 so an open dropdown above them always wins on DOM order too.
  // w-full + min-w-0 keep a long multi-select value inside its grid cell
  // instead of bleeding into the neighbouring field.
  const wrap = `relative w-full min-w-0 ${open ? "z-[70]" : "z-0"}`;

  const trigger = compact
    ? "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-white px-3 py-2.5 text-left text-[13px] transition-colors hover:border-primary/40 focus:border-primary"
    : "flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-border bg-white px-[14px] py-3 text-left text-[14px] transition-colors hover:border-primary/40 focus:border-primary";

  return (
    <div ref={ref} className={wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={trigger}
      >
        <span
          className={`min-w-0 truncate ${
            selected.length > 0 ? "font-semibold text-primary" : "text-[#A6AEBB]"
          }`}
        >
          {selected.length > 0 ? value : placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full right-0 left-0 z-[60] mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-white p-1 shadow-xl"
        >
          {options.map((item, gi) =>
            typeof item === "string" ? (
              <OptionRow
                key={`s-${gi}-${item}`}
                option={item}
                multiple={multiple}
                selected={selected.includes(item)}
                onPick={pick}
              />
            ) : (
              <div key={`g-${gi}-${item.group}`}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold tracking-[0.1em] text-primary uppercase">
                  {item.group}
                </div>
                {item.options.map((opt) => (
                  <OptionRow
                    key={`g-${gi}-${opt}`}
                    option={opt}
                    multiple={multiple}
                    selected={selected.includes(opt)}
                    onPick={pick}
                  />
                ))}
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function OptionRow({
  option,
  multiple,
  selected,
  onPick,
}: {
  option: string;
  multiple: boolean;
  selected: boolean;
  onPick: (opt: string) => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onPick(option)}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
        selected
          ? "bg-primary/8 font-semibold text-primary"
          : "text-off-white hover:bg-primary/5"
      }`}
    >
      {multiple && (
        <span
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border ${
            selected ? "border-primary bg-primary" : "border-border"
          }`}
        >
          {selected && (
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 13 4 4 10-10" />
            </svg>
          )}
        </span>
      )}
      <span className="truncate">{option}</span>
    </button>
  );
}