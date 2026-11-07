"use client";

import { useActionState, useRef, useState } from "react";
import { removeDietary, saveDietary, type FormState } from "@/app/actions";
import type { DietaryEntry } from "@/lib/event";
import {
  OwnEntryHint,
  goldButtonClass,
  inputClass,
  labelClass,
  outlineButtonClass,
  ownRowActiveClass,
  ownRowClass,
  rowClass,
  sheetDialogClass,
  sheetHandleClass,
  sheetPanelClass,
  sheetTitleClass,
} from "./ui";

const initialState: FormState = { ok: false, message: "" };

export default function DietaryButton({ entries }: { entries: DietaryEntry[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  // The entry currently loaded into the form for editing (null = adding).
  const [editing, setEditing] = useState<DietaryEntry | null>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await saveDietary(prev, formData);
      if (result.ok) setEditing(null);
      return result;
    },
    initialState,
  );

  function startEditing(entry: DietaryEntry) {
    setEditing(entry);
    // Bring the form into view on small screens.
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={outlineButtonClass}
      >
        See allergies / dietary wishes
        {entries.length > 0 && (
          <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-black tabular-nums">
            {entries.length}
          </span>
        )}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="dietary-title"
        onClose={() => setEditing(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className={sheetDialogClass}
      >
        <div className={sheetPanelClass}>
          <div className={sheetHandleClass} />
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="dietary-title" className={sheetTitleClass}>
              Allergies &amp; dietary wishes
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="-mr-2 min-h-11 shrink-0 px-2 text-base font-semibold text-gold"
            >
              Done
            </button>
          </div>

          {entries.length === 0 ? (
            <p className="rounded-2xl border border-grey-800 bg-grey-900 px-4 py-6 text-center text-base text-grey-400">
              Nothing noted yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {entries.map((entry) => (
                <li key={entry.id}>
                  {entry.mine ? (
                    <button
                      type="button"
                      onClick={() => startEditing(entry)}
                      className={editing?.id === entry.id ? ownRowActiveClass : ownRowClass}
                    >
                      <DietaryRow entry={entry} />
                    </button>
                  ) : (
                    <div className={rowClass}>
                      <DietaryRow entry={entry} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="my-6 h-px bg-grey-800" />

          <div ref={formRef}>
            <Fields
              key={`${state.savedAt ?? 0}-${editing?.id ?? "new"}`}
              editing={editing}
              formAction={formAction}
              pending={pending}
              error={state.ok ? "" : state.message}
              onStopEditing={() => setEditing(null)}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}

// Uses spans only, because it can sit inside a <button>.
function DietaryRow({ entry }: { entry: DietaryEntry }) {
  return (
    <span className="min-w-0 flex-1">
      <span className="block text-base font-semibold break-words">
        {entry.name}
      </span>
      <span className="block text-sm text-grey-300 break-words">{entry.note}</span>
      {entry.mine && <OwnEntryHint />}
    </span>
  );
}

function Fields({
  editing,
  formAction,
  pending,
  error,
  onStopEditing,
}: {
  editing: DietaryEntry | null;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error: string;
  onStopEditing: () => void;
}) {
  return (
    <form action={formAction} className="flex flex-col gap-5">
      <h3 className="text-base font-semibold">
        {editing ? "Edit your entry" : "Add an allergy or wish"}
      </h3>
      {editing && <input type="hidden" name="id" value={editing.id} />}

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Name</span>
        <input
          name="name"
          required
          maxLength={60}
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          defaultValue={editing?.name}
          placeholder="Your name"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Allergy or dietary wish</span>
        <input
          name="note"
          required
          maxLength={200}
          autoCapitalize="sentences"
          enterKeyHint="done"
          defaultValue={editing?.note}
          placeholder="e.g. Nut allergy, vegetarian"
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1 pt-1">
        <button type="submit" disabled={pending} className={goldButtonClass}>
          {pending ? "Saving…" : editing ? "Save" : "Add"}
        </button>
        {editing && (
          <>
            <button
              type="submit"
              formAction={async (formData) => {
                await removeDietary(formData);
                onStopEditing();
              }}
              formNoValidate
              onClick={(e) => {
                if (!confirm("Remove this entry?")) e.preventDefault();
              }}
              className="min-h-12 w-full text-sm font-semibold text-red-400"
            >
              Remove my entry
            </button>
            <button
              type="button"
              onClick={onStopEditing}
              className="min-h-12 w-full text-sm font-medium text-grey-400"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </form>
  );
}
