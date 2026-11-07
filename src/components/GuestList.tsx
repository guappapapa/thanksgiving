import type { Rsvp } from "@/lib/event";
import GuestSheet from "./GuestSheet";
import { OwnEntryHint, ownRowClass, rowClass } from "./ui";

export default function GuestList({
  rsvps,
  actions,
}: {
  rsvps: Rsvp[];
  actions: React.ReactNode;
}) {
  const guests = rsvps.reduce((sum, r) => sum + 1 + r.plusOnes, 0);

  return (
    <section className="flex flex-col gap-5">
      <Stat value={guests} label={guests === 1 ? "guest" : "guests"} />

      {actions}

      <div className="flex items-baseline justify-between gap-3 px-1 pt-2">
        <h1 className="text-xl font-semibold tracking-tight">Guest list</h1>
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-grey-300 [text-shadow:0_1px_6px_#000]">
          Who&apos;s bringing what
        </span>
      </div>

      {rsvps.length === 0 ? (
        <p className="rounded-2xl border border-grey-800 bg-grey-900 px-5 py-10 text-center text-base text-grey-400">
          Nobody&apos;s on the list yet.
          <br />
          Be the first to add yourself.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rsvps.map((r) => (
            <li key={r.id}>
              {r.mine ? (
                <GuestSheet existing={r} className={ownRowClass}>
                  <GuestRow rsvp={r} />
                </GuestSheet>
              ) : (
                <div className={rowClass}>
                  <GuestRow rsvp={r} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// Uses spans only, because it can sit inside a <button>.
function GuestRow({ rsvp }: { rsvp: Rsvp }) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold break-words">
          {rsvp.name}
        </span>
        <span className="block text-sm text-grey-400 break-words">{rsvp.dish}</span>
        {rsvp.mine && <OwnEntryHint />}
      </span>
      {rsvp.plusOnes > 0 && (
        <span className="shrink-0 rounded-full border border-gold/50 px-2.5 py-1 text-xs font-semibold text-gold tabular-nums">
          +{rsvp.plusOnes}
        </span>
      )}
    </>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-grey-800 bg-grey-900 px-4 py-5 text-center">
      <p className="text-5xl font-bold leading-none tracking-tight text-gold tabular-nums">
        {value}
      </p>
      <p className="mt-1.5 text-sm font-medium text-grey-400">{label}</p>
    </div>
  );
}
