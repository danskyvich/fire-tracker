export async function getWindData() {
        const API_BASE = process.env.NEXT_PUBLIC_API_SITE ?? "http://localhost:5180";
        const result = await fetch(`${API_BASE}/api/wind`);
        if (!result.ok) throw new Error("Failed fetching wind data");
        return await result.json();
    }