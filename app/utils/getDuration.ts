export function getFireDuration(date: string | undefined, time: string | undefined) {
    if (!date || !time) return;
    //format date 
    const formattedDate = new Date(date).toISOString().split('T')[0];

    // format time 05:00 -> 05:00:00
    const parts = time.split(':');
    if (parts.length === 2) parts.push("00");
    const formattedTime =  parts.map(num => num.padStart(2, '0')).join(':');

    // create the following objects in ISO format ex. 2026-01-01T01:00:00Z
    const previousDateTime = `${formattedDate}T${formattedTime}Z`;
    const currentDateTime = new Date().toISOString();

    // get the duration in hours
    return Temporal.Instant.from(previousDateTime).until(currentDateTime, { largestUnit: 'hours'}).toString();
}

export function formatDuration(iso: string) {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if (!match) return '';

    const totalHours = parseInt(match[1] ?? '0', 10);
    const minutes = parseInt(match[2] ?? '0', 10);

    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    const parts = [];
    if (days) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
    if (!days && minutes) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);

    return parts.join(', ');
}
