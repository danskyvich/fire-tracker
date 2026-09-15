"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { BASEMAP } from "@deck.gl/carto";
import "maplibre-gl/dist/maplibre-gl.css";
import { getUserLocation } from "../../lib/location/geolocation";
import { clearMeasureState, createMeasureState, toggleMeasurePoint } from "../../lib/location/measure/distance";
import { FireDetection } from "@/app/lib/api/types";
import {FiresMap} from "./fires-layer";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { getFires } from "@/app/lib/api/fires";
import FireInfo from "../ui/fire-info";

interface InteractiveMapProps {
  getLiftedMap: (map: maplibregl.Map) => void;
  isMeasuring: boolean;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  const canvas = document.createElement("canvas");
  return !!(
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl")
  );
}

export default function InteractiveMap({ getLiftedMap, isMeasuring }: InteractiveMapProps) {
  // map containers
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // webgl checks
  const [webglSupported] = useState(checkWebGLSupport);
  const [error, setError] = useState<string | null>(null);

  // geolocation API
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationEnabled, setLocationEnabled] = useState<boolean | null>(null);

  // for measuring distance
  const measureRef = useRef(createMeasureState());
  const isMeasuringRef = useRef(isMeasuring);
  const distanceRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  // for fires
  const [fires, setFires] = useState<FireDetection[]>([]);
  const [selectedFire, setSelectedFire] = useState<FireDetection | null>(null);

  useEffect(() => {
    getFires().then(setFires).catch((err) => setError(String(err)));
  }, []);

  useEffect(() => {
    if (fires.length === 0) return;
    overlayRef.current?.setProps({ 
      layers: [FiresMap({ fires, onChose: setSelectedFire })], 
      getCursor: ({ isHovering }) => isHovering ? 'pointer' : 'default' });
  }, [fires]);

  useEffect(() => {
    // prompt the user to enable their location w/ consent
    const promptUserLocation = async () => {
      const result = await getUserLocation(); // this line sends a prompt to user
      if (!result.success) {
        setError(result.error);
        return;
      } else {
        setLocationEnabled(true);
        setLatitude(result.latitude);
        setLongitude(result.longitude);
      }
    };

    promptUserLocation();
  }, []);

  // checks browser if WebGL is enabled/supported
  if (!webglSupported) {
    throw new Error("WebGL is not available in this browser/environment.");
  }

  useEffect(() => {
    // use geojson to add a point above the map
    // this point is for the current user location
    const loadMap = (map: maplibregl.Map) =>
      new Promise<void>((resolve) =>
        map.on("load", () => {
          map.addSource("user_location", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [longitude ?? 121.05, latitude ?? 14.65],
                  },
                  properties: {
                    name: "Location",
                    type: "Point",
                  },
                },
              ],
            },
          });

          // this section renders the points and lines on the map
          // modify points and lines appearance here
          map.addSource("geojson", {
            type: "geojson",
            data: measureRef.current.geojson,
          });

          // layer for points
          map.addLayer({
            id: "measure-points",
            type: "circle",
            source: "geojson",
            paint: { "circle-radius": 5, "circle-color": "#56ae8e" },
            filter: ["in", "$type", "Point"],
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


          map.on('click', (e) => {
            if (!isMeasuringRef.current) return;

            const features = map.queryRenderedFeatures(e.point, {
              layers: ["measure-points"]
            });
            const { geojson, distanceKm } = toggleMeasurePoint(
              measureRef.current,
              features[0]?.properties?.id, //
              e.lngLat,
            );

            // if there is distance, update the total km text 
            // distanceRef is where the text lies
            if (distanceRef.current) {
              distanceRef.current.innerHTML = '';
              if (distanceKm !== null) {
                const value = document.createElement("pre");
                value.textContent = `Total distance: ${distanceKm.toLocaleString()} km`;
                distanceRef.current.appendChild(value);
              }
            };

            // this call updates both measure-points and measure-line since
            // they came from the same source (which is geojson) -> map.addLayer({ source: geojson })
            (map.getSource("geojson") as maplibregl.GeoJSONSource).setData(geojson);
          })


          // when mouse moves
          map.on("mousemove", (e) => {
            if (!isMeasuringRef.current) {
              map.getCanvas().style.cursor = ""; //returns to default cursor 
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

      if (!overlayRef.current) {
        overlayRef.current = new MapboxOverlay({ layers: []});
      };

      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: BASEMAP.DARK_MATTER,
        interactive: true,
        center: [longitude ?? 121.05, latitude ?? 14.65], //default to Quezon City
        zoom: 6,
      });

      map.addControl(overlayRef.current);

      const scale = new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: "metric",
      });

      map.addControl(scale, "bottom-left");

      // wait for the point to load before adding it to basemap as a layer.
      await loadMap(map);

      getLiftedMap(map);

      if (locationEnabled) {
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
  }, [latitude, longitude, locationEnabled, getLiftedMap]);

  useEffect(() => {
    // attach a ref to isMeasuring
    isMeasuringRef.current = isMeasuring;

    // when the user leaves the measure-distance, clear all 
    // lines and points
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

  return (
    <>
      <div className="relative w-dvw h-dvh">
        <div ref={mapContainer} id="map-canvas" className="w-full h-full" />
        <div
          ref={distanceRef}
          className={`${!isMeasuring && "hidden"} absolute bg-background px-2 py-1 border border-white rounded-lg bottom-10 left-4 text-sm text-white z-10`}
        />
        {
          selectedFire && <FireInfo selectedFire={selectedFire} onClose={() => setSelectedFire(null)} open />
        }
      </div>
    </>
  );
}
