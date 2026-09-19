"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { WindTexture } from "@/app/lib/api/types";

interface WindOverlayProps {
  map: maplibregl.Map | null;
  wind: WindTexture | null;
  bounds?: [number, number, number, number];
}

const TRAIL_LENGTH = 15;

export default function WindOverlay({
  map,
  wind,
  bounds = [-180, -90, 180, 90],
}: WindOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<{ history: [number, number][]; age: number }[]>(
    [],
  );
  const windSampleRef = useRef<ImageData | null>(null);

  useEffect(() => {
    if (!wind) return;
    const offscreen = document.createElement("canvas");
    offscreen.width = wind.bitmap.width;
    offscreen.height = wind.bitmap.height;
    const ctx = offscreen.getContext("2d")!;
    ctx.drawImage(wind.bitmap, 0, 0);
    windSampleRef.current = ctx.getImageData(
      0,
      0,
      wind.bitmap.width,
      wind.bitmap.height,
    );
  }, [wind]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!map || !canvas || !wind) return;

    const ctx = canvas.getContext("2d")!;
    const NUM_PARTICLES = 900;
    const MAX_AGE = 90;

    const resize = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio;
      canvas.height = canvas.clientHeight * devicePixelRatio;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnParticle = () => {
      const lng = bounds[0] + Math.random() * (bounds[2] - bounds[0]);
      const lat = bounds[1] + Math.random() * (bounds[3] - bounds[1]);
      return {
        history: [[lng, lat]] as [number, number][],
        age: Math.floor(Math.random() * MAX_AGE),
      };
    };

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from(
        { length: NUM_PARTICLES },
        spawnParticle,
      );
    }

    const sampleWind = (lng: number, lat: number) => {
      const data = windSampleRef.current;
      if (!data || !Number.isFinite(lng) || !Number.isFinite(lat)) return null;

      const lng360 = lng < 0 ? lng + 360 : lng;
      const x = Math.floor((lng360 / 360) * data.width);
      const y = Math.floor(((90 - lat) / 180) * data.height);

      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < 0 ||
        x >= data.width ||
        y < 0 ||
        y >= data.height
      ) {
        return null;
      }

      const i = (y * data.width + x) * 4;
      const encodedU = data.data[i];
      const encodedV = data.data[i + 1];
      const u = wind.uMin + (encodedU / 255) * (wind.uMax - wind.uMin);
      const v = wind.vMin + (encodedV / 255) * (wind.vMax - wind.vMin);
      if (!Number.isFinite(u) || !Number.isFinite(v)) return null;
      return { u, v };
    };

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const projectWrapped = (lng: number, lat: number) => {
        const centerLng = map.getCenter().lng;
        let adjustedLng = lng;
        while (adjustedLng - centerLng > 180) adjustedLng -= 360;
        while (adjustedLng - centerLng < -180) adjustedLng += 360;
        return map.project([adjustedLng, lat]);
      };

      particlesRef.current.forEach((p, idx) => {
        const [lng, lat] = p.history[p.history.length - 1];
        const w = sampleWind(lng, lat);
        if (!w || p.age > MAX_AGE) {
          particlesRef.current[idx] = spawnParticle();
          return;
        }

        const speedFactor = 0.01;
        const latRad = (lat * Math.PI) / 180;
        const lngScale = 1 / Math.max(Math.cos(latRad), 0.1);

        let newLng = lng + w.u * speedFactor * lngScale;
        const newLat = lat + w.v * speedFactor;

        if (newLng > 180) newLng -= 360;
        if (newLng < -180) newLng += 360;

        if (newLat < -90 || newLat > 90) {
          particlesRef.current[idx] = spawnParticle();
          return;
        }

        p.history.push([newLng, newLat]);
        if (Math.abs(newLng - lng) > 180) {
          p.history = [[newLng, newLat]];
        } else if (p.history.length > TRAIL_LENGTH) {
          p.history.shift();
        }
        p.age++;

        for (let i = 1; i < p.history.length; i++) {
          const [prevLng, prevLat] = p.history[i - 1];
          const [currLng, currLat] = p.history[i];

          const before = projectWrapped(prevLng, prevLat);
          const after = projectWrapped(currLng, currLat);

          const dx = Math.abs(after.x - before.x);
          if (dx > canvas.width / devicePixelRatio / 2) {
            continue;
          }

          const alpha = (i / p.history.length) * 0.5;
          ctx.strokeStyle = `rgba(181, 191, 234, ${alpha})`;
          ctx.lineWidth = 2 * devicePixelRatio;

          ctx.beginPath();
          ctx.moveTo(before.x * devicePixelRatio, before.y * devicePixelRatio);
          ctx.lineTo(after.x * devicePixelRatio, after.y * devicePixelRatio);
          ctx.stroke();
        }
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [map, wind, bounds]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
