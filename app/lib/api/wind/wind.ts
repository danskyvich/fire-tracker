import { WindComponent, WindDataPoint } from "../types";

export function toWindMap(components: WindComponent[]): WindDataPoint[] {
    const [uComp, vComp] = components;
    const { nx, ny, lo1, la1, dx, dy } = uComp.header;
    const points = [];

    for (let row = 0; row < ny; row+=4) {
        for (let col = 0; col < nx; col+=4) {
            const lat = la1 + (row * dy);
            const lon = lo1 - (col * dx);
            const index = row * nx + col;

            const u = uComp.data[index];
            const v = vComp.data[index];

            const speed = Math.sqrt(Math.pow(u,2) + Math.pow(v,2));
            const direction = Math.atan2(u,v);

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