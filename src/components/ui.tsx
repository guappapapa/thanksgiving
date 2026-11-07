// Shared class names and small pieces so every sheet, row and input looks the same.

export const inputClass =
  "w-full rounded-xl border border-grey-700 bg-grey-900 px-4 py-3.5 text-base text-white placeholder:text-grey-500 outline-none transition focus:border-gold";

export const labelClass = "text-sm font-medium text-grey-300";

export const sheetDialogClass =
  "sheet fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/70 sm:inset-x-auto sm:mx-auto sm:max-w-md";

export const sheetPanelClass =
  "max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl border border-b-0 border-grey-800 bg-grey-950 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]";

export const sheetHandleClass = "mx-auto mb-4 h-1.5 w-10 rounded-full bg-grey-700";

export const sheetTitleClass = "text-xl font-semibold tracking-tight";

// Both main buttons share one height and text size.
const bigButtonBase =
  "flex min-h-14 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-semibold transition active:scale-[0.98] disabled:opacity-60";

export const goldButtonClass = `${bigButtonBase} bg-gold text-black`;

export const outlineButtonClass = `${bigButtonBase} border border-grey-700 bg-grey-900 text-white`;

// List rows (guest list and allergies). Rows you own are tappable to edit.
const rowBase =
  "flex w-full items-center gap-3 rounded-2xl border bg-grey-900 px-4 py-3.5 text-left";

export const rowClass = `${rowBase} border-grey-800`;

export const ownRowClass = `${rowBase} border-gold/50 transition active:scale-[0.99]`;

export const ownRowActiveClass = `${rowBase} border-gold`;

// Shown under your own entries: "[You] Tap to edit".
export function OwnEntryHint() {
  return (
    <span className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-gold">
      <span className="rounded-full bg-gold px-2 py-0.5 leading-tight font-bold text-black">
        You
      </span>
      Tap to edit
    </span>
  );
}

export function PlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
