import { FireDetection } from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_SITE ?? "http://localhost:5180";

// call all data from the api endpoint
export async function getFires(): Promise<FireDetection[]> {
    const result = await fetch(`${API_BASE}/api/fires`);
    if (!result.ok) throw new Error("Failed to fetch fires from NASA FIRMS.");
    return result.json();
}