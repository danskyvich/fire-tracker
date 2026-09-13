import { X } from "lucide-react";
import {
  ContainedPoint,
  ControlledPoint,
  PartialContainedPoint,
  ShallowPoint,
  UncontainedPoint,
} from "./data-points";

export default function Legends({onClose, open}: {onClose: () => void, open: number | null}) {
  const LEGENDS_CONTENT = [
    {
      element: <UncontainedPoint />,
      value: "Active / uncontained",
    },
    {
      element: <PartialContainedPoint />,
      value: "Partially contained",
    },
    {
      element: <ContainedPoint />,
      value: "Contained",
    },
    {
      element: <ControlledPoint />,
      value: "Controlled / out",
    },
  ];
  const SIZES_CONTENT = [
    {
      element: <ShallowPoint className="w-3.5 h-3.5" />,
      value: "10.000+ acres",
    },
    {
      element: <ShallowPoint className="w-3 h-3" />,
      value: "1.000-10.000 acres",
    },
    {
      element: <ShallowPoint className="w-2.5 h-2.5" />,
      value: "100-1.000 acres",
    },
    {
      element: <ShallowPoint className="w-2.25 h-2.25" />,
      value: "<100 acres",
    },
  ];

  if (!open) return null;
  return (
    <div className="flex flex-col pointer-events-auto p-3 w-fit h-fit bg-(--color-background-dark) rounded-lg">
      <div className="flex w-full items-center justify-between">
        <p className="font-bold">Legends</p>
        <X size={15} className="min-w-3 h-auto cursor-pointer" onClick={onClose}/>
      </div>
      {/* Content */}
      <div className="flex flex-col w-full h-full gap-2 my-1">
        {/* Status */}
        <div className="flex flex-col w-full h-full gap-1">
          <p className="font-extralight text-sm font-sans">Status</p>
          {LEGENDS_CONTENT.map((item, id) => (
            <div
              className="flex w-full h-fit items-center justify-start gap-2 pl-2"
              key={id}
            >
              {item.element}
              <p className="font-sans text-sm font-extralight">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Size */}
        <div className="flex flex-col w-full h-full gap-1">
          <p className="font-extralight text-sm font-sans">Size</p>
          {SIZES_CONTENT.map((item, id) => (
            <div
              className="flex w-full h-fit items-center justify-start gap-2 pl-2"
              key={id}
            >
              {item.element}
              <p className="font-sans text-sm font-extralight">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
