import { useEffect, useRef, useState } from "react"

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
}

const isGeolocationSupported = 
    typeof navigator != "undefined" && "geolocation" in navigator;

export const useGeolocation = () => {
    const lonRef = useRef<number | null>(null);
    const latRef = useRef<number | null>(null);

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        error: isGeolocationSupported ? null : "Geolocation is not supported by your browser",
    });

    useEffect(() => {
        if (!isGeolocationSupported) return;
        navigator.geolocation.getCurrentPosition(
            (position) => {
                    const { latitude, longitude } = position.coords;
                    lonRef.current = longitude;
                    latRef.current = latitude;
                    setState({latitude, longitude, error: null});
            },
             (error) => {
                setState(x => ({ ...x, error: `${error.code}: ${error.message}`}));
            },
        );
    }, []);

    return { ...state, latRef, lonRef };
}

export default useGeolocation;
