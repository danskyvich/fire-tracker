// remove false positives
export function fireFiltering(bright_ti4: number, deltaT45: number, side: "D" | "N") {
    return (side === "D" && bright_ti4 > 325 && deltaT45 > 25) || (side === "N" && bright_ti4 > 294 && deltaT45 > 10);
}