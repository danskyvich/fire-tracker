import { WindDataPoint } from "maplibre-gl-wind";
import { WindComponent } from "../types";

export default function toWindMap(components: WindComponent[]): WindDataPoint[] {
        const [uComp, vComp] = components;
        if (components.length !== 2) throw new Error("Incomplete components fetched.")
        const { nx, ny, lo1, la1, dx, dy } = uComp.header;
        const points = [];
    
        for (let row = 0; row < ny; row++ ) {
            for (let col = 0; col < nx; col++ ) {
                const lat = la1 - (row * dy);
                let lon = lo1 + (col * dx);
                if (lon > 180) lon -= 360;
                const index = row * nx + col;
    
                const u = uComp.data[index];
                const v = vComp.data[index];
    
                const speed = Math.sqrt(Math.pow(u,2) + Math.pow(v,2));
                const direction = (Math.atan2(u, v) * 180) / Math.PI;
    
                const payload = { lat, lon, speed, direction };
                points.push(payload);
            }
        }
        return points ?? [];
    }