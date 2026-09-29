'use client'

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function HoverModal({satellite}: {satellite: string | undefined}) {
    const [minimized, setMinimized] = useState<boolean>(false);

    if (satellite === undefined) return null;
    const CONTENT = [
      {
        title: "Suomi NPP NRT",
        id: "N",
        active: true,
        description:
          "A joint NOAA/NASA/DoD weather and climate observation satellite, launched on October 28, 2011.",
      },
      {
        title: "NOAA-20 VIIRS NRT",
        active: true,
        id: "N20",
        description: "A polar orbiting satellite that captures visible and infrared images of Earth's land, atmosphere, ice, and oceans using the VIIRS instrument. Originally called JPSS-1, it was launched in 2017 by NASA and NOAA."
      },
      {
        title: "NOAA-21 VIIRS NRT",
        active: true,
        id: "N21",
        description: "A polar orbiting satellite launched by NASA and NOAA in November 2022. Like NOAA, it carries the VIIRS instrument that captures high-resolution imagery of the Earth's atmosphere, land, and oceans.",
      }
    ];

    return (
      <div className="flex flex-col absolute z-50 bottom-0 left-[102%] w-40 md:w-50 h-auto border border-white/25 gap-2 bg-background/90 p-3 rounded-lg text-sm font-sans">
        <>
          <div className="flex w-full items-center justify-between">
            <p className="font-semibold font-sans">
              {CONTENT.find((item) => item.id === satellite)?.title}
            </p>
            {minimized ? (
              <ChevronUp
                size={18}
                className="min-w-3 h-auto cursor-pointer"
                onClick={() => setMinimized(false)}
              />
            ) : (
              <ChevronDown
                className="min-w-3 h-auto cursor-pointer"
                size={18}
                onClick={() => setMinimized(true)}
              />
            )}
          </div>
          {!minimized && (
            <div className="flex flex-col gap-2 text-white/70 font-sans text-[0.7rem]">
              <p>
                {CONTENT.find((item) => item.id === satellite)?.description}
              </p>
              <p>Currently {CONTENT.find(item => item.id === satellite)?.active === true ? "active" : "retired"}.</p>
            </div>
          )}
        </>
      </div>
    );
}