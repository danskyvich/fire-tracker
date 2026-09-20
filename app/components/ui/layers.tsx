import { X } from "lucide-react";
import LayerItem from "./layer-item";

interface LayerProps {
  onClose: () => void;
  open: number | null;
  toggleLayers: (id: string) => void;
  activeLayers: Set<string>;
}

export default function Layer({ onClose, open, toggleLayers, activeLayers }: LayerProps) {
  const LAYERS_ITEMS = [
    {
      id: "fire-markers",
      label: "Fire-markers",
      toggle: activeLayers.has("fire-markers"),
      onCheck: () => toggleLayers("fire-markers"),
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
      id: "wind-map",
      label: "Wind",
      toggle: activeLayers.has("wind-map"),
      onCheck: () => toggleLayers("wind-map"),
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