"use client";

import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { BASEMAP } from "@deck.gl/carto";
import "maplibre-gl/dist/maplibre-gl.css";
import { clearMeasureState, createMeasureState, toggleMeasurePoint } from "../../lib/location/measure/distance";
import { FireDetection, WindTextureBitmap } from "@/app/lib/api/types";
import {FiresMap} from "./fires-layer";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { getFires } from "@/app/lib/api/fires/fires";
import FireInfo from "../ui/fire-info";
import { WindParticleLayer } from "maplibre-gl-wind";
import useGeolocation from "@/app/hooks/useGeolocation";

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  const canvas = document.createElement("canvas");
  return !!(
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")
  );
}

interface InteractiveMapProps {
  getLiftedMap: (map: maplibregl.Map) => void;
  isMeasuring: boolean;
  activeLayers: Set<string>;
  setActiveLayers: Dispatch<SetStateAction<Set<string>>>;
}

export default function InteractiveMap({ getLiftedMap, isMeasuring, activeLayers }: InteractiveMapProps) {

  const getLiftedMapRef = useRef(getLiftedMap);
  const latRef = useRef<number | null>(null);
  const lonRef = useRef<number| null>(null);
  // map containers
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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
  const [windTexture, setWindTexture] = useState<WindTextureBitmap | null>(
    null,
  );

  // webworkers
  const workerRef = useRef<Worker | null>(null);

  // for air quality
  const API_BASE = process.env.NEXT_PUBLIC_API_SITE ?? "http://localhost:5180";

  const { latitude, longitude, error: geoError } = useGeolocation();

  // set fires
  useEffect(() => {
    getFires()
      .then(setFires)
      .catch((err) => setError(String(err)));
  }, []);

  // webworker for wind
  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../../workers/wind-overlay-worker.ts", import.meta.url),
    );
    workerRef.current.postMessage({
      type: "BEGIN",
    });

    workerRef.current.onmessage = function (event) {
      const { type, data } = event.data;

      switch (type) {
        case "TEXTURE_DATA":
          setWindTexture(data);
          break;
        case "WORKER_ERROR":
          setError(data.message);
          break;
      }
    };

    workerRef.current.onerror = (e) => setError(e.message);
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // conditionally display fire overlay
  useEffect(() => {
    if (fires.length === 0) return;

    const windLayerReady = activeLayers.has("wind-map") && windTexture?.bitmap;
    overlayRef.current?.setProps({
      layers: [
        //fire
        activeLayers.has("fire-markers") &&
          FiresMap({ fires, onChose: setSelectedFire }),
        //wind
        windLayerReady &&
          new WindParticleLayer({
            id: "wind",
            // @ts-expect-error: image's type is unknown, but it accepts both bitmap and canvas
            image: windTexture.bitmap,
            imageUnscale: [
              Math.min(windTexture?.uMin ?? -50, windTexture?.vMin ?? -50),
              Math.max(windTexture?.uMax ?? 50, windTexture?.vMax ?? 50),
            ],
            speedRange: [
              0,
              Math.max(windTexture?.uMax ?? 30, windTexture?.vMax ?? 30),
            ],
            maxAge: 50,
            animate: true,
            speedFactor: 5,
            width: 5,
            bounds: [-180, -90, 180, 90],
            numParticles: 2000,
            colorRamp: [
              [0.0, [230, 255, 36, 255]],
              [0.5, [255, 180, 36, 255]],
              [1.0, [255, 79, 36, 255]],
            ],
          }),
      ].filter(Boolean),
      getCursor: ({ isHovering }) => (isHovering ? "pointer" : "default"),
    });
  }, [fires, activeLayers, windTexture]);

  if (!webglSupported) {
    throw new Error("WebGL is not available in this browser/environment.");
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer("air-quality")) return;

    map.setLayoutProperty(
      "air-quality",
      "visibility",
      activeLayers.has("air-quality") ? "visible" : "none",
    )
  }, [activeLayers]);

  // for positioning
  useEffect(() => {
    latRef.current = latitude;
    lonRef.current = longitude;
  }, [latitude, longitude]);

  // map
  useEffect(() => {
    const loadMap = (map: maplibregl.Map) =>
      new Promise<void>((resolve) =>
        map.on("load", () => {
          // this section renders the points and lines on the map
          // modify points and lines appearance here
          map.addSource("geojson", {
            type: "geojson",
            data: measureRef.current.geojson,
          });

          // layer for linestrings
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

            const features = map.queryRenderedFeatures(e.point, {
              layers: ["measure-points"],
            });
            const { geojson, distanceKm } = toggleMeasurePoint(
              measureRef.current,
              features[0]?.properties?.id, //
              e.lngLat,
            );

            // if there is distance, update the total km text
            // distanceRef is where the text lies
            if (distanceRef.current) {
              distanceRef.current.innerHTML = "";
              if (distanceKm !== null) {
                const value = document.createElement("pre");
                value.textContent = `Total distance: ${distanceKm.toLocaleString()} km`;
                distanceRef.current.appendChild(value);
              }
            }

            // this call updates both measure-points and measure-line since
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

    // this function loads the basemap itself
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

      map.addControl(overlayRef.current);

      const scale = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      });

      map.addControl(scale, "bottom-left");

      await loadMap(map); //load the map

      getLiftedMapRef.current(map);

      if (geoError === null) {
        map.addSource("user_location", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: {
                  type: "Point",
                  coordinates: [
                    lonRef.current ?? 121.05,
                    latRef.current ?? 14.65,
                  ],
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
      }

      // assign map to an element
      mapRef.current = map;
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
    </div>
  );
}
