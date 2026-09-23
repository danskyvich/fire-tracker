"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { BASEMAP } from "@deck.gl/carto";
import "maplibre-gl/dist/maplibre-gl.css";
import { clearMeasureState, createMeasureState, toggleMeasurePoint } from "../../lib/location/measure/distance";
import { FireDetection, WindTexture } from "@/app/lib/api/types";
import {FiresMap} from "../../lib/api/fires/fires-layer";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { getFires } from "@/app/lib/api/fires/fires";
import FireInfo from "../ui/fire-info";
import useGeolocation from "@/app/hooks/useGeolocation";
import AqiInfo from "../ui/aqi-info";
import useWindParticleLayer from "@/app/hooks/useWindParticleLayer";
import ErrorModal from "../ui/error-modal";

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  const canvas = document.createElement("canvas");
  return !!(
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")
  );
};

interface InteractiveMapProps {
  getLiftedMap: (map: maplibregl.Map) => void;
  isMeasuring: boolean;
  activeLayers: Set<string>;
  setActiveLayers: Dispatch<SetStateAction<Set<string>>>;
};

const WIND_BOUNDS: [number, number, number, number] = [-180, -90, 180, 90];

export default function InteractiveMap({
  getLiftedMap,
  isMeasuring,
  activeLayers,
}: InteractiveMapProps) {
  const getLiftedMapRef = useRef(getLiftedMap);
  const latRef = useRef<number | null>(null);
  const lonRef = useRef<number | null>(null);

  // map containers
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  // webgl checks
  const [webglSupported] = useState(checkWebGLSupport);
  const [error, setError] = useState<string | null>(null);

  // for measuring distance
  const measureRef = useRef(createMeasureState());
  const isMeasuringRef = useRef(isMeasuring);
  const distanceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  // for fires
  const [fires, setFires] = useState<FireDetection[]>([]);
  const [selectedFire, setSelectedFire] = useState<FireDetection | null>(null);

  // for wind
  const [wind, setWind] = useState<WindTexture | null>(null);
  const windLayer = useWindParticleLayer({
    map: mapInstance,
    wind: activeLayers.has("wind-map") ? wind : null,
    bounds: WIND_BOUNDS,
  });

  // for air quality
  const API_BASE =
    process.env.NEXT_PUBLIC_API_SITE;

  const { latitude, longitude, error: geoError } = useGeolocation();

  // set fires
  useEffect(() => {
    if (!mapInstance) return;

    const fetchFires = () => {
      const bounds = mapInstance.getBounds();
      const bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ].join(",");

      getFires(bbox)
        .then(setFires)
        .catch((err) => setError(String(err)));
    }

    fetchFires();
    mapInstance.on("moveend", fetchFires);

    return () => {
      mapInstance.off("moveend", fetchFires);
    }
  }, [mapInstance]);

  useEffect(() => {
    const fetchWind = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/wind/texture`);
        if (!response.ok)
          throw new Error(`Failed fetching wind data: ${response.status}`);

        const uMin = parseFloat(response.headers.get("X-Wind-UMin")!);
        const uMax = parseFloat(response.headers.get("X-Wind-UMax")!);
        const vMin = parseFloat(response.headers.get("X-Wind-VMin")!);
        const vMax = parseFloat(response.headers.get("X-Wind-VMax")!);
        const lo1 = parseFloat(response.headers.get("X-Wind-Lo1")!);
        const lo2 = parseFloat(response.headers.get("X-Wind-Lo2")!);
        const la1 = parseFloat(response.headers.get("X-Wind-La1")!);
        const la2 = parseFloat(response.headers.get("X-Wind-La2")!);
        const bitmap = await createImageBitmap(await response.blob());
        console.log({ uMin, uMax, vMin, vMax, lo1, lo2, la1, la2 });

        setWind({ bitmap, uMin, uMax, vMin, vMax, lo1, lo2, la1, la2});
      } catch (err) {
        setError(String(err));
      }
    };
    fetchWind();
  }, [API_BASE]);

  // conditionally display fire overlay
  useEffect(() => {
    if (!mapInstance) return;

    overlayRef.current?.setProps({
      layers: [
        //fire
        activeLayers.has("fire-markers") &&
          FiresMap({ fires, onChose: setSelectedFire }),
        windLayer,
      ].filter(Boolean),
      getCursor: ({ isHovering }) => (isHovering ? "pointer" : "default"),
    });
  }, [fires, activeLayers, windLayer, mapInstance]);

  if (!webglSupported) {
    throw new Error("WebGL is not available in this browser/environment.");
  };

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("air-quality")) return;

    map.setLayoutProperty(
      "air-quality",
      "visibility",
      activeLayers.has("air-quality") ? "visible" : "none",
    );
  }, [activeLayers]);

  // for positioning
  useEffect(() => {
    latRef.current = latitude;
    lonRef.current = longitude;
  }, [latitude, longitude]);

  useEffect(() => {
    if (mapInstance === null || latitude == null || longitude == null) return;
    const source = mapInstance.getSource<maplibregl.GeoJSONSource>("user_location");
    if (!source) return;

    source.setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          properties: {
            name: "Location",
            type: "Point",
          },
        },
      ],
    });

  }, [mapInstance, latitude, longitude]);

  // map
  useEffect(() => {
    const loadMap = (map: maplibregl.Map) =>
      new Promise<void>((resolve) =>
        map.on("load", () => {
          map.addSource("geojson", {
            type: "geojson",
            data: measureRef.current.geojson,
          });

          map.addSource("user_location", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [lonRef.current ?? 121.05, latRef.current ?? 14.65],
                  },
                  properties: {
                    name: "Location",
                    type: "Point",
                  },
                },
              ],
            },
          });

          map.addLayer({
            id: "user_location_point",
            type: "circle",
            source: "user_location",
            paint: {
              "circle-radius": 5,
              "circle-color": "#1971ff",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#619eff",
            },
          });

          map.addLayer({
            id: "measure-points",
            type: "circle",
            source: "geojson",
            paint: {
              "circle-radius": 5,
              "circle-color": "#ffffff",
            },
            filter: ["in", "$type", "Point"],
          });

          map.addLayer({
            id: "measure-lines",
            type: "line",
            source: "geojson",
            layout: { "line-cap": "round", "line-join": "round" },
            paint: { "line-color": "#ffffff", "line-width": 2.5 },
            filter: ["in", "$type", "LineString"],
          });

          // for air-quality
          map.addSource("air-quality", {
            type: "raster",
            tiles: [`${API_BASE}/api/Aqi/tiles/{z}/{x}/{y}`],
            tileSize: 256,
            attribution:
              'Air Quality data © <a href="https://aqicn.org" target="_blank">WAQI</a>',
          });

          map.addLayer({
            id: "air-quality",
            type: "raster",
            source: "air-quality",
            paint: {
              "raster-opacity": 0.85,
            },
            layout: {
              visibility: "none",
            },
          });

          map.on("click", (e) => {
            if (!isMeasuringRef.current) return;
            if (!map.getLayer("measure-points")) return;

            const features = map.queryRenderedFeatures(e.point, {
              layers: ["measure-points"],
            });
            const { geojson, distanceKm } = toggleMeasurePoint(
              measureRef.current,
              features[0]?.properties?.id, //
              e.lngLat,
            );

            if (distanceRef.current) {
              distanceRef.current.innerHTML = "";
              if (distanceKm !== null) {
                const value = document.createElement("pre");
                value.textContent = `Total distance: ${distanceKm.toLocaleString()} km`;
                distanceRef.current.appendChild(value);
              }
            }

            // they came from the same source (which is geojson) -> map.addLayer({ source: geojson })
            (map.getSource("geojson") as maplibregl.GeoJSONSource).setData(
              geojson,
            );
          });

          // when mouse moves
          map.on("mousemove", (e) => {
            if (!isMeasuringRef.current) {
              map.getCanvas().style.cursor = "";
              return;
            }
            // update features
            const features = map.queryRenderedFeatures(e.point, {
              layers: ["measure-points"],
            });
            // change cursor
            map.getCanvas().style.cursor = features.length
              ? "pointer"
              : "crosshair";
          });

          resolve();
        }),
      );

    async function initMap() {
      if (!mapContainer.current || mapRef.current) return;

      if (!overlayRef.current)
        overlayRef.current = new MapboxOverlay({ layers: [] });

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: BASEMAP.DARK_MATTER,
        interactive: true,
        center: [lonRef.current ?? 121.05, latRef.current ?? 14.65],
        zoom: 6,
        pitch: 0,
        maxPitch: 0,
        minPitch: 0,
      });

      // add the overlay
      map.addControl(overlayRef.current);

      // add the zoom ui
      map.addControl(new maplibregl.NavigationControl(), "bottom-right");

      // add the map scale
      const scale = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      });

      map.addControl(scale, "bottom-left");

      // for mobile users
      map.boxZoom.enable();
      map.touchZoomRotate.enable();
      map.scrollZoom.enable();

      await loadMap(map); //load the map

      getLiftedMapRef.current(map);

      // assign map to an element
      mapRef.current = map;
      setMapInstance(map);
    }

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [API_BASE, geoError]);

  // measuring effects
  useEffect(() => {
    isMeasuringRef.current = isMeasuring;

    if (!isMeasuring && mapRef.current) {
      clearMeasureState(measureRef.current); //clear data
      const source = mapRef.current.getSource("geojson") as
        | maplibregl.GeoJSONSource
        | undefined;
      source?.setData(measureRef.current.geojson);
      // clear distanceRef
      if (distanceRef.current) distanceRef.current.innerHTML = "";
    }
  }, [isMeasuring]);

  useEffect(() => {
    getLiftedMapRef.current = getLiftedMap;
  }, [getLiftedMap]);

  return (
    <div className="relative w-dvw h-dvh">
      {
        error && <ErrorModal message={error}/>
      }
      <div ref={mapContainer} id="map-canvas" className="w-full h-full" />
      <div
        ref={distanceRef}
        className={`${!isMeasuring && "hidden"} absolute bg-background px-2 py-1 border border-white rounded-lg bottom-10 left-4 text-sm text-white z-10`}
      />
      {selectedFire && (
        <FireInfo
          selectedFire={selectedFire}
          onClose={() => setSelectedFire(null)}
          open
        />
      )}
      {activeLayers.has("air-quality") && <AqiInfo/>}
    </div>
  );
}
