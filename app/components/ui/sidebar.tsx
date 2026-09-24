import {Locate, Layers, Wind, Ruler, List, Info} from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from "maplibre-gl";
import Legends from './legends';
import Layer from "./layers"
import WebAppPage from './web-app-page';
import ErrorModal from './error-modal';
import useGeolocation from '@/app/hooks/useGeolocation';

interface SidebarProps {
  map: maplibregl.Map | null,
  activeIndex: number | null,
  onIndex: (activeIndex: number | null) => void;
  activeLayers: Set<string>;
  toggleLayers: (id: string) => void;
}

export default function Sidebar({
  map,
  activeIndex,
  onIndex,
  activeLayers,
  toggleLayers,
}: SidebarProps) {
  const [error, setError] = useState<string | null>(null);
  
  // Geolocation API
  const { latitude, longitude, error: geoError } = useGeolocation();
  useEffect(() => {
    const retrievePosition = async () => {
      if (!latitude || !longitude) return;
      if (geoError === null) {
        return;
      }
    };

    retrievePosition();
  }, [geoError, latitude, longitude]);

  // SIDEBAR
  const SIDEBAR_ITEMS = [
    {
      icon: <Locate size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 0,
    },
    {
      icon: <Layers size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 1,
    },
    {
      icon: <Ruler size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 2,
    },
    {
      icon: <Info size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 4,
    },
  ];

  const handleLocationClick = () => {
    onIndex(0);
    if (latitude === null || longitude === null) {
      setError(geoError ?? "Geolocation not working.");
      return;
    }
    map?.flyTo({
      center: [longitude, latitude],
      zoom: 15,
      essential: true,
    });
  };

  if (!map) return;
  
  return (
    <>
      {error && <ErrorModal message={error} />}
      {activeIndex === 1 && (
        <div className="absolute left-18 top-[38%]">
          <Layer
            onClose={() => onIndex(null)}
            open={activeIndex}
            activeLayers={activeLayers}
            toggleLayers={toggleLayers}
          />
        </div>
      )}
      {activeIndex === 3 && (
        <WebAppPage onClose={() => onIndex(null)} open={activeIndex} />
      )}
      <div className="pointer-events-auto flex flex-col bg-(--color-background-accent)/75 w-fit h-fit py-10 px-3 gap-8 rounded-lg">
        {SIDEBAR_ITEMS.map((item, id) => (
          <div
            className={`${activeIndex === id && "text-(--color-accent)"} flex w-full h-fit hover:bg-(--color-background-accent)/50 hover:text-(--color-accent)/50 transition-all duration-100`}
            key={id}
            onClick={() => { id === 0 ? handleLocationClick() : onIndex(id)}}
          >
            {item.icon}
          </div>
        ))}
      </div>
    </>
  );
}