import { FireDetection } from "@/app/lib/api/types";
import { ScatterplotLayer } from "deck.gl";

interface FiresMapProps {
    fires: FireDetection[];
    onChose: (fires: FireDetection) => void;
}

export function FiresMap({fires, onChose}: FiresMapProps) {
    return new ScatterplotLayer({
        id: "fires",
        data: fires,
        pickable: true,
        stroked: true,
        onClick: (info) => onChose(info.object),
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 500,
        radiusMinPixels: 5,
        radiusMaxPixels: 12.5,
        getFillColor: [255,0,0],
        getLineColor: d => d.isValid ? [255,0,0.5] : [255,0,0,0.5],
    });
}