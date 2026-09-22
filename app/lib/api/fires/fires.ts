import { FireDetection } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_SITE ?? "https://fire-tracker-yh7z.onrender.com";

// call all data from the api endpoint
export async function getFires(bbox: string): Promise<FireDetection[]> {
    const result = await fetch(`${API_BASE}/api/fires?bbox=${bbox}`);
    if (!result.ok) throw new Error("Failed to fetch fires from NASA FIRMS.");
    return result.json();
}