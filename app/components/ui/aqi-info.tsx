import { ChevronDown, ChevronUp, Wind, X } from "lucide-react";
import { useState } from "react";

export default function AqiInfo() {
  const [minimized, setMinimized] = useState<boolean>(true);

  const AQI_COLORS = [
    { id: "good", color: "bg-[#028459]", value: "Good", range: "0-50" },
    {
      id: "moderate",
      color: "bg-[#dbbf2d] text-black",
      value: "Moderate",
      range: "51-100",
    },
    {
      id: "unhealthy/s",
      color: "bg-[#db842d] text-black",
      value: "Unhealthy for sensitive groups",
      range: "101-150",
    },
    {
      id: "unhealthy",
      color: "bg-[#af022d]",
      value: "Unhealthy",
      range: "151-200",
    },
    {
      id: "very-unhealthy",
      color: "bg-[#590284]",
      value: "Very unhealthy",
      range: "201-300",
    },
    {
      id: "hazardous",
      color: "bg-[#6d0220]",
      value: "Hazardous",
      range: "300+",
    },
  ];

  return (
    <div className="flex flex-col w-40 md:w-65 h-fit absolute z-50 pointer-events-auto rounded-lg bg-background/75 p-3 bottom-12 right-3 border border-white/25 gap-2">
      <div
        className="flex border border-white/50 rounded-lg py-1 items-center justify-center cursor-pointer bg-transparent hover:bg-white/10 active:bg-white/25 duration-100 transition-all"
        onClick={() => setMinimized((prev) => !prev)}
      >
        {minimized ? (
          <ChevronUp size={18} className="min-w-3 h-auto cursor-pointer" />
        ) : (
          <ChevronDown size={18} className="min-w-3 h-auto cursor-pointer" />
        )}
      </div>
      <div className="flex gap-2 justify-between items-center">
        <div className="flex w-fit">
          <Wind className="min-w-4 h-auto" size={15}/> 
          <p className="font-sans text-[0.85rem] font-semibold">
            Air Quality Index
          </p>
        </div>
      </div>
      {!minimized && (
        <div className="contents">
          <div className="grid grid-cols-[27%_1fr] gap-x-2 sm:gap-x-4 gap-x-0 sm:gap-y-1 grid-rows-6 w-full h-full items-center justify-center">
            {AQI_COLORS.map((item) => (
              <div key={item.id} className="contents">
                <div
                  className={`flex items-center justify-center w-full px-1 py-0.5 ${item.color} font-sans tracking-tighter text-sm rounded-md`}
                >
                  <p className="text-[0.6rem] lg:text-[0.8rem]">{item.range}</p>
                </div>
                <p className="text-[0.75rem]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
