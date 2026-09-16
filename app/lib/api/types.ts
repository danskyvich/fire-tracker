export interface FireDetection {
    latitude: number,
    longitude: number,
    confidence: string,
    bright_ti4: number,
    bright_ti5: number,
    deltaT45: number,
    frp: number,
    daynight: string,
    acq_date: string,
    acq_time: string,
    satellite: string,
}

export interface WindVariables {
    lo1: number,
    la1: number,
    lo2: number,
    la2: number,
    dx: number,
    dy: number,
    nx: number,
    ny: number,
    parameterNumber: number,
    refTime: string,
}

export interface WindTextureBitmap {
    bitmap: ImageBitmap;
    uMin: number;
    uMax: number;
    vMin: number;
    vMax: number;
}

export interface WindComponent {
    header: WindVariables,
    data: number[],
}

export interface WindDataPoint {
    lat: number,
    lon: number,
    speed: number,
    direction: number,
}