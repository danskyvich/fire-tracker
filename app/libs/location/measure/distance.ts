import * as turf from '@turf/turf'

// instantiate geojson and linestring
export function createMeasureState() {
    {/* GeoJSON */}
    const geojson: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection', features: []
    };

    {/* LineString */}
    const linestring: GeoJSON.Feature<GeoJSON.LineString> = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [],
        },
        properties: {},
    };
    return { geojson, linestring }
}

// actual logic of measure-distance
export function toggleMeasurePoint(
    state: ReturnType<typeof createMeasureState>,
    clickedFeatureId: string | undefined,
    lngLat: { lng: number, lat: number},
) {
    const { geojson, linestring } = state;

    if (geojson.features.length > 1) geojson.features.pop(); // remove old linestring

    if (clickedFeatureId) {
        // removes the pin IF the user clicks that existing pin
        geojson.features = geojson.features.filter((p) => p.properties?.id !== clickedFeatureId);
    } else {
        // create new pin
        geojson.features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [lngLat.lng, lngLat.lat]
            },
            properties: {
                id: String(Date.now())
            },
        });
    }

    // turf.js calculates the distance in km (by default)
    let distanceKm: number | null = null;

    // if there are more than 2 pins, rebuild the line
    if (geojson.features.length > 1) {
        linestring.geometry.coordinates = geojson.features.map(
            p => (p.geometry as GeoJSON.Point).coordinates
        );
        geojson.features.push(linestring); // creates line
        distanceKm = turf.length(linestring); // computes distance in km
    }

    return { geojson, distanceKm};
}

export function clearMeasureState(
    state: ReturnType<typeof createMeasureState>
) {
    state.geojson.features = [];
}