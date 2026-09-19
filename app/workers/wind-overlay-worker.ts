import { generateWindTexture } from "maplibre-gl-wind";
import { getWindData } from "../lib/api/wind/getWindData";

interface MinimalDocument {
    createElement(tag: string): OffscreenCanvas;
}

interface WorkerScope {
    document?: MinimalDocument; // attach a document
    onmessage: ((event: MessageEvent) => void) | null;
    postMessage(message: unknown, transfer?: Transferable[]): void;
}

declare const self: WorkerScope;

if (typeof document === 'undefined') {
    self.document = {
        createElement: (tag: string): OffscreenCanvas => {
            if (tag === 'canvas') return new OffscreenCanvas(1, 1);
            throw new Error(`document.createElement('${tag}') unsupported in worker`);
        },
    };
}

self.onmessage = (e: MessageEvent) => {
    if (e.data.type === 'BEGIN') {
        initializeWindOverlay();
    }
};

const initializeWindOverlay = () => {
    (async () => {
        try {
            const data = await getWindData();
            const result = generateWindTexture(data, {
                width: 512,
                height: 512,
                bounds: [-180, -90, 180, 90],
                power: 2,
            });

            const canvas = result.canvas as unknown as OffscreenCanvas;
            const { uMin, uMax, vMin, vMax } = result;

            const bitmap = canvas.transferToImageBitmap();

            console.log({uMin, uMax, vMin, vMax});
            self.postMessage(
                { type: 'TEXTURE_DATA', data: { bitmap, uMin, uMax, vMin, vMax } },
                [bitmap]
            );
        } catch (err) {
            self.postMessage({
                type: 'WORKER_ERROR',
                data: { message: err instanceof Error ? err.message : String(err) },
            });
        }
    })();
};