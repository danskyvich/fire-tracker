import { X } from "lucide-react";
import LayerItem from "./layer-item";
import { useState } from "react";

export default function Layer({onClose, open}: {onClose: () => void, open: number | null}) {

    const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set(["fire-markers"]));

    const toggleLayers = (id: string) => {
        setActiveLayers(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        })
    }

    const LAYERS_ITEMS = [
      {
        id: "fire-markers",
        label: "Fire-markers / perimeter",
        toggle: activeLayers.has("fire-markers"),
        onCheck: () => toggleLayers("fire-markers"),
      },
      {
        id: "containment-boundary",
        label: "Containment boundary",
        toggle: activeLayers.has("containment-boundary"),
        onCheck: () => toggleLayers("containment-boundary"),
      },
    ];
    const DATA_ITEMS = [
      {
        id: "air-quality",
        label: "Air Quality Index (AQI)",
        toggle: activeLayers.has("air-quality"),
        onCheck: () => toggleLayers("air-quality"),
      },
      {
        id: "evac-zones",
        label: "Evacuation zones",
        toggle: activeLayers.has("evac-zonesy"),
        onCheck: () => toggleLayers("evac-zones"),
      },
    ];

    if (!open) return null;
    return (
      <div className="flex flex-col pointer-events-auto p-3 w-fit h-fit bg-(--color-background-dark) rounded-lg">
        <div className="flex w-full items-center justify-between">
          <p className="font-bold">Layers</p>
          <X
            size={15}
            className="min-w-3 h-auto cursor-pointer"
            onClick={onClose}
          />
        </div>
        <div className="flex flex-col w-full h-full gap-2 my-1">
          <div className="flex flex-col w-full h-fit">
            <p className="text-sm font-extralight font-sans">Core layers</p>
            <div className="flex flex-col w-full h-fit pl-2 gap-1 my-1">
              {LAYERS_ITEMS.map((item, id) => (
                <div className="flex w-full h-fit" key={id}>
                  <LayerItem
                    id={item?.id}
                    toggle={item?.toggle}
                    onCheck={item?.onCheck}
                    label={item?.label}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col w-full h-fit">
            <p className="text-sm font-extralight font-sans">Data layers</p>
            <div className="flex flex-col w-full h-fit pl-2 gap-1 my-1">
              {DATA_ITEMS.map((item, id) => (
                <div className="flex w-full h-fit" key={id}>
                  <LayerItem
                    id={item?.id}
                    toggle={item?.toggle}
                    onCheck={item?.onCheck}
                    label={item?.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
}