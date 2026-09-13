import { FireDetection } from "@/app/lib/api/types";
import { ScatterplotLayer } from "deck.gl";

export function FiresMap(fires:  FireDetection[]) {
    return new ScatterplotLayer({
        id: "fires",
        data: fires,
        getPosition: (d) => [d.longitude, d.latitude],
        getRadius: 500,
        getFillColor: [255,0,0],
    });
}