import {Locate, Layers, Wind, Ruler, List, Info} from 'lucide-react'
import { useEffect, useState } from 'react';
import * as maplibregl from "maplibre-gl";
import { getUserLocation } from '@/app/libs/location/geolocation';
import Legends from './legends';
import Layer from "./layers"
import WebAppPage from './web-app-page';
import ErrorModal from './error-modal';

interface SidebarProps {
  map: maplibregl.Map | null,
  activeIndex: number | null,
  onIndex: (activeIndex: number | null) => void;
}

export default function Sidebar({map, activeIndex, onIndex}: SidebarProps) {

  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number>(0);
  const [long, setLong] = useState<number>(0);

  useEffect(() => {
    const retrievePosition = async() => {
      const result = await getUserLocation();
      if (!result.success) {
        setError(result.error ?? "Fetching position error");
        return;
      } 
      setLat(result.latitude);
      setLong(result.longitude);
      return;
    }

    retrievePosition();
  })

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
      icon: <Wind size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 2,
    },
    {
      icon: <Ruler size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 3,
    },
    {
      icon: <List size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 4,
    },
    {
      icon: <Info size={25} className="min-w-3 h-auto cursor-pointer" />,
      activeIndex: 5,
    },
  ];

  // navigate to the user's location
  if (activeIndex === 0) {
    map?.flyTo({
      center: [long, lat],
      zoom: 15,
      essential: true,
    });
  }
  if (!map) return;
    return (
      <>
        {error && <ErrorModal message={error} />}
        {activeIndex === 1 && (
          <div className="absolute left-18 top-[38%]">
            <Layer onClose={() => onIndex(null)} open={activeIndex} />
          </div>
        )}
        {activeIndex === 4 && (
          <div className="absolute left-18 top-[58%]">
            <Legends onClose={() => onIndex(null)} open={activeIndex} />
          </div>
        )}
        {activeIndex === 5 && (
          <WebAppPage onClose={() => onIndex(null)} open={activeIndex} />
        )}
        <div className="pointer-events-auto flex flex-col bg-(--color-background-accent)/75 w-fit h-fit py-10 px-3 gap-8 rounded-lg">
          {SIDEBAR_ITEMS.map((item, id) => (
            <div
              className={`${activeIndex === id && "text-(--color-accent)"} flex w-full h-fit hover:bg-(--color-background-accent)/50 hover:text-(--color-accent)/50 transition-all duration-100`}
              key={id}
              onClick={() => onIndex(id)}
            >
              {item.icon}
            </div>
          ))}
        </div>
      </>
    );
}