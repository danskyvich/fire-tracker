import { FireDetection } from "@/app/lib/api/types";
import { formatDate, formatTime } from "@/app/utils/formatDateTime";
import { formatDuration, getFireDuration } from "@/app/utils/getDuration";
import { ChevronDown, ChevronUp, Flame, Satellite, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FireInfoProps {
  selectedFire: FireDetection | null;
  onClose: () => void;
  open: boolean;
}

export default function FireInfo({selectedFire, onClose, open}: FireInfoProps) {
    const [isMinimized, setIsMinimized] = useState<boolean>(false);
    const [duration, setDuration] = useState<string>('');

    useEffect(() => {
      if (!selectedFire) return;

      const update = () => {
        const iso = getFireDuration(
          formatDate(selectedFire?.acq_date),
          formatTime(selectedFire?.acq_time),
        );
        if (iso) setDuration(formatDuration(iso));
      }

      update();
      const id = setInterval(update, 60_000);
      return () => clearInterval(id);
    }, [selectedFire, duration])

    const CONFIDENCE = [
      { id: "n", value: "Nominal", color: "bg-(--color-partial-fill)" },
      { id: "l", value: "Low", color: "bg-(--color-uncontained-fill)" },
      { id: "h", value: "High", color: "bg-(--color-secondary)" },
    ];
    const DAYNIGHT = [
      {
        id: "D",
        value: "Daytime",
        color: "bg-slate-500 text-white",
      },
      {
        id: "N",
        value: "Nighttime",
        color: "bg-slate-700 text-white",
      },
    ];

    if (!open) return null;
    return (
      <div className="flex flex-col w-69 md:w-70 lg:w-80 xl:w-90 h-fit absolute z-50 pointer-events-auto rounded-lg bg-background/75 p-3 bottom-11 left-4 border border-white/25 gap-2">
        {/* Controller */}
        <div
          className="flex w-full h-fit border border-white/23 items-center justify-center py-1 hover:bg-white/15 cursor-pointer transition-all duration-100"
          onClick={() => setIsMinimized((prev) => !prev)}
        >
          {isMinimized ? (
            <ChevronUp
              size={15}
              className="text-white min-w-3 h-auto cursor-pointer"
            />
          ) : (
            <ChevronDown
              size={15}
              className="text-white min-w-3 h-auto cursor-pointer"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col w-full h-full gap-1">
          <div
            className={` ${!isMinimized && "border-b border-white/25 pb-1"} flex w-full h-fit items-center justify-between`}
          >
            <div className="">
              <div className="flex w-full gap-2">
                <Flame size={18} className="min-w-3 h-auto" />
                <p className="text-md font-semibold font-sans">
                  {selectedFire?.longitude}, {selectedFire?.latitude}
                </p>
              </div>
              <p className="font-extralight font-sans text-sm">
                <span className="text-white/75 text-sm italic">since</span>{" "}
                {formatDate(selectedFire?.acq_date)},{" "}
                {formatTime(selectedFire?.acq_time)}
              </p>
            </div>

            <X className="min-w-4 h-auto cursor-pointer" onClick={onClose} />
          </div>

          {!isMinimized && (
            <div className="flex flex-col w-full h-full gap-1">
              {/* Tags */}
              <div className="flex w-full gap-2 py-1">
                {/* Confidence */}
                <div
                  className={`flex items-center justify-center ${CONFIDENCE.find((e) => e.id === String(selectedFire?.confidence))?.color} px-3 py-1 text-sm font-sans text-background rounded-lg `}
                >
                  {
                    CONFIDENCE.find(
                      (e) => e.id === String(selectedFire?.confidence),
                    )?.value
                  }
                </div>

                {/* DayNight */}
                <div
                  className={`flex items-center justify-center ${DAYNIGHT.find((e) => e.id === selectedFire?.daynight)?.color} px-3 py-1 text-sm font-sans rounded-lg`}
                >
                  {DAYNIGHT.find((e) => e.id === selectedFire?.daynight)?.value}
                </div>
              </div>

              {/* Duration */}
              <p className="text-extralight text-xl font-semibold text-(--color-accent)">
                {duration} <span className="text-base font-light">ago</span>
              </p>

              {/* Satellite */}
              <div className="flex w-full gap-2">
                <Satellite size={18} className="min-w-3 h-auto"/>
                <p className="text-sm font-sans">
                  {String(selectedFire?.satellite) === "N" &&
                    "Suomi NPP Satellite"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}