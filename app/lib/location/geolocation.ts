// HTML Geolocation API to locate user
type GeolocationResult = 
| {success: false, error: string}
| {success: true, latitude: number, longitude: number }

// get user's current location
export function getUserLocation(): Promise<GeolocationResult> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ success: false, error: "Geolocation is not supported by your browser"});
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                resolve({success: true, latitude, longitude});
                return;
            },
            (error) => {
                resolve({success: false, error: `${error.code}: ${error.message}`});
            }
        );
    });
}