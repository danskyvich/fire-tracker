export function formatTime(apiTime: string | undefined) {
    // ex. 3 -> 0003
    if (!apiTime) return;

    let container = "";

    for (let i = 0; i < 4 - apiTime.length; i++) {
        container += "0";
    }
    const unformattedTime = container + apiTime;
    return `${unformattedTime.slice(0,2)}:${unformattedTime.slice(2,4)}`
}

export function formatDate(apiDate: string | undefined) {
    // date format 2026-09-11T00:00:00
    if (!apiDate) return;
    return new Date(apiDate).toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}