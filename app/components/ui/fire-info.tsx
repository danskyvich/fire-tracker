import { ChevronDown, ChevronUp, Flame } from "lucide-react";
import { useState } from "react";

export default function FireInfo() {
    const [isMinimized, setIsMinimized] = useState<boolean>(true);

    return (
      <div className="flex flex-col w-69 md:w-70 lg:w-80 xl:w-90 h-fit absolute z-50 pointer-events-auto rounded-lg bg-background p-3 bottom-11 left-[20%] sm:left-[15%] md:left-[10%] border border-white/25 gap-2">
        {/* Controller */}
        <div
          className="flex w-full h-fit border border-white/23 items-center justify-center py-1 hover:bg-white/15 cursor-pointer transition-all duration-100"
          onClick={() => setIsMinimized((prev) => !prev)}
        >
          {isMinimized ? (
            <ChevronDown
              size={15}
              className="text-white min-w-3 h-auto cursor-pointer"
            />
          ) : (
            <ChevronUp
              size={15}
              className="text-white min-w-3 h-auto cursor-pointer"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col w-full h-full gap-1">
          <div className="flex w-full h-fit items-center justify-between">
            <div className="flex gap-2">
              <Flame size={20} className="text-white min-w-3 h-auto" />
              <p className="text-md font-bold font-sans">Fire title</p>
            </div>

            {/* Header */}
            <div className="flex w-fit h-fit border px-5 py-1 bg-(--color-partial-fill) border-(--color-partial-stroke) rounded-md">
              <p className="text-sm font-sans font-medium text-background">
                Status
              </p>
            </div>
          </div>

          {/** Basic */}
          <div
            className={`flex w-full h-fit items-center justify-between text-sm ${!isMinimized && "border-b border-white/15 pb-1 mb-2"}`}
          >
            <p className="whitespace-nowrap">Sample City, California</p>
            <div className="flex w-full h-fit items-center justify-end">
              <p className="text-sm">USA</p>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col w-full h-full">
              <p className="font-semibold text-sm">34.023422, -118.509659.02</p>
              <p className="text-light text-sm">Sep 14, 08:30 GMT+8</p>
              <p className="text-extralight italic text-[0.8rem] text-white/50">Sep 14, 06:30 UTC</p>
            </div>
          )}
        </div>
      </div>
    );
}