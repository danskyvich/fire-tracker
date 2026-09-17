"use client"

import InteractiveMap from "./components/map/map-instance";
import Sidebar from "./components/ui/sidebar"
import SearchField from "./components/ui/search-field";
import { SearchIcon } from "lucide-react";
import WebHeader from "./components/ui/web-header";
import Zoom from "./components/ui/zoom";
import { useState } from "react";

export default function Home() {
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<string>>( new Set(["fire-markers"]));
  const isMeasuring = activeIndex === 2;

  const actionLayer = (id: string ) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }
  
  return (
    <div className="flex w-full h-full">
      <InteractiveMap getLiftedMap={setMap} isMeasuring={isMeasuring} activeLayers={activeLayers} setActiveLayers={setActiveLayers}/>

      {/* Floating container for UI */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-between">
        <div className="absolute pointer-events-none grid grid-[15%_1fr_15%] sm:grid-cols-[12.5%_1fr_12.5%] md:grid-cols-[10%_1fr_10%] grid-rows-[5%_1fr_5%] auto-cols-auto w-full h-full p-3">
          {/* Row-1*/}
          <div className="flex z-50 flex-row col-span-3 row-span-1 row-start-1 items-center gap-5 justify-center">
            <div className="pointer-events-auto flex h-full gap-2 py-1 items-center justify-end">
              <SearchIcon size={20} className="min-w-3 h-auto cursor-pointer" />
              <SearchField />
            </div>
            <WebHeader />
          </div>

          {/* Middle */}
          <div className="flex z-50 justify-start items-center">
            <Sidebar map={map} onIndex={setActiveIndex} activeIndex={activeIndex} activeLayers={activeLayers} toggleLayers={actionLayer}/>
          </div>
          <div />
          <div />

          {/* Lower bar */}
          <div/>

          <div />

          <div className="flex z-50 items-end justify-end pr-5 w-full h-full">
            <Zoom map={map} />
          </div>
        </div>
      </div>
    </div>
  );
}
