import Image from "next/image";
import DietaryButton from "@/components/DietaryButton";
import GuestList from "@/components/GuestList";
import GuestSheet from "@/components/GuestSheet";
import { PlusIcon, goldButtonClass } from "@/components/ui";
import { getAllDietary, getAllRsvps } from "@/lib/db";
import { getDeviceToken } from "@/lib/session";
import logo from "../../public/images/logo.png";
import stars from "../../public/images/stars.webp";

// Always read fresh data so new entries show up on reload.
export const dynamic = "force-dynamic";

export default async function Home() {
  const deviceToken = await getDeviceToken();
  const [rsvps, dietary] = await Promise.all([
    getAllRsvps(deviceToken),
    getAllDietary(deviceToken),
  ]);

  return (
    <>
      {/* Fixed full-screen background: centered, always covers, never scrolls. */}
      <div aria-hidden className="stars-bg pointer-events-none -z-10">
        <Image
          src={stars}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Image
          src={logo}
          alt="FDG & Friends Thanksgiving 2K26"
          priority
          sizes="(max-width: 448px) 100vw, 448px"
          className="h-auto w-full"
        />
        <GuestList
          rsvps={rsvps}
          actions={
            <div className="flex flex-col gap-3">
              <GuestSheet
                className={`${goldButtonClass} shadow-[0_8px_30px_rgba(226,176,74,0.25)]`}
              >
                <PlusIcon /> Add
              </GuestSheet>
              <DietaryButton entries={dietary} />
            </div>
          }
        />
      </main>
    </>
  );
}
