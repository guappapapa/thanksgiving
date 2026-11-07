"use client";

import { useActionState, useRef, useState } from "react";
import { removeRsvp, saveRsvp, type FormState } from "@/app/actions";
import { MAX_PLUS_ONES, type Rsvp } from "@/lib/event";
import {
  goldButtonClass,
  inputClass,
  labelClass,
  sheetDialogClass,
  sheetHandleClass,
  sheetPanelClass,
  sheetTitleClass,
} from "./ui";

const initialState: FormState = { ok: false, message: "" };

// A button that opens the guest sheet. Without `existing` it adds a new guest;
// with `existing` it edits (or removes) that entry.
export default function GuestSheet({
  existing,
  className,
  children,
}: {
  existing?: Rsvp;
  className: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: FormState, formData: FormData) => {
      const result = await saveRsvp(prev, formData);
      if (result.ok) dialogRef.current?.close();
      return result;
    },
    initialState,
  );
  const titleId = `guest-title-${existing?.id ?? "new"}`;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className={sheetDialogClass}
      >
        <div className={sheetPanelClass}>
          <div className={sheetHandleClass} />
          <h2 id={titleId} className={`mb-5 ${sheetTitleClass}`}>
            {existing ? "Edit your entry" : "Add yourself"}
          </h2>
          <Fields
            key={state.savedAt ?? 0}
            existing={existing}
            formAction={formAction}
            pending={pending}
            error={state.ok ? "" : state.message}
            onCancel={() => dialogRef.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}

function Fields({
  existing,
  formAction,
  pending,
  error,
  onCancel,
}: {
  existing?: Rsvp;
  formAction: (formData: FormData) => void;
  pending: boolean;
  error: string;
  onCancel: () => void;
}) {
  const [plusOnes, setPlusOnes] = useState(existing?.plusOnes ?? 0);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Name</span>
        <input
          name="name"
          required
          maxLength={60}
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          defaultValue={existing?.name}
          placeholder="Your name"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className={labelClass}>Dish</span>
        <input
          name="dish"
          required
          maxLength={80}
          autoCapitalize="sentences"
          enterKeyHint="done"
          defaultValue={existing?.dish}
          placeholder="What are you bringing?"
          className={inputClass}
        />
      </label>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={labelClass}>Plus ones</p>
          <p className="text-xs text-grey-500">Anyone coming with you?</p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-grey-700 bg-grey-900 p-1">
          <StepButton
            label="One fewer plus one"
            disabled={plusOnes <= 0}
            onClick={() => setPlusOnes((n) => Math.max(0, n - 1))}
          >
            −
          </StepButton>
          <output className="w-8 text-center text-lg font-semibold tabular-nums">
            {plusOnes}
          </output>
          <StepButton
            label="One more plus one"
            disabled={plusOnes >= MAX_PLUS_ONES}
            onClick={() => setPlusOnes((n) => Math.min(MAX_PLUS_ONES, n + 1))}
          >
            +
          </StepButton>
        </div>
        <input type="hidden" name="plusOnes" value={plusOnes} />
      </div>

      {error && (
        <p role="alert" className="text-center text-sm font-medium text-red-400">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-1 pt-1">
        <button type="submit" disabled={pending} className={goldButtonClass}>
          {pending ? "Saving…" : existing ? "Save" : "Add me"}
        </button>
        {existing && (
          <button
            type="submit"
            formAction={removeRsvp}
            formNoValidate
            onClick={(e) => {
              if (!confirm("Remove your entry from the guest list?")) e.preventDefault();
            }}
            className="min-h-12 w-full text-sm font-semibold text-red-400"
          >
            Remove my entry
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="min-h-12 w-full text-sm font-medium text-grey-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-lg text-2xl text-gold transition active:bg-grey-800 disabled:text-grey-700"
    >
      {children}
    </button>
  );
}
