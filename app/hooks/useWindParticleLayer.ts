"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { WindParticleLayer } from "maplibre-gl-wind";
import { WindTexture } from "@/app/lib/api/types";

interface UseWindParticleLayerArgs {
  map: maplibregl.Map | null;
  wind: WindTexture | null;
  bounds?: [number, number, number, number];
}

const NUM_PARTICLES = 2500;
const MAX_AGE = 50;
const BASE_SPEED_FACTOR = 5;

// At or above this zoom level, slow particles down (less motion when
// looking at a small area up close).
const ZOOM_THRESHOLD = 8;
const ZOOMED_IN_SPEED_FACTOR = 0.25;

// Approximate the previous pale-purple trail look. This is a
// speed-based ramp (Windy.com style); adjust stops/colors to taste.
const COLOR_RAMP: [number, [number, number, number, number]][] = [
  [0.0, [181, 212, 231, 100]],
  [0.5, [181, 212, 231, 100]],
  [1.0, [181, 212, 231, 100]],
];

export default function useWindParticleLayer({
  map,
  wind,
  bounds = [-180, -90, 180, 90],
}: UseWindParticleLayerArgs) {
  const imageUrlRef = useRef<string | null>(null);
  const [layer, setLayer] = useState<WindParticleLayer | null>(null);

  // Rebuild the wind texture (as a data URL) whenever the wind data changes.
  useEffect(() => {
    if (!wind) {
      imageUrlRef.current = null;
      return;
    }

    const offscreen = document.createElement("canvas");
    offscreen.width = wind.bitmap.width;
    offscreen.height = wind.bitmap.height;
    const ctx = offscreen.getContext("2d")!;
    ctx.drawImage(wind.bitmap, 0, 0);
    imageUrlRef.current = offscreen.toDataURL();
  }, [wind]);

  // Rebuild the WindParticleLayer instance, and keep speedFactor in sync
  // with zoom.
  useEffect(() => {
    if (!map || !wind || !imageUrlRef.current) {
      setLayer(null);
      return;
    }

    const imageUnscale: [number, number] = [
      Math.min(wind.uMin, wind.vMin),
      Math.max(wind.uMax, wind.vMax),
    ];

    const buildLayer = () => {
      const speedFactor =
        map.getZoom() >= ZOOM_THRESHOLD
          ? BASE_SPEED_FACTOR * ZOOMED_IN_SPEED_FACTOR
          : BASE_SPEED_FACTOR;

      setLayer(
        new WindParticleLayer({
          id: "wind-particles",
          image: imageUrlRef.current!,
          bounds,
          imageUnscale,
          numParticles: NUM_PARTICLES,
          maxAge: MAX_AGE,
          speedFactor,
          colorRamp: COLOR_RAMP,
          width: 4.5,
        }),
      );
    };

    buildLayer();
    map.on("zoom", buildLayer);

    return () => {
      map.off("zoom", buildLayer);
    };
  }, [map, wind, bounds]);

  return layer;
}