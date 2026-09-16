import { generateWindTexture } from "maplibre-gl-wind";
import { WindDataPoint, WindComponent } from "../lib/api/types";

self.onmessage = (e) => 
    {
        if (e.data.type === 'BEGIN') {
            initializeWindOverlay();
        }
    }

const initializeWindOverlay = () => {
    (async () => {
        try {
            const data = await getWindData();
            const points = toWindMap(data);
            const texture = generateWindTexture(points, {
            width: 720,
            height: 360,
            bounds: [-180, -90, 180, 90],
            });
            self.postMessage({ type: 'TEXTURE_DATA', data: { texture }});
        } catch (err) {
            self.postMessage({ type: 'WORKER_ERROR', data: { err }});
        }    
    })();
}

const toWindMap = (components: WindComponent[]): WindDataPoint[] => {
        const [uComp, vComp] = components;
        const { nx, ny, lo1, la1, dx, dy } = uComp.header;
        const points = [];
    
        for (let row = 0; row < ny; row+=4) {
            for (let col = 0; col < nx; col+=4) {
                const lat = la1 - (row * dy);
                const lon = lo1 + (col * dx);
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

export async function getWindData() {
        const API_BASE = process.env.NEXT_PUBLIC_API_SITE ?? "http://localhost/5180";
        const result = await fetch(`${API_BASE}/api/wind`);
        if (!result.ok) throw new Error("Failed fetching wind data");
        return await result.json();
    }