import { useCurrentTime } from "../../hooks/useCurrentTime";
import Image from "next/image";

export default function WebHeader() {

    const value = useCurrentTime();

    return (
      <div className="flex w-fit h-fit bg-(--color-background-accent)/80 border-(--color-primary) border-2 px-5 py-1 rounded-lg items-center justify-center gap-3">
        <Image src="/icon.png" alt="web-logo" width={20} height={20} className="hidden lg:flex"/>
        <p className="hidden sm:flex flex-row font-sans text-md text-(--color-primary) font-semibold">
          WildfireTracker
        </p>

        {/* Live */}
        <div className="flex w-fit h-full items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-(--color-accent) rounded-[50%]" />
          <p className="text-(--color-accent) font-bold">Live</p>
        </div>

        
        {/** Time and timezone */}
        <div className="flex w-fit h-full items-center gap-3">
            <p className="text-sm text-(--color-accent) font-bold line-clamp-1">{value.time}</p>
            <p className="text-white font-bold text-sm">{value.timezone}</p>
        </div>
      </div>
    );
}